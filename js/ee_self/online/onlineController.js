define(["app"], function (app) {


    var bindings = [
        {element: '#callWX', event: 'click', handler: callWX},
        {element: '#callWX', event: 'click', handler: initClipBoard},
    ];

    function init() {
        var renderObject = {
            selector: $('.online'),
            hbsUrl: "js/ee_self/online/online",
            model:{},
            bindings: bindings
        }
        viewRender(renderObject);

        localStorage.setItem("from_help_about", 1);
    }

    return {
        init: init
    };


    function callWX() {
        app.f7.confirm(getI18NText('copyWeiXinKey'), function () {
            showLoading();
            $.ajax({

            });
            closeLoading();
        });
    }
    function initClipBoard(){
        var text="CDPWeStar";
        window.plugins.clipboardManager.copy(text);
    }



});