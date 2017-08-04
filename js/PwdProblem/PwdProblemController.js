define(["app"], function(app) {
	var bindings = [{
			element: '#PwdProblem_back',
			event: 'click',
			handler: openBackPage
		}, {
			element: '#enterOK',
			event: 'click',
			handler: enterOK_fun
		}, {
			element: '#check-phone-number',
			event: 'click',
			handler: checkPhone
		}, {
			element: '#mobile',
			event: 'focus',
			handler: textEdit
		}, {
			element: '#mobile',
			event: 'keyup',
			handler: addClear
		}, {
			element: '#mobile',
			event: 'blur',
			handler: hideClear
		},{
			element: '#text-clear-mo',
			event: 'click',
			handler: textClear
		}, {
			element: '#verifyCode',
			event: 'focus',
			handler: textEdit
		}, {
			element: '#verifyCode',
			event: 'keyup',
			handler: addClear
		}, {
			element: '#verifyCode',
			event: 'blur',
			handler: hideClear
		},{
			element: '#text-clear-ve',
			event: 'click',
			handler: textClear
		}, {
			element: '#password_confirm',
			event: 'focus',
			handler: textEdit
		}, {
			element: '#password_confirm',
			event: 'keyup',
			handler: addClear
		}, {
			element: '#password_confirm',
			event: 'blur',
			handler: hideClear
		},{
			element: '#text-clear-password',
			event: 'click',
			handler: textClear
		}, {
			element: '#password',
			event: 'focus',
			handler: textEdit
		}, {
			element: '#password',
			event: 'keyup',
			handler: addClear
		}, {
			element: '#password',
			event: 'blur',
			handler: hideClear
		},{
			element: '#text-clear-password_confirm',
			event: 'click',
			handler: textClear
		}, {
			element: '.back',
			event: 'click',
			handler: function() {
				$('.navbar').addClass("navbar-none")
			}
		}
	];

	function init(query) {
		$('.navbar').removeClass("navbar-none");
		var renderObject = {
            selector: $('.pwd-problem'),
            hbsUrl: "js/PwdProblem/PwdProblem",
            model: {},
            bindings: bindings
        }
        viewRender(renderObject);
	}

	return {
		init: init
	};

	function commonDeal(url, onDataSuccess, onDataError, onOverTimeError, onError) {
		var onStarSuccess = function(data) {
			if (parseInt(data.status) === 1) {
				onDataSuccess(data);
			} else {
				onDataError(data);
			}
		}
		getAjaxData(null, url, onStarSuccess, onError);
	}

	function enterOK_fun(event) {
		var regPhone = /^1[3-8]+\d{9}$/;
		var regPWD = /^(?=.*[0-9].*)(?=.*[A-Z].*)(?=.*[a-z].*)(?=.*[,.~!@#$%\^\+\*&\\\/\?\|:\.{}();=_\-\<\>\[\]].*).{4,50}$/;
		var mobile = $.trim($("#mobile").val());
		var verifyCode = $.trim($("#verifyCode").val());
		var password = $.trim($("#password").val());
		var password_confirm = $.trim($("#password_confirm").val());
		
		if(mobile === ""){
			app.f7.alert(getI18NText('phoneTip'));
			return false;
		}else if(!regPhone.test(mobile)){
			app.f7.alert(getI18NText('effectivePhoneTip'));
			return false;
		}else if(verifyCode === "") {
			app.f7.alert(getI18NText('inputValidCodeTip'));
			return false;
		}else if (password === "") {
			app.f7.alert(getI18NText('inputNewPwd'), '');
			return false;
		} else if (password_confirm === "") {
			app.f7.alert(getI18NText('inputSureNewPwd'), '');
			return false;
		} else if (password !== password_confirm) {
			app.f7.alert(getI18NText('ensurePwdSame'), '');
			return false;
		} else if (!regPWD.test(password)) {
			app.f7.alert(getI18NText('effectivePwdTip'), '');
			return false;
		}else {
			var onError = function(e) {
				app.f7.hidePreloader();
				closeLoading();
				app.f7.alert(getI18NText('network-error'));
			}

			var onStarSuccess = function(data) {
				if (parseInt(data.status) === 1) {
					app.f7.alert(getI18NText('changePwdSucceed'), '');
					setLocalStorage({
						"userName": mobile
					});
					$(".modal-button").click(function() {
						$('.navbar').addClass("navbar-none");
						app.mainView.router.load({
							url: 'index.html'
						});
					});
				} else {
					var message = data.message;
                    if (parseInt(data.status) === 605) {
                        message = getI18NText('DBError');
                    }
                    app.f7.alert(message);
				}
			}
			var url = ess_getUrl("user/userService/resetPwdByMobile/") + "&mobile=" + mobile + "&validation=" + verifyCode + "&pwd=" + password;
			getAjaxData(null,url, onStarSuccess, onError);
		}
	}

	function checkPhone() {
		var check = true;
		var regPhone = /^1[3-8]+\d{9}$/;
		var mobile = $.trim($("#mobile").val());
		if (mobile != "") {
			if (!regPhone.test(mobile)) {
				check = false;
				app.f7.alert(getI18NText('effectivePhoneTip'));
			}
		} else {
			check = false;
			app.f7.alert(getI18NText('phoneTip'));
		}

		if (check) {
			showLoading();
			var onError = function(e) {
				closeLoading();
				app.f7.alert(getI18NText('network-error'));
			}
			var onStarSuccess = function(data) {
				if (parseInt(data.status) === 1) {
					closeLoading();
					app.f7.alert(getI18NText('code-sent'), '');
					var curCount = 60;
					$("#check-phone-number").attr("disabled", "true");
					$("#check-phone-number").html(curCount +getI18NText('secResend'));
					var InterValObj = window.setInterval(function() {
						if (curCount == 0) {
							window.clearInterval(InterValObj); //停止计时器
							$("#check-phone-number").removeAttr("disabled"); //启用按钮
							$("#check-phone-number").html(getI18NText('resendCode'));
						} else {
							curCount--;
							$("#check-phone-number").html(curCount + getI18NText('secResend'));
						}
					}, 1000);
				} else {
					closeLoading();
					var message = data.message;
                    if (parseInt(data.status) === 605) {
                        message = getI18NText('DBError');
                    }
                    app.f7.alert(message);
				}
			}
			var url = ess_getUrl("user/userService/sendMobileValidationCode/") + "&mobile=" + mobile;
			getAjaxData(null,url, onStarSuccess, onError);
		}
	}
	function openBackPage() {
		$('.navbar').addClass("navbar-none");
		app.mainView.router.back({
			url: 'index.html',
			force: true,
			ignoreCache: true
		});
	}


});