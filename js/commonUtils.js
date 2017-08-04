/**
 * Update by zoe,2016/9/28.
 */

$(function() {
	//init system
	initLocalStorage();
	setTheme();
	initBrowser();
	registerCommonTemplete();

	//init event
	document.addEventListener("deviceready", onDeviceReady, false);
	document.addEventListener("backbutton", eventBackButton, false);
});

var deviceInfo = {};
var macAddressInfo;
/**
 * ondevice ready to do set local storage for device information
 */
function onDeviceReady() {
	deviceInfo.model = device.model; //设备模型（如三星，华为等）
	deviceInfo.version = device.version; //设备版本
	localStorage.setItem('deviceUUID', device.uuid);
	var onGPLSuccess = function(language) {
		if (localStorage.getItem("languageSet") !== "true") {
			var new_language = 'en_us';
			if (language !== undefined && language !== null && language.value !== undefined) {
				if (device.platform.toLowerCase() === 'ios') {
					if (language.value.indexOf('zh-Hans-') > -1) {
						new_language = 'zh_cn';
					} else if (language.value.indexOf('zh-Hant-') > -1) {
						new_language = 'zh_tw';
					} else {
						new_language = 'en_us';
					}
				} else {

					new_language = (language.value).toLowerCase().replace("-", "_");
				}

				if (new_language !== 'en_us' && new_language !== 'zh_cn' && new_language !== 'zh_tw') {
					new_language = 'en_us';
				}
			}
			localStorage.setItem("language", new_language);
		}
	};

	var onGPLFailure = function() {
		localStorage.setItem("language", 'en_us');
	};
	navigator.globalization.getPreferredLanguage(onGPLSuccess, onGPLFailure);

	window.MacAddress.getMacAddress(
		function(macAddress) {
			macAddressInfo = macAddress;
		},
		function(fail) {

		}
	);
}
/**
 * on hardware 'back' clicked ,deal with this event
 */
function eventBackButton() {
	if ($('.icon-back').length !== 0) {
		$('.icon-back').click();
	} else {
		require(['app'], function(app) {
			var popupModel = $('.popup.modal-in');
			if (popupModel.length > 0 && popupModel.css('display') === 'block') {
				app.f7.closeModal();
				return;
			}
			var activeName = app.mainView.activePage.name; //判断当前页面，只有在profile页面才提示退出，其他的都返回前一个页面
			if (activeName === '' || activeName === null || activeName.indexOf('myProfile') > -1 || activeName.indexOf('index') > -1) {
				showToast(getI18NText('exitAfterAgainTap'));

				document.removeEventListener("backbutton", eventBackButton, false); // 注销返回键
				document.addEventListener("backbutton", exitApp, false); //绑定退出事件

				//3秒后重新注册
				var intervalID = window.setInterval(
					function() {
						window.clearInterval(intervalID);
						document.removeEventListener("backbutton", exitApp, false); // 注销返回键
						document.addEventListener("backbutton", eventBackButton, false); // 返回键
					}, 3000);

			} else if (activeName.indexOf('self_base') > -1 || activeName.indexOf('contactList') > -1) {
				app.mainView.back({
					animatePages: false
				});
			} else {
				app.mainView.back();
			}
		});
	}
}

/** exit app when 'back' clicked on android mobile */
function exitApp() {
	navigator.app.exitApp();
}
/**
 * init browser information on app load
 */
