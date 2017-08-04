/** 
 * @author zoe
 * @description My profile edit family members controller
 * Created at 2016/6/24  
 */
define(["app"], function (app) {
    var $$ = Dom7;
    var bindings = [
        {
            element: '#commitButton',
            event: 'click',
            handler: submit
        },{
            element: '#deleteButton',
            event: 'click',
            handler: deleteGroup
        }];

    var Picker = [];
    var data_id = null;
    var groupId = null;

    var module = {
        html: 'weStarPerson/editForm/editForm.html'
    }
    /**
     * Init the controller
     * @param  {Object} query : an object with id
     */
    function init(query) {
        var title = '';
        var form = null;
        var selectValue = null;
        var selectValueArr = [];
        var delete_able = (query.delete_able === 'true') ? true : false;
        data_id = query.data_id;

        if(query.groupID !== undefined && query.groupID !== null){
            groupId = query.groupID;
            var dataObj = storeWithExpiration.get('ee_person');
            title = dataObj[groupId].title;
            selectValueArr = dataObj[groupId].data || [];
        }
        
        var structure = storeWithExpiration.get('myStructure');
        if(structure !== undefined && structure !== null){
            form = structure[groupId];
        }

        if(selectValueArr.length !== 0 && data_id!== undefined){
            var selectValue = _.find(selectValueArr,{
                id : data_id
            });

            form = compactDetail(selectValue.groupData,form);
            title = getI18NText('edit') + title;
        }else{
            title = getI18NText('add') + title;
        }

        var beforeRender = function(){
            $(".editForm-title").text(title);
        }
        var afterRender = function(){
            form.forEach(function(item,index){
                if(item.type.input === "selector"){
                    var id = item.field_code;
                    var avaliableArray = item.type.avaliableValue;
                    initPicker(index,id,avaliableArray,item.value);
                }else if(item.type.input === "dateTimeSeletor"){
                    var field_code = item.field_code;
                    initDatePicker(index,field_code,item.value,item.type.format);
                }
            })
        }

        var renderObject = {
            selector : $(".editForm"),
            hbsUrl : "js/weStarPerson/editForm/editForm",
            model: {
                form : form,
                delete : delete_able
            },
            bindings: bindings,
            beforeRender : beforeRender,
            afterRender : afterRender
        }
        viewRender(renderObject);
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
            formatValue: function(p, values, displayValues) {
                return displayValues;
            }
        });
        if(defaultValue !== undefined && defaultValue !== null){
            if(typeof avaliableArray[0] === 'object'){
                var selectObj = _.find(avaliableArray, {
                    value: defaultValue
                });
                $('#'+id).val(selectObj.display);
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
                    date += '-0' + values[1];
                } else {
                    date += '-' + values[1];
                }
                if (values[2] < 10) {
                    date += '-0' + values[2];
                } else {
                    date += '-' + values[2];
                }
                return date;
            }
        });
    }

    function compactDetail(data,struct){
        var new_form = cloneObj(struct);
        new_form.forEach(function(item, index) {
            var code = item.field_code;
            var selectObj = _.find(data, {
                field_code: code
            });
            item.value = ((selectObj === undefined || selectObj === null) ? null : selectObj.value);
        });
        return new_form;
    }

    function submit(){

        var selectedElement = $('.weui-input');
        var resultMap = [];

        for(var index = 0 ; index < selectedElement.length ; index++){
            var item = $(selectedElement[index]);
            
            var isSelector = item.attr("selector");
            var index = parseInt(item.attr("index"));
            var nullable = item.attr("nullable");
            var id = item.attr("id");
            var value = item.val();
            var placeholder = item.attr("placeholder");
            var type = item.attr('type');

            if(isSelector === "true" && Picker[index]!== null && Picker[index] !== undefined){
                value = Picker[index].value[0];
            }

            if(type==='checkbox'){
                value = (item.attr('checked') === 1) ? 1 : 0;
            }

            if(nullable !== "true" && ( value === null || value.trim() === '')){
                app.f7.alert(placeholder);

                return false;
                break;
            }
            else{
                resultMap.push({field_code : id , value : value});
            }
        }
       
        var onSuccess = function(data) {
            closeLoading();
            if (parseInt(data.status) === 1) {
                showToast(getI18NText('modifySucceed'),1000);
                var dataObj = storeWithExpiration.get('ee_person');
                dataObj[groupId].data = null;
                storeWithExpiration.set('ee_person',dataObj);
                var title = dataObj[groupId].title;
                
                app.mainView.router.back({
                    url: './js/weStarPerson/detail/detail.html',
                    query : {
                        id : groupId,
                        title : title
                    },
                    force : true,
                    ignoreCache: true
                });
            }else{
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
        var data = {
            argsJson: JSON.stringify({
                group_type : groupId,
                id: data_id || null,
                isGroup : true,
                value : resultMap 
            })
        }
        showLoading();
        var url = ess_getUrl('humanresource/HumanResourceWebsvcService/updateEmployeeProfileDetail/');
        getAjaxData(module, url, onSuccess, onError, data);
        
    }

    function deleteGroup(){
        app.f7.confirm(getI18NText('deleteConfirm'),function(){
            var onSuccess = function(data) {
                closeLoading();
                if (parseInt(data.status) === 1) {
                    showToast(getI18NText('deleteSucceed'),1000);
                    var dataObj = storeWithExpiration.get('ee_person');
                    dataObj[groupId].data = null;
                    storeWithExpiration.set('ee_person',dataObj);
                    var title = dataObj[groupId].title;
                    
                    app.mainView.router.back({
                        url: './js/weStarPerson/detail/detail.html',
                        query : {
                            id : groupId,
                            title : title
                        },
                        force : true,
                        ignoreCache: true
                    });
                }else{
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
                app.f7.alert(getI18NText('network-error'));
            }
            var data = {
                argsJson: JSON.stringify({
                    group_type : groupId,
                    id: data_id,
                    isGroup : true
                })
            }
            showLoading();
            var url = ess_getUrl('humanresource/HumanResourceWebsvcService/deleteEmployeeProfileDetail/');
            getAjaxData(module, url, onSuccess, onError, data);
        })
    }
    return {
        init: init
    };
});

