
    $(document).ready(function(){
        $('.works-box').each(function () {
        const gallery = this;
        let prepared = false;
        const prepareImages = () => {
            prepared = true;
            // Include Slick's cloned slides so the seamless loop never exposes
            // an unloaded copy. Restore picture sources before fallback images.
            gallery.querySelectorAll('source[data-deferred-srcset]').forEach(source => {
                source.srcset = source.dataset.deferredSrcset;
                delete source.dataset.deferredSrcset;
            });
            gallery.querySelectorAll('img[data-deferred-src]').forEach(image => {
                image.loading = 'eager';
                image.fetchPriority = 'auto';
                image.src = image.dataset.deferredSrc;
                delete image.dataset.deferredSrc;
            });
        };
        $(gallery).on('init reInit', function () {
            // Slick clears cloned IDs to empty strings; remove the empty attrs.
            $(this).find('[id=""]').removeAttr('id');
            if (prepared) prepareImages();
        }).slick({
            lazyLoad: 'ondemand',
            slidesToShow: 5,
            slidesToScroll: 1,
            infinite: true,
            autoplay: true,
            accessibility: false,
            pauseOnFocus: false,
            arrows: false,
            dots: false,
            draggable: false,
            pauseOnHover: false,
            pauseOnDotsHover: false,
            focusOnSelect: false,
            swipe: false,
            touchMove: false,
            autoplaySpeed: 0,
            cssEase: 'linear',
            speed: 3000,
            responsive: [
                {
                    breakpoint: 768,
                    settings: {
                        slidesToShow: 2,
                        slidesToScroll: 1,
                        speed: 5000,
                    }
                }
            ]
            });
        // Keep Slick's approved layout and motion, but do not download the
        // entire works gallery while the visitor is still at the first view.
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver(entries => {
                if (!entries.some(entry => entry.isIntersecting)) return;
                prepareImages();
                observer.disconnect();
            }, { rootMargin: '600px 0px' });
            observer.observe(gallery);
        } else prepareImages();
        window.addEventListener('beforeprint', prepareImages, { once: true });
        });
        });
