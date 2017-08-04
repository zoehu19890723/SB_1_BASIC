define(["app"], function(app) {
    var bindings = [{
        element: '#Photograph',
        event: 'click',
        handler: Photograph
    }, {
        element: '#AccesstoPhone',
        event: 'click',
        handler: AccesstoPhone
    }, {
        element: '#save_photo',
        event: 'click',
        handler: save_photo
    }];


    var query_;
    var serviceIP = Star_envUrl;
    var sessionID = localStorage.getItem('sessionid');

    function init(query) {
        query_ = query;
        var afterRender = function(template) {
            app.f7.popup(template);
            app.f7.closeModal(template);
        }
        var renderObject = {
            hbsUrl: "js/myLeave/attatchment/attatchment",
            model: query_,
            bindings: bindings,
            afterRender: afterRender
        }
        viewRender(renderObject);
    }

    return {
        init: init
    };

    function save_photo() {

        //上传图片

        if (imgURL === "") {
            app.f7.alert(getI18NText('noPFind'), '');
        } else {
            var serviceURL = encodeURI(serviceIP + '/system/EFile/upload/;jsessionid=' + sessionID);

            var deferred = when.defer();
            options = new FileUploadOptions();
            options.fileKey = "photo";
            options.fileName = imgURL.substr(imgURL.lastIndexOf('/') + 1);
            options.mimeType = "image/jpeg";

            var ft = new FileTransfer();
            // 上传回调
            showLoading();
            ft.upload(imgURL, serviceURL, function(data) {
                app.f7.closeModal()
                closeLoading();
                app.f7.alert(getI18NText('uploadSuc'), '');
                var phoneSRC = JSON.parse(data.response).result.filePath;
                phoneSRC = Star_imgUrl + phoneSRC;
                //alert(phoneSRC)
                localStorage.setItem('attatchPhoto', phoneSRC);
                $(".edit-attatchment").html("<img src='" + phoneSRC + "' style='height:48px!important;height: 48px;' >")
            }, function() {
                closeLoading();
                app.f7.alert(getI18NText('uploadFail'), '');

            }, options);
            return deferred.promise
        }

    };

    function Photograph() {
        navigator.camera.getPicture(
            onPhotoUrlSuccess,
            onUrlFail, {
                quality: 100,
                allowEdit: false,
                destinationType: Camera.DestinationType.FILE_URI,
                targetWidth: 150, //生成的图片大小 单位像素
                targetHeight: 150,
                correctOrientation: true
            });
    };

    function AccesstoPhone() {
        navigator.camera.getPicture(
            onPhotoUrlSuccess,
            onUrlFail, {
                quality: 100,
                destinationType: Camera.DestinationType.FILE_URI, //设置返回值的格式   DATA_URL:base64  FILE_URI:路径格式
                sourceType: Camera.PictureSourceType.PHOTOLIBRARY, //PHOTOLIBRARY或SAVEDPHOTOALBUM 系统弹出照片选择对话框，用户可以从相集中选择照片
                allowEdit: false,
                targetWidth: 150,
                targetHeight: 150,
                mediaType: Camera.MediaType.PICTURE
            })
    };
});

var imgURL;

function onPhotoUrlSuccess(data) {
    data.lastIndexOf('?') > 0 ? imgURL = data.substring(0, data.lastIndexOf('?')) : imgURL = data;
    $('#picture-holder')[0].innerHTML = '<img src="' + data + '" width="200" height="200">'


};

function onUrlFail(error) {
    console.log(error);
};