function initBrowser() {
	var browser = {
		versions: function() {
			var u = navigator.userAgent,
				app = navigator.appVersion;
			return {
				trident: u.indexOf('Trident') > -1, //IE内核
				presto: u.indexOf('Presto') > -1, //opera内核
				webKit: u.indexOf('AppleWebKit') > -1, //苹果、谷歌内�?
				gecko: u.indexOf('Gecko') > -1 && u.indexOf('KHTML') == -1, //火狐内核
				mobile: !!u.match(/AppleWebKit.*Mobile.*/), //是否为移动终�?
				ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), //ios终端
				android: u.indexOf('Android') > -1 || u.indexOf('Linux') > -1, //android终端或�?�uc浏览�?
				iPhone: u.indexOf('iPhone') > -1, //是否为iPhone或�?�QQHD浏览�?
				iPad: u.indexOf('iPad') > -1, //是否iPad
				webApp: u.indexOf('Safari') == -1, //是否web应该程序，没有头部与底部
				weixin: u.indexOf('MicroMessenger') > -1, //是否微信 �?2015-01-22新增�?
				qq: u.match(/\sQQ/i) == " qq" //是否QQ
			};
		}()
	};
	localStorage.setItem("browser", JSON.stringify(browser.versions));
	if (browser.versions.ios !== undefined) {
		localStorage.setItem("device", 'ios');
	} else {
		localStorage.setItem("device", 'android');
	}
}
/** refresh localstorage */
function initLocalStorage(keepSession,clearPwd) {
	var userName = localStorage.getItem("userName");
	var passWord = localStorage.getItem("passWord");
	var language = localStorage.getItem("language");
	var languageSet = localStorage.getItem("languageSet");
	var theme_color = localStorage.getItem("theme") || "blue";
	var sessionid, device, browser;

	if (keepSession !== undefined && keepSession !== null) {
		sessionid = localStorage.getItem("sessionid");
		device = localStorage.getItem("device");
		browser = localStorage.getItem("browser");
	}

	localStorage.clear();

	localStorage.setItem("userName", userName);
	localStorage.setItem('theme', theme_color);

	if(clearPwd === undefined || clearPwd === null){
		localStorage.setItem("passWord", passWord);
	}
	if (language !== undefined || language !== null) {
		localStorage.setItem('language', language);
	}
	if (languageSet !== undefined || languageSet !== null) {
		localStorage.setItem('languageSet', languageSet);
	}

	if (keepSession !== undefined && keepSession !== null) {
		setLocalStorage({
			"sessionid": sessionid,
			"device": device,
			"browser": browser
		});
	}
}
/**
 * set theme
 * @param {String} color pointed theme
 */
function setTheme(color) {
	if (color === undefined) {
		color = localStorage.getItem("theme") || "blue";
	}
	var new_theme = "theme-custom-" + color;
	localStorage.setItem("theme", color);
	$('body').removeClass();
	$('body').addClass(new_theme);
}

/**
 * show toast loading mask
 * @param  {String} s : toast information
 * @param  {Number} t : toast duration
 */
function showToast(s, t) {
	if (t === undefined) {
		t = 3000;
	}
	var toast = '<div id="toast"><div class="weui_mask_transparent toast_mask"><div class="toast_content"><p>' + s + '</p> </div> </div></div>';
	$("#index_view").append(toast);
	setTimeout(function() {
		$("#toast").remove();
	}, t);
}

var ess_loadingToastHtml = '<div id="ess_loadingToast" class="weui_loading_toast"> <div class="weui_mask_transparent"></div> <div class="weui_toast"> <div class="weui_loading"> <!-- :) --> <div class="weui_loading_leaf weui_loading_leaf_0"></div> <div class="weui_loading_leaf weui_loading_leaf_1"></div> <div class="weui_loading_leaf weui_loading_leaf_2"></div> <div class="weui_loading_leaf weui_loading_leaf_3"></div> <div class="weui_loading_leaf weui_loading_leaf_4"></div> <div class="weui_loading_leaf weui_loading_leaf_5"></div> <div class="weui_loading_leaf weui_loading_leaf_6"></div> <div class="weui_loading_leaf weui_loading_leaf_7"></div> <div class="weui_loading_leaf weui_loading_leaf_8"></div> <div class="weui_loading_leaf weui_loading_leaf_9"></div> <div class="weui_loading_leaf weui_loading_leaf_10"></div> <div class="weui_loading_leaf weui_loading_leaf_11"></div> </div> <p class="weui_toast_content" style="text-align: center">{{spacial-string}}</p> </div> </div>';
var ess_GeoToastHtml = '<div id="ess_geoToast" class="weui_loading_toast"> <div class="weui_mask_transparent"></div> <div class="weui_toast"> <div class="weui_loading"> <div class="weui_loading_leaf weui_loading_leaf_0"></div> <div class="weui_loading_leaf weui_loading_leaf_1"></div> <div class="weui_loading_leaf weui_loading_leaf_2"></div> <div class="weui_loading_leaf weui_loading_leaf_3"></div> <div class="weui_loading_leaf weui_loading_leaf_4"></div> <div class="weui_loading_leaf weui_loading_leaf_5"></div> <div class="weui_loading_leaf weui_loading_leaf_6"></div> <div class="weui_loading_leaf weui_loading_leaf_7"></div> <div class="weui_loading_leaf weui_loading_leaf_8"></div> <div class="weui_loading_leaf weui_loading_leaf_9"></div> <div class="weui_loading_leaf weui_loading_leaf_10"></div> <div class="weui_loading_leaf weui_loading_leaf_11"></div> </div> <p class="weui_toast_content" style="text-align: center">{{spacial-string}}</p> </div> </div>';

