/**
 * Created by Zoe.Hu on 2016/10/26.
 */
define(["app"], function(app) {

    var bindings = [{
        element: '.seeDetail',
        event: 'click',
        handler: seeDetail
    }, {
        element: '.search-histroy-panel .wx-contacts',
        event: 'click',
        handler: clickHistory
    }, {
        element: '.tab-link',
        event: 'click',
        handler: jumpPage
    }, {
        element: '.input-box',
        event: 'search',
        handler: onSearch
    }, {
        element: '.input-box',
        event: 'input',
        handler: onChange
    }, {
        element: '.input-box',
        event: 'focus',
        handler: onSearchFocus
    }, {
        element: '.cancel_btn',
        event: 'click',
        handler: onSearchCancel
    }, {
        element: '.search-bar-panel form',
        event: 'submit',
        handler: onSubmit
    }];

    var module = {
        html: 'myContact/contactList/contactList.html'
    }

    function init() {
        var onSuccess = function(data) {
            closeLoading();
            if (data.status === 1) {
                store.set('myFavorContact', data.data);
                showList(data.data);

            } else {
                var message = data.message;
                if (parseInt(data.status) === 605) {
                    message = getI18NText('DBError');
                }
                app.f7.alert(message);
            }
        }
        var onError = function(e) {
            closeLoading();
            app.f7.alert(getI18NText('network-error'));
        }
        var favorList = store.get('myFavorContact');
        if (favorList) {
            showList(favorList);
        } else {
            showLoading();
            getAjaxData(module, ess_getUrl("humanresource/HumanResourceWebsvcService/getFavorAddressList/"), onSuccess, onError);
        }
    }

    function showList(list) {
        var noFavor = true;
        if (list !== undefined && list !== null && list.length > 0) {
            list.forEach(function(item, index) {
                if (item.photo !== undefined && item.photo !== null && item.photo.indexOf(Star_imgUrl) < 0) {
                    var image = item.photo.replace(/\s/g, '%20');
                    item.photo = Star_imgUrl + image;
                }
            });
            noFavor = false;
        }
        var renderObject = {
            selector: $('.contactList'),
            hbsUrl: "js/myContact/contactList/contactList",
            model: {
                favorList: list,
                noFavor: noFavor,
                historyList: getHistoryList()
            },
            bindings: bindings
        }
        viewRender(renderObject);
    }

    function seeDetail(e) {
        var id = $(e.target).parents('li').attr("data-id") || $(e.target).attr("data-id");
        if(id === undefined || id === null){
            return;
        }
        app.mainView.router.load({
            url: "js/myContact/contactDetail/contactDetail.html?id=" + id + '&fromList=true'
        });
    }

    function jumpPage(e) {
        var id = $(e.currentTarget).attr("toPage");
        if ("myProfile" == id) {
            app.mainView.router.load({
                url: "js/myProfile/myProfile.html",
                animatePages: false
            })
        } else if ("myMessage" == id) {
            app.mainView.router.load({
                url: "js/myMessage/messageOverview/messageOverview.html",
                animatePages: false
            })
        } else {
            app.mainView.router.load({
                url: "js/ee_self/self_base/self_base.html",
                animatePages: false
            })
        }
    }

    function clickHistory(e) {
        var key = $(e.target).parents('li').attr("search-key") || $(e.target).attr("search-key");
        if(key === undefined || key === null){
            if($(e.target).hasClass('clearHistory')){
                clearSearchHistoryList()
            }
        }else{
             $('.input-box').val(key);
            onSearch();
        }
    }

    function onSearch() {
        var value = $('.input-box').val();
        if(value === null || value === '' || value.trim() ===''){
            app.f7.alert(getI18NText('searchTextNull'));
            return;
        }
        showLoading();
        $('.search-result-panel .wx-contacts').empty();
        var onSuccess = function(data) {
            closeLoading();
            if (data.status === 1) {
                var list = data.data;
                var str = '<li class="wx-title no-search-result">'+getI18NText('noResult')+'</li>';
                if (list !== undefined && list !== null && list.length > 0) {
                    str = '<li class="wx-title group-title common-layout-center">'+getI18NText('search-result')+'</li>';
                    list.forEach(function(item, index) {
                        if (item.photo !== undefined && item.photo !== null && item.photo.indexOf(Star_imgUrl) < 0) {
                            var image = item.photo.replace(/\s/g, '%20');
                            item.photo = Star_imgUrl + image;
                        }
                        str += '<li class="wx-item favor-list-item" data-id="' + item.id + '">' + '<span class="wx-icon cut-img">' + '<img onload="AutoResizeImage(36,this)" src="' + item.photo + '" onerror="javascript:this.src=\'./img/default.jpg\';"/>' + '</span>' + '<div class="wx-name">' + item.name + '</div>' + '<div class="wx-pos">';
                        if (item.organization !== undefined && item.organization !== null && item.organization !== 'null') {
                            str += '<span>' + item.organization + '</span>';
                        }
                        if (item.position !== undefined && item.position !== null && item.position !== 'null' && item.position.trim() !== '') {
                            str += '<span class="position-detail">' + item.position + '</span>';
                        }
                        str += '</div></li>';

                    });
                }
                $('.search-result-panel .wx-contacts').append(str);
                $('.search-histroy-panel').css('display', 'none');
                $('.myFavor-list-panel').css('display', 'none');

                updateHistorylist(value);
            } else {
                var message = data.message;
                if (parseInt(data.status) === 605) {
                    message = getI18NText('DBError');
                }
                app.f7.alert(message);
            }
        }

        var onError = function(e) {
            closeLoading();
            app.f7.alert(getI18NText('network-error'));
        }

        var data = {
            argsJson: JSON.stringify({
                id: null,
                text: value
            })
        }
        getAjaxData(module, ess_getUrl("humanresource/HumanResourceWebsvcService/getSearchAddressList/"), onSuccess, onError, data);
    }

    function onChange() {
        var value = $('.input-box').val();
        if (value === '') {
            var height = setHistroyListDom();
            $('.search-histroy-panel').css('display', 'block').css('height', height);
            $('.myFavor-list-panel').css('display', 'block');
            $('.search-result-panel .wx-contacts').empty();
        }
    }

    function onSearchFocus() {
        $('.search-bar-panel').css('width', 'calc(96% - 100px)');

        var height = setHistroyListDom();
        $('.search-histroy-panel').css('height', height);
    }

    function onSearchCancel() {
        $('.search-bar-panel').css('width', 'calc(96% - 40px)');
        $('.search-histroy-panel').css('display', 'block').css('height', 0);
        $('.myFavor-list-panel').css('display', 'block');
        $('.search-result-panel .wx-contacts').empty();
        $('.input-box').val('');
    }

    function getHistoryList() {
        var list = store.get('searchList');
        return list || [];
    }

    function updateHistorylist(text) {
        var old_list = getHistoryList();
        var new_list = [];
        if (old_list) {
            new_list = _.first(_.without(old_list, text), 4);
            new_list.unshift(text);
        } else {
            new_list = [text];
        }
        store.set('searchList', new_list);
    }

    function setHistroyListDom() {
        var list = getHistoryList();
        var height = 0;
        $('.search-histroy-panel .wx-contacts').empty();
        if (list.length > 0) {
            var str = '<li class="wx-title group-title common-layout-center"><span style="flex:1">'+getI18NText('search-history')+'</span><span class="clearHistory">'+getI18NText('clear-out')+'</span></li>';
            list.forEach(function(item, index) {
                str += '<li class="wx-item user-info serach-history-item" search-key="' + item + '">' + '<span class="wx-icon">' + '<i class="WeStar_iconfont">&#xe631</i>' + '</span>' + '<div class="wx-name">' + item + '</div></li>'
            });
            $('.search-histroy-panel .wx-contacts').append(str);
            height = list.length * 52 + 34;
        }
        return height;
    }

    function clearSearchHistoryList(){
        store.set('searchList',[]);
        setHistroyListDom();
        $('.search-histroy-panel').css('display','none');
    }

    function onSubmit(){
        return false;
    }

    return {
        init: init
    };
});