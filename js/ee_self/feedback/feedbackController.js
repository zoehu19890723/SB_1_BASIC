define(["app"], function(app) {


    var bindings = [{
        element: '#confirm_feedback_button',
        event: 'click',
        handler: commitFeed
    }, ];

    function init() {
        var renderObject = {
            selector: $('.feedback'),
            hbsUrl: "js/ee_self/feedback/feedback",
            model:{},
            bindings: bindings
        }
        viewRender(renderObject);
    }

    return {
        init: init
    };


    function commitFeed() {
        app.mainView.router.back();
    }


});