/**
 * show loading mask for data get
 * @return {[type]} [description]
 */
function showLoading() {
	var loading_text = getI18NText('DataLoading');
	var newToastHtml = ess_loadingToastHtml.replace('{{spacial-string}}', loading_text);
	if (!isLoadingExist()) {
		$("#index_view .pages").append(newToastHtml);
	}
}
/**
 * show loading mask for login event
 * @return {[type]} [description]
 */
function showLoadingLogin() {
	var loading_text = getI18NText('DataLoading');
	var newToastHtml = ess_loadingToastHtml.replace('{{spacial-string}}', loading_text);
	$("#index_view").append(newToastHtml);
}
/** close loading mask */
function closeLoading() {
	$("#ess_loadingToast").remove();
}
/**
 * check if loading mask exist
 * @return {Boolean} true : exist ,false : not exist
 */
function isLoadingExist() {
	if ($("#ess_loadingToast").length > 0) {
		return true;
	} else {
		return false;
	}
}
/**
 * show geolocation mask
 */
function showGeoLoading() {
	var loading_text = getI18NText('GeoLoading');
	var newToastHtml = ess_GeoToastHtml.replace('{{spacial-string}}', loading_text);
	$("#index_view .pages").append(newToastHtml);
}

/** close loading mask */
function closeGeoLoading() {
	$("#ess_geoToast").remove();
}

function getRandomNumber() {
	var timestamp = (new Date()).valueOf();
	var num = Math.ceil(Math.random() * 1000);
	var result = timestamp + "_" + num;
	return result;
}

function getQueryObject(url) {
	var query = {};
	if (url && url.indexOf("?") != -1) {
		var para = url.substr(url.indexOf("?") + 1);
		var para_arr = para.split("&");
		if (para_arr) {
			for (i = 0; i < para_arr.length; i++) {
				var p = para_arr[i];
				var p_ = p.split("=");
				if (p_.length == 2) {
					query[p_[0]] = p_[1];
				}
			}
		}
	}
	return query;
}

function textEdit(e) {
	var val_ = $.trim($(this).val());
	if ("" !== val_) {
		$(this).parent().next().children().show();
	} else {
		$(this).parent().next().children().hide();
	}
}

function textClear() {
	$(this).parent().parent().find("[class=weui_input]").val("");
	$(this).hide();
}

function hideClear() {
	$(this).parent().next().children().hide();
}

function addClear() {
	var val_ = $.trim($(this).val());
	if ("" !== val_) {
		$(this).parent().next().children().show();
	} else {
		$(this).parent().next().children().hide();
	}
}

/**
 * get basic url for differnt service
 * @param  {String} url      Spark url
 * @return {String}           new url
 */
function ess_getUrl(url) {
	//mobile/PC
	var platform = "pc";
	if ("android" == localStorage.getItem("device") || "ios" == localStorage.getItem("device")) {
		platform = "mobile";
	}
	var ess_envUrl = Star_envUrl + "/";

	var session_id = localStorage.getItem("sessionid") || null;
	//WeStar
	var extraParam = (session_id=== null) ? '&format=jsonp' : ('&format=jsonp&cubi_sess_id='+session_id);
	var url_ = ess_envUrl + url + extraParam;
	return url_;

}
/**
 * re-define the store object with expiration time(default 30d)
 * @type {Object}
 */
var storeWithExpiration = {
	set: function(key, val, expiration_time) {
		expiration_time = expiration_time || EXPIRATION_TIME;
		store.set(key, {
			val: val,
			expiration_time: expiration_time,
			time: new Date().getTime()
		});
	},
	get: function(key) {
		var info = store.get(key);
		if (!info) {
			return null;
		}
		if (new Date().getTime() - info.time > info.expiration_time) {
			store.remove(key);
			return null;
		}
		return info.val;
	},
	remove: function(key) {
		store.remove(key);
	}
};
/**
 * get ajax data
 * @param  {String} url       ajax address
 * @param  {Function} onSuccess called when ajax succeed
 * @param  {Function} onError   called when ajax failed
 * @param  {Object} data      paramaters of ajax request
 */
