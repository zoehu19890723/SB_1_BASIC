/**
 * Created by Elsa.Dou on 2016/1/8.
 */
define(["app"], function(app) {

    var contact = null;
    var color = ["blue", "red", "lightgreen", "orange2", "pink", "teal"];
    var state = {
        isFavorite: false
    };
    var flag = 0;

    var bindings = [{
            element: '.left',
            event: 'click',
            handler: openNewPage
        }, {
            element: '.wx-item',
            event: 'click',
            handler: seeDetail
        }, {
            element: '.wx-item',
            event: 'touchstart',
            handler: showFocus
        }, {
            element: '.wx-item',
            event: 'touchend',
            handler: hideFocus
        },
        //{element: '#search-key', event: 'click', handler: searchList},
        //{element: '#cancel-key', event: 'click', handler: init},
        {
            element: '.tab-link',
            event: 'click',
            handler: jumpPage
        }
    ];

    function init(query) {
        var list__ = store.get('myContact');
        if (list__) {
            showList({
                "list": list__
            });
        } else {
            showLoading();
            $.ajax({
                type: "get",
                url: ess_getUrl("humanresource/HumanResourceWebsvcService/getAddressList/"),
                dataType: "jsonp",
                timeout: 20000,
                jsonp: "callback",
                jsonpCallback: "jsonp" + getRandomNumber(),
                success: function(json) {
                    closeLoading();
                    if (1 == json.status) {
                        var list__ = new Array();
                        var allContacts = new Array();
                        var content_ = {};
                        var j = 0;
                        $.each(json.data.list, function(i, value) {
                            if (value && value.length > 0) {
                                var obj_ = {};
                                obj_.letter = i;
                                obj_.childList = value;
                                for (var i = 0; i < obj_.childList.length; i++) {
                                    if (j == 6) j = 0;
                                    //管理员临时赋id
                                    if (!obj_.childList[i].id) obj_.childList[i].id = 000;
                                    //统一性别
                                    if (obj_.childList[i].gender == getI18NText('female') || obj_.childList[i].gender == "p_f" || obj_.childList[i].gender == false) obj_.childList[i].gender = false;
                                    else obj_.childList[i].gender = true;
                                    //增加拼音属性
                                    if (obj_.childList[i].name) {
                                        obj_.childList[i].pinyin = pinyin.getFullChars(value[i].name).toLowerCase();
                                    }
                                    if (!obj_.childList[i].photo) {
                                        obj_.childList[i].color = color[j];
                                        j++;
                                    } else {
                                        obj_.childList[i].color = "";
                                    }
                                    //统一头像
                                    var photo = obj_.childList[i].photo;
                                    if (photo && '' !== photo && photo.indexOf(Star_imgUrl) < 0) {
                                        photo = photo.replace(/\s/g, '%20');
                                        obj_.childList[i].photo = Star_imgUrl + photo;
                                    }

                                }

                                list__.push(obj_);
                            }
                        });
                        store.set('myContact', list__);
                        showList({
                            "list": list__
                        });

                    } else if (json.status == "-1") {
                        app.f7.alert(json.message, function() {
                            app.router.load('login');
                        });
                    } else {
                        closeLoading();
                        app.f7.alert(json.message);
                    }
                },
                error: function(e) {
                    closeLoading();
                    app.f7.showPreloader(getI18NText('network-error'))
                    setTimeout(function() {
                        app.f7.hidePreloader();
                    }, 2000);
                    app.mainView.router.back({
                        force: true,
                        url: "index.html"
                    });
                }
            });
        }
    }

    function showList(model) {
        var renderObject = {
            selector: $('.myMessage'),
            hbsUrl: "js/myMessage/messageOverview/messageOverview",
            model: model,
            bindings: bindings
        }
        viewRender(renderObject);
    }

    function seeDetail(e) {
        var id = $(e.currentTarget).attr("toPage");
        app.mainView.router.load({
            url: "js/myMessage/" + id + "/" + id + ".html"
        });
    }

    function openNewPage(e) {
        app.mainView.router.back({
            url: 'js/myProfile/myProfile.html',
            force: true
        });
    }

    function jumpPage(e) {
        var id = $(e.currentTarget).attr("toPage");
        if ("myProfile" == id) {
            app.mainView.router.load({
                url: "js/myProfile/myProfile.html",
                animatePages: false
            })
        } else if ("myContact" == id) {
            app.mainView.router.load({
                url: "js/myContact/contactList/contactList.html",
                animatePages: false
            })
        } else if ("myMessage" == id) {
            app.mainView.router.load({
                url: "js/myMessage/messageOverview/messageOverview.html",
                animatePages: false
            })
        } else if ("mySelf" == id) {
            app.mainView.router.load({
                url: "js/ee_self/self_base/self_base.html",
                animatePages: false
            })
        }
    }

    function showFocus() {
        $(this).addClass("focus");
    }

    function hideFocus() {
        $(this).removeClass("focus");
    }

    return {
        init: init
    };
});