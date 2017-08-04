define(["app"], function(app) {

    var $$ = Dom7;
    var bindings = [

        {
            element: '#commitButton',
            event: 'click',
            handler: commitVacation
        }, {
            element: '#uploadP',
            event: 'click',
            handler: uploadPicture
        }
    ];
    var vacationType = [{
        id: '1',
        name: getI18NText('year-leave')
    }, {
        id: '2',
        name: getI18NText('sick-leave')
    }];
    var AttendanceTime = {};
    var myDate = new Date();
    var leaveTypeListPicker = null;

    var module = {
        html: 'myLeave/myLeaveApply/myLeaveApply.html'
    }

    function init() {
        showLoading();
        var model_ = {};
        var onSuccess = function(data) {
            closeLoading();
            if (parseInt(data.status) === 1) {
                if (data.data === undefined || data.data.leave_type === undefined || data.data.leave_type.length === 0) {
                    vacationType = [{
                        id: '0',
                        name: getI18NText('no-type-choose')
                    }];
                } else {
                    vacationType = data.data.leave_type;
                    AttendanceTime = data.data.attendance_time;
                }
                model_.photo = localStorage.getItem('attatchPhoto');

                var renderObject = {
                    selector: $('.myleaveapply'),
                    hbsUrl: "js/myLeave/myLeaveApply/myLeaveApply",
                    model: model_,
                    bindings: bindings,
                    afterRender: initPicker
                }
                viewRender(renderObject);

            } else if (parseInt(data.status) === -1) {
                app.f7.alert(data.message, function() {
                    app.router.load('login');
                });
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

        var url = ess_getUrl("ess/ELeave/GetLeaveType/");

        getAjaxData(module, url, onSuccess, onError);
    }
    return {
        init: init
    };

    function getNextDay() {
        var now = new Date();
        var new_date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        return new_date;
    }

    function initPicker() {
        var defaultStartTime = AttendanceTime.begin_time_am || '09:00';
        var defaultEndTime = AttendanceTime.end_time_pm || '18:00';
        var next_day = getNextDay();
        var pickerStart = app.f7.picker({
            input: '#startDate',
            toolbarTemplate: '<div class="toolbar">' +
                '<div class="toolbar-inner">' +
                '<div class="left">' +
                '<a href="#" class="link toolbar-randomize-link"></a>' +
                '</div>' +
                '<div class="right">' +
                '<a href="#" class="link close-picker" id="start-sure">'+getI18NText('confirmP')+'</a>' +
                '</div>' +
                '</div>' +
                '</div>',
            value: [next_day.getFullYear(), next_day.getMonth(), next_day.getDate(), (defaultStartTime.split(':')[0]), (defaultStartTime.split(':')[1])],
            cols: [{
                    textAlign: 'left',
                    values: (function() {
                        var arr = [];
                        for (var i = myDate.getFullYear() - 3; i <= myDate.getFullYear() + 3; i++) {
                            arr.push(i);
                        }
                        return arr;
                    })()
                }, {
                    values: ('0 1 2 3 4 5 6 7 8 9 10 11').split(' '),
                    displayValues: ('01 02 03 04 05 06 07 08 09 10 11 12').split(' '),

                }, {
                    values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31],
                    displayValues: ('01 02 03 04 05 06 07 08 09 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31').split(' '),
                }, {
                    divider: true,
                    content: '  '
                },
                // Hours
                {
                    values: (function() {
                        var arr = [];
                        for (var i = 0; i <= 23; i++) {
                            arr.push(i < 10 ? '0' + i : i);
                        }
                        return arr;
                    })(),
                },
                // Divider
                {
                    divider: true,
                    content: ':'
                },
                // Minutes
                {
                    values: (function() {
                        var arr = [];
                        for (var i = 0; i <= 59; i++) {
                            arr.push(i < 10 ? '0' + i : i);
                        }
                        return arr;
                    })(),
                }
            ],
            onChange: function(picker, values) {
                var daysInMonth = new Date(picker.value[0], picker.value[1] * 1 + 1, 0).getDate();
                if (values[2] > daysInMonth) {
                    picker.cols[2].setValue(daysInMonth);
                }

            },
            onOpen: function() {
                $$('#start-sure').on('click', function() {
                    var begin = $.trim($("#startDate").val());
                    var end = $.trim($("#endDate").val());
                    if (!compareTime(begin, end)) {
                        pickerEnd.setValue([pickerStart.cols[0].value, pickerStart.cols[1].value, pickerStart.cols[2].value, pickerEnd.value[3], pickerEnd.value[4]]);
                    }
                });
            },
            formatValue: function(p, values) {
                var result1 = values[0];
                if (values[1] < 9) {
                    result1 += "-0" + (values[1] * 1 + 1);
                } else {
                    result1 += "-" + (values[1] * 1 + 1);
                }
                if (values[2] < 10) {
                    result1 += "-0" + values[2];
                } else {
                    result1 += "-" + values[2];
                }
                result1 += '   ' + values[3] + ':' + values[4]
                return result1;
            }
        });

        var pickerEnd = app.f7.picker({
            input: '#endDate',
            toolbarTemplate: '<div class="toolbar">' +
                '<div class="toolbar-inner">' +
                '<div class="left">' +
                '<a href="#" class="link toolbar-randomize-link"></a>' +
                '</div>' +
                '<div class="right">' +
                '<a href="#" class="link close-picker" id="end-sure">'+getI18NText('confirmP')+'</a>' +
                '</div>' +
                '</div>' +
                '</div>',
            value: [next_day.getFullYear(), next_day.getMonth(), next_day.getDate(), (defaultEndTime.split(':')[0]), (defaultEndTime.split(':')[1])],
            cols: [{
                    textAlign: 'left',
                    values: (function() {
                        var arr = [];
                        for (var i = myDate.getFullYear() - 3; i <= myDate.getFullYear() + 3; i++) {
                            arr.push(i);
                        }
                        return arr;
                    })()
                }, {
                    values: ('0 1 2 3 4 5 6 7 8 9 10 11').split(' '),
                    displayValues: ('01 02 03 04 05 06 07 08 09 10 11 12').split(' '),

                }, {
                    values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31],
                    displayValues: ('01 02 03 04 05 06 07 08 09 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31').split(' '),
                }, {
                    divider: true,
                    content: '  '
                },
                // Hours
                {
                    values: (function() {
                        var arr = [];
                        for (var i = 0; i <= 23; i++) {
                            arr.push(i < 10 ? '0' + i : i);
                        }
                        return arr;
                    })(),
                },
                // Divider
                {
                    divider: true,
                    content: ':'
                },
                // Minutes
                {
                    values: (function() {
                        var arr = [];
                        for (var i = 0; i <= 59; i++) {
                            arr.push(i < 10 ? '0' + i : i);
                        }
                        return arr;
                    })(),
                }
            ],
            onChange: function(picker, values) {
                var daysInMonth = new Date(picker.value[0], picker.value[1] * 1 + 1, 0).getDate();
                if (values[2] > daysInMonth) {
                    picker.cols[2].setValue(daysInMonth);
                }
            },
            onOpen: function() {
                $$('#end-sure').on('click', function() {
                    var end = pickerEnd.cols[0].displayValue;

                });
            },
            formatValue: function(p, values) {
                var result2 = values[0];
                if (values[1] < 9) {
                    result2 += "-0" + (values[1] * 1 + 1);
                } else {
                    result2 += "-" + (values[1] * 1 + 1);
                }
                if (values[2] < 10) {
                    result2 += "-0" + values[2];
                } else {
                    result2 += "-" + values[2];
                }
                result2 += '   ' + values[3] + ':' + values[4]
                return result2;
            }
        });
        leaveTypeListPicker = app.f7.picker({
            input: '#vacationType',
            toolbarTemplate: '<div class="toolbar">' +
                '<div class="toolbar-inner">' +
                '<div class="left">' +
                '<a href="#" class="link toolbar-randomize-link"></a>' +
                '</div>' +
                '<div class="right">' +
                '<a href="#" class="link close-picker" id="eeList-picker-month-sure">'+getI18NText('confirmP')+'</a>' +
                '</div>' +
                '</div>' +
                '</div>',
            cols: [{
                values: (function() {
                    var arr = [];
                    $$.each(vacationType, function(index, value) {
                        arr.push(value.leave_code);
                    });
                    return arr;
                })(),
                displayValues: (function() {
                    var arr = [];
                    $$.each(vacationType, function(index, value) {
                        arr.push(value.name);
                    });
                    return arr;
                })()
            }],
            formatValue: function(p, values, displayValues) {
                return displayValues;
            }
        });
    }

    function uploadPicture() {
        var phooo = $(".upload").find("img").attr("src");
        app.router.load("myLeave/attatchment", {
            photo: phooo
        });

    }

    function compareTime(begin, end) {
        var d1 = new Date(begin.replace(/\-/g, "\/"));
        var d2 = new Date(end.replace(/\-/g, "\/"));

        if (begin != "" && end != "" && d1 < d2) {
            return true;
        } else return false;
    }

    function commitVacation() {

        var leave_type = null;
        var begin = $.trim($("#startDate").val());
        var end = $.trim($("#endDate").val());
        var begin_date = begin.split('   ')[0];
        var begin_time = begin.split('   ')[1];
        var end_date = end.split('   ')[0];
        var end_time = end.split('   ')[1];
        var attatchment = localStorage.getItem("attatchPhoto");
        var remark = $.trim($("#feedback").val());
        var check = true;

        if (leaveTypeListPicker !== null && leaveTypeListPicker.cols[0] !== undefined) {
            leave_type = leaveTypeListPicker.cols[0].value;
        }
        
        if (check && vacationType[0].id === "0") {
            check = false;
            app.f7.alert(vacationType[0].name);
        }

        if (check && !leave_type) {
            check = false;
            app.f7.alert(getI18NText('enterLeaveType'));
        }
        if (check && !begin_date) {
            check = false;
            app.f7.alert(getI18NText('timeNotNull'));
        }

        if (check && !end_date) {
            check = false;
            app.f7.alert(getI18NText('timeNotNull'));
        }

        if (check && !compareTime(begin, end)) {
            check = false;
            app.f7.alert(getI18NText('startBEnd'));
        }
        var argsJson = {
            leave_code: leave_type,
            begin_date: begin_date,
            begin_time: begin_time,
            end_date: end_date,
            end_time: end_time,
            attachment: attatchment,
            remark: remark
        };
        if (check) {
            showLoading();
            var onSuccess = function(data) {
                closeLoading();
                if (parseInt(data.status) === 1) {
                    if (data.data.status === "OK") {
                        app.f7.alert(getI18NText('leaveSuc') + data.data.leave_days + getI18NText('day'), function() {
                            localStorage.removeItem("attatchPhoto");
                            app.mainView.router.back({
                                url: "js/myLeave/myLeaveApply/myLeaveApply.html"
                            });
                        });
                    } else {
                        app.f7.alert(data.data.msg);
                    }

                } else if (parseInt(data.status) === -1) {
                    app.f7.alert(data.message, function() {
                        app.router.load('login');
                    });
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
            var url = ess_getUrl("ess/ELeave/ApplyELeave/");
            var data = {
                "argsJson": JSON.stringify(argsJson)
            }

            getAjaxData(module, url, onSuccess, onError, data);
        }
    }
});