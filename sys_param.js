var WebUrlPath = {
    'WEB_WESTAR' : '//192.168.102.206',//开发环境
    'WEB_WESTAR_SERVICE' : '/ws.php',//开发环境服务
    'WEB_WESTAR_Ali' : 'http://star-test.cdpyun.com',//阿里云环境
    'WEB_WESTAR_PRO' : '//star.cdpyun.com',//生产环境
    'WEB_WESTAR_SERVICE_PRO' : '/ws.php',//阿里云环境服务
};

var EXPIRATION_TIME = 30*24*60*60*1000;

//发布系统
//1.修改后端服务 url
// var Star_imgUrl = WebUrlPath.WEB_WESTAR_PRO;
// var Star_envUrl = Star_imgUrl+WebUrlPath.WEB_WESTAR_SERVICE_PRO;
// var Star_imgUrl = WebUrlPath.WEB_WESTAR;
// var Star_envUrl=Star_imgUrl+WebUrlPath.WEB_WESTAR_SERVICE;
var Star_imgUrl = WebUrlPath.WEB_WESTAR_Ali;
var Star_envUrl=Star_imgUrl+WebUrlPath.WEB_WESTAR_SERVICE_PRO;


//2.修改app版本 
var Star_appVersion = '1.2.0';
