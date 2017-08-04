/** 
 * @author zoe
 * @description My overtime info controller
 * Created at 2016/6/24  
 */
define(["app"], function(app) {

    var bindings = [{
        element: '.leave-item',
        event: 'click',
        handler: openNewPage
    }];
    var module = {
        html : 'myOverTime/myOverTimeInfo/myOverTimeInfo.html'
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
                    app.f7.alert(data.message);
                }
                var renderObject = {
                    selector: $('.myovertimeinfo'),
                    hbsUrl: "js/myOverTime/myOverTimeInfo/myOverTimeInfo",
                    model: model_,
                    bindings: bindings,
                    afterRender : afterRender
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

        getAjaxData(module,ess_getUrl("ess/EOT/getMyOverTimeInfo/"), onSuccess, onError);
    }

    return {
        init: init
    };
    /**
     * open detail page of my overtime
     * @param  {Object} e :click event
     */
    function openNewPage(e) {
        var id = $(e.currentTarget).find(".link-page").attr("toPage");
        var currentTab = $(e.currentTarget).parent().parent().attr("id");
        var code = (currentTab === "tab2") ? 1 : 0;

        app.mainView.router.load({
            url: './js/myOverTime/myOverTimeDetailInfo/myOverTimeDetailInfo.html?id=' + id + "&code=" + code
        })
    }
});