jQuery(function($) {
	$('.toc_toggle').on('click',function(){
		var section = $(this).closest('#toc');
		$(this).toggleClass('is-active');
		section.toggleClass('is-active');
		section.find('.toc_list').slideToggle();
		if($(this).hasClass('is-active')){
			$(this).children('a').text('非表示');
		}else{
			$(this).children('a').text('表示');
		}
		return false;
	});

var hTags = $('.entry-content').find('h2, h3');
    if (hTags.length > 0) {
        var indexList = $('<ul class="toc_list">');
        var listSrc = "";
        var h3List = "";    //h3タグを取得しておくための変数
        for (var i = 0; i < hTags.length; i++) {
            var theHeading = hTags[i];
						if($(theHeading).hasClass('void')){ continue; }
            $(theHeading).attr('id', "index_id" + i);  //リンクで飛べるようにIDをつける

            if ($(theHeading).prop("tagName") === 'H2') {

                if (h3List !== "") {
                    //h3リストが生成されていれば
                    listSrc += '<ol class="toc_child">' + h3List + '</ol>';
                    h3List = "";
                } 

                listSrc += '</li><li><a href="#index_id' + i + '">' + theHeading.textContent + '</a>';

            } else if ($(theHeading).prop("tagName") === 'H3') {
                h3List += '<li><a href="#index_id' + i + '">' + theHeading.textContent + '</a></li>';

            }

        }
        if (h3List !== "") {
            //最後のリストがh3だった場合
            listSrc += '<ol class="toc_child">' + h3List + '</ol></li>';
        } else {
            listSrc += '</li>';
        }
       indexList.append(listSrc);
// console.log(indexList);
        $('#toc').append(indexList);
    }
});


