$(function(){
	$("a[href^='#']").click(function(){
		var speed = 500;
		var href= $(this).attr("href");
		var target = $(href == "#" || href == "" ? "html" : href);
		var position = target.offset().top;
		$("html, body").animate({scrollTop:position}, speed, "swing");
		return false;
	});
	//TOPへ戻るボタン設定
    var topBtn = $("#page-top");
    topBtn.hide();
    //スクロールが100に達したらボタン表示
    $(window).scroll(function () {
        if ($(this).scrollTop() > 100) {
            topBtn.fadeIn();
        } else {
            topBtn.fadeOut();
        }
    });
	// aタグを削除する
    var ua = navigator.userAgent;
    if(ua.indexOf("iPhone") < 0 && ua.indexOf("Android") < 0){
        $(".telhref span").each(function(){
            $(this).unwrap();
        });
    }
	// Gnavi開閉
	var open = "open";
	var hamBtn = $("#ham_btn");
	var slideMenu = $("#slide_menu");
	var wrap = $("#wrap");
    $("#ham_btn").click(function(){
        hamBtn.toggleClass(open);
        slideMenu.toggleClass(open);
		wrap.toggleClass(open);
    });
    $("#bg_cover").click(function(){
        hamBtn.removeClass(open);
        slideMenu.removeClass(open);
		wrap.removeClass(open);
    });
    $("#slide_menu .nav_menu").click(function(){
        $("#slide_menu .nav_menu ul").not(":animated").slideToggle();
    });
	//画像を背景に設定する
	$(function () {
		$('.bg_photo').each(function () {
			var img = $(this).find('img');
			if (img) {
				$(this).css({
					backgroundImage: 'url("' + img.attr('src') + '")'
				});
			}
		});
	});
	// アニメーション
	$(window).scroll(function(){
		var windowHeight = $(window).height(),
		topWindow = $(window).scrollTop();

		$(".fadein").each(function(){
			var targetPosition = $(this).offset().top;
			if(topWindow > targetPosition - windowHeight/1.2){
				$(this).addClass("on");
			} else{
				$(this).removeClass("on");
			}
		});
	});
});
//footerナビ 開閉
$(window).on('load resize', function(){
	var winW = $(window).width();
	var devW = 768;
	if (winW <= devW) {
    $("footer .nav_menu ul").addClass("sp");
	} else {
    $("footer .nav_menu ul").removeClass("sp");
	}
});
$(function(){
    $("footer .nav_menu").click(function(){
        $("footer .nav_menu ul.sp").not(":animated").slideToggle();
    });
});
