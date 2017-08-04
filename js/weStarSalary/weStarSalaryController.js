/**
 * @description  WeStar salary controller.Created at 2016/6/24
 * @author zoe
 */
define(["app"], function(app) {

    var bindings = [];

    var module = {
        html : 'weStarSalary/weStarSalary.html'
    }

    /**
     * init controller 
     */
    function init(refresh) {
        showLoading();
        var ess_mySalary_month = [];

        /**
         * on ajax succeed with data return
         * @param {Object} data , return data form service
         */
        var onSuccess = function(data) {
            closeLoading();

            if (parseInt(data.status) === 1) {
                var pla_wage = {
                    isNull: false
                };

                if (data.data === undefined || data.data === null ||(data.data && data.data.length === 0)) {
                    pla_wage.isNull = true;
                } else {
                    $('#mySalary-calender').css('visibility', 'visible');
                    storeWithExpiration.set('mySalary', data.data);
                    for (var i = 0; i < data.data.length; i++) {
                        ess_mySalary_month.push(data.data[i].date);
                    }

                    var select_month = storeWithExpiration.get("salary_selected_month") ? storeWithExpiration.get("salary_selected_month") : ((ess_mySalary_month.length == 0) ? "" : ess_mySalary_month[0]);
                    storeWithExpiration.set("salary_selected_month", select_month);

                    var currentIndex = _.findIndex(data.data, {
                        date: storeWithExpiration.get("salary_selected_month")
                    });
                    pla_wage.data = (currentIndex !== -1) ? data.data[currentIndex] : data.data[0];

                    if (refresh !== true) {
                        initPicker(ess_mySalary_month);
                    }
                }

                renderView(pla_wage);

            } else {
                var message = data.message;
                if (message === null || message === "") {
                    message = getI18NText('reGet-salary');
                }
                if (parseInt(data.status) === 605) {
                    message = getI18NText('DBError');
                }
                app.f7.alert(message);
            }
        };

        /**
         * on ajax failed with error return
         * @param {Object} e , error data return
         */
        var onError = function(e) {
            closeLoading();
            app.f7.alert(getI18NText('network-error'));
        }

        /**
         * on ajax succeed with data return ,and reset the data in local store
         * @param {Object} data , return data form service
         */
        var onRestDataSuccess = function(data) {
            if (data.status && parseInt(data.status) === 1 && data.data) {
                storeWithExpiration.set('mySalary', data.data);
            } else {
                var message = data.message;
                if(parseInt(data.status) === 605){
                    message = getI18NText('DBError');
                }
                app.f7.alert(message);
            }
        }

        if (!storeWithExpiration.get("mySalary")) {
            getAjaxData(module,ess_getUrl("payroll/PayrollConfigWebService/getEmployeePayslip/"), onSuccess, onError);
        } else {
            var data = {
                data: storeWithExpiration.get("mySalary"),
                status: 1
            }
            onSuccess(data);

            getAjaxData(module,ess_getUrl("payroll/PayrollConfigWebService/getEmployeePayslip/"), onRestDataSuccess, onError);
        }
    }

    return {
        init: init
    };

    function renderView(model) {
        var afterRender = function() {
            checkListItems();
        }
        var renderObject = {
            selector: $('.mySalary'),
            hbsUrl: "js/weStarSalary/weStarSalary",
            model: model,
            bindings: bindings,
            afterRender: afterRender
        }
        viewRender(renderObject);
    }

    /**
     * Init salary calendar picker
     * @param {Array} ess_mySalary_month ,it is an array with different object of {date : XXX ,id : XXX}
     */
    function initPicker(ess_mySalary_month) {
        var myPicker = app.f7.picker({
            input: '#mySalary-calender',
            toolbarTemplate: '<div class="toolbar">' +
                '<div class="toolbar-inner">' +
                '<div class="left">' +
                '<a href="#" class="link toolbar-randomize-link"></a>' +
                '</div>' +
                '<div class="right">' +
                '<a href="#" class="link close-picker" id="mySalary-picker-month-sure">'+getI18NText('confirmP')+'</a>' +
                '</div>' +
                '</div>' +
                '</div>',
            value: [storeWithExpiration.get("salary_selected_month")],
            cols: [{
                displayValues: (function() {
                    var arr = [];
                    $.each(ess_mySalary_month, function(index, value) {
                        var tempIndex = value.lastIndexOf('-');
                        var result = value.substring(0, tempIndex);
                        arr.push(result);
                    });
                    return arr;
                })(),
                values: (function() {
                    var arr = [];
                    $.each(ess_mySalary_month, function(index, value) {
                        arr.push(value);
                    });
                    return arr;
                })()
            }],
            onClose: function() {
                if (myPicker.value[0] !== storeWithExpiration.get("salary_selected_month")) {
                    var mySalary = storeWithExpiration.get('mySalary');
                    var index = ess_mySalary_month.indexOf(myPicker.value[0]);

                    var select_month = (index !== -1) ? myPicker.value[0] : storeWithExpiration.get("salary_selected_month");

                    storeWithExpiration.set("salary_selected_month", select_month);

                    var pla_wage = {
                        isNull: false,
                        data: (index !== -1) ? mySalary[index] : mySalary[0]
                    };

                    renderView(pla_wage);
                }
            }
        });
    }
});