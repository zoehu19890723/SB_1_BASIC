/**
 * Mobile attendance
 * @author zoe hu 
 */
define(["app"], function(app) {
    var bindings = [{
        element: '#attendance_back',
        event: 'click',
        handler: backToMain
    }, {
        element: '.attendence-action',
        event: 'click',
        handler: attendAction
    }, {
        element: '.popup-about',
        event: 'opened',
        handler: openPopup
    }, {
        element: '#tab2',
        event: 'show',
        handler: showSummaryTab
    }];

    //second count interval
    var interval = null;

    var module = {
        html: 'myAttendance/myAttendance.html'
    }

    /**
     * init this controller when load this view
     */
    function init() {
        localStorage.setItem('showMap', false);
        getCmpInfo(getRecords, showView);
    }

    /**
     * get company info
     * @param  {function} getrecord get records of current date
     * @param  {function} showview  show this view 
     */
    function getCmpInfo(getrecord, showview) {
        if (!store.get('myAttendanceCmp') || !store.get('allCmpInfo')) {
            showLoading();
            var url = ess_getUrl("attendance/SignInService/GetCompanyGeoInfo/");
            var onSuccess = function(data) {
                if (parseInt(data.status) === 1) {
                    store.set('allCmpInfo', data.data);
                    var activeCmp = {};
                    if (data.data.length === 1) {
                        activeCmp = data.data[0];
                    } else {
                        activeCmp = _.find(data.data, {
                            active: true
                        });
                    }
                    if (activeCmp === {} || activeCmp.loc === undefined || activeCmp.loc === null) {
                        closeLoading();
                        app.f7.alert(getI18NText('unablePunch'), function() {
                            app.mainView.router.back();
                        });
                    } else {
                        store.set('myAttendanceCmp', {
                            cmpPoint: {
                                lat: activeCmp.loc.lat || '',
                                lng: activeCmp.loc.lng || ''
                            },
                            cmpDistance: activeCmp.radius || 500,
                            address: activeCmp.address || '',
                            name: activeCmp.name || ''
                        });
                        getrecord(showview);
                    }
                } else {
                    var message = data.message;
                    if (parseInt(data.status) === 605) {
                        message = getI18NText('DBError');
                    }
                    app.f7.alert(message, function() {
                        app.mainView.router.back();
                    });
                }
            }
            var onError = function(e) {
                closeLoading();
                app.f7.alert(getI18NText('network-error'), function() {
                    app.mainView.router.back();
                });
            }
            getAjaxData(module, url, onSuccess, onError);
        } else {
            getrecord(showview);
        }
    }
    /**
     * get records of current date
     * @param  {function} showview render this view
     */
    function getRecords(showview) {
        var basicRecord = {
            sign_time: getI18NText('location-time'),
            hasLocation: false
        }
        var attendanceStatus = 5;
        store.set('currentRecordsDate', getFormatDate());
        if (!store.get('myAttendanceRecords')) {
            var onSuccess = function(data) {
                if (parseInt(data.status) === 1) {
                    var records = data.data.records;
                    records.forEach(function(item) {
                        item.sign_time = getI18NText('punching-time') + item.sign_time;
                        item.hasLocation = true;
                    });
                    var new_records = records.concat(basicRecord);
                    store.set('myAttendanceRecords', new_records);
                } else {
                    var message = data.message;
                    if (parseInt(data.status) === 605) {
                        message = getI18NText('DBError');
                    }
                    app.f7.alert(message, function() {
                        store.set('myAttendanceRecords', basicRecord);
                    });
                }
                showview();
            }
            var onError = function(e) {
                app.f7.alert(getI18NText('network-error'), function() {
                    store.set('myAttendanceRecords', basicRecord);
                    showview();
                });
            }

            var url = ess_getUrl("attendance/SignInService/GetMySignInRecord/");
            var paramObj = {
                "argsJson": JSON.stringify({
                    'signinDate': getFormatDate()
                })
            }
            getAjaxData(module, url, onSuccess, onError, paramObj);
        } else {
            showview();
        }
    }
    /**
     * refresh records when switch to other date different from current selected date
     * @param  {String} dateStr other date string with format as 2016-07-23
     */
    function refreshRecord(dateStr) {
        showLoading();
        var basicRecord = {
            sign_time: getI18NText('location-time'),
            hasLocation: false
        }
        var attendanceStatus = 5;
        store.set('currentRecordsDate', dateStr);
        var onSuccess = function(data) {
            if (parseInt(data.status) === 1) {
                var records = data.data.records;
                records.forEach(function(item) {
                    item.sign_time = getI18NText('punching-time') + item.sign_time;
                    item.hasLocation = true;
                });
                var new_records = records.concat(basicRecord);
                attendanceStatus = data.data.attendanceStatus || 0;
                showView(new_records, formatRecordStatus(attendanceStatus));
            } else {
                var message = data.message;
                if (parseInt(data.status) === 605) {
                    message = getI18NText('DBError');
                }
                app.f7.alert(message, function() {
                    showView(basicRecord, formatRecordStatus(attendanceStatus));
                });
            }
        }
        var onError = function(e) {
            app.f7.alert(getI18NText('network-error'), function() {
                showView(basicRecord);
            });
        }
        var url = ess_getUrl("attendance/SignInService/GetMySignInRecord/");
        var paramObj = {
            "argsJson": JSON.stringify({
                'signinDate': dateStr
            })
        }
        getAjaxData(module, url, onSuccess, onError, paramObj);
    }

    /**
     * render this view
     * @param  {Array} records records of selected date(not stored as local),when undefiend it was as stored records 
     */
    function showView(records, statusObj) {
        var newRecords = store.get('myAttendanceRecords') || [];
        var showAttendanceBtn = true;
        if (records !== undefined) {
            newRecords = records;
            if (store.get('currentRecordsDate') !== getFormatDate()) {
                showAttendanceBtn = false;
            }
        }
        var model = {
            time: getFormatTime(),
            text: getI18NText('toPunch'),
            currentAddress: store.get('myAttendanceCmp').address,
            currentCompany: store.get('myAttendanceCmp').name,
            record: newRecords,
            showAttendanceBtn: showAttendanceBtn
        }

        if (statusObj !== null && showAttendanceBtn === false) {
            model.statusObj = statusObj;
        }

        var afterRender = function() {
            closeLoading();
            setTimeLine();
            if (showAttendanceBtn === true) {
                loadMapJs("http://api.map.baidu.com/api?v=2.0&ak=Geo0U7oOcI0O4hcKncCIX1kKlRXFepMy&callback=caculatePostion", caculatePostion);
                var timeStamp = $('.action-time-interval');
                interval = setInterval(function() {
                    timeStamp.text(getFormatTime());
                }, 1000);
            }
            initPicker((store.get('allCmpInfo') || []));
        }
        var renderObject = {
            selector: $('.myAttendance'),
            hbsUrl: "js/myAttendance/myAttendance",
            model: model,
            bindings: bindings,
            afterRender: afterRender
        };
        viewRender(renderObject);
    }

    /**
     * set time line after records render
     */
    function setTimeLine() {
        var timeoutId = setTimeout(function() {
            var heightTop = $('.record').first().find('.record-circle').offset().top;
            var heightBottom = $('.record').last().find('.record-circle').offset().top;
            var height = heightBottom - heightTop;
            $('.flow-line').height(height);
            clearTimeout(timeoutId);
        }, 100);
    }
    /**
     * trigger when map view pop up
     */
    function openPopup() {
        var geolocation, marker, lnglat;
        localStorage.setItem('showMap', true);

        if (map === null) {
            lnglat = new BMap.Point(store.get('myAttendanceCmp').cmpPoint.lng, store.get('myAttendanceCmp').cmpPoint.lat);
            map = new BMap.Map("container"); // 创建Map实例
            map.centerAndZoom(lnglat, 16); // 初始化地图,设置中心点坐标和地图级别
            map.enableScrollWheelZoom(true);

            marker = new BMap.Marker(lnglat, {
                icon: new BMap.Icon("img/cmp.png", new BMap.Size(35, 35))
            });
            map.addOverlay(marker);
        }
        drawMarker();
    }
    /**
     * trigger when map view closed
     */
    function closePopup() {
        localStorage.setItem('showMap', false);
    }
    /**
     * load Baidu map js as required
     * @param  {String} url baidu map url
     * @param  {Function} fnc callback function when js loaded
     */
    function loadMapJs(url, fnc) {
        var script = document.createElement('script');
        var isDuplicate = false;
        var scriptArr = $('body script')
        script.src = url;
        script.type = "text/javascript";
        scriptArr.forEach(function(item) {
            if (url === item.src) {
                isDuplicate = true;
            }
        })
        if (isDuplicate === false) {
            document.body.appendChild(script);
        } else {
            fnc();
        }
    }
    /**
     * format date 
     * @param  {Date} date date to format,default as current date
     * @return {String} formated date string 2016-7-23
     */
    function getFormatDate(date) {
        if (date === undefined) {
            date = new Date();
        }
        var dateStr = '';
        dateStr = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
        return dateStr;
    }
    /**
     * format date  time
     * @param  {Date} date date to format,default as current date
     * @return {String}     formated date time string 15:36:22
     */
    function getFormatTime(date) {
        if (date === undefined) {
            date = new Date();
        }
        var timeStr = '';
        var hour = date.getHours();
        var minutes = date.getMinutes();
        var second = date.getSeconds();
        if (hour < 10) {
            hour = "0" + hour;
        }
        if (minutes < 10) {
            minutes = "0" + minutes;
        }
        if (second < 10) {
            second = "0" + second;
        }

        timeStr = hour + ":" + minutes + ":" + second;
        return timeStr;
    }
    /**
     * formate attend status to object with code
     * @param  {Number} code attendance status code
     * @return {Object}      formated attendance status object
     */
    function formatRecordStatus(code) {
        var object = null;
        switch (code) {
            case 0:
                {
                    object = {
                        statusCode: 1,
                        statusText: getI18NText('normal')
                    }
                    break;
                }
            case 1:
                {
                    object = {
                        statusCode: 0,
                        statusText: getI18NText('late-arrive')
                    }
                    break;
                }
            case 2:
                {
                    object = {
                        statusCode: 0,
                        statusText: getI18NText('early-leave')
                    }
                    break;
                }
            case 3:
                {
                    object = {
                        statusCode: 1,
                        statusText: getI18NText('overtime')
                    }
                    break;
                }
            case 4:
                {
                    object = {
                        statusCode: 1,
                        statusText: getI18NText('vacation')
                    }
                    break;
                }
            case 5:
                {
                    object = {
                        statusCode: 0,
                        statusText: getI18NText('absence')
                    }
                    break;
                }
            default:
                break;
        }
        return object;
    }


    /**
     * back to main view
     */
    function backToMain() {
        clearInterval(interval);
        clearInterval(watchID);　　
        app.mainView.router.back();
    }

    /**
     * init company picker and date picker
     * @param  {Array} myCmpInfo my company info
     */
    function initPicker(myCmpInfo) {
        var reRenderFlag = false;
        var icon = $('.company .arrow-down');
        var dateIcon = $('.date-info .arrow-down')
        var currentDate = store.get('currentRecordsDate').split('-');
        var nowDate = new Date();
        var cmpPicker = app.f7.picker({
            input: '.company-name',
            toolbarTemplate: '<div class="toolbar">' +
                '<div class="toolbar-inner">' +
                '<div class="left">' +
                '<a href="#" class="link toolbar-randomize-link"></a>' +
                '</div>' +
                '<div class="right">' +
                '<a href="#" class="link close-picker" id="mycompany-sure">'+getI18NText('confirmP')+'</a>' +
                '</div>' +
                '</div>' +
                '</div>',
            value: [store.get('myAttendanceCmp').address],
            cols: [{
                displayValues: (function() {
                    var arr = [];
                    $.each(myCmpInfo, function(index, value) {
                        arr.push(value.name);
                    });
                    return arr;
                })(),
                values: (function() {
                    var arr = [];
                    $.each(myCmpInfo, function(index, value) {
                        arr.push(value.address);
                    });
                    return arr;
                })()
            }],
            onOpen: function() {
                if (!icon.hasClass('up')) {
                    icon.addClass('up');
                }
            },
            onClose: function(p) {
                if (icon.hasClass('up')) {
                    icon.removeClass('up');
                }
                if (reRenderFlag === true) {
                    refreshRecord(getFormatDate());
                }
            },
            onChange: function(picker, values) {
                var oldPos = store.get('myAttendanceCmp').address || '';
                var newPos = '';
                if (picker.cols.length > 0) {
                    newPos = picker.cols[0].value;
                }
                if (oldPos !== newPos && newPos !== '') {
                    var newCmp = _.find(store.get('allCmpInfo'), {
                        address: newPos
                    });
                    store.set('myAttendanceCmp', {
                        cmpPoint: {
                            lat: newCmp.loc.lat || '',
                            lng: newCmp.loc.lng || ''
                        },
                        cmpDistance: newCmp.radius || 500,
                        address: newCmp.address || '',
                        name: newCmp.name || ''
                    })
                    $('.company-name').text(newCmp.name);
                    $('.address').text(newCmp.address);
                    reRenderFlag = true;
                }
            }
        });

        var datePicker = app.f7.picker({
            input: '#date',
            toolbarTemplate: '<div class="toolbar">' +
                '<div class="toolbar-inner">' +
                '<div class="left">' +
                '<a href="#" class="link toolbar-randomize-link"></a>' +
                '</div>' +
                '<div class="right">' +
                '<a href="#" class="link close-picker" id="myDate-sure">'+getI18NText('confirmP')+'</a>' +
                '</div>' +
                '</div>' +
                '</div>',
            value: [parseInt(currentDate[0]), parseInt(currentDate[1]), parseInt(currentDate[2])],
            cols: [{
                textAlign: 'left',
                values: (function() {
                    var arr = [];
                    for (var i = nowDate.getFullYear() - 3; i <= nowDate.getFullYear(); i++) {
                        arr.push(i);
                    }
                    return arr;
                })()
            }, {
                values: ('1 2 3 4 5 6 7 8 9 10 11 12').split(' '),
                displayValues: ('01 02 03 04 05 06 07 08 09 10 11 12').split(' '),

            }, {
                values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31],
                displayValues: ('01 02 03 04 05 06 07 08 09 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31').split(' '),
            }],
            onOpen: function() {
                if (!dateIcon.hasClass('up')) {
                    dateIcon.addClass('up');
                }
            },
            onClose: function(p) {
                var dateStr = p.cols[0].value + '-' + p.cols[1].value + '-' + p.cols[2].value;
                if (dateIcon.hasClass('up')) {
                    dateIcon.removeClass('up');
                }
                if (dateStr !== store.get('currentRecordsDate')) {
                    refreshRecord(dateStr);
                }
            },
            formatValue: function(p, values) {
                date = values[0];
                if (values[1] < 10) {
                    date += ".0" + values[1];
                } else {
                    date += "." + values[1];
                }
                if (values[2] < 10) {
                    date += ".0" + values[2];
                } else {
                    date += "." + values[2];
                }
                return date;
            }
        });


    }
    /**
     * click attend button
     */
    function attendAction() {
        $('.attendence-action-panel').addClass('attending');

        var curr_lat = localStorage.getItem('currentPointLat');
        var curr_lng = localStorage.getItem('currentPointLng');
        var geoc = new BMap.Geocoder();
        var pt = new BMap.Point(curr_lng, curr_lat);
        var detailLoc = '';
        var time = new Date().Format('yyyy-MM-dd hh:mm:ss');
        var url = ess_getUrl("attendance/SignInService/SaveSignInRecord/");

        var onSuccess = function(data) {
            $('.attendence-action-panel').removeClass('attending');
            if (parseInt(data.status) === 1) {
                var records = store.get('myAttendanceRecords');
                var onlyTime = time.split(' ')[1] || '';
                var record = {
                    sign_time: getI18NText('punching-time') + onlyTime,
                    hasLocation: true,
                    sign_address: detailLoc
                }
                records.splice(records.length - 1, 0, record);
                store.set('myAttendanceRecords', records);

                var html = '<div class="record">' + '<div class="record-circle status-true"></div>' + '<div class="record-content">' + '<div class="record-time">' + record.sign_time + '</div>' + '<div class="record-location">' + '<i class="WeStar_iconfont">&#xe60a;</i>' + '<span>' + record.sign_address + '</span>' + '</div></div></div>';
                $(html).insertBefore($('.record-circle.status-').parent());
                setTimeLine();
                $('.attendence-action-panel')[0].scrollIntoView();
            } else {
                var message = data.message;
                if (parseInt(data.status) === 605) {
                    message = getI18NText('DBError');
                }
                app.f7.alert(message);
            }
        }

        var onError = function(e) {
            $('.attendence-action-panel').removeClass('attending');
            app.f7.alert(getI18NText('network-error'));
        }

        geoc.getLocation(pt, function(rs) {
            var addComp = rs.addressComponents;
            detailLoc = addComp.city + addComp.district + addComp.street + addComp.streetNumber;

            var attendanceObj = {
                "argsJson": JSON.stringify({
                    'location_lat': curr_lat,
                    'location_lng': curr_lng,
                    'sign_address': detailLoc,
                    'signin_time': time,
                    'equipment_serial_number': localStorage.getItem('deviceUUID')
                })
            }
            var ST1 = setTimeout(function() {
                getAjaxData(module, url, onSuccess, onError, attendanceObj);
                clearTimeout(ST1);
            }, 1000);
        });
    }
    /**
     * click tab2 and show my attendance summary
     */
    function showSummaryTab() {
        showLoading();
        var onSuccess = function(data) {
            if (parseInt(data.status) === 1) {
                store.set('myAttendanceMonth', data.data);
                refreshSummary();
            } else {
                var message = data.message;
                if (parseInt(data.status) === 605) {
                    message = getI18NText('DBError');
                }
                app.f7.alert(message, function() {
                    refreshSummary();
                });
            }
        }
        var onError = function(e) {
            app.f7.alert(getI18NText('network-error'), function() {
                refreshSummary();
            });
        }

        var compareMonth = function() {
            var monthArr = store.get('myAttendanceMonth');
            if (monthArr === undefined || monthArr === null || monthArr.length === 0) {
                return true;
            } else {
                var lastMonth = monthArr[monthArr.length - 1];
                var nowDate = new Date();
                var year = parseInt((lastMonth.split('-'))[0]);
                var month = parseInt((lastMonth.split('-'))[1]);
                if (year < nowDate.getFullYear() || (year === nowDate.getFullYear() && month < nowDate.getMonth())) {
                    return true;
                } else {
                    return false;
                }
            }
        }
        if (store.get('myAttendanceMonth') === undefined || store.set('myAttendanceMonth') === null || compareMonth() === true) {
            var url = ess_getUrl("attendance/SignInService/getMyAttendanceYearMonth/");
            getAjaxData(module, url, onSuccess, onError);
        } else {
            refreshSummary();
        }
    }
    /**
     * refresh attendance summary detail
     * @param  {String} monthStr select month
     */
    function refreshSummary(monthStr) {
        var model = null;
        var onSuccess = function(data) {
            if (parseInt(data.status) === 1) {
                var abnormalRecord = data.data;
                var hasAbnormal = (abnormalRecord.length > 0) ? true : false;
                abnormalRecord.forEach(function(item) {
                    item.status = formatRecordStatus(item.attendance_status).statusText;
                });
                var lateDays = (_.filter(abnormalRecord, {
                    attendance_status: 1
                })).length;
                var earlyDays = (_.filter(abnormalRecord, {
                    attendance_status: 2
                })).length;
                var absenceDays = (_.filter(abnormalRecord, {
                    attendance_status: 5
                })).length;

                var summaryObj = {
                    hasAbnormal: hasAbnormal,
                    abnormalRecord: abnormalRecord,
                    lateDays: lateDays,
                    earlyDays: earlyDays,
                    absenceDays: absenceDays
                }
                model = {
                    isNull: false,
                    summaryData: summaryObj
                }

            } else {
                var message = data.message;
                if (parseInt(data.status) === 605) {
                    message = getI18NText('DBError');
                }
                app.f7.alert(message);
            }
            renderTab2(model);
        }

        var onError = function(e) {
            closeLoading();
            app.f7.alert(getI18NText('network-error'));
        }

        var renderTab2 = function(model) {
            closeLoading();
            var renderObject = {
                selector: $('#tab2'),
                hbsUrl: "js/myAttendance/myAttendanceSummary",
                model: model,
                bindings: []
            };
            if (model.isNull !== true) {
                renderObject.afterRender = initSummaryDatePicker;
            }
            viewRender(renderObject);
        }

        var monthArr = store.get('myAttendanceMonth');
        if (monthArr === undefined || monthArr === null || monthArr.length === 0) {
            renderTab2({
                isNull: true
            });
        } else {
            if (monthStr === undefined && monthArr.length > 0) {
                monthStr = monthArr[0];
            }
            store.set('currentSummaryMonth', monthStr);
            var url = ess_getUrl("attendance/SignInService/getMyAttendanceSummary/");
            var paramObj = {
                "argsJson": JSON.stringify({
                    'month': monthStr
                })
            }
            getAjaxData(module, url, onSuccess, onError, paramObj);
        }
    }
    /**
     * init summary detail month select picker
     */
    function initSummaryDatePicker() {
        var icon = $('.month-select');
        var monthArray = store.get('myAttendanceMonth');
        var summaryMonthPicker = app.f7.picker({
            input: '#month',
            toolbarTemplate: '<div class="toolbar">' +
                '<div class="toolbar-inner">' +
                '<div class="left">' +
                '<a href="#" class="link toolbar-randomize-link"></a>' +
                '</div>' +
                '<div class="right">' +
                '<a href="#" class="link close-picker" id="myDate-sure">'+getI18NText('confirmP')+'</a>' +
                '</div>' +
                '</div>' +
                '</div>',
            value: [store.get('currentSummaryMonth')],
            cols: [{
                values: (function() {
                    var arr = [];
                    for (var i = 0; i < monthArray.length; i++) {
                        arr.push(monthArray[i]);
                    }
                    return arr;
                })()
            }],
            onOpen: function() {
                if (!icon.hasClass('up')) {
                    icon.addClass('up');
                }
            },
            onClose: function(p) {
                if (icon.hasClass('up')) {
                    icon.removeClass('up');
                }
                var monthStr = p.cols[0].value;
                if (monthStr !== store.get('currentSummaryMonth')) {
                    showLoading();
                    refreshSummary(monthStr);
                }
            },
            formatValue: function(p, values) {
                var month = values[0];
                montStr = month.replace('-', getI18NText('year')) + getI18NText('month');
                return montStr;
            }
        });
    }

    return {
        init: init
    };
});
//global variables
var map = null,
    geoMarker = null,
    watchID = null;