function getAjaxData(module, url, onSuccess, onError, data) {
	data = data || null;
	var onSuccessCallBack = function(data) {
		if (data.status === 555) { //session time out;
			DealSessionOut(module);
			//console.log('sessop --------');
		} else if (onSuccess !== undefined && typeof onSuccess === "function") {
			onSuccess(data);
		}
	};
	$.ajax({
		type: "get",
		async: true,
		url: url,
		data: data,
		dataType: "jsonp",
		timeout: 20000,
		jsonp: "callback",
		jsonpCallback: "jsonp" + getRandomNumber(),
		success: onSuccessCallBack,
		error: onError
	});
}

/**
 * deal session time out situation
 * @param {String} module pointed module
 */
function DealSessionOut(module) {
	var userName = localStorage.getItem("userName");
	var passWord = localStorage.getItem("passWord");
	var app = require('app');
	if (userName && userName !== "" && userName !== "null" && passWord && passWord !== "" && passWord !== "null") {
		showLoading();
		var language = translateLanguage();
		var url = ess_getUrl("user/userService/loginByMobile/") + "&username=" + userName + "&password=" + passWord + "&language=" + language;
		var onStarSuccess = function(data) { //1:success;0:pwd error;-1:user not exist
			closeLoading();
			if (parseInt(data.status) === 1) {
				setLocalStorage({
					'sessionid': data.data.session_id || ''
				});
				app.mainView.router.refreshPage();
			} else {
				app.f7.alert(data.message, function() {
					app.router.load('login');
				});
			}
		};
		var onError = function(e) {
			closeLoading();
			app.f7.alert(getI18NText('network-error'), function() {
				app.router.load('login');
			});
		};
		getAjaxData(null, url, onStarSuccess, onError, null, false);
	} else {
		app.router.load('login');
	}
}

/**
 * transform language for implment
 * @param  {String} language pointed language
 * @return {String}          transformed language text
 */
function translateLanguage(language) {
	if (language === undefined) {
		language = localStorage.getItem('language') || 'en_us';
	}
	var new_language = 'english';
	switch (language) {
		case 'zh_cn':
			{
				new_language = 'chinese';
				break;
			}
		case 'zh_tw':
			{
				new_language = 'big5';
				break;
			}
		default:
			new_language = 'english';
	}

	return new_language;
}

/**
 * post ajax data
 * @param  {String} url       ajax address
 * @param  {Function} onSuccess called when ajax succeed
 * @param  {Function} onError   called when ajax failed
 * @param  {Object} data      paramaters of ajax request
 */
function postAjaxData(url, onSuccess, onError, data) {
	data = data || null;
	$.ajax({
		type: "post",
		async: true,
		url: url,
		data: data,
		dataType: "jsonp",
		timeout: 20000,
		jsonp: "callback",
		jsonpCallback: "jsonp" + getRandomNumber(),
		success: onSuccess,
		error: onError
	});
}
/**
 * set local storage
 * @param {Object} object key-value mapping
 */
function setLocalStorage(object) {
	if (arguments.length > 1) {
		window.localStorage.setItem(arguments[0], arguments[1]);
	} else {
		var array = _.pairs(object);
		array.forEach(function(k) {
			if (window.localStorage.getItem(k[0])) {
				window.localStorage.removeItem(k[0]);
			}
			window.localStorage.setItem(k[0], k[1]);
		});
	}
}
/**
 * register basic user info card for common use
 */
function registerCardTemplete() {
	var templete = '<div class="card">' + '<div class="wx-group">' + '<ul class="wx-person">' + '<li class="wx-item">' + '<div class="wx-time" ><span></span></div>' + '<span class="wx-icon edit-head-photo cut-img">  <img src="{{card.photo}}" onerror = "javascript:this.src=\'./img/default.jpg\';" onload="AutoResizeImage(60,this)"/>' + '</span>' + '<div class="wx-name">{{card.name}}</div>' + '<span class="wx-pos back-color-imp">{{#if card.post}} {{card.post}} {{else}} {{i18n-text "unknown"}} {{/if}}</span>' + '{{#if card.name_editable}}' + '<div class="wx-time " ></div>' + '{{/if}}' + '<div class="wx-content" >{{card.action}}</div>' + '</li>' + '</ul>' + '</div>' + '</div>';

	Handlebars.registerPartial('userInfoCard', templete);
}
/**
 * register basic apply info card (include my-leave and my-overtime)for common use
 */
