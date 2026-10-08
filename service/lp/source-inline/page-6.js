
    $(document).ready(function(){
        $('.works-box').on('init reInit', function () {
            // Slick clears cloned IDs to empty strings; remove the empty attrs.
            $(this).find('[id=""]').removeAttr('id');
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
        });
