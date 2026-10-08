
    $(document).ready(function(){
        $('.works-box').slick({
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
    