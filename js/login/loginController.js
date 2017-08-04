/**
 * @description login controller.Updated at 2016/6/24
 */
define(["app", "js/first_slider/first_sliderController"], function(app, firstSlider) {

    var $$ = Dom7;

    var lang = "zh_cn";

    var bindings = [{
        element: '#btn_enter',
        event: 'click',
        handler: checkValidate
    }, {
        element: '#forgetpwd',
        event: 'click',
        handler: openNewPage
    }, {
        element: '#pwd',
        event: 'focus',
        handler: textEdit
    }, {
        element: '#username',
        event: 'focus',
        handler: textEdit
    }, {
        element: '#username',
        event: 'keyup',
        handler: addClear
    }, {
        element: '#username',
        event: 'blur',
        handler: hideClear
    }, {
        element: '#pwd',
        event: 'keyup',
        handler: addClear
    }, {
        element: '#pwd',
        event: 'blur',
        handler: hideClear
    }, {
        element: '#text-clear-u',
        event: 'click',
        handler: textClear
    }, {
        element: '#text-clear-p',
        event: 'click',
        handler: textClear
    }];
    /**
     * Init controller
     */
    function init() {
        var afterRender = function() {
            var username = localStorage.getItem("userName");
            var pwd = localStorage.getItem("passWord");
            if (username && username != "null") {
                $('#username').val(username);

            }
            if (pwd && pwd != "null") {
                $('#pwd').val(pwd);
            }
        }
        var renderObject = {
            selector: $('#login-page-content'),
            hbsUrl: "js/login/login",
            model: "",
            bindings: bindings,
            afterRender : afterRender
        }
        viewRender(renderObject);


    }
    /**
     * check wether the login type and user input is right
     * @param  {Object} event Click login button event
     */
    function checkValidate(event) {
        event.stopPropagation();
        var username = $.trim($("#username").val());
        var pwd = $("#pwd").val().trim();

        try {
            var networkState = navigator.connection.type;
        } catch (e) {

        }
        event.preventDefault();

        if (username == '') {
            app.f7.alert(getI18NText('userNameNull'));
            return false;
        } else if (pwd == '') {
            app.f7.alert(getI18NText('pwdNull'));
            return false;
        } else if (networkState == "none") {
            app.f7.alert(getI18NText('networkNull'));
        } else {
            showLoading();
            firstSlider.loginEvent(username, pwd);
        }
    }

    return {
        init: init
    };
    /**
     * open new page when click register and pwdProblem tag
     * @param  {Object} e click event
     */
    function openNewPage(e) {
        app.mainView.router.load({
            url: "js/PwdProblem/PwdProblem.html"
        });
    }
});