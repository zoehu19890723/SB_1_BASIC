define(["app"], function(app) {

    var bindings = [{
        element: '.my-sub-item',
        event: 'click',
        handler: gotoSubDetail
    }];
     var module = {
        html: 'myContact/subSelect/subSelect.html'
    }

    function init(query) {
        var id = query.id;
        var onError = function(e){
            closeLoading();
            app.f7.alert(getI18NText('network-error'),function(){
                backForce();
            });
        }
        var onSuccess = function(data){
            if(data.status === "1" || data.status === 1){
                var model = {};
                if(data.data.length === 0){
                    model.isNull = true;
                }else{
                     data.data.forEach(function(item){
                        if(item.photo !== undefined && item.photo !== null && item.photo !== ''){
                            var src = item.photo.replace(/\s/g, '%20');
                            item.photo = Star_imgUrl + src;
                        }
                    });
                     model = {
                        isNull: false,
                        members : data.data,
                    }
                }
                 var renderObject = {
                    selector: $('.subselect'),
                    hbsUrl: "js/myContact/subSelect/subSelect",
                    model: model,
                    bindings: bindings
                }
                viewRender(renderObject);
            
            }else{
                closeLoading();
                var message = data.message;
                if (parseInt(data.status) === 605) {
                    message = getI18NText('DBError');
                }
                app.f7.alert(message,function(){
                    backForce();
                });
            }
        }
        var data = {
                "argsJson": JSON.stringify({
                    "id": id
                })
            }
        var url = ess_getUrl("ess/SubordinateService/GetSubordinateByEmpId/");
        
        if(id === undefined || id === null){
            closeLoading();
            app.f7.alert(getI18NText('noUserId'),function(){
                backForce();
            });
        }else{
            getAjaxData(module,url,onSuccess, onError,data);
        }
    }

    function backForce(){
        app.mainView.router.back();
    }

    function gotoSubDetail(e){
        var id = $(e.currentTarget).attr('data-id');
        app.mainView.router.back({
            url: 'js/myContact/contactDetail/contactDetail.html?id='+id,
            force: true
        });
    }

    return {
        init: init
    };
});