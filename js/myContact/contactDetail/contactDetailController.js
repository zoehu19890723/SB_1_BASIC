/**
 * Created by Zoe.Hu on 2016/10/26.
 */
define(["app"], function(app) {
    var contact = null;
    var bindings = [{
        element: '#myContact_contactDetail_label',
        event: 'click',
        handler: changeFavor
    },{
        element: '.my-contact-detail',
        event: 'click',
        handler: backToContactListForce
    },{
        element: '.supervisor-item',
        event: 'click',
        handler: goToSupervisor
    },{
        element: '.back-previous',
        event: 'click',
        handler: backToPrevious
    },{
        element: '.subordinate-item',
        event: 'click',
        handler: gotoSubordinate
    }];

    var module = {
        html: 'myContact/contactDetail/contactDetail.html'
    }

    var id = null;

    function init(query) {
        id = query.id;
        showLoading();
        var onSuccess = function(data) {
            closeLoading();
            if (data.status === 1) {
                contact = new Contact(data.data);
            } else {
                var message = data.message;
                if (parseInt(data.status) === 605) {
                    message = getI18NText('DBError');
                }
                app.f7.alert(message);
            }
            renderView(query);
        }

        var onError = function(e) {
            closeLoading();
            app.f7.alert(getI18NText('network-error'),function(){
                renderView(query);
            });
        }

        var data = {
            argsJson: JSON.stringify({
                id: id,
            })
        }
        getAjaxData(module, ess_getUrl("humanresource/HumanResourceWebsvcService/getAddressDetail/"), onSuccess, onError, data);
    }

    function renderView(query){
        if(query.goToSupervisor !== undefined){
            contact.animation = 'fromRight'
        }
        if(query.back !== undefined){
            contact.animation = 'fromLeft'
        }
        if(query.fromList !== undefined){
            store.set('tempOrgin',{id : id , name : contact.name});
        }
        var originObj = store.get('tempOrgin');
        if(id !== originObj.id){
            contact.origin = {
                id : originObj.id,
                name : originObj.name
            }
        }else{
            contact.origin = null;
        }

        var afterRender = function(){
            var width = $('body').width();
            $('.contactDetail .page-content').css('width',width);
        }
        var renderObject = {
            selector: $('.contactDetail'),
            hbsUrl: "js/myContact/contactDetail/contactDetail",
            model: contact,
            afterRender : afterRender,
            bindings: bindings
        }
        viewRender(renderObject);
    }

    function Contact(values) {
        if (values === undefined || values === null) {
            this.isNull = true;
            return;
        }
        values = values || {};
        this.isNull = false;

        this.id = values.id || '';
        this.mobile = values.mobile || '';
        this.name = values.name || '';

        if (values.photo !== undefined && values.photo !== null && values.photo.indexOf(Star_imgUrl) < 0) {
            var image = values.photo.replace(/\s/g, '%20');
            values.photo = Star_imgUrl + image;
        }
        this.photo = values.photo || '';
        this.gender = values.gender || 0;
        this.email = values.email || '';
        this.post = values.position || '';
        if (values.supervisor === undefined || values.supervisor === null || values.supervisor.name === undefined || values.supervisor.name === null || values.supervisor.id === undefined || values.supervisor.id === null) {
            this.supervisor = null;
        } else {
            this.supervisor = values.supervisor
        }
        this.isFavor = parseInt(values.isFavor) || 0;
        this.organization = values.organization;
        this.subordinate_no = parseInt(values.subordinate_no || 0);
    }

    function changeFavor(e) {
        e.preventDefault();
        var onSuccess = function(data) {
            closeLoading();
            if (data.status === 1) {
                if (destFavor === 1) {
                    showToast(getI18NText('favorSuccess'), 2000);
                    contact.isFavor = 1;
                    $('#isFavorite').attr('checked','on');
                    updateFavorList(true);
                } else {
                    showToast(getI18NText('delFavorSuccess'), 2000);
                    contact.isFavor = 0;
                    $('#isFavorite').removeAttr('checked');
                    updateFavorList(false);
                }
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

        var destFavor = 0;

        if (contact.isFavor === 0) {
            destFavor = 1;
        } else {
            destFavor = 0;
        }
        var data = {
            argsJson: JSON.stringify({
                id: id,
                isFavor: destFavor
            })
        }

        if (destFavor === 0) {
            app.f7.confirm(getI18NText('sureToDelFavor'), function() {
                showLoading();
                getAjaxData(module, ess_getUrl("humanresource/HumanResourceWebsvcService/changeFavor/"), onSuccess, onError, data);
            });
        } else {
            showLoading();
            getAjaxData(module, ess_getUrl("humanresource/HumanResourceWebsvcService/changeFavor/"), onSuccess, onError, data);
        }
    }

    function updateFavorList(flag) {
        var favorList = store.get('myFavorContact') || [];

        var newObj = {
            id: id,
            name: contact.name,
            organization: contact.organization,
            photo: contact.photo,
            position: contact.post
        }

        if (flag === true) {
            favorList.push(newObj);
        } else {
            var index = _.findIndex(favorList, {
                id: id
            });
            favorList.splice(index, 1);
        }
        store.set('myFavorContact', favorList);
    }

    function backToContactListForce(){
        app.mainView.router.back({
            url: 'js/myContact/contactList/contactList.html',
            force: true,
            ignoreCache: true
        });
    }

    function goToSupervisor(e){
        var new_id = $(e.currentTarget).attr('data-id');
        init({id : new_id,goToSupervisor : true});
    }

    function backToPrevious(e){
        var new_id = $(e.currentTarget).attr('data-id');
        var name = $(e.currentTarget).attr('data-name');
        init({id : new_id,back : true});
    }

    function gotoSubordinate(e){
        app.mainView.router.load({
            url: 'js/myContact/subSelect/subSelect.html?id='+id,
        });
    }

    return {
        init: init
    };
});