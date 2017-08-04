/** 
 * @author zoe
 * @description My profile edit family members controller
 * Created at 2016/6/24  
 */
define(["app"], function(app) {
    var bindings = [{
        element: '#saveEdit',
        event: 'click',
        handler: saveEdit
    }];

    var field_code = null;
    var nullable = null;
    var type = null;
    var old_value = null;
    var group_id = null;

    var module = {
        html: 'weStarPerson/editText/editText.html'
    }
    /**
     * Init the controller
     * @param  {Object} query : an object with id
     */
    function init(query) {

        field_code = query.field_code;
        group_id = query.groupID;
        nullable = query.nullable || 'false';
        type = query.type || 'text';
        old_value = query.value;
        var name = query.name;
        var placeholder = getI18NText('input-more')+ query.name;

        var beforeRender = function() {
            $('.edit-title').text(getI18NText('modify') + name);
        };

        var afterRender = function() {
            $('.edit-text-input').val(old_value);
            setTimeout(function() {
                $('.edit-text-input').focus();
            }, 500);

        }

        var renderObject = {
            selector: $('.editText'),
            hbsUrl: 'js/weStarPerson/editText/editText',
            model: {placeholder : placeholder},
            bindings: bindings,
            beforeRender: beforeRender,
            afterRender: afterRender
        }
        viewRender(renderObject);
    }

    function saveEdit() {
        var new_value = $('.edit-text-input').val();

        if (nullable === 'false' && (new_value === null || new_value.trim() === '')) {
            app.f7.alert(getI18NText('newNull'));
            return;
        }
        if (old_value !== null && new_value !== null && new_value.trim() === old_value.trim()) {
            app.f7.alert(getI18NText('newValSame'));
            return;
        }
        var dataobj = storeWithExpiration.get('ee_person');
                    
        var onSuccess = function(data) {
            closeLoading();
            if (parseInt(data.status) === 1) {
                showToast(getI18NText('modifySucceed'),1000);
                dataobj[group_id].data.forEach(function(item,index){
                    if(item.field_code === field_code){
                        item.value = new_value;
                    }
                });
                storeWithExpiration.set('ee_person', dataobj);
                var title = dataobj[group_id].title;
                
                app.mainView.router.back({
                    url: './js/weStarPerson/detail/detail.html',
                    query : {
                        id : group_id,
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
                group_type : group_id,
                field_code: field_code,
                isGroup : false,
                value : new_value 
            })
        }
        showLoading();
        var url = ess_getUrl('humanresource/HumanResourceWebsvcService/updateEmployeeProfileDetail/');
        getAjaxData(module, url, onSuccess, onError, data);
    }

    return {
        init: init
    };

});