/**
 * Created by Elsa.Dou on 2016/1/8.
 */
define(["app"], function(app) {

    var contact = null;
    var color = ["blue", "red", "lightgreen", "orange2", "pink", "teal"];
    var state = {
        isFavorite: false
    };
    var flag = 0;

    var bindings = [

    ];

    function init(query) {
        var list__ = store.get('myContact');
        if (list__) {
            showList({
                "list": list__
            });
        } else {
            showLoading();

        }
    }

    function showList(model) {
        var renderObject = {
            selector: $('.companyNews'),
            hbsUrl: "js/myMessage/companyNews/companyNews",
            model: model,
            bindings: bindings
        }
        viewRender(renderObject);
    }

    function seeDetail(e) {


    }
    return {
        init: init
    };
});