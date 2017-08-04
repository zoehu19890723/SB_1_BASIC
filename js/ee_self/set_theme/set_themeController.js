define(["app"], function(app) {
    var bindings = [{
        element: '.theme-panel',
        event: 'click',
        handler: updateTheme
    }];
    function init() {
        var selected_color = localStorage.getItem("theme") || 'blue';
        var model = {
            selected : selected_color,
            themes : [{
                name : '樱花粉',
                color : 'pink'
            },{
                name : '魅惑紫',
                color : 'purple'
            },{
                name : '炫目黄',
                color : 'yellow'
            },{
                name : '深邃蓝',
                color : 'blue'
            },{
                name : '清新绿',
                color : 'green'
            },{
                name : '经典黑',
                color : 'dark'
            },{
                name : '中国红',
                color : 'cdp'
            }]
        };
        var renderObject = {
            selector: $('.set_theme'),
            hbsUrl: "js/ee_self/set_theme/set_theme",
            model: model,
            bindings: bindings
        }
        viewRender(renderObject);
    }

    function updateTheme(e){
        var id = $(e.currentTarget).attr("id");
        var old_theme = localStorage.getItem("theme") || 'blue';
        if(id === old_theme){
            return;
        }
        setTheme(id);
        showToast('更换主题成功',2000);
        app.mainView.router.refreshPage();
    }
    return {
        init: init
    };
});