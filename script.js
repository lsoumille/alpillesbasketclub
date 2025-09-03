document.addEventListener('DOMContentLoaded', function() {
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

    // ===================== Photos Carousel =====================
    const photosSection = document.getElementById('photos');
    if (photosSection) {
        const track = photosSection.querySelector('.carousel-track');
        const viewport = photosSection.querySelector('.carousel-viewport');
        const prevBtn = photosSection.querySelector('.prev');
        const nextBtn = photosSection.querySelector('.next');
        const dotsContainer = photosSection.querySelector('.carousel-dots');
        const emptyMsg = photosSection.querySelector('.carousel-empty');

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
            slides = images.map((img, i) => {
                const li = document.createElement('li');
                li.className = 'carousel-slide';
                const imageEl = document.createElement('img');
                imageEl.loading = 'lazy';
                imageEl.alt = img.alt || `Photo ${i + 1}`;
                imageEl.src = img.src;
                li.appendChild(imageEl);
                track.appendChild(li);

                const dot = document.createElement('button');
                dot.className = 'carousel-dot';
                dot.type = 'button';
                dot.setAttribute('role', 'tab');
                dot.setAttribute('aria-label', `Aller à la photo ${i + 1}`);
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
                const res = await fetch('pictures/manifest.json', { cache: 'no-cache' });
                if (!res.ok) throw new Error('manifest not found');
                const data = await res.json();
                if (Array.isArray(data) && data.length) {
                    const images = data.map(item => ({ src: `pictures/${item.src || item}`, alt: item.alt || '' }));
                    buildSlides(images);
                    return;
                }
            } catch (e) {
                // ignore and fallback
            }
            // Fallback: try to load a few common names
            const guesses = Array.from({ length: 10 }, (_, i) => `pictures/photo${i + 1}.jpg`);
            const checks = await Promise.all(guesses.map(src => fetch(src, { method: 'HEAD' }).then(r => r.ok ? src : null).catch(() => null)));
            const found = checks.filter(Boolean).map(src => ({ src, alt: '' }));
            buildSlides(found);
        }

        // --- Event Listeners ---
        prevBtn.addEventListener('click', () => navigate(-1));
        nextBtn.addEventListener('click', () => navigate(1));

        viewport.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                navigate(-1);
            }
            if (e.key === 'ArrowRight') {
                e.preventDefault();
                navigate(1);
            }
        });

        window.addEventListener('resize', () => setIndex(currentIndex, { animate: false }));

        // Touch/Swipe handling
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
});
