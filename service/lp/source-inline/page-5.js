
    $(function(){
        $('a[href^="#"]').click(function(){
            var campaignCue = $(this).hasClass("section-down-cue--handoff");
            var proposalNote = $(this).closest(".offer-proposal__note").length;
            var speed = (campaignCue || proposalNote) && window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 500;
            var href= $(this).attr("href");
            var target = $(href == "#" || href == "" ? 'html' : href);
            var menuOffset = $(this).closest(".fix-menu-secret").length ? 80 : 0;
            if (proposalNote) menuOffset = $('#top-header').outerHeight() + 12;
            if ($(this).closest(".fix-menu").length && window.matchMedia('(max-width: 768px)').matches) {
                menuOffset = $('#top-header').outerHeight() + 12;
            }
            if (campaignCue) menuOffset = parseFloat(window.getComputedStyle(target[0]).scrollMarginTop) || 0;
            var position = Math.max(0, target.offset().top - menuOffset);
            $("html, body").stop(true).animate({scrollTop:position}, speed, "swing", function(){
                if (href !== "#" && href !== "") {
                    window.setTimeout(function(){
                        var corrected = $(href).offset();
                        if (corrected) window.scrollTo({top: Math.max(0, corrected.top - menuOffset), left: 0, behavior: "auto"});
                    }, 1200);
                }
            });
            return false;
        });
    });
