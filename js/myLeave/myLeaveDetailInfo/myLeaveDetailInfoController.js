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
    }, {
        element: '.cancel-link-actions',
        event: 'click',
        handler: clickCancel
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
    var from = null;
    /**
     * init the controller
     * @param  {Object} query : Object with title,id and code
     */
    function init(query) {
        var tempStr = getI18NText('my');
        if(query.title !== undefined && query.title !== null){
            tempStr = query.title.replace('[/s]',' ') + getI18NText('prep');
        }
        title = tempStr + getI18NText('real-leave'); //谁发起的申请
        id = query.id;
        code = parseInt(query.code); //0:我发起的未审批的；1：我发起的审批的；2：待我审批的；3：我已审批的
        from = query.from;

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
                                last_person_arr.forEach(function(item) {
                                    var status = parseInt(item.status.step_status);
                                    if (status === 1) {
                                        generalId = item.id;
                                        return;
                                    }
                                })
                                data.data.approvePerson.forEach(function(item) {
                                    item.data = dealPersonImage(item.data);
                                })
                            }
                        }
                        model_.data = data.data;
                    }
                } else {
                    var message = data.message;
                    if (parseInt(data.status) === 605) {
                        message = getI18NText('DBError');
                    }
                    app.f7.alert(message);
                }
                var afterRender = function() {
                    if (model_.data && model_.data.approvePerson !== undefined && model_.data.approvePerson !== null && model_.data.approvePerson.length > 0) {
                        var heightTop = $('.one-item').first().find('.status-img').offset().top;
                        var heightBottom = $('.one-item').last().find('.status-img').offset().top;
                        var height = heightBottom - heightTop + 30;
                        $('.flow-line').height(height);

                        var totalHeight = $('.page-content').height() - 88;
                        var blockHeight = $('.basic-info-card').height() + $('.approve-flow-card').height() + 16 + 95;

                        if (totalHeight > blockHeight) {
                            var marginTop = totalHeight - blockHeight;
                            $('.item-content.detail-edit-content').css('margin-top', marginTop);
                        }
                    }
                }
                var renderObject = {
                    selector: $('.myleavedetailinfo'),
                    hbsUrl: "js/myLeave/myLeaveDetailInfo/myLeaveDetailInfo",
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
        var url = ess_getUrl("ess/ELeave/getleaveDetailInfo/");
        var module = {
            html: 'myLeave/myLeaveDetailInfo/myLeaveDetailInfo.html',
            param: {
                id: id,
                title: title,
                code: code
            }
        }
        getAjaxData(module, url, onSuccess, onError,data);
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
        var code = $(e.currentTarget).attr("code");
        actionButton.addClass("disable-click");

        var back_url = "./js/myLeave/myLeaveApprove/myLeaveApprove.html";
        if(from !== undefined && from !== null){
            back_url = "./js/myApprove/myApprove.html"
        }
        var onSuccess = function(data) {
            closeLoading();
            actionButton.removeClass("disable-click");
            if (parseInt(data.status) === 1 && data.data && data.data.status === true) {
                app.f7.alert(getI18NText('approvalSuc'), function() {
                    app.mainView.router.back({
                        url: back_url,
                        ignoreCache: true,
                        force: true
                    });
                });
            } else {
                var msg = (data.data.message) ? data.data.message : data.message;
                if (parseInt(data.status) === 605) {
                    msg = getI18NText('DBError');
                }
                app.f7.alert(msg, function() {
                    app.mainView.router.back({
                        url: back_url,
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

        var url = ess_getUrl("ess/ELeave/ApproveLeaveItem/");
        var reson = $("#leave-reson").val();
        if (reson === null || reson === "") {
            reson = (parseInt(code) === 0) ? getI18NText('approve-apply') : getI18NText('refuse-apply')
        }
        var data = {
            "argsJson": JSON.stringify({
                "id": generalId,
                "resultCode": parseInt(code),
                "msg": reson
            })
        }

        var module = {
            html: 'myLeave/myLeaveDetailInfo/myLeaveDetailInfo.html',
            param: {
                id: id,
                title: title,
                code: code
            }
        }
        getAjaxData(module, url, onSuccess, onError, data);
    }
    /**
     * click the cancel button when user self cancel the approvement
     * @param  {Object} e click event object
     */
    function clickCancel(e) {
        showLoading();
        var cancelButton = $('.cancel-link-actions');
        cancelButton.addClass("disable-click");

        var onSuccess = function(data) {
            closeLoading();
            cancelButton.removeClass("disable-click");
            if (parseInt(data.status) === 1 && data.data && data.data.status === true) {
                app.f7.alert(getI18NText('revoke-success'), function() {
                    app.mainView.router.back({
                        url: "./js/myLeave/myLeaveInfo/myLeaveInfo.html",
                        ignoreCache: true,
                        force: true
                    });
                });
            } else {
                var msg = (data.data.message) ? data.data.message : data.message;
                if (parseInt(data.status) === 605) {
                    msg = getI18NText('DBError');
                }
                app.f7.alert(msg, function() {
                    app.mainView.router.back({
                        url: "./js/myLeave/myLeaveInfo/myLeaveInfo.html",
                        ignoreCache: true,
                        force: true
                    });
                });
            }
        }

        var onError = function(e) {
            closeLoading();
            cancelButton.removeClass("disable-click");
            app.f7.alert(getI18NText('network-error'));
        }

        var reson = $("#leave-reson").val();
        if (reson === null || reson === "") {
            reson = getI18NText('cancel-apply');
        }
        var url = ess_getUrl("ess/ELeave/CancelAttendanceApply/");
        var data = {
            "argsJson": JSON.stringify({
                "id": id,
                "workflowType": "LEAVE",
                "cancelReason": reson
            })
        }
        var module = {
            html: 'myLeave/myLeaveDetailInfo/myLeaveDetailInfo.html',
            param: {
                id: id,
                title: title,
                code: code
            }
        }

        getAjaxData(module, url, onSuccess, onError, data);
    }

});