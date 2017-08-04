define(["app"], function(app) {

    var bindings = [{
        element: '.button-submit',
        event: 'click',
        handler: submitChange
    }, {
        element: '.button-cancel',
        event: 'click',
        handler: clickCancel
    }];


    function init() {
        var renderObject = {
            selector: $('.changePwd'),
            hbsUrl: "js/changePwd/changePwd",
            model: {},
            bindings: bindings
        }
        viewRender(renderObject);
    }

    function submitChange() {
        var orgPwd = $("#orgPwd").val();
        var newPwd = $("#newPwd").val();
        var new2Pwd = $("#new2Pwd").val();

        var myReg = /^(?=.*[0-9].*)(?=.*[A-Z].*)(?=.*[a-z].*)(?=.*[,.~!@#$%\^\+\*&\\\/\?\|:\.{}();=_\-\<\>\[\]].*).{4,50}$/;

        if (orgPwd == '') {
            app.f7.alert(getI18NText('oldPassNotNull'), '');
            return false;
        } else if (newPwd == '') {
            app.f7.alert(getI18NText('newPassNotNull'), '');
            return false;
        } else if (new2Pwd == '') {
            app.f7.alert(getI18NText('confirmNotNull'), '');
            return false;
        } else if (new2Pwd != newPwd) {
            app.f7.alert(getI18NText('passDiff'), '');
        } else if (myReg.test(newPwd) == false) {
            app.f7.alert(getI18NText('passUnderRule'), '');
            return false;
        } else {
            showLoading();
            var onSuccess = function(data) {
                closeLoading();
                if (parseInt(data.status) === 0) {
                    app.f7.alert(data.message, '');
                } else if (parseInt(data.status) === -1) {
                    app.f7.alert(data.message, function() {
                        app.router.load('login');
                    });
                } else {
                    app.f7.alert(getI18NText('changeSuc'), function() {
                        localStorage.setItem('password', newPwd);
                        app.mainView.router.back();
                    });
                }
            }

            var onError = function(e) {
                closeLoading();
                app.f7.alert(getI18NText('network-error'));
            }

            var data = {
                argsJson: JSON.stringify({
                    oldPwd: orgPwd,
                    newPwd: newPwd
                })
            }

            var module = {
                html: 'changePwd/changePwd.html',
                param: {
                    oldPwd: orgPwd,
                    newPwd: newPwd
                }
            }

            var url = ess_getUrl("user/userService/ChangePwd/")
            getAjaxData(module, url, onSuccess, onError, data);
        }
    }

    function clickCancel(){
        app.mainView.router.back();
    }
    return {
        init: init
    };

});