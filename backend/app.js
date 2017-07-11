var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var Groupchat = require('./db/models/group-chat.js');
var User=require('./db/models/user.js')
var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


/////////////从此处开始为websocket部分/////////////////////
//创建一个websocket连接，端口为8080
var WebSocketServer = require('ws').Server,wss = new WebSocketServer({port: 8081});
 
// 创建websocket连接池，clients存储所有正在连接的websocket，name为用户名
var clients = [];
var name="";
var ws_save = false;
var str="";

function connect(message,ws){
	console.log("test1");

	for(var i =0; i<clients.length;i++){
		if(clients[i].user == message){
			ws_save = true;
			console.log("this ws has connect");
		}
	}

	if(ws_save == false) {
		str = {"ws":ws,"user":message};
		clients.push(str);

		//显示当前连接池中的连接数量
		console.log("add a websocket websockets total:"+clients.length);
	}

	ws_save = false;
}

//监听websocket连接，当监听到创建新的websocket连接以后走下段代码
wss.on('connection', function(ws) {
/*
	//生成json字符串，并且push进连接池，json格式中的ws为websocket连接，target为目标用户
	var str = {"ws":ws,"target":target};
	clients.push(str);

	//显示当前连接池中的连接数量
	console.log("add a websocket websockets total:"+clients.length);
*/

	console.log("con");

	//当监听到有消息过来的时候触发下段代码
	ws.on('message', function(message) {
		
		console.log("ws.on message");
		console.log(message);
		message = JSON.parse(message);
		//当监听消息为注册消息时
		if(message.action=="sign_up" && message.data.user!="" && message.data.password!="")
		{
			User.findbyuser(
				message.data,
				function(err,user)
				{
					if(err){
						console.log(err);
					}
					else{
						if(user[0]!=null)
						{
							var sign_up_temp={message:"sign_up_fail"};
							var sign_up = JSON.stringify(sign_up_temp);
							ws.send(sign_up);	
						}
						else	
						{							
							console.log(user);
							User.add_user(
								message.data,	
								function(err,user)
								{
									if(err){
										console.log(err);
									}
									else{					
										var sign_up_temp={message:"sign_up_success"};
										var sign_up = JSON.stringify(sign_up_temp);
										ws.send(sign_up);
									}
								});
						}
					}
				});
		}

		
		//监听的消息为登录消息时
		if(message.action=="login")
		{
			
			connect(message.data.user,ws);

			//按照用户名密码查询数据库，验证是否符合登陆条件
			User.verify(
				message.data,
				function(err,user)
				{
					if(err){
						console.log(err);
					}
					else{
						//如果数据库中存在登录信息
						if(user[0] != null){
							var login_temp={message:"login_permit"};
							var login_message = JSON.stringify(login_temp)
							ws.send(login_message);
						}
						//数据库中不存在登录信息
						else{
							var login_temp={message:"login_denied"};
							var login_message = JSON.stringify(login_temp)
							ws.send(login_message);
						}
					}
				})
		}
			
		/*if(message.action == "addmessage"){
			Groupchat.create({
				chatroomname:message.data.group_id,
				member_id:message.data.message_id
			},function(err,groupchat){
				if(err){
					console.log(err);
				}
				else{
					console.log(groupchat);
				}
			});
		}*/
		
		//添加联系人
		else if(message.action=="add_contact")
		{
			console.log(message);
			User.findbyuser(
				message.data,
				function(err,user)
				{
					if(err){
						console.log(err);
					}
					else{
						console.log(user);
						if(user[0]!=null)
						{
							var exist=false;
							user[0].contact_id.forEach(function(contact_temp){
								if(contact_temp==message.data.contact_id){
									exist=true;
									var add_contact_temp={message:"contact_exist"};
									var add_contact = JSON.stringify(add_contact_temp);
								
									ws.send(add_contact);
								}
							});
							
							if(exist==false)
							{	
								//添加联系人
								User.addcontact(
									message.data,
									function(err,user)
									{
										if(err) {
											console.log(err);
										}
										else {
											
											console.log(user);
										}
									});
									
								add_contact_temp={message:"add_contact_success",contact:message.data.contact_id};
								add_contact = JSON.stringify(add_contact_temp);
								ws.send(add_contact);
							}
						}
					}
				});
		}
			
		//建立群组部分
		else if(message.action=="add_member")
		{
			//查找群组是否存在
			Groupchat.findbychat_name(
				message.data.group_id,
				function(err,groupchat)
				{
					if(err){
						console.log(err);
					}
					else{
						console.log(groupchat);
						
						//若群组不存在，则新建群组
						if(groupchat[0] == null){
							Groupchat.create({
								chatroomname:message.data.group_id,
								//member_id:message.data.member_id
							},function(err,groupchat){
								if(err){
									console.log(err);
								}
								else{
									//向新建的群组中加入成员信息
									console.log("b test");
									console.log(groupchat);
									Groupchat.add_member_id(message,function(err,group){
										if(err) {
											console.log(err);
										}
										else {
											console.log(group);
											//向用户信息中加入群的信息
											User.add_group_id_to_user(
												message.data,
												function(err,user){
													if(err) {
														console.log(err);
													}
													else {
														console.log(user);
													}	
												});													
											
										}
									});
									
								}
							});
						}
						
						//若群组已经存在，直接添加成员信息
						else{
							Groupchat.add_member_id(message,function(err,result){
								if(err) {
									console.log(err);
								}
								else {
									console.log(result);
									User.add_group_id_to_user(
										message.data,
										function(err,user){
											if(err) {
												console.log(err);
											}
											else {
												console.log(user);
											}	
										});
								}
							});
							
						/*	Groupchat.update({chatroomname:message.data.group_id},
							{$addToSet:{member_id:data.member_id}});
							console.log("have");*/
						}
					}
				});
		}
		/*
			if(mark==false)
			{
				Groupchat.create({
					chatroomname:message.data.group_id,
					member_id:message.data.message_id
				},function(err,groupchat){
					if(err){
						console.log(err);
					}
					else{
						console.log(groupchat);
					}
				});
			}
		*/
			
		//聊天信息部分
		
		else
		{
			//如果是群聊信息
			if(message.data.type === "all"){
				//按群名查数据库
				Groupchat.findbychat_name(
					message.data.target,
					function(err,groupchat)
					{
						if(err){
							console.log(err);
						}
						else{
							var exist=false;
							//判断发消息的用户是否在群里
							groupchat[0].member_id.forEach(function(user_temp){
								if(message.data.user==user_temp)
									exist=true
							});
							//不在群里则返回提示信息
							if(exist==false)
							{
								var temp={message:"need_join"}
								var join_temp=JSON.stringify(temp);
								ws.send(join_temp);
							}
								
							if(groupchat[0]!=null && exist==true)
							{
								console.log(groupchat);
								//遍历整个连接池，查询是否有符合条件的websocket连接
								clients.forEach(function(ws_temp){
									var send_content = JSON.stringify(message.data);
									console.log(send_content);
									
									//遍历数据库中群组的成员信息
									for(var i=0;i<groupchat[0].member_id.length;i++)
									{
										console.log(groupchat[0].member_id[i]);
										if(groupchat[0].member_id[i] == ws_temp.user){
											//使用ws_temp中的ws来获取连接，并进行发送消息
											ws_temp.ws.send(send_content);
										}
									}
								})
							}
						}
					});
			}
					
				//遍历整个连接池，查询是否有符合条件的websocket连接
			/*	clients.forEach(function(ws_temp){

					//进行判断，如果遍历的当前websocket连接(ws_temp)与触发消息时间的websocket连接(ws)不为同一个，则发送内容
					//if(ws_temp.ws !== ws) {

						//var send_content = JSON.stringify(message.content);
						console.log("this is a test");
						console.log(message);
						var send_content = JSON.stringify(message.data);
						//使用ws_temp中的ws来获取连接，并进行发送消息
						ws_temp.ws.send(send_content);
					//}
				})
			}*/
			else {
				clients.forEach(function(ws_temp){
					var send_content = JSON.stringify(message.data);
					console.log(send_content);

					if(message.target == ws_temp.user){
						//使用ws_temp中的ws来获取连接，并进行发送消息
						ws_temp.ws.send(send_content);
					}
				});
			}
		}
	});

	ws.on('close', function(message) {
	// 连接关闭时，将其移出连接池
		clients = clients.filter(function(ws1){
			return ws1.ws !== ws
		})
		console.log("close a websocket websockets total:"+clients.length);
	});
});
////////////////此处为websocket部分结束////////////////////
module.exports = app;
