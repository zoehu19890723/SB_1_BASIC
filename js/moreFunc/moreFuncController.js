define(["app"], function(app) {

    var bindings = [];

    function init() {
        var renderObject = {
            selector: $('.morefunc'),
            hbsUrl: "js/moreFunc/moreFunc",
            model: {
                isNull: true
            },
            bindings: bindings
        }
        viewRender(renderObject);

    }
    return {
        init: init
    };
});