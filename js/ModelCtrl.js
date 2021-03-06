var ModelCtrl = 
{
	times : -2,
	first : true,
	loadFinish : false,
	isLog : false,
	loadData : function(data)
	{
		if(!ModelCtrl.isLog){
			ViewCtrl.messageBoxCtrl("请先登录账号！");		
			return ;
		}
		Bmob.initialize("84121d59c2a97a1f8a922763a7a19bfc", "190059def574c736f869932b0bb3a623");
		var video = Bmob.Object.extend("video");
		var query = new Bmob.Query(video);
		var limit = 8;
		query.count({
		  success: function(count) {
		  	if(data.type == "update")
		  	{
		  		ModelCtrl.times = -2;
				$(".videoBox").remove();
		  	}
			if(data.type == "classify")
			{
				$("#resultsPage .videoBox").remove();
				query.equalTo("type", data.key);
				$(".resultsheader>i").html(data.key);
			}
			else if(data.type == "search")
			{
				$("#resultsPage .videoBox").remove();
			}
			else
			{
				if(ModelCtrl.times == 0)
				{
					query.skip(0);
					query.limit(count%limit);
				}
				else
				{
					if(ModelCtrl.times == -2)
						ModelCtrl.times = Math.floor(count/limit);
					else if(ModelCtrl.times == -1)
						return ;
					query.skip((ModelCtrl.times-1)*limit + count%limit);
					query.limit(limit);
				}
			}
			query.find({
				success : function(results)
				{
					var searchFlag = false;
					for(var i = results.length - 1; i >= 0;i--)
					{
						var title = results[i].get('title');
						var url = results[i].get('url');
						var author = results[i].get('author');
						var type = results[i].get('type');
						var cover;
						if(ModelCtrl.first)
						{
							if(i > results.length - 5 && data.type == "get")
								cover = "cover";
							else
								cover = "overlay";
						}
						else
							cover = "overlay";
						var tempate = '<div class="videoBox" style="background: #525252 url(img/'+type+'.jpg) no-repeat;">' +
									'<a href=\"' + url + '\">' +
										'<div class=\"'+ cover + '\"></div>' +
										'<div class="title">' + title + '</div>' +
										'<div class="information">作者 / ' + author + '</div>' +
									'</a>' +
								'</div>';
						if(data.type == "classify" || data.type == "search")
						{
							if(data.type == "search" && str.isMate(title.toUpperCase(), data.key.toUpperCase()))
							{
								searchFlag = true;
								$("#search").css("transform", "scale(0,1)").val("");
								$(".resultsheader>i").html(data.key.toUpperCase());
								$(tempate).appendTo($("#resultsPage>.container"));
								$("#resultsPage").css("transition","transform ease .3s").css("transform", "translate3d(-100%,0,0)");
								$(".resultsheader").css("transition","transform ease .3s").css("transform", "translate3d(0,0,0)");
							}
							else if(data.type == "classify")
								$(tempate).appendTo($("#resultsPage>.container"));
							else if(searchFlag == false && i == 0)
								ViewCtrl.messageBoxCtrl("搜索失败！");
						}
						else
						{
							if(ModelCtrl.first)
							{
								if(i > results.length - 5)
									$(tempate).appendTo($("#Carousel"));
								else
									$(tempate).appendTo($(".container:first"));
							}
							else
								$(tempate).appendTo($(".container:first"));
						}
					}
					$("#mainPage .container>.videoBox, #classifyPage").trigger("loadDataEnd");
					ModelCtrl.first = false;
					ModelCtrl.loadFinish = true;
					
				},
				error : function(error)
				{
					alert("获取数据失败:" + error);
				}
			});
		}
	});
	},

	preLoad : function()
	{
		$(window).on("scroll", function(){
			if(!ModelCtrl.isLog){
				ViewCtrl.messageBoxCtrl("请先登录账号！");		
				return ;
			}
			var scrollTop = $(window).scrollTop();
			if($(document).height() - $(window).height() - scrollTop - 160
			 <= $(".videoBox").innerHeight()*2 + $("#footer").innerHeight()
			 && ModelCtrl.times >= 0 && ModelCtrl.loadFinish)
			{
				ModelCtrl.loadFinish = false;
				ModelCtrl.loadData({"type":"get", "key":""});
				console.log(ModelCtrl.times);
				ModelCtrl.times--;
			}
		});
	},

	submitData : function()
	{

		var title = $(".inputBox>input:eq(0)").val();
		var url = $(".inputBox>input:eq(1)").val();
		var author;
		if($(".inputBox>input:eq(2)").val() == "")
			author = "佚名";
		else
			author = $(".inputBox>input:eq(2)").val();
		var type;
		if($(".typeSelect>.selection").html() == "独立游戏")
			type = "IndieGame";
		else
			type = $(".typeSelect>.selection").html();

		Bmob.initialize("84121d59c2a97a1f8a922763a7a19bfc", "190059def574c736f869932b0bb3a623");
		var Video = Bmob.Object.extend("video");
		var video = new Video();
		video.set("title", title);
		video.set("url", url);
		video.set("author", author);
		video.set("type", type);

		video.save(null,{
			success : function(){
				ModelCtrl.first = true;
				ModelCtrl.loadData({"type":"update", "key":""});
				ViewCtrl.messageBoxCtrl("添加成功！");
				return true;
			},
			error : function(error){
				ViewCtrl.messageBoxCtrl("添加失败:" + error);
				return false;
			}
		});
	},

	log : function(username, password)
	{
		Bmob.initialize("84121d59c2a97a1f8a922763a7a19bfc", "190059def574c736f869932b0bb3a623");
		var user = Bmob.Object.extend("_User");
		var query = new Bmob.Query(user);
		var flag = false;

		query.equalTo("username", username);
		query.equalTo("password", password);

		query.find({
			success : function(results){
				if(ModelCtrl.isLog)
					return ;
				//登录成功隐藏登录界面
				if(results.length){
					ModelCtrl.isLog = true;
					ModelCtrl.loadData({"type":"get", "key":""});
					ViewCtrl.messageBoxCtrl("登录成功！");
					flag = true;
					$("#logPage").fadeOut(300);
					$(".logInput:eq(0)").val("");
					$(".logInput:eq(1)").val("");
					$("#settingPage .username").html(username);
					if(!Cookies.get("username")){
						Cookies.set("username", username, new Date().setDate(new Date().getDate() + 30));
						Cookies.set("password", password, new Date().setDate(new Date().getDate() + 30));
					}
					//加载用户头像
					console.log(results[0].get('iconURL'));
					if(results[0].get('iconURL'))
						$(".userPicture").css("background-image", 'url("' + results[0].get('iconURL') + '")');
					else if(results[0].get('sex') === "男")
						$(".userPicture").css("background-image", 'url("img/manIcon.png")');
					else
						$(".userPicture").css("background-image", 'url("img/womanIcon.png")');

					$('<div class="settingText">注销</div>').appendTo($(".settingBox"));
					$(".userPicture").attr("for", "xFile");

					//上传用户头像
					$("#xFile").on("change", function(){
						var fileType = ["jpg", "png", "bmp"];
						var type = $("#xFile").val().split('.')[1];
						var index = $.inArray(type, fileType);
						if(index === -1){
							ViewCtrl.messageBoxCtrl("文件格式错误！")
							return ;
						}
						var fileUploadControl = $(this)[0];
				        if (fileUploadControl.files.length > 0) {
					        var file = fileUploadControl.files[0];
					        var name = $(".username").html() + "." + fileType[index];
					        var fileSaver = new Bmob.File(name, file);     
					        fileSaver.save().then(
					        	function(obj){
					        		results[0].set("iconURL", obj.url());
					        		results[0].save();

					        		$(".userPicture").css("background-image", 'url("' + obj.url() + '")');
					        });
				    }
					});
					ModelCtrl.unLog();
				}
				else
					ViewCtrl.messageBoxCtrl("用户名或密码错误！");
			},
			error : function(error){
				ViewCtrl.messageBoxCtrl(error);
			}
		});

		return flag;
	},

	getCode : function(){
		Bmob.initialize("84121d59c2a97a1f8a922763a7a19bfc", "190059def574c736f869932b0bb3a623");
		var user = Bmob.Object.extend("_User");

		$(".codeButton").on("touchend", function(){
			var phoneNum = $(".logInput:eq(3)").val();
			if(phoneNum === ""){
				ViewCtrl.messageBoxCtrl("请输入手机号!");
				return ;
			}
			else{
				var query = new Bmob.Query(user);
				query.equalTo("mobilePhoneNumber", phoneNum);
				query.find({
					success : function(results){
						if(results.length === 0){
							Bmob.Sms.requestSmsCode({"mobilePhoneNumber" : phoneNum, "template" : "验证码"})
							.then(
								function(obj){ViewCtrl.messageBoxCtrl("获取成功！");},
								function(error){ViewCtrl.messageBoxCtrl("获取失败！");});
						}
						else
							ViewCtrl.messageBoxCtrl("该手机号已被注册!");
					}
				});
			}
		});
	},

	register : function()
	{
		if($(".logInput:eq(2)").val() === "")
			ViewCtrl.messageBoxCtrl("请再次输入密码");
		else if($(".logInput:eq(1)").val() !== $(".logInput:eq(2)").val()){
			ViewCtrl.messageBoxCtrl("两次输入的密码不一致!");
			return ;
		}
		var phoneNum = $(".logInput:eq(3)").val();
		if(phoneNum === ""){
			ViewCtrl.messageBoxCtrl("请输入手机号!");
			return ;
		}
		if($(".logInput:eq(4)").val() === ""){
			ViewCtrl.messageBoxCtrl("请输入验证码!");
			return ;
		}
		Bmob.Sms.verifySmsCode(phoneNum, $(".logInput:eq(4)").val())
		.then(
			function(){
				Bmob.initialize("84121d59c2a97a1f8a922763a7a19bfc", "190059def574c736f869932b0bb3a623");
				var User = Bmob.Object.extend("_User");
				var user = new User();

				user.set("username", $(".logInput:eq(0)").val());
				user.set("password", $(".logInput:eq(1)").val());
				user.set("sex", $(".selection:eq(1)").html());
				user.set("mobilePhoneNumber", $(".logInput:eq(3)").val());

				user.save(null, {
					success : function(){
						ViewCtrl.messageBoxCtrl("申请注册成功，请等待审核。");
						$(".logInput:eq(0)").val("");
						$(".logInput:eq(1)").val("");
						$(".logInput:gt(1)").fadeOut(300);
						$(".typeSelect:eq(1)>.selection").html("男");
						$(".typeSelect:eq(1)").selection("hidden");
						$(".codeButton").fadeOut(300);
						$("#logPage .inputBox").css("transform", "translateY(0%)");
						ViewCtrl.isRegisterPage = false;
					},
					error : function(error){
						ViewCtrl.messageBoxCtrl("该用户已存在!" + error);
					}
				});
			},
			function(error){ 
				console.log(error);
				ViewCtrl.messageBoxCtrl("验证码不正确" + error); 
				return false; 
			});
	},

	autoLog : function()
	{
		var username = Cookies.get("username"),
			password = Cookies.get("password");
		if(username && password)
			ModelCtrl.log(username, password);
		else
			ViewCtrl.messageBoxCtrl("请先登录账号！");
	},

	unLog : function()
	{
		$(".settingText:contains(注销)").on("touchend", function(){
			Cookies.unset("username");
			Cookies.unset("password");
			$("#settingPage .username").html("未登录");
			ModelCtrl.first = true;
			ModelCtrl.isLog = false;
			$(".videoBox").remove();
			$(".userPicture").css("background-image", 'url("img/defaultIcon.png")');
			$(".userPicture").removeAttr("for");
			$("#xFile").unbind("change");
			ViewCtrl.messageBoxCtrl("注销成功！");
			$(this).remove();
		});
	}
};

var str = 
{
	isMate : function(s, t)
	{
		var nextval = new Array(t.length);
		str.getNextval(t, nextval);
		var i = 0, j = 0;

		while(i < s.length && j < t.length)
		{
			if(s.charAt(i) == t.charAt(j) || j == -1)
			{
				i++;
				j++;
			}
			else
				j = nextval[j];
		}

		if(j == t.length)
			return true;
		else
			return false;
	},

	getNextval : function(t, nextval)
	{
		var i = 1, j = 0;

		nextval[0] = -1;

		while(i < t.length)
		{
			if(t.charAt(i) == t.charAt(j) || j == -1)
			{
				if(t.charAt(i) != t.charAt(nextval[i]))
					nextval[++i] = j++;
				else
					nextval[++i] = nextval[i];
			}
			else
				j = nextval[j];
		}

	},
};