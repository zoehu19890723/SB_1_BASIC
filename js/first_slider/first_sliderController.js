/**
 * @description login controller.Updated at 2016/6/24
 */
define(["app"], function(app) {

    var bindings = [{
        element: '#img2',
        event: 'click',
        handler: toLogin
    }];
    /**
     * Init controller
     */
    function init() {
        var isFirstUse = localStorage.getItem('isFirstUse');
        var userName = localStorage.getItem("userName");
        var passWord = localStorage.getItem("passWord");
        var device = localStorage.getItem('device');

        if (userName && userName != "" && userName != "null" && passWord && passWord != "" && passWord != "null") {
            loginEvent(userName, passWord);
            return false;
        }
        app.router.load('login');
        // if (device === 'ios') {
        //     app.router.load('login');
        // } else {
        //     if (isFirstUse && isFirstUse == '1') {
        //         app.router.load('login');
        //     } else {
        //         var renderObject = {
        //             selector: $('#login-page-content'),
        //             hbsUrl: "js/first_slider/first_slider",
        //             model: {},
        //             bindings: bindings,
        //             afterRender : afterRender
        //         }
        //         viewRender(renderObject);
        //     }
        // }

        // function afterRender() {
        //     app.f7.swiper('.swiper-container', {
        //         pagination: '.swiper-pagination'
        //     });
        //     var height = (document.documentElement.clientHeight) + 'px';
        //     var scaleX = (document.documentElement.clientWidth) / 640;
        //     var scaleY = (document.documentElement.clientHeight) / 1136;
        //     $('.swiper-wrapper').css('height', height);
        //     $('.aboutimg').css("-webkit-transform-origin", "0 0");
        //     $('.aboutimg').css("-webkit-transform", "scale(" + scaleX + "," + scaleY + ")");
        // }
    }

    /**
     * login system
     * @param  {String} usrName            user name
     * @param  {String} usrPwd             user password
     */
    function loginEvent(userName, pwd) {
        showLoading();
        var new_language = translateLanguage();
        var url = ess_getUrl("user/userService/loginByMobile/") + "&username=" + userName + "&password=" + pwd +"&language=" + new_language;
        var onStarSuccess = function(data) { //1:success;0:pwd error;-1:user not exist
            closeLoading();
            if (parseInt(data.status) === 1) {
                var localStorageParams = {
                    "login_userName": userName,
                    "userName": userName,
                    "passWord": pwd,
                    'sessionid': data.data.session_id || '',
                }
                setLocalStorage(localStorageParams);
                app.mainView.router.load({
                    url: 'js/myProfile/myProfile.html'
                });
            } else {
                setLocalStorage({
                    "login_userName": userName,
                    "userName": userName
                });
                var message = data.message;
                if (parseInt(data.status) === 605) {
                    message = getI18NText('DBError');
                }
                app.f7.alert(message, function() {
                    app.router.load('login');
                });
            }
        }
        var onError = function(e) {
            closeLoading();
            setLocalStorage({
                "login_userName": userName,
                "userName": userName
            });
            app.f7.alert(getI18NText('network-error'), function() {
                app.router.load('login');
            });

        }
        getAjaxData(null, url, onStarSuccess, onError, null, false);

    }
    /**
     * to login page
     */
    function toLogin() {
        localStorage.setItem('isFirstUse', '1');
        app.router.load('login');
    }

    return {
        init: init,
        loginEvent: loginEvent
    };

});