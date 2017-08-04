define(["app"], function(app) {

    var bindings = [{
        element: '.wx-circle',
        event: 'click',
        handler: openNewPage
    }, {
        element: '.tab-link',
        event: 'click',
        handler: jumpPage
    }];

    var module = {
            html : 'myProfile/myProfile.html',
        }

    function init() {
        $('.navbar').removeClass("navbar-none");
        initWeStar();
    }

    return {
        init: init
    };

    function openNewPage(e) {
        var id = $(e.currentTarget).attr("toPage");
        switch(id){
            case 'myLeave' : {
                app.mainView.router.load({
                    url: './js/myLeave/myLeave/myLeave.html'
                });
                break;
            }
            case 'myOverTime' : {
                app.mainView.router.load({
                    url: './js/myOverTime/myOverTime/myOverTime.html'
                });
                break;
            }
            case 'myStarProfile' : {
                app.mainView.router.load({
                    url: './js/weStarPerson/summary/summary.html'
                });
                break;
            }
            case 'myStarSalary' : {
                app.mainView.router.load({
                    url: './js/weStarSalary/weStarSalary.html'
                });
                break;
            }
            case 'myAttend' : {
                app.mainView.router.load({
                    url: './js/myAttendance/myAttendance.html'
                });
                break;
            }
            case 'myApprove' : {
                app.mainView.router.load({
                    url: './js/myApprove/myApprove.html'
                });
                break;
            }
            case 'myTeam' : {
                app.mainView.router.load({
                    url: './js/myTeam/myTeam.html'
                });
                break;
            }
            case 'moreFunc' : {
                app.mainView.router.load({
                    url: './js/moreFunc/moreFunc.html'
                });
                break;
            }
            default : {
                app.f7.alert(getI18NText('noFunc'));
            }

        }
    }

    function jumpPage(e) {
        var id = $(e.currentTarget).attr("toPage");
        if ("myContact" === id) {
            app.mainView.router.load({
                url: "js/myContact/contactList/contactList.html",
                animatePages: false
            })
        } else if("mySelf" === id){
            app.mainView.router.load({
                url: "js/ee_self/self_base/self_base.html",
                animatePages: false
            })
        }else  if ("myMessage" == id){
            app.mainView.router.load({
                url: "js/myMessage/messageOverview/messageOverview.html",
                animatePages: false
            })
        }
    }

    function initWeStar() {
        var myprofile_menudata = {};
        myprofile_menudata.profile = setStarMenu();
        var imageArray = [{
            action: 'NoAction',
            title: getI18NText('benifits'),
            img: './img/ess_banner_1.jpg'
        }, {
            action: 'NoAction',
            title: getI18NText('social-security'),
            img: './img/ess_banner_2.jpg'
        }];
        myprofile_menudata.banner = imageArray;

        var afterRender = function() {
            app.f7.swiper('.swiper-1', {
                pagination: '.swiper-1 .pagination-1',
                lazyLoading: true,
                autoplay: 4000,
                autoplayDisableOnInteraction: false
            });
            $('#myProfile_center').text(getI18NText('ESSTitle'));
            closeLoading();
        }

        var renderObject = {
            selector: $('.my-profile'),
            hbsUrl: "js/myProfile/myProfile",
            model: myprofile_menudata,
            bindings: bindings,
            afterRender: afterRender
        }
        viewRender(renderObject);
    }

    function setStarMenu() {
        var menu_info = [{
            code: 'myStarProfile',
            title: getI18NText('myStarProfile')
        }, {
            code: 'myStarSalary',
            title: getI18NText('myStarSalary')
        }, {
            code: 'myLeave',
            title: getI18NText('myLeave')
        }, {
            code: 'myOverTime',
            title: getI18NText('myOverTime')
        }, {
            code: 'myAttend',
            title: getI18NText('myAttend')
        }, {
            code: 'myApprove',
            title: getI18NText('myApprove')
        }, {
            code: 'myTeam',
            title: getI18NText('my-team')
        // }, {
        //     code: 'moreFunc',
        //     title: ''
        }]
        return menu_info;
    }
});