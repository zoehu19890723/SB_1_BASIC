/** 
 * @author zoe
 * @description My leave quota controller.
 * Created at 2016/6/24  
 */
define(["app"], function(app) {

    var bindings = [];

    var module = {
        html : 'myLeave/myLeaveQuota/myLeaveQuota.html'
    }
    /**
     * Init the controller
     */
    function init() {
        var model_ = {
            "card": storeWithExpiration.get("ee_person").profile,
            "isNull": false
        };
        /**
         * on ajax service success
         * @param  {Object} data : success data 
         */
        var onSucccess = function(data) {
                if (data.status && parseInt(data.status) === 1) {
                    closeLoading();
                    if (data.data === undefined || data.data === null || (data.data && data.data.leaveData.length === 0)) {
                        model_.isNull = true;
                    } else {
                        model_.person_leaveQuota = data.data;
                        storeWithExpiration.set('person_leaveQuota', data.data);
                    }
                } else {
                    closeLoading();
                    var message = data.message || getI18NText('get-quota-fail');
                    if (parseInt(data.status) === 605) {
                        message = getI18NText('DBError');
                    }
                    app.f7.alert(message);
                }
                var renderObject = {
                    selector: $('.myleavequota'),
                    hbsUrl: "js/myLeave/myLeaveQuota/myLeaveQuota",
                    model: model_,
                    bindings: bindings
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
            /**
             * on ajax service success,to reset data in store
             * @param  {Object} data : success data 
             */
        var onResetData = function(data) {
            if (data.status && parseInt(data.status) === 1) {
                storeWithExpiration.set('person_leaveQuota', data.data);
            } else {
                var message = data.message || getI18NText('get-quota-fail');
                if (parseInt(data.status) === 605) {
                    message = getI18NText('DBError');
                }
                app.f7.alert(message);
            }
        }
        var url = ess_getUrl("attendance/AttendanceAnnualLeave/getLeaveQuota/");

        if (storeWithExpiration.get('person_leaveQuota') === undefined || storeWithExpiration.get('person_leaveQuota') === null) {
            showLoading();
            getAjaxData(module,url, onSucccess, onError);

        } else {
            var data = {
                data: storeWithExpiration.get('person_leaveQuota'),
                status: 1
            }
            onSucccess(data);

            getAjaxData(module,url, onResetData, onError);
        }
    }
    return {
        init: init
    };
});