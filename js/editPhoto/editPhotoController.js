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

    var module = {
        html: 'editPhoto/editPhoto.html'
    };
    var query_;


    function init(query) {
        query_ = query;

        var afterRender = function(template) {
            app.f7.popup(template);
            app.f7.closeModal(template);
        };
        var renderObject = {
            hbsUrl: "js/editPhoto/editPhoto",
            model: query_,
            bindings: bindings,
            afterRender: afterRender
        };
        viewRender(renderObject);
    }

    return {
        init: init
    };

    function save_photo() {
        //上传图片
        var sessionID = localStorage.getItem('sessionid');
        var serviceIP = Star_envUrl;

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
                onFileUploadSucceed(JSON.parse(data.response).result.filePath);
            }, function() {
                closeLoading();
                app.f7.alert(getI18NText('uploadFail'), '');
            }, options);
            return deferred.promise;
        }
    }

    function onFileUploadSucceed(image_url) {
        var onSuccess = function(json) {
            closeLoading();
            app.f7.closeModal();
            if (parseInt(json.status) === 1) {
                showToast(getI18NText('uploadSuc'));
                var phoneSRC = image_url;
                phoneSRC = phoneSRC.replace(/\s/g, '%20');
                if (phoneSRC.indexOf(Star_imgUrl) < 0) {
                    phoneSRC = Star_imgUrl + phoneSRC;
                }
                if (storeWithExpiration.get('ee_person') !== undefined && storeWithExpiration.get('ee_person') !== null) {
                    var ee_person = storeWithExpiration.get('ee_person');
                    ee_person.profile.photo = phoneSRC;
                    storeWithExpiration.set('ee_person', ee_person);
                }
                $(".edit-head-photo").html('<img src="' + phoneSRC + '" height="60" width="60">');
            } else {
                var message = json.message;
                if (parseInt(json.status) === 605) {
                    message = getI18NText('DBError');
                }
                app.f7.alert(message);
            }
        };
        var onError = function(e) {
            closeLoading();
            alert("error");
            app.f7.alert(getI18NText('network-error'));
        };

        var url = ess_getUrl("humanresource/HumanResourceWebsvcService/updateEmployeePhoto/");

        var param = {
            argsJson: JSON.stringify({
                photo: image_url
            })
        };
        getAjaxData({}, url, onSuccess, onError, param);
    }


    function Photograph() {
        navigator.camera.getPicture(
            onPhotoUrlSuccess,
            onUrlFail, {
                quality: 100,
                allowEdit: true,
                destinationType: Camera.DestinationType.FILE_URI,
                targetWidth: 150, //生成的图片大小 单位像素
                targetHeight: 150,
                correctOrientation: true
            });
    }

    function AccesstoPhone() {
        navigator.camera.getPicture(
            onPhotoUrlSuccess,
            onUrlFail, {
                quality: 100,
                destinationType: Camera.DestinationType.FILE_URI, //设置返回值的格式   DATA_URL:base64  FILE_URI:路径格式
                sourceType: Camera.PictureSourceType.PHOTOLIBRARY, //PHOTOLIBRARY或SAVEDPHOTOALBUM 系统弹出照片选择对话框，用户可以从相集中选择照片
                allowEdit: true,
                targetWidth: 150,
                targetHeight: 150,
                mediaType: Camera.MediaType.PICTURE
            });
    }
});

var imgURL;

function onPhotoUrlSuccess(data) {
    imgURL = data.lastIndexOf('?') > 0 ?  data.substring(0, data.lastIndexOf('?')) : data;
    $('#head-holder')[0].innerHTML = '<img src="' + data + '" width="120" height="120">';
}

function onUrlFail(error) {
    console.log(error);
}