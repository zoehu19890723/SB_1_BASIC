/** 
 * @author zoe
 * @description My leave detail info controller.
 * Created at 2016/6/24  
 */
define(["app"], function(app) {


    var bindings = [{
        element: '.approve-link-actions',
        event: 'click',
        handler: clickAction
    }];
    /**
     * Id of the last approve item
     * @type {String}
     */
    var generalId = null;
    /**
     * Id of the main leave item
     * @type {String}
     */
    var id = "";
    var code = 0;
    var title = '';

    /**
     * init the controller
     * @param  {Object} query : Object with title,id and code
     */
    function init(query) {
        var tempStr = getI18NText('my');
        
        if(query.title !== undefined && query.title !== null){
            tempStr = query.title.replace('[/s]',' ')+ getI18NText('prep');
        }
        title = tempStr + getI18NText('transferTitle'); //谁发起的申请
        id = query.id;
        code = parseInt(query.code); //0:：待我审批的；1：我已审批的

        $('.my-leave-detail-info').text(title);
        initKeyBoardEvent();
        showLoading();
        var model_ = {
                isNull: false,
                code: code
            }
        /**
         * on ajax service success
         * @param  {Object} data : success data 
         */
        var onSuccess = function(data) {
                closeLoading();
                if (parseInt(data.status) === 1) {
                    if (data.data === undefined || (data.data && data.data.length === 0)) {
                        model_.isNull = true;
                    } else {
                        if (data.data.applyPerson !== undefined) {
                            data.data.applyPerson = dealImage([data.data.applyPerson], true)[0];
                            if (data.data.approvePerson !== undefined && data.data.approvePerson.length !== 0) {
                                var last_person_arr = data.data.approvePerson[data.data.approvePerson.length - 1].data;
                                last_person_arr.forEach(function(item){
                                    var status = parseInt(item.status.step_status);
                                    if(status === 1){
                                        generalId = item.id;
                                        return;
                                    }
                                })
                                data.data.approvePerson.forEach(function(item){
                                    item.data = dealPersonImage(item.data);
                                })
                            }
                        }
                        model_.data = data.data;
                    }
                } else if(parseInt(data.status) === 605){
                    app.f7.alert(getI18NText('DBError'));
                }else {
                    app.f7.alert(data.message);
                }
                var afterRender = function() {
                    if (model_.data && model_.data.approvePerson !== undefined && model_.data.approvePerson !== null && model_.data.approvePerson.length > 0) {
                        var heightTop = $('.one-item').first().find('.status-img').offset().top;
                        var heightBottom = $('.one-item').last().find('.status-img').offset().top;
                        var height = heightBottom - heightTop + 40;
                        $('.flow-line').height(height);
                    }
                }
                var renderObject = {
                    selector: $('.transferDetail'),
                    hbsUrl: "js/transferDetail/transferDetail",
                    model: model_,
                    bindings: bindings,
                    afterRender: afterRender
                }
                viewRender(renderObject);
            }
            /**
             * on ajax service failed
             * @param  {Object} e : error object
             */
        var onError = function(e) {
            closeLoading();
            app.f7.alert(getI18NText('network-error'));
        }
        var data = {
            "argsJson": JSON.stringify({
                "id": id})
        }

        var url = ess_getUrl("humanresource/HumanResourceRelocationWebsvcService/getTransferDetailInfo/");
        var module = {
            html : 'HRTransfer/transferDetail.html',
            param : {
                id : id,
                title : title,
                code : code
            }
        }
        getAjaxData(module,url, onSuccess, onError,data);
    }
    return {
        init: init
    }
    /**
     * init the key board event ,with android system when input focused change the style of the textarea 
     */
    function initKeyBoardEvent() {
        window.addEventListener('native.keyboardshow', function(e) {
            var height = e.keyboardHeight;
            $('.detail-edit-content').addClass("focused");
            $('.detail-edit-content').css("bottom", height);
        });
        window.addEventListener('native.keyboardhide', function(e) {
            $('.detail-edit-content').removeClass("focused");
            $('.detail-edit-content').css("bottom", 44);
        });
    }

     function dealPersonImage(array) {
        if (array && array.length !== 0) {
            array.forEach(function(item, index) {
                var subItem = item;
                if (subItem && subItem.image && subItem.image !== "" && subItem.image.indexOf(Star_imgUrl) < 0) {
                    var image = subItem.image.replace(/\s/g, '%20');
                    subItem.image = Star_imgUrl + image;
                    item = subItem;
                }
            })
        }
        return array;
    }

    /**
     * Click the pass or reject button when approve the item
     * @param  {Object} e click event object
     */
    function clickAction(e) {
        if(generalId === null){
            app.f7.alert(getI18NText('ApproveDataError'));
            return;
        }
        showLoading();
        var actionButton = $('.approve-link-actions');
        var ActionCode = $(e.currentTarget).attr("code");
        actionButton.addClass("disable-click");
        var onSuccess = function(data) {
            closeLoading();
            actionButton.removeClass("disable-click");
            if (parseInt(data.status) === 1 && data.data && data.data.status === true) {
                app.f7.alert(getI18NText('approvalSuc'), function() {
                    app.mainView.router.back({
                        url: "./js/myApprove/myApprove.html",
                        ignoreCache: true,
                        force: true
                    });
                });
            } else {
                var msg = (data.data.message) ? data.data.message : data.message;
                if(parseInt(data.status) === 605){
                    msg = getI18NText('DBError');
                }
                app.f7.alert(msg, function() {
                    app.mainView.router.back({
                        url: "./js/myApprove/myApprove.html",
                        ignoreCache: true,
                        force: true
                    });
                });
            }
        }

        var onError = function(e) {
            closeLoading();
            actionButton.removeClass("disable-click");
            app.f7.alert(getI18NText('network-error'));
        }

        var url = ess_getUrl("humanresource/HumanResourceRelocationWebsvcService/ApproveTransfer/");
        var reson = $("#leave-reson").val();
        if (reson === null || reson === "") {
            reson = (parseInt(ActionCode) === 0) ? getI18NText('approve') : getI18NText('refuse');
        }
        var data = {
            "argsJson": JSON.stringify({
                "id": parseInt(generalId),
                "resultCode": parseInt(ActionCode),
                "msg": reson
            })
        }
        var module = {
            html : 'HRTransfer/HRTransfer/HRTransfer.html',
            param : {
                id : id,
                title : title,
                code : code
            }
        }
        getAjaxData(module, url, onSuccess, onError, data);
    }


});