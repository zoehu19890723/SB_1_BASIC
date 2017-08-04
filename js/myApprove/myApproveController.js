define(["app"], function(app) {
    var bindings = [{
        element: '.leave-item',
        event: 'click',
        handler: openNewPage
    }];

    var module = {
        html : 'myApprove/myApprove.html'
    }
    /**
     * init controller
     */
    function init() {
        showLoading();
        var model_ = {
            "isNull": false,
        };
        /**
         * on ajax service success
         * @param  {Object} data : success data 
         */
        var onSuccess = function(data) {
                closeLoading();
                if (parseInt(data.status) === 1) {
                    if (data.data === undefined || data.data === null || (data.data && data.data.length === 0)) {
                        model_.isNull = true;
                    } else {
                        var tempArr = data.data.notApproved || [];
                        tempArr.forEach(function(item, index) {
                            _.extend(item, {
                                userInfo: {
                                    image: item.userInfo.image,
                                    name: item.userInfo.name.replace(' ','[/s]')
                                }
                            });
                        });
                        data.data.notApproved = tempArr;
                        data.data.approved = dealImage(data.data.approved);

                        model_.data = data.data;
                    }

                }else if(parseInt(data.status) === 605){
                    app.f7.alert(getI18NText('DBError'));
                }else {
                    app.f7.alert(data.message);
                }
                var renderObject = {
                    selector: $('.myApprove'),
                    hbsUrl: "js/myApprove/myApprove",
                    model: model_,
                    bindings: bindings
                }
                viewRender(renderObject);
            }
            /**
             * on ajax service success
             * @param  {Object} data : success data 
             */
        var onError = function(e) {
            closeLoading();
            app.f7.alert(getI18NText('network-error'));
        }

      getAjaxData(module,ess_getUrl("ess/MyApprovalService/getMyApproveInfo/"), onSuccess, onError);
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
        var title = $(e.currentTarget).find(".link-page").attr("name") || '未知';
        var currentTab = $(e.currentTarget).parent().parent().attr("id");
        var code = (currentTab === "tab2") ? 3 : 2;

        if(id.indexOf('E01') > -1 || id.indexOf('E02') > -1 ){
            app.mainView.router.load({
                url: './js/myLeave/myLeaveDetailInfo/myLeaveDetailInfo.html?from=approve&id=' + id + "&title=" + title + "&code=" + code
            })
        }else if(id.indexOf('E03') > -1 || id.indexOf('E04') > -1 ){
            app.mainView.router.load({
                url: './js/myOverTime/myOverTimeDetailInfo/myOverTimeDetailInfo.html?from=approve&id=' + id + "&title=" + title + "&code=" + code
            })
        }else{
            code = (currentTab === "tab2") ? 1 : 0;
            app.mainView.router.load({
                url: './js/transferDetail/transferDetail.html?id=' + id + "&title=" + title + "&code=" + code
            });
        }
        
    }
});