/**
 * caculate current postion after baidu map loaded
 */
function caculatePostion() {
    $('.attend-location-des span').text(getI18NText('locating'));
    watchID = setInterval(function(){
        navigator.geolocation.getCurrentPosition(onSuccess, onError, {
            enableHighAccuracy: true,
            maximumAge: 3000,
            timeout: 3000
        });
    },5000);
    //GPS定位成功
    function onSuccess(position) {
        var gpsPoint = new BMap.Point(position.coords.longitude, position.coords.latitude);
        var convertor = new BMap.Convertor();
        var translateCallback = function(data) {
            if (data.status === 0) {
                currentPoint = data.points[0];
                cmpPoint = new BMap.Point(store.get('myAttendanceCmp').cmpPoint.lng, store.get('myAttendanceCmp').cmpPoint.lat);

                var tempMap = new BMap.Map();
                var distance = tempMap.getDistance(currentPoint, cmpPoint).toFixed(0);
                var textArea = $('.attend-location-des span');
                var attendAction = $('.attendence-action-panel');

                if (distance < store.get('myAttendanceCmp').cmpDistance) {
                    if (attendAction.hasClass('disable')) {
                        attendAction.removeClass('disable');
                    }
                    textArea.text(getI18NText('intoPunch'));
                } else {
                    if (!attendAction.hasClass('disable')) {
                        attendAction.addClass('disable');
                    }
                    textArea.text(getI18NText('farPunch'));
                }

                setLocalStorage({
                    'currentPointLng': currentPoint.lng,
                    'currentPointLat': currentPoint.lat,
                    'distance': distance
                })

                if (localStorage.getItem('showMap') === 'true') {
                    drawMarker(currentPoint, distance);
                }
            }
        }
        convertor.translate([gpsPoint], 1, 5, translateCallback);
    }
    //GPS定位失败
    function onError(error) {
        var attendAction = $('.attendence-action-panel');
        if (!attendAction.hasClass('disable')) {
            attendAction.addClass('disable');
        }
        var textArea = $('.attend-location-des span');
        textArea.text(getI18NText('lostPunch'));
    }
}
/**
 * draw map markers after geoloaction succeed
 * @param  {Object} currentPoint current baidu map point
 * @param  {Number} distance     the distance between company and mu current geoloction
 */
