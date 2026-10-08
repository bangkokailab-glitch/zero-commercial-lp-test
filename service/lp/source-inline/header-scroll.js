
    if (window.matchMedia( "(min-width: 769px)" ).matches) {
    $(function () {
        $(window).scroll(function () {

            if ($(this).scrollTop() > 50) {
                $('#top-header').addClass('scroll');
            } else {
                $('#top-header').removeClass('scroll');
            }
        });
    });
    }


