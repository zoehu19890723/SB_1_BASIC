/**
 * Created by Elsa.Dou on 2016/4/7.
 */
define(["app"], function(app) {
    var bindings = [{
        element: '.tab-link',
        event: 'click',
        handler: jumpPage
    }, {
        element: '.wx-settings .wx-item',
        event: 'click',
        handler: openNewPage
    }, {
        element: '.quitSystem',
        event: 'click',
        handler: quitSystem
    }, {
        element: '.self_base .edit-head-photo',
        event: 'click',
        handler: openPhotoPage
    }];

    var module = {
        html: 'self_base/self_base.html'
    }

    function init() {
        if (!localStorage.getItem("userName") || !localStorage.getItem("passWord")) {
            return;
        }
        if (!storeWithExpiration.get("ee_person")) {
            var onSuccess = function(json) {
                var model_ = {};
                if (parseInt(json.status) === 1) {
                    var card = json.data.profile;
                    var photo = json.data.profile.photo;
                    if (photo && '' !== photo && photo.indexOf(Star_imgUrl) < 0) {
                        photo = photo.replace(/\s/g, '%20');
                        json.data.profile.photo = Star_imgUrl + photo;
                    }
                    storeWithExpiration.set('ee_person', json.data);
                    model_.card = card;
                } else if (parseInt(json.status) === -1) {
                    app.f7.alert(json.message, function() {
                        app.mainView.router.load({
                            url: "index.html"
                        });
                    });
                } else if (parseInt(json.status) === 605) {
                    app.f7.alert(getI18NText('DBError'));
                } else {
                    app.f7.alert(json.message);
                }

                var renderObject = {
                    selector: $('.self_base'),
                    hbsUrl: "js/ee_self/self_base/self_base",
                    model: model_,
                    bindings: bindings
                };
                viewRender(renderObject);
            }
            var onError = function(e) {
                closeLoading();
                app.f7.showPreloader(getI18NText('network-error'));
                setTimeout(function() {
                    app.f7.hidePreloader();
                }, 2000);
                app.mainView.router.back({
                    force: true,
                    url: "index.html"
                });
            }
            var url = ess_getUrl("humanresource/HumanResourceWebsvcService/getEmployeeProfile/");
            getAjaxData(module, url, onSuccess, onError);

        } else {
            var model_ = {
                "card": storeWithExpiration.get("ee_person").profile
            };
            var renderObject = {
                selector: $('.self_base'),
                hbsUrl: "js/ee_self/self_base/self_base",
                model: model_,
                bindings: bindings
            };
            viewRender(renderObject);
        }
        initWeChat();
    }
    return {
        init: init
    };

    function quitSystem() {

        app.f7.confirm(getI18NText('sureQuit'),
            function() {
                initLocalStorage(null,true);

                var onSuccess = function(data) {
                    if(parseInt(data.status) === 1){
                        $('.navbar').addClass("navbar-none");
                        app.mainView.router.load({
                            url: "index.html"
                        });
                    }else if(parseInt(data.status) === 605){
                        app.f7.alert(getI18NText('DBError'));
                    }else{
                        app.f7.alert(data.message);
                    }
                    
                }
                var onError = function() {
                    closeLoading();
                    app.f7.alert(getI18NText('network-error'));
                }
                var url = ess_getUrl("user/userService/logout/");
                getAjaxData(module, url, onSuccess, onError);
            });
    }

    function jumpPage(e) {
        var id = $(e.currentTarget).attr("toPage");
        if ("myProfile" === id) {
            app.mainView.router.load({
                url: "js/myProfile/myProfile.html",
                animatePages: false
            });

        } else if ("myContact" === id) {
            app.mainView.router.load({
                url: "js/myContact/contactList/contactList.html",
                animatePages: false
            });
        } else if ("myMessage" === id) {
            app.mainView.router.load({
                url: "js/myMessage/messageOverview/messageOverview.html",
                animatePages: false
            });
        }
    }

     /** 
     * open photo edit page
     */
    function openPhotoPage() {
        query_ = storeWithExpiration.get("ee_person").profile;
        app.router.load("editPhoto", {
            photo: query_.photo
        });
    }

    function openNewPage(e) {
        var id = $(e.currentTarget).attr("toPage");
        if (id === null || id === undefined || id === '') {
            return;
        }
        switch (id) {
            case 'setting':
                {
                    app.mainView.router.load({
                        url: "js/ee_self/setting/setting.html"
                    });
                    break;
                }
            case 'feedback':
                {
                    app.mainView.router.load({
                        url: "js/ee_self/feedback/feedback.html"
                    });
                    break;
                }
            case 'online':
                {
                    app.mainView.router.load({
                        url: "js/ee_self/online/online.html"
                    });
                    break;
                }
            case 'HelpAbout':
                {
                    app.mainView.router.load({
                        url: "js/HelpAbout/HelpAbout.html"
                    });
                    break;
                }
        }
    }

    function initWeChat() {
        document.addEventListener('deviceready', function() {
            //分享给好友
            var btn1 = $("#recommendF");
            btn1.onclick = function() {
                //alert(33333333)
                navigator.WechatShare.showToast('请稍后...');
                shareToWeixin(false);
            };

            ////分享到朋友圈
            //var btn2 = document.getElementById('share_to_timeline');
            //btn2.onclick = function(){
            //    navigator.WechatShare.showToast('请稍后...');
            //    shareToWeixin(true);
            //}

            //分享操作的回调
            navigator.WechatShare.sendCallBack = function(result) {
                switch (result) {
                    case 1:
                        navigator.WechatShare.showToast('分享成功');
                        break;

                    case 2:
                        navigator.WechatShare.showToast('取消分享');
                        break;

                    case 3:
                        navigator.WechatShare.showToast('验证失败');
                        break;

                    case 4:
                        navigator.WechatShare.showToast('未知错误');
                        break;
                }

            };
        });
    }

    function shareToWeixin(bool) {
        //这里以分享一个网页为例
        var args = {
            type: 'webpage',
            url: 'http://www.baidu.com',
            imgUrl: 'https://www.baidu.com/img/bdlogo.png',
            title: '文章标题',
            desc: '文章简介',
            isSendToTimeline: bool //true表示分享到朋友圈，false分享给好友
        };

        navigator.WechatShare.send(args);
    }
});