function drawMarker(currentPoint, distance) {
    if (localStorage.getItem('currentPointLng') === undefined || localStorage.getItem('currentPointLat') === undefined || localStorage.getItem('distance') === undefined) {
        return;
    }
    if (currentPoint === undefined || distance === null) {
        currentPoint = new BMap.Point(localStorage.getItem('currentPointLng'), localStorage.getItem('currentPointLat'));
        distance = localStorage.getItem('distance') || '未知';
    }
    if (currentPoint.lat === null || currentPoint.lng === null) {
        return;
    }

    var cmpPoint = new BMap.Point(store.get('myAttendanceCmp').cmpPoint.lng, store.get('myAttendanceCmp').cmpPoint.lat);
    var label = new BMap.Label(getI18NText('farFromC') + distance + getI18NText('meter'), {
        offset: new BMap.Size(20, -25)
    });
    label.setStyle({
        border: "1px solid #ff9500",
        fontSize: "16px",
        borderRadius: "6px",
        padding: "8px"
    });
    if (geoMarker === null) {
        geoMarker = new BMap.Marker(currentPoint, {
            icon: new BMap.Icon("img/mySelf.png", new BMap.Size(50, 60))
        });
        map.addOverlay(geoMarker);
        map.setViewport([geoMarker.getPosition(), cmpPoint]);
    } else {
        geoMarker.setPosition(currentPoint);
    }
    geoMarker.setLabel(label);
}