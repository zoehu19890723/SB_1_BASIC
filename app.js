require.config({
    paths: {
        handlebars: "lib/handlebars",
        text: "lib/text",
        hbs: "lib/hbs"
    },
    shim: {
        handlebars: {
            exports: "Handlebars"
        }
    }
});

define('app', ['js/router','js/locale','handlebars'], function (Router, Locale) {
    Router.init();

    var language = localStorage.getItem('language') || 'en_us';
    var sure = (Locale[language] !== undefined) ? (Locale[language])['confirmP'] : 'Ok';
    var cancel = (Locale[language] !== undefined) ? (Locale[language])['cancelP'] : 'Cancel'
    
    var f7 = new Framework7({
        modalTitle: '',
        animateNavBackIcon: true,
        dynamicNavbar:true,
        cache:true,
        modalButtonOk: sure,
        modalButtonCancel: cancel
    });

    var mainView = f7.addView('.view-main', {
        dynamicNavbar: true
    });
    
    return {
        f7: f7,
        mainView: mainView,
        router: Router,
        locale : Locale
    };
});
