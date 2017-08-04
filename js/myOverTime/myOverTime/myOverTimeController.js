/** 
 * @author zoe
 * @description It is my overtime home-page
 * Created at 2016/6/24  
 */
define(["app", "js/weStarPerson/summary/summaryController"], function(app, profile) {

    var bindings = [{
            element: '.my-overtime-item',
            event: 'click',
            handler: openNewPage
        },
        // { element: '.edit-head-photo', event: 'click', handler: profile.openPhotoPage }
    ];
    /**
     * Init the controller
     */
    function init() {
        var model_ = {
            listInfo: getStructures()
        };
        var renderObject = {
            selector : $('.myovertime'),
            hbsUrl : "js/myOverTime/myOverTime/myOverTime",
            model : model_,
            bindings : bindings
        }
        profile.setPersonalProfile(renderObject);
    }
    /**
     * Open page to different overtime module
     * @param  {Object} e click event object
     */
    function openNewPage(e) {
        var id = $(e.currentTarget).attr("toPage");
        app.mainView.router.load({
            url: './js/myOverTime/' + id + '/' + id + '.html'
        });
    }

    return {
        init: init
    }
    /** 
     * @return {Array} overtime modules
     */
    function getStructures() {
        return [
            [{
                title: getI18NText('overtime-info-text'),
                link: "myOverTimeInfo"
            }],
            [{
                title: getI18NText('overtime-apply-text'),
                link: "myOverTimeApply"
            }, {
                title: getI18NText('overtime-approve-text'),
                link: "myOverTimeApprove"
            }]
        ]
    }
});