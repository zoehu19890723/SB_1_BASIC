/** 
 * @author zoe
 * @description My leave info controller
 * Created at 2016/6/24  
 */
define(["app"], function(app) {


    var bindings = [{
        element: '.leave-item',
        event: 'click',
        handler: openNewPage
    }];

    var module = {
        html : 'myLeave/myLeaveInfo/myLeaveInfo.html'
    }
    /**
     * init controller
     */
    function init() {
        showLoading();
        var model_ = {
            "card": storeWithExpiration.get("ee_person").profile,
            "isNull": false,
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
                        var tempArr = data.data.notApproved || [];
                        tempArr.forEach(function(item, index) {
                            _.extend(item, {
                                userInfo: {
                                    image: model_.card.photo,
                                    name: model_.card.name
                                }
                            })
                        });
                        data.data.notApproved = tempArr;
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
                    selector: $('.myleaveinfo'),
                    hbsUrl: "js/myLeave/myLeaveInfo/myLeaveInfo",
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
            app.f7.alert(getI18NText('network-error'),function(){
                afterRender();
            });
        }

        getAjaxData(module,ess_getUrl("ess/ELeave/getMyLeaveInfo/"), onSuccess, onError);
    }

    return {
        init: init
    };

    /**
     * open detail page of my leave
     * @param  {Object} e :click event
     */
    function openNewPage(e) {
        var id = $(e.currentTarget).find(".link-page").attr("toPage");
        var currentTab = $(e.currentTarget).parent().parent().attr("id");
        var code = (currentTab === "tab2") ? 1 : 0;

        app.mainView.router.load({
            url: './js/myLeave/myLeaveDetailInfo/myLeaveDetailInfo.html?id=' + id + "&code=" + code
        })
    }

});