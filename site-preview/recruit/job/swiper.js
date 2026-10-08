// Swiper
var mySwiper = new Swiper (".swiper-container", {
	loop: true,
	speed: 600,
	slidesPerView: 3,
	spaceBetween: 5,
	direction: "horizontal",
	effect: "slide",
	
	// スライダーの自動再生
	autoplay: {
		delay: 3000,
		stopOnLast: false,
		disableOnInteraction: true
	},
	
	// レスポンシブ化条件
	breakpoints: {
		// 768ピクセル幅以下になったら
		768: {
			slidesPerView: 2,
			spaceBetween: 10
		},
		// 640ピクセル幅以下になったら
		640: {
			slidesPerView: 1,
			spaceBetween: 10
		}
	},
	
	// ページネーションを表示する場合
	pagination: {
		el: ".swiper-pagination",
		clickable: true,
	},
	
	// 前後スライドへのナビゲーションを表示する場合
	navigation: {
		nextEl: ".swiper-button-next",
		prevEl: ".swiper-button-prev",
	}
});