function registerApplyInfoCardTemplete() {
	var temp = '<div class="leave-item-time">{{updateTime}}</div>' + '<div class="leave-item">' + '<div class = "status-img cut-img"><img  onload="AutoResizeImage(40,this)"src="{{userInfo.image}}" onerror="javascript:this.src=\'./img/default.jpg\';"></div>' + '<div class="b_main">' + '<div class="border border-color">' + '<div class = "summary">' + '<div class = "title back-color-imp">' + '<span>{{title}}</span>' + '</div>' + '<div class = "contentTitle">' + '<span>{{status.title}}:</span>' + '<span class = "value">{{status.value}}</span>' + '</div>' + '{{#each general}}' + '<div class = "content">' + '<span>{{title}}:</span>' + '<span class = "value">{{value}}</span>' + '</div>' + '{{/each}}' + '<div class="link-page" topage = {{id}} name={{userInfo.name}}>' + '<div class="click-detail">{{i18n-text "see-detail"}}</div>' + '<i class="WeStar_iconfont ">&#xe624;</i>' + '</div>' + '</div>' + '</div>' + '<div class="out border-right-color">' + '<div class="in border-right-color"></div>' + '</div>' + '</div>' + '</div>';

	Handlebars.registerPartial('applyInfoCard', temp);
}
/**
 * register no data card for common use
 */
function registerNullTemplete() {
	var temp = '<div class="noDataItem">' + '<span>{{i18n-text "NoData"}}</span>' + '</div>';

	Handlebars.registerPartial('nullCard', temp);
}
/**
 * register compare function for handle bar caculation
 */
function registerCompareFunction() {
	Handlebars.registerHelper('compare', function(left, operator, right, options) {
		if (arguments.length < 3) {
			throw new Error('Handlerbars Helper "compare" needs 2 parameters');
		}
		var operators = {
			'==': function(l, r) {
				return l == r;
			},
			'===': function(l, r) {
				return l === r;
			},
			'!=': function(l, r) {
				return l != r;
			},
			'!==': function(l, r) {
				return l !== r;
			},
			'<': function(l, r) {
				return l < r;
			},
			'>': function(l, r) {
				return l > r;
			},
			'<=': function(l, r) {
				return l <= r;
			},
			'>=': function(l, r) {
				return l >= r;
			},
			'typeof': function(l, r) {
				return typeof l == r;
			}
		};

		if (!operators[operator]) {
			throw new Error('Handlerbars Helper "compare" doesn\'t know the operator ' + operator);
		}

		var result = operators[operator](left, right);

		if (result) {
			return options.fn(this);
		} else {
			return options.inverse(this);
		}
	});
}
/**
 * get I18N Text
 * @param  {String} text pointed text
 * @return {String}      translated text
 */
function getI18NText(text) {
	var app = require('app');
	var language = localStorage.getItem('language') || 'en_us';

	if (language === undefined || language === "null" || app.locale[language] === undefined) {
		localStorage.setItem('language', 'en_us');
		language = 'en_us';
	}
	var res = (app.locale[language])[text];
	if (res === undefined) {
		res = text;
	}
	return res;
}

/**
 * transform text for html dom node
 */
function transformI18NForHtml() {
	var ele = $('[i18n-text]');

	ele.forEach(function(item) {
		var text = item.getAttribute('i18n-text');
		item.innerText = getI18NText(text);
	});
}

/**
 * register helper for I18N text in hbs
 * @return {[type]} [description]
 */
function registerI18NHelper() {
	Handlebars.registerHelper('i18n-text', function(text) {
		if (arguments.length < 1) {
			throw new Error('Handlerbars Helper "I18N" needs 1 parameters');
		}
		var res = getI18NText(text);
		return res;
	});
}
/**
 * register common templete
 */
function registerCommonTemplete() {
	require(['app'], function(app) {
		registerCardTemplete();
		registerApplyInfoCardTemplete();
		registerNullTemplete();
		registerCompareFunction();
		registerI18NHelper();
	});
}

/**
 * check list items length , when over the length of the item ,change its layout
 */
function checkListItems() {
	var itemInnerArr = $(".item-inner");
	itemInnerArr.forEach(function(item, index) {
		var itemTitle = $(item).find(".item-title").find("span").width();
		var itemValue = $(item).find(".ess-item-value").width();
		var totalWidth = $(item).width() - 15;
		if (totalWidth > itemTitle + itemValue) {
			return;
		} else {
			$(item).addClass("ajustItemInner");
			$(item).find(".item-title").find("span").css("white-space", "normal");
		}
	});
}
/**
 * concat image src with basic service url
 * @param  {Array} array         Array of object with image to deal
 * @param  {Boolean} withoutInfo whether image is under the property of userinfo
 * @return {Array}               new array with object dealt
 */
