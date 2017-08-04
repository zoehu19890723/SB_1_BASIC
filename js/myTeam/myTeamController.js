/**
 * @description  WeStar salary controller.Created at 2016/6/24
 * @author zoe
 */
define(["app"], function(app) {

    var bindings = [
    {
        element: '.team-member',
        event: 'click',
        handler: openNewPage
    },{
        element: '.myTeamback',
        event: 'click',
        handler: backToMain
    },{
        element: '.nav-item',
        event: 'click',
        handler: backToPointedPage
    },{
        element: '.self-info-card',
        event: 'click',
        handler: openProfile
    }];

    var module = {
        html : 'myTeam/myTeam.html'
    }

    /**
     * init controller 
     */
    function init(param) {
        var animation = '';
        if(param !== undefined && param.id !== undefined){
            if(param.back === true){
                animation = 'fromLeft';
            }else{
                animation = 'fromRight';
            }
            getMyTeamMember(param.id,animation);
        }else{
            showLoading();
            getMyProfile();
        }
    }

    function getMyProfile(){
        var parent_obj = {};

        var onError = function(e){
            closeLoading();
            app.f7.alert(getI18NText('network-error'),function(){
                backToMain();
            });
        }
        var onSuccess = function(data){
            if(data.status === "1" || data.status === 1){
                var photo=data.data.profile.photo;
                if(photo &&''!==photo && photo.indexOf(Star_imgUrl)< 0){
                    data.data.profile.photo = Star_imgUrl + photo;
                }
                storeWithExpiration.set('ee_person',data.data);
                parent_obj = _.pick(data.data.profile,'name', 'id','emp_code');
                parent_obj.fullname = parent_obj.name;
                store.set('parent',[parent_obj]);
                getMyTeamMember(data.data.profile.id);
                
            }else{
                closeLoading();
                var message = data.message;
                if (parseInt(data.status) === 605) {
                    message = getI18NText('DBError');
                }
                app.f7.alert(message,function(){
                    backToMain();
                });
            }
        }

        var onReStoreData = function(data){
            if(data.status === "1" || data.status === 1){
                var photo=data.data.profile.photo;
                if(photo &&''!==photo && photo.indexOf(Star_imgUrl)< 0){
                    data.data.profile.photo = Star_imgUrl + photo;
                }
                storeWithExpiration.set('ee_person',data.data);
            }else{
                closeLoading();
                var message = data.message;
                if (parseInt(data.status) === 605) {
                    message = getI18NText('DBError');
                }
                app.f7.alert(message);
            }
        }

        var url = ess_getUrl("humanresource/HumanResourceWebsvcService/getEmployeeProfile/");
        
        if(!storeWithExpiration.get("ee_person")){
            getAjaxData(module,url,onSuccess, onError);
        }else{
            parent_obj = _.pick(storeWithExpiration.get("ee_person").profile,'name', 'id','emp_code');
            parent_obj.fullname = parent_obj.name;
            store.set('parent',[parent_obj]);
            getMyTeamMember(storeWithExpiration.get("ee_person").profile.id);
            
            getAjaxData(module,url,onReStoreData, onError);
        }
    }

    function getMyTeamMember(id,animation){
        

        var onError = function(e){
            closeLoading();
            app.f7.alert(getI18NText('network-error'),function(){
                backToMain();
            });
        }

        var onSuccess = function(data){
            if(parseInt(data.status) === 1){
                setView(data.data,animation)
            }else{
                closeLoading();
                var message = data.message;
                if (parseInt(data.status) === 605) {
                    message = getI18NText('DBError');
                }
                app.f7.alert(message,function(){
                    backToMain();
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
                backToMain();
            });
        }else{
            getAjaxData(module,url,onSuccess, onError,data);
        }
        
    }

    function setView(data,animation){
        closeLoading();
        var model = {}
        if(data === null || data.length === 0){
            model.isNull = true;
        }else{
            var hasNav = false;
            var afterRender = function(){
                if(hasNav === true){
                    var width = $('.org-nav').width();
                    $('.org-nav').scrollLeft(width);
                }
                var width = $('body').width();
                $('.myTeam .page-content').css('width',width);
            }
            var parent = store.get('parent');
            if(parent.length > 1){
                hasNav = true;
                var lastNode = parent[parent.length-1];
                lastNode.isSelf = 'isSelf';
            }
            data.forEach(function(item){
                if(item.photo !== undefined && item.photo !== null && item.photo !== ''){
                    var src = item.photo.replace(/\s/g, '%20');
                    item.photo = Star_imgUrl + src;
                }
            })
            model = {
                isNull: false,
                members : data,
                hasNav : hasNav,
                parent : parent,
                animation : animation
            }
        }
        
        var renderObject = {
            selector: $('.myTeam'),
            hbsUrl: "js/myTeam/myTeam",
            model: model,
            bindings: bindings,
            afterRender : afterRender
        }
        viewRender(renderObject);
    }

    function openNewPage(e){
        var id = $(e.currentTarget).attr("toPage");
        var name = $(e.currentTarget).parent().find('.emp-name>span').text();
        var code = $(e.currentTarget).parent().find('.emp-code>span').text();
        var parent = store.get('parent');
        parent.push({
            id : id,
            emp_code : code,
            fullname : name
        });
        store.set('parent',parent);
        init({id : id});
    }

    function backToMain(){
        store.set('parent',[]);
        app.mainView.router.back({
            url: './js/myProfile/myProfile.html',
            force : true
        });
    }

    function openProfile(e){
        var id = $(e.currentTarget).attr("toPage");
        var name = $(e.currentTarget).find(".emp-name span").text();
        app.mainView.router.load({
            url: './js/weStarPerson/summary/summary.html?id='+id+'&name='+name,
        });
    }

    function backToPointedPage(e){
        var id = $(e.currentTarget).attr("toPage");
        var parent = store.get('parent');
        var select_index = _.findIndex(parent, {id : id}); 
        parent = _.initial(parent, (parent.length - select_index - 1)); 
        store.set('parent',parent);
        
        init({id : id ,back : true});
    }
    return {
        init: init
    };
});