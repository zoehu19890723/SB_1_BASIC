/** 
 * @author zoe
 * @description It is the summary controller for my profile summary view .
 * Created at 2016/6/24  
 */
define(["app"], function(app) {
    var bindings = [{
        element: '.we-star-person',
        event: 'click',
        handler: openNewPage
    }];

    var generalID = null;
    /**
     * init controller
     */
    function init(param) {
        generalID = null;
        var name = getI18NText('my');
        if (param.id !== undefined) {
            generalID = param.id;
        }
        if (param.name !== undefined) {
            name = param.name + getI18NText('prep');
        }

        var beforeRender = function() {
            $(".myprofile-summary").text(name + getI18NText('StarProfile'));
        }
        var renderObject = {
            selector: $('.person-summary'),
            hbsUrl: "js/weStarPerson/summary/summary",
            model: {},
            bindings: bindings,
            beforeRender: beforeRender
        }
        setPersonalProfile(renderObject);
    }

    return {
        init: init,
        setPersonalProfile: setPersonalProfile
    };

    /**
     * set personal profile
     * @param {Object} view  : hbs view
     * @param {Object} model : data model for hbs templete
     * @param {Array} binds : listeners for view
     */
    function setPersonalProfile(renderObject) {
        /**
         * on ajax service success
         * @param  {Object} data : success data 
         */
        var onSuccess = function(data) {
            closeLoading();
            var model_ = renderObject.model;
            if (data.status === "1" || data.status === 1) {
                var photo = data.data.profile.photo;
                if (photo && '' !== photo && photo.indexOf(Star_imgUrl) < 0) {
                    photo = photo.replace(/\s/g, '%20');
                    data.data.profile.photo = Star_imgUrl + photo;
                }
                if (generalID === undefined || generalID === null) {
                    storeWithExpiration.set('ee_person', data.data);
                } else {
                    storeWithExpiration.set('selected_person', data.data);
                }
                var detailArray = _.pairs(_.omit(data.data, "profile"));
                model_.detailArray = detailArray;
                model_.card = data.data.profile;
            } else {
                var message = data.message;
                if (parseInt(data.status) === 605) {
                    message = getI18NText('DBError');
                }
                if (generalID !== undefined && generalID !== '') {
                    app.f7.alert(message);
                } else {
                    app.f7.alert(message, function() {
                        app.mainView.router.load({
                            url: "index.html"
                        });
                    });
                }

            }
            renderObject.model = model_;
            viewRender(renderObject);
        };

        /**
         * on ajax service failed
         * @param  {Object} e : error object
         */
        var onError = function(e) {
            closeLoading();
            app.f7.alert(getI18NText('network-error'));
        }

        var url = ess_getUrl("humanresource/HumanResourceWebsvcService/getEmployeeProfile/");
        var module = {
            html: 'weStarPerson/summary/summary.html',
        }
        if (generalID !== undefined && generalID !== null && generalID !== '') {
            showLoading();
            var data = {
                "argsJson": JSON.stringify({
                    "id": parseInt(generalID)
                })
            }
            module.param = {
                id: generalID
            }
            getAjaxData(module, url, onSuccess, onError, data);
        } else {
            if (!storeWithExpiration.get("ee_person")) {
                showLoading();
                getAjaxData(module, url, onSuccess, onError);
            } else {
                var data = {
                    status: 1,
                    data: storeWithExpiration.get("ee_person")
                }
                onSuccess(data);
            }
        }
    }

    /**
     * open detai page of my profile
     * @param  {Object} e :click event
     */
    function openNewPage(e) {
        var id = $(e.currentTarget).attr("toPage");
        var addStr = '';
        if (generalID !== null) {
            addStr = "&generalID=" + generalID
        }
        var title = $.trim($(e.currentTarget).find(".wx-name").html());
        app.mainView.router.load({
            url: './js/weStarPerson/detail/detail.html?id=' + id + "&title=" + title + addStr
        });
    }
});