function dealImage(array, withoutInfo) {
	if (array && array.length !== 0) {
		array.forEach(function(item, index) {
			var subItem = withoutInfo ? item : item.userInfo;
			if (subItem && subItem.image && subItem.image !== "" && subItem.image.indexOf(Star_imgUrl) < 0) {
				var image = subItem.image.replace(/\s/g, '%20');
				subItem.image = Star_imgUrl + image;

				if (withoutInfo) {
					item = subItem;
				} else {
					item.userInfo = subItem;
				}
			}
		});
	}
	return array;
}
/**
 * render hbs files
 * @param  {object} renderObject 	 basic render paramaters contains : selector,hbsUrl,model,bindings
 *                                   event operation functions contains : beforeRender,afterRender(after render and before binding),afterBinding
 */
function viewRender(renderObject) {
	var selector = renderObject.selector;
	var hbsUrl = renderObject.hbsUrl;
	var model = renderObject.model;
	var bindings = renderObject.bindings;
	var hbsModule = "hbs!" + hbsUrl;

	var bindEvents = function(bindings) {
		for (var i in bindings) {
			$(bindings[i].element).on(bindings[i].event, bindings[i].handler);
		}
	};

	var isFnc = function(name) {
		if (renderObject !== undefined && renderObject !== null) {
			var fnc = renderObject[name];
			if (fnc !== undefined && fnc !== null && typeof fnc === "function") {
				return true;
			} else {
				return false;
			}
		} else {
			return false;
		}
	};

	require(["app", hbsModule], function(app, viewTemplate) {

		if (isFnc('beforeRender')) {
			renderObject.beforeRender.call();
		}
		var templete = viewTemplate(model);
		if (selector !== undefined && selector !== null) {
			selector.html(templete);
		}
		if (isFnc('afterRender')) {
			renderObject.afterRender.call(this, templete);
		}
		bindEvents(bindings);

		if (isFnc('afterBinding')) {
			renderObject.afterBinding.call();
		}
	});
}
//format date
Date.prototype.Format = function(fmt) {
	var o = {
		"M+": this.getMonth() + 1, //月份 
		"d+": this.getDate(), //日 
		"h+": this.getHours(), //小时 
		"m+": this.getMinutes(), //分 
		"s+": this.getSeconds(), //秒 
		"q+": Math.floor((this.getMonth() + 3) / 3), //季度 
		"S": this.getMilliseconds() //毫秒 
	};
	if (/(y+)/.test(fmt)) {
		fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
	}
	for (var k in o) {
		if (new RegExp("(" + k + ")").test(fmt)) {
			fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
		}
	}
	return fmt;
};
/**
 * deal image to pointed size
 * @param {Number} maxSize max size(width and height is the same)
 * @param {Object} objImg  image object
 */
function AutoResizeImage(maxSize, objImg) {
	var img = new Image();
	img.src = objImg.src;
	var hRatio;
	var wRatio;
	var Ratio = 1;
	var w = img.width;
	var h = img.height;
	wRatio = maxSize / w;
	hRatio = maxSize / h;
	if (wRatio < 1 || hRatio < 1) {
		Ratio = (wRatio > hRatio ? wRatio : hRatio);
	}
	if (Ratio < 1) {
		w = w * Ratio;
		h = h * Ratio;
	}
	objImg.height = h;
	objImg.width = w;
}

function cloneObj(old_obj) {
    var Constructor = old_obj.constructor;
    var obj = new Constructor();

    for (var attr in old_obj) {
        if (old_obj.hasOwnProperty(attr)) {
            if (typeof(old_obj[attr]) !== "function") {
                if (old_obj[attr] === null) {
                    obj[attr] = null;
                }
                else {
                	var type = typeof old_obj[attr];
                	switch(type){
                		case 'object' : {
                			obj[attr] = cloneObj(old_obj[attr]);
                			break;
                		}
                		case 'array' : {
                			obj[attr] = cloneArray(old_obj[attr]);
                			break;
                		}
                		default : {
                			obj[attr] = cloneCommon(old_obj[attr]);
                			break;
                		}
                	}
                }
            }
        }
    }
    return obj;
};
function cloneArray(old_array){
    var thisArr = old_array.valueOf();
    var newArr = [];
    for (var i=0; i<thisArr.length; i++) {
        newArr.push(cloneObj(thisArr[i]));
    }
    return newArr;
};

function cloneCommon(old_value){
	return old_value.valueOf();
}
