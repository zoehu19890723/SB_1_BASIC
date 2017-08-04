/** 
 * @author zoe
 * @description My profile detail controller
 * Created at 2016/6/24  
 */
define(["app"], function(app) {
    var bindings = [{
        element: '.edit-item',
        event: 'click',
        handler: editItem
    }, {
        element: '.editable-group',
        event: 'click',
        handler: editGroup
    },{
        element: '.addBtn',
        event: 'click',
        handler: AddGroup
    }];
    var module = {
        html: 'weStarPerson/detail/detail.html'
    }
    var groupID = null;
    var generalID = null;
    var Picker = [];
    /**
     * Init the controller
     * @param  {Object} query : an object with id
     */
    function init(query) {
        $(".myprofile-sub").text(query.title);
        var id = query.id || null;
        groupID = id;
        generalID = query.generalID;
        var card = {};
        var baseData = {};
        var paramData = {
            group_id: id
        };

        var onSuccess = function(data) {
            closeLoading();
            if (parseInt(data.status) === 1) {
                var data = data.data;
                var struct = null;
                if (data.structure !== undefined && data.structure !== null) {
                    var desObj = storeWithExpiration.get('myStructure');
                    desObj[id] = data.structure;
                    storeWithExpiration.set('myStructure', desObj);
                    struct = data.structure;
                } else {
                    struct = storeWithExpiration.get('myStructure')[id];
                }
                if (generalID === undefined || generalID === null) {
                    var dataobj = storeWithExpiration.get('ee_person');
                    dataobj[id] = {
                        title: dataobj[id].title,
                        data: data.data,
                        isGroup: data.isGroup,
                        permission_code: data.permission_code || 0
                    };
                    storeWithExpiration.set('ee_person', dataobj);
                }

                setView(card, data.data, data.isGroup, struct, data.permission_code);

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

        var url = ess_getUrl("humanresource/HumanResourceWebsvcService/getEmployeeProfileDetail/");

        if (storeWithExpiration.get('myStructure') === undefined || storeWithExpiration.get('myStructure') === null) {
            storeWithExpiration.set('myStructure', {});
        }
        var specStruct = storeWithExpiration.get('myStructure')[id];

        if (generalID !== undefined) {
            card = storeWithExpiration.get('selected_person').profile
            baseData = storeWithExpiration.get('selected_person')[id];

        } else {
            card = storeWithExpiration.get("ee_person").profile
            baseData = storeWithExpiration.get('ee_person')[id];
        }

        if (baseData.data === undefined || baseData.data === null) {
            showLoading();
            if (specStruct === undefined || specStruct === null) {
                paramData.withStructure = true;
            } else {
                paramData.withStructure = false;
            }
            if (generalID !== undefined) {
                paramData.id = generalID;
            }
            var data = {
                argsJson: JSON.stringify(paramData)
            };
            getAjaxData(module, url, onSuccess, onError, data);
        } else {
            setView(card, baseData.data, baseData.isGroup, specStruct, baseData.permission_code);
        }

    }

    function setView(card, data, isGroup, structure, permission_code) {
        var model_ = {
            "card": card,
            "isgroup": isGroup || false,
            "isNull": (data !== undefined && data !== null && data.length > 0) ? false : true
        };

        var hbsUrl = "js/weStarPerson/detail/detail";

        if (isGroup === undefined || isGroup === false) {
            data_ = compactDetail(data, structure) || null;
        } else {
            data_ = compactGroupDetail(data, structure);
            if ((generalID === undefined || generalID === null || generalID === '') && parseInt(permission_code) === 4) {
                hbsUrl = "js/weStarPerson/detail/detailGroupEdit";
            } else if ((generalID === undefined || generalID === null || generalID === '') && parseInt(permission_code) === 3) {
                hbsUrl = "js/weStarPerson/detail/detailGroupAdd";
            } else {
                hbsUrl = "js/weStarPerson/detail/detailGroupReadOnly";
            }

        }
        model_.data = data_;

        var afterRender = function(){
            checkListItems();
            var normalSelector = $('[data-type=selector]');
            normalSelector.forEach(function(item){
                var value = $(item).attr('data-value');
                var field_code = $(item).attr('id');
                var index = parseInt($(item).attr('index'))
                var selectStruct = storeWithExpiration.get('myStructure')[groupID];
                var avaliableArr = (_.find(selectStruct, { field_code: field_code})).type.avaliableValue;
                initPicker(index,field_code,avaliableArr,value);
            });

            var normalSelector = $('[data-type=dateTimeSelector]');
            normalSelector.forEach(function(item){
                var value = $(item).attr('data-value');
                var field_code = $(item).attr('id');
                var index = parseInt($(item).attr('index'))
                var selectStruct = storeWithExpiration.get('myStructure')[groupID];
                var format = (_.find(selectStruct, { field_code: field_code})).type.format;
                initDatePicker(index,field_code,value,format);
            });
        }

        var renderObject = {
            selector: $(".profile-detail"),
            hbsUrl: hbsUrl,
            model: model_,
            bindings: bindings,
            afterRender: afterRender
        }
        viewRender(renderObject);
    }

    function editItem(e) {
        var field_code = $(e.currentTarget).attr('code');
        var name = $(e.currentTarget).attr('name');
        var value = $(e.currentTarget).attr('default-value') || '';
        var nullable = $(e.currentTarget).attr('nullable') || 'false';
        var type = $(e.currentTarget).attr('ui-type') || 'text';

        if(type === 'text' || type === 'textarea'){
            app.mainView.router.load({
                url: './js/weStarPerson/editText/editText.html',
                query: {
                    field_code: field_code,
                    name: name,
                    value: value,
                    nullable: nullable,
                    groupID: groupID
                }
            });
        }
    }


    function convertType(item) {
        if (item === null) {
            return null;
        }
        if (item.type !== undefined && item.type.input !== undefined && item.type.input !== null) {
            var type = item.type.input;
            switch(type){
                case 'selector' : {
                    var avaliableValues = item.type.avaliableValue;
                    var isNormal = false;
                    for (var i = 0; i < avaliableValues.length; i++) {
                        var temp_item = avaliableValues[i];
                        if (typeof temp_item === 'object' && temp_item.value === item.value) {
                            item.value = temp_item.display;
                            isNormal = true;
                            break;
                        } else if (temp_item === item.value) {
                            item.value = temp_item;
                            isNormal = true;
                            break;
                        }
                    }
                    if(isNormal === false){
                        item.value = null;
                    }
                    break;
                }
                case 'checkbox' : {
                    if(item.value === 1 || item.value === '1' ){
                        item.value = getI18NText('checkboxT');
                    }else{
                        item.value = getI18NText('checkboxF');
                    }
                    break;
                }
            }
            return item;
        }
    }

    function initPicker(index,id,avaliableArray,defaultValue){
        Picker[index] = app.f7.picker({
            input: '#'+id,
            toolbarTemplate: '<div class="toolbar">' +
                '<div class="toolbar-inner">' +
                '<div class="left">' +
                '<a href="#" class="link toolbar-randomize-link"></a>' +
                '</div>' +
                '<div class="right">' +
                '<a href="#" class="link close-picker">'+getI18NText('confirmP')+'</a>' +
                '</div>' +
                '</div>' +
                '</div>',
            value : [defaultValue] || [],
            cols: [{
                values: (function() {
                    var arr = [];
                    avaliableArray.forEach(function(value,index) {
                        if(typeof value === "object" && value.value !== undefined){
                            arr.push(value.value);
                        }else{
                            arr.push(value);
                        }
                    });
                    return arr;
                })(),
                displayValues: (function() {
                    var disArr = [];
                    avaliableArray.forEach(function(value,index) {
                        if(typeof value === "object" && value.display !== undefined){
                            disArr.push(value.display);
                        }else{
                            disArr.push(value);
                        }
                    });
                    return disArr;
                })()
            }],
            onClose: function(p) {
                var dateStr = p.cols[0].value;
                updateSelector(dateStr,id);
            },
            formatValue: function(p, values, displayValues) {
                return displayValues;
            }
        });
        if(defaultValue !== undefined && defaultValue !== null){
            if(typeof avaliableArray[0] === 'object'){
                var selectObj = _.find(avaliableArray, {
                    value: defaultValue
                });
                if(selectObj !== undefined && selectObj !== null && selectObj.display !== undefined && selectObj.display !== null){
                     $('#'+id).val(selectObj.display);
                 }
            }else{
                $('#'+id).val(defaultValue);
            }
        }
    }

    function initDatePicker(index,id,defaultValue,format){
        if(format === undefined || format === null){
            format = "yyyy-MM-dd";
        }
        var valueArr = defaultValue.split('-');

        var nowDate = new Date(parseInt(valueArr[0]),parseInt(valueArr[1]), parseInt(valueArr[2]));

        Picker[index] = app.f7.picker({
            input: '#'+id,
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
            value: [parseInt(valueArr[0]), parseInt(valueArr[1]), parseInt(valueArr[2])],
            cols: [{
                textAlign: 'left',
                values: (function() {
                    var arr = [];
                    for (var i = nowDate.getFullYear() - 10; i <= nowDate.getFullYear() +10; i++) {
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
            onClose: function(p) {
                var dateStr = p.cols[0].value + '-' + p.cols[1].value + '-' + p.cols[2].value;
                updateSelector(dateStr,id);
            },
            formatValue: function(p, values) {
                date = values[0];
                if (values[1] < 10) {
                    date += "-0" + values[1];
                } else {
                    date += "-" + values[1];
                }
                if (values[2] < 10) {
                    date += "-0" + values[2];
                } else {
                    date += "-" + values[2];
                }
                return date;
            }
        });
    }

    function updateSelector(dateStr,field_code){
        showLoading();
        var dataobj = storeWithExpiration.get('ee_person');
        
        var onSuccess = function(data) {
            closeLoading();
            if (parseInt(data.status) === 1) {
                showToast(getI18NText('modifySucceed'),1000);
                dataobj[group_id].data.forEach(function(item,index){
                    if(item.field_code === field_code){
                        item.value = dateStr;
                    }
                });
                storeWithExpiration.set('ee_person', dataobj);
                
                app.mainView.router.refreshPage();
            }else{
                var message = data.message;
                if (parseInt(data.status) === 605) {
                    message = getI18NText('DBError');
                }
                app.f7.alert(message, function() {
                    app.mainView.router.refreshPage();
                });
            }
        }
        var onError = function(e) {
            closeLoading();
            app.f7.alert(getI18NText('network-error'), function() {
                app.mainView.router.refreshPage();
            });
        }

        var data = {
            argsJson: JSON.stringify({
                group_type : groupID,
                field_code: field_code,
                isGroup : false,
                value : dateStr 
            })
        }
        
        var url = ess_getUrl('humanresource/HumanResourceWebsvcService/updateEmployeeProfileDetail/');
        getAjaxData(module, url, onSuccess, onError, data);
    }

    function editGroup(e) {
        var data_id = $(e.currentTarget).find('.edit-container').attr("data_id");
        var delete_able = $(e.currentTarget).find('.edit-container').attr("delete_able");

        app.mainView.router.load({
            url: './js/weStarPerson/editForm/editForm.html',
            query: {
                groupID: groupID,
                data_id: data_id,
                delete_able : delete_able
            }
        });
    }

    function AddGroup(){
        app.mainView.router.load({
            url: './js/weStarPerson/editForm/editForm.html',
            query: {
                groupID: groupID,
                delete_able : 'false'
            }
        });
    }

    function compactDetail(data, struct,isgroup) {
        var new_form = cloneArray(struct);
        new_form.forEach(function(item, index) {
            var code = item.field_code;
            var selectObj = _.find(data, {
                field_code: code
            });
            if ((generalID === undefined || generalID === null || generalID === '') && parseInt(item.permission_code) >= 3) {
                item.editAble = true;
            }
            item.value = ((selectObj === undefined || selectObj === null) ? null : selectObj.value);
            if(item.permission_code < 3 || isgroup === true){
                item = convertType(item);
            }
        });
        return new_form;
    }

    function compactGroupDetail(data, struct) {
        var result = [];
        var desObj = {};
        data.forEach(function(item, index) {
            var groupdata = compactDetail(item.groupData, cloneArray(struct),true);
            desObj = {
                groupTitle: item.groupTitle || null,
                groupId: item.id || null,
                permission_code: item.permission_code,
                groupData: groupdata
            }
            result.push(desObj);
        })
        return result;
    }

    return {
        init: init
    };

});