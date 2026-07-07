document.addEventListener('DOMContentLoaded', function () {
    document.body.classList.add('js-ready');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ===================== Header rétractable ======================
    const header = document.getElementById('siteHeader');
    if (header) {
        const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 24);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
    }

    // ===================== Menu mobile =============================
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');

    if (navToggle && navMenu) {
        const navLinks = navMenu.querySelectorAll('a');

        function closeMenu() {
            navMenu.classList.remove('is-open');
            navToggle.setAttribute('aria-expanded', 'false');
            navToggle.setAttribute('aria-label', 'Ouvrir le menu');
        }

        function openMenu() {
            navMenu.classList.add('is-open');
            navToggle.setAttribute('aria-expanded', 'true');
            navToggle.setAttribute('aria-label', 'Fermer le menu');
        }

        navToggle.addEventListener('click', function (event) {
            event.stopPropagation();
            if (navMenu.classList.contains('is-open')) {
                closeMenu();
            } else {
                openMenu();
            }
        });

        navLinks.forEach(link => link.addEventListener('click', closeMenu));

        document.addEventListener('click', function (event) {
            if (!navMenu.contains(event.target) && !navToggle.contains(event.target)) {
                closeMenu();
            }
        });

        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape') closeMenu();
        });

        // Réinitialiser en repassant sur desktop
        let wasMobile = window.matchMedia('(max-width: 900px)').matches;
        window.addEventListener('resize', () => {
            const isMobile = window.matchMedia('(max-width: 900px)').matches;
            if (!isMobile && wasMobile) closeMenu();
            wasMobile = isMobile;
        });
    }

    // ===================== Scroll-reveal ===========================
    const revealEls = document.querySelectorAll('.reveal');
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
        revealEls.forEach(el => el.classList.add('is-visible'));
    } else {
        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
        revealEls.forEach(el => observer.observe(el));
    }

    // ===================== Carrousel générique =====================
    function initCarousel(sectionElement) {
        const track = sectionElement.querySelector('.carousel-track');
        const viewport = sectionElement.querySelector('.carousel-viewport');
        const prevBtn = sectionElement.querySelector('.prev');
        const nextBtn = sectionElement.querySelector('.next');
        const dotsContainer = sectionElement.querySelector('.carousel-dots');
        const emptyMsg = sectionElement.querySelector('.carousel-empty');
        const sectionId = sectionElement.id; // 'photos' ou 'sponsors'

        if (!track || !viewport || !prevBtn || !nextBtn || !dotsContainer || !emptyMsg) {
            console.error(`Carousel structure missing in section #${sectionId}`);
            return;
        }

        let slides = [];
        let currentIndex = 0;
        let autoTimer = null;
        const AUTO_DELAY = 6000;

        function setIndex(index, { animate = true } = {}) {
            if (!slides.length) return;
            currentIndex = (index + slides.length) % slides.length;
            const offset = -currentIndex * viewport.clientWidth;
            track.style.transition = (animate && !prefersReducedMotion) ? 'transform 0.45s cubic-bezier(0.4,0,0.2,1)' : 'none';
            track.style.transform = `translateX(${offset}px)`;
            updateDots();
        }

        function updateDots() {
            const dots = Array.from(dotsContainer.querySelectorAll('.carousel-dot'));
            dots.forEach((d, i) => d.setAttribute('aria-selected', i === currentIndex ? 'true' : 'false'));
        }

        function startAuto() {
            stopAuto();
            if (prefersReducedMotion || slides.length < 2) return;
            autoTimer = setInterval(() => navigate(1), AUTO_DELAY);
        }

        function stopAuto() {
            if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
        }

        function navigate(direction) {
            setIndex(currentIndex + direction);
            startAuto();
        }

        function buildSlides(images) {
            track.innerHTML = '';
            dotsContainer.innerHTML = '';
            slides = images.map((imgData, i) => {
                const li = document.createElement('li');
                li.className = 'carousel-slide';

                const imageEl = document.createElement('img');
                imageEl.loading = 'lazy';
                imageEl.alt = imgData.alt || `Image ${i + 1}`;
                imageEl.src = imgData.src;

                let slideContent = imageEl;
                if (imgData.href) {
                    const link = document.createElement('a');
                    link.href = imgData.href;
                    link.target = '_blank';
                    link.rel = 'noopener noreferrer';
                    link.appendChild(imageEl);
                    slideContent = link;
                }

                li.appendChild(slideContent);
                track.appendChild(li);

                const dot = document.createElement('button');
                dot.className = 'carousel-dot';
                dot.type = 'button';
                dot.setAttribute('role', 'tab');
                dot.setAttribute('aria-label', `Aller à l'élément ${i + 1}`);
                dot.addEventListener('click', () => { setIndex(i); startAuto(); });
                dotsContainer.appendChild(dot);
                return li;
            });
            emptyMsg.classList.toggle('hidden', slides.length > 0);
            setIndex(0, { animate: false });
            startAuto();
        }

        async function loadManifest() {
            try {
                const path = sectionId === 'photos' ? 'pictures' : sectionId;
                const manifestPath = `${path}/manifest.json`;
                const res = await fetch(manifestPath, { cache: 'no-cache' });
                if (!res.ok) throw new Error('manifest not found');
                const data = await res.json();
                if (Array.isArray(data) && data.length) {
                    const images = data.map(item => ({
                        src: `${path}/${item.src || item}`,
                        alt: item.alt || '',
                        href: item.href || null
                    }));
                    buildSlides(images);
                    return;
                }
            } catch (e) {
                console.error(`Failed to load carousel for #${sectionId}:`, e);
            }
            buildSlides([]);
        }

        // --- Écouteurs ---
        prevBtn.addEventListener('click', () => navigate(-1));
        nextBtn.addEventListener('click', () => navigate(1));

        viewport.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') { e.preventDefault(); navigate(-1); }
            if (e.key === 'ArrowRight') { e.preventDefault(); navigate(1); }
        });

        viewport.addEventListener('mouseenter', stopAuto);
        viewport.addEventListener('mouseleave', startAuto);

        window.addEventListener('resize', () => setIndex(currentIndex, { animate: false }));

        let touchStartX = 0;
        let touchDeltaX = 0;
        viewport.addEventListener('touchstart', (e) => {
            stopAuto();
            touchStartX = e.touches[0].clientX;
            touchDeltaX = 0;
            track.style.transition = 'none';
        }, { passive: true });

        viewport.addEventListener('touchmove', (e) => {
            if (!slides.length) return;
            touchDeltaX = e.touches[0].clientX - touchStartX;
            const offset = -currentIndex * viewport.clientWidth + touchDeltaX;
            track.style.transform = `translateX(${offset}px)`;
        }, { passive: true });

        viewport.addEventListener('touchend', () => {
            const threshold = viewport.clientWidth * 0.2;
            if (Math.abs(touchDeltaX) > threshold) {
                setIndex(currentIndex + (touchDeltaX < 0 ? 1 : -1));
            } else {
                setIndex(currentIndex);
            }
            startAuto();
        });

        loadManifest();
    }

    const photosSection = document.getElementById('photos');
    if (photosSection) initCarousel(photosSection);

    const sponsorsSection = document.getElementById('sponsors');
    if (sponsorsSection) initCarousel(sponsorsSection);
});
