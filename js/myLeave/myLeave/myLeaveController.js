/** 
 * @author zoe
 * @description It is my leave home-page
 * Created at 2016/6/24  
 */
define(["app","js/weStarPerson/summary/summaryController"], function (app,profile) {


    var bindings = [
            { element: '.my-leave-item', event: 'click', handler: openNewPage} ,
            // { element: '.edit-head-photo', event: 'click', handler: profile.openPhotoPage }
        ];
    /**
     * Init the controller
     */
    function init() {
        var model_= {
            listInfo : getStructures()
        };
        var renderObject = {
            selector : $('.myleave'),
            hbsUrl : "js/myLeave/myLeave/myLeave",
            model : model_,
            bindings : bindings
        }
        profile.setPersonalProfile(renderObject);
    }
    /**
     * Open page to different leave module
     * @param  {Object} e click event object
     */
    function openNewPage(e){
        var id=$(e.currentTarget).attr("toPage");
        app.mainView.router.load({url:'./js/myLeave/'+id+'/'+id+'.html'});
    }

    return {
        init: init
    }
    /** 
     * @return {Array} leave modules
     */
    function getStructures(){
        return [[
                {
                    title : getI18NText('leave-quota-show'),
                    link : "myLeaveQuota"

                },{
                    title : getI18NText('leave-info-show'),
                    link : "myLeaveInfo"
                }
            ],[
                {
                    title : getI18NText('leave-apply'),
                    link : "myLeaveApply"
                },{
                    title : getI18NText('leave-approve'),
                    link : "myLeaveApprove"
                }
                // ,{
                //     title : "休假撤销申请",
                //     link : "myLeaveCancel"
                // }
            ]]    
        }
});