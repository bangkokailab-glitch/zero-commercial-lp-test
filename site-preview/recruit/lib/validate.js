$(function(){
    $("*[data-mail-input]", "form[data-mail]").show();
    $("*[data-mail-check]", "form[data-mail]").hide();

    $("*[data-mail-next]", "form[data-mail]").on("click", function(e){
        e.preventDefault();

        // エラーチェック
        var error = checkForm();
        if(error.length) {
            alert(error.join("\n"));
            return;
        }

        // チェック内容設定
        var fd = $("form[data-mail]").serializeArray();
        jQuery.each(fd, function(i, row){
            row.value = String(row.value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
            row.value = String(row.value + "").replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, "$1<br>$2");
            $("*[data-mail-check='"+row.name+"']", "form[data-mail]").html(row.value);
        });

        // チェック内容設定(チェックボックス)
        var cb = [];
        $("input[type='checkbox']", "form[data-mail]").each(function(){
            cb.push($(this).attr("name"));
        });
        cb = cb.filter(function(x, i, self){
            return self.indexOf(x) === i;
        });
        jQuery.each(cb, function(i, name){
            var t = name.replace(/\[/g, "").replace(/\]/g, "");
            var tmp = [];
            $("input[name='"+name+"']:checked", "form[data-mail]").each(function(){
                tmp.push($(this).val());
            });
            $("*[data-mail-check='"+t+"']", "form[data-mail]").html(tmp.join("<br>"));
        });

        // チェック表示
        $("*[data-mail-input]", "form[data-mail]").hide();
        $("*[data-mail-check]", "form[data-mail]").fadeIn(200, "swing", function(){
            var p = $("form[data-mail]").offset().top;
            $("html,body").stop(true, true).animate({scrollTop:p}, 200);
        });
    });

    $("*[data-mail-back]", "form[data-mail]").on("click", function(e){
        e.preventDefault();
        backForm();
    });

    $("form[data-mail]").submit(function(e){

        // エラーチェック
        var error = checkForm();
        if(error.length) {
            alert(error.join("\n"));
            e.preventDefault();
        }
    });

    $("input").on("keydown", function(e) {
        if ((e.which && e.which === 13) || (e.keyCode && e.keyCode === 13)) {
            return false;
        } else {
            return true;
        }
    });

});
function checkForm() {
    var error = [];

    // メールアドレスチェック
    var mail = "";
    var mail2 = "";
    if(!$("input[name='メールアドレス']", "form[data-mail]").length) {
        error.push("メールアドレスの項目が存在しません");
    } else {
        mail = $("input[name='メールアドレス']", "form[data-mail]").val();
    }
    if(!mail.match(/.+@.+\..+/g)) error.push("メールアドレスが正しくありません");
    if($("input[name='メールアドレスチェック']", "form[data-mail]").length) {
        mail2 = $("input[name='メールアドレスチェック']", "form[data-mail]").val();
        if(mail != mail2) error.push("メールアドレスが一致しません");
    }

    $("input[required],select[required],textarea[required]").each(function(){
        var formName = $(this).attr("name")+"は必須項目です";
        if($(this).val() == ""){
            error.push(formName);
        }
    });

    // カスタムチェック
    if("function" === typeof window.customCheck) {
        var customError = customCheck();
        error = error.concat(customError);
    }
    return error;
}

function backForm() {
    // チェック内容削除
    $("*[data-mail-check!='']", "form[data-mail]").each(function(i){
        if($(this).attr("data-mail-check")) $(this).text("");
    });
    $("*[data-mail-check]", "form[data-mail]").hide();
    $("*[data-mail-input]", "form[data-mail]").fadeIn(200, "swing", function(){
        var p = $("form[data-mail]").offset().top;
        $("html,body").stop(true, true).animate({scrollTop:p}, 200);
    });
}
