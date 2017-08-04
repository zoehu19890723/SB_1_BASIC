define(function () {
    /**
     * Init router, that handle page events
     */
    function init() {
        $(document).on('pageBeforeInit', function (e) {
            //localStorage.setItem("isFirstUse", '1');
            store.set('pageRouter', {
                pagePrevious: e.detail.page.fromPage?e.detail.page.fromPage.name:'',
                pageNow: e.detail.page.name
            });

            var page = e.detail.page;
            var query_ = getQueryObject(e.detail.page.container.baseURI);
            if (page.query) {
                for (val in query_) {
                    page.query[val] = query_[val];
                }
            } else {
                page.query = query_;
            }
            load(page.name, page.query);
        });
    }


    /**
     * Load (or reload) controller from js code (another controller) - call it's init function
     * @param controllerName
     * @param query
     * @param module  属于哪个大模块下面
     * @param type  1:默认调用init  2：调用back页面
     */
    function load(controllerName, query, module, type) {
        if (controllerName==null){
            return;
        }
        try{
            var pageName = controllerName.split('/').pop();

            require(['js/' + controllerName + '/'+ pageName + 'Controller'], function(controller) {
                transformI18NForHtml();//transform language for basic html
                controller.init(query);
            });
        }catch(e){
            throw new Error(e);
        }

    }

    return {
        init: init,
        load: load
    };
});