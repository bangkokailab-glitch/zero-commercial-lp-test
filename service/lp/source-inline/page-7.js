
    (function () {
      document.querySelectorAll('.lp-purpose-slider .lp-purpose-grid').forEach(function (track) {
        if (track.dataset.unifiedSwipe === 'true') return;
        var root = track.closest('.lp-purpose-slider');
        var prev = root.querySelector('.lp-purpose-prev');
        var next = root.querySelector('.lp-purpose-next');
        var dots = root.querySelector('.lp-purpose-dots');
        var cards = Array.prototype.slice.call(track.querySelectorAll('.lp-purpose-card'));
        var currentPage = 0;

        function perView() {
            return window.matchMedia('(max-width: 768px)').matches ? 2 : 4;
        }

        function pageCount() {
            return Math.ceil(cards.length / perView());
        }

        function renderDots() {
            dots.innerHTML = '';
            for (var index = 0; index < pageCount(); index += 1) {
                var dot = document.createElement('button');
                dot.type = 'button';
                dot.className = 'lp-purpose-dot';
                dot.setAttribute('aria-label', (index + 1) + 'ページ目を表示');
                dot.dataset.page = index;
                dot.addEventListener('click', function () {
                    goTo(Number(this.dataset.page));
                });
                dots.appendChild(dot);
            }
            updateControls();
        }

        function targetLeft(page) {
            var cardIndex = Math.min(page * perView(), cards.length - 1);
            var left = cards[cardIndex].offsetLeft - track.offsetLeft;
            return Math.max(0, Math.min(left, track.scrollWidth - track.clientWidth));
        }

        function goTo(page) {
            currentPage = Math.max(0, Math.min(pageCount() - 1, page));
            track.scrollTo({ left: targetLeft(currentPage), behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
            updateControls();
        }

        function updateControls() {
            var allDots = dots.querySelectorAll('.lp-purpose-dot');
            allDots.forEach(function (dot, index) {
                var active = index === currentPage;
                dot.classList.toggle('is-current', active);
                dot.setAttribute('aria-current', active ? 'true' : 'false');
            });
            prev.disabled = currentPage === 0;
            next.disabled = currentPage >= pageCount() - 1;
        }

        function syncFromScroll() {
            var nearest = 0;
            var distance = Infinity;
            for (var page = 0; page < pageCount(); page += 1) {
                var delta = Math.abs(track.scrollLeft - targetLeft(page));
                if (delta < distance) {
                    distance = delta;
                    nearest = page;
                }
            }
            currentPage = nearest;
            updateControls();
        }

        prev.addEventListener('click', function () { goTo(currentPage - 1); });
        next.addEventListener('click', function () { goTo(currentPage + 1); });
        track.addEventListener('keydown', function (event) {
            if (event.key === 'ArrowLeft') { event.preventDefault(); goTo(currentPage - 1); }
            if (event.key === 'ArrowRight') { event.preventDefault(); goTo(currentPage + 1); }
        });
        track.addEventListener('scroll', function () {
            window.clearTimeout(track._purposeScrollTimer);
            track._purposeScrollTimer = window.setTimeout(syncFromScroll, 100);
        }, { passive: true });
        window.addEventListener('resize', function () {
            window.clearTimeout(track._purposeResizeTimer);
            track._purposeResizeTimer = window.setTimeout(function () {
                currentPage = 0;
                track.scrollLeft = 0;
                renderDots();
            }, 120);
        });

        renderDots();
      });
    }());
    