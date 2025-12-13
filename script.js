document.addEventListener('DOMContentLoaded', function() {
    // Marquer le DOM comme prêt pour activer certaines transitions CSS sans flicker
    document.body.classList.add('js-ready');
    // ===================== Mobile Menu =====================
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-menu a');

    function closeMenu() {
        mobileMenuToggle.classList.remove('active');
        navMenu.classList.remove('active');
    }

    mobileMenuToggle.addEventListener('click', function(event) {
        event.stopPropagation();
        mobileMenuToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    navLinks.forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    document.addEventListener('click', function(event) {
        if (!navMenu.contains(event.target) && !mobileMenuToggle.contains(event.target)) {
            closeMenu();
        }
    });

    // Fermer/normaliser le menu quand on repasse en desktop pour éviter les états incohérents
    let wasMobile = window.matchMedia('(max-width: 992px)').matches;
    window.addEventListener('resize', () => {
        const isMobile = window.matchMedia('(max-width: 992px)').matches;
        if (!isMobile && wasMobile) {
            closeMenu();
        }
        wasMobile = isMobile;
    });

    // ===================== Generic Carousel Initializer =====================
    function initCarousel(sectionElement) {
        const track = sectionElement.querySelector('.carousel-track');
        const viewport = sectionElement.querySelector('.carousel-viewport');
        const prevBtn = sectionElement.querySelector('.prev');
        const nextBtn = sectionElement.querySelector('.next');
        const dotsContainer = sectionElement.querySelector('.carousel-dots');
        const emptyMsg = sectionElement.querySelector('.carousel-empty');
        const sectionId = sectionElement.id; // 'photos' or 'sponsors'

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
            track.style.transition = animate ? 'transform 0.4s ease' : 'none';
            track.style.transform = `translateX(${offset}px)`;
            updateDots();
        }

        function updateDots() {
            const dots = Array.from(dotsContainer.querySelectorAll('.carousel-dot'));
            dots.forEach((d, i) => d.setAttribute('aria-selected', i === currentIndex ? 'true' : 'false'));
        }

        function startAuto() {
            stopAuto();
            autoTimer = setInterval(() => navigate(1), AUTO_DELAY);
        }

        function stopAuto() {
            if (autoTimer) {
                clearInterval(autoTimer);
                autoTimer = null;
            }
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

                // If href is present, wrap the image in a link
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
                dot.addEventListener('click', () => {
                    setIndex(i);
                    startAuto();
                });
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
            buildSlides([]); // Ensure carousel is empty on failure
        }

        // --- Event Listeners ---
        prevBtn.addEventListener('click', () => navigate(-1));
        nextBtn.addEventListener('click', () => navigate(1));

        viewport.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') { e.preventDefault(); navigate(-1); }
            if (e.key === 'ArrowRight') { e.preventDefault(); navigate(1); }
        });

        window.addEventListener('resize', () => setIndex(currentIndex, { animate: false }));

        let touchStartX = 0;
        let touchDeltaX = 0;
        viewport.addEventListener('touchstart', (e) => {
            stopAuto();
            touchStartX = e.touches[0].clientX;
            touchDeltaX = 0;
            track.style.transition = 'none';
        });

        viewport.addEventListener('touchmove', (e) => {
            if (!slides.length) return;
            touchDeltaX = e.touches[0].clientX - touchStartX;
            const offset = -currentIndex * viewport.clientWidth + touchDeltaX;
            track.style.transform = `translateX(${offset}px)`;
        });

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

    // Initialize all carousels on the page
    const photosSection = document.getElementById('photos');
    if (photosSection) {
        initCarousel(photosSection);
    }

    const sponsorsSection = document.getElementById('sponsors');
    if (sponsorsSection) {
        initCarousel(sponsorsSection);
    }
});
