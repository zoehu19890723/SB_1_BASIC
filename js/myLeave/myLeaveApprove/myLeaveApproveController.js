/** 
 * @author zoe
 * @description My leave approve controller.
 * Created at 2016/6/24  
 */
define(["app"], function(app) {

    var bindings = [{
        element: '.leave-item',
        event: 'click',
        handler: openNewPage
    }];

    var module = {
        html : 'myLeave/myLeaveApprove/myLeaveApprove.html'
    }

    /**
     * init controller
     */
    function init() {
        showLoading();
        var model_ = {
            "isNull": false
        };
        var afterRender = function() {
            //app.f7.initPullToRefresh($(".pull-to-refresh-content"));
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
                        data.data.notApproved = dealImage(data.data.notApproved);
                        data.data.approved = dealImage(data.data.approved);
                        model_.data = data.data;
                    }

                } else {
                    var message = data.message;
                    if (parseInt(data.status) === 605) {
                        message = getI18NText('DBError');
                    }
                    app.f7.alert(message);
                }
                var renderObject = {
                    selector: $('.myleaveapprove'),
                    hbsUrl: "js/myLeave/myLeaveApprove/myLeaveApprove",
                    model: model_,
                    bindings: bindings,
                    afterRender: afterRender
                }
                viewRender(renderObject);
            }
            /**
             * on ajax service success
             * @param  {Object} data : success data 
             */
        var onError = function(e) {
            closeLoading();
            app.f7.alert(getI18NText('network-error'),function(){
                afterRender();
            });
        }

        getAjaxData(module,ess_getUrl("ess/ELeave/getMyLeaveApproveInfo/"), onSuccess, onError);
    }
    return {
        init: init
    };
    /**
     * open detai page of my profile
     * @param  {Object} e :click event
     */
    function openNewPage(e) {
        var id = $(e.currentTarget).find(".link-page").attr("toPage");
        var title = $(e.currentTarget).find(".link-page").attr("name");
        var currentTab = $(e.currentTarget).parent().parent().attr("id");
        var code = (currentTab === "tab2") ? 3 : 2;

        app.mainView.router.load({
            url: './js/myLeave/myLeaveDetailInfo/myLeaveDetailInfo.html?id=' + id + "&title=" + title + "&code=" + code
        })
    }
});