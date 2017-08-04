define(["app"], function(app) {
    var bindings = [];
    function init() {
        var model = {
            version : Star_appVersion || '1.0.0'
        };
        var renderObject = {
            selector: $('.about'),
            hbsUrl: "js/ee_self/about/about",
            model: model,
            bindings: bindings
        }
        viewRender(renderObject);
    }

    return {
        init: init
    };
});