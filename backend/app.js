var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var Groupchat = require('./db/models/group-chat.js');
var User=require('./db/models/user.js');
var Group_record=require('./db/models/group_record.js');
var Single_record=require('./db/models/single_record.js');
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
			//查找用户是否已经注册过
			User.findbyuser(
				message.data,
				function(err,user)
				{
					if(err){
						console.log(err);
					}
					else{
						//若用户注册过，即用户表里存在用户信息
						if(user[0]!=null)
						{
							var sign_up_temp={message:"sign_up_fail"};
							var sign_up = JSON.stringify(sign_up_temp);
							ws.send(sign_up);	
						}
						//用户没有注册过
						else	
						{							
							console.log(user);
							//向用户表中加入用户信息
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
							var login_temp={message:"login_permit",
							data:{group_id:user[0].group_id,contact_id:user[0].contact_id}};
							
							console.log(login_temp);
							
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
		
		//选择群组调出聊天记录
		else if(message.action=="record" && message.data.type=="all")
		{
			Group_record.findbychatroom_name(
				message.data.target,
				function(err,result){
					if(err){
						console.log(err);
					}
					else{
						if(result[0]!=null)
						{
							console.log(result);
							send={message:"record",record:result[0].record};
							console.log(send);
							send = JSON.stringify(send);
							ws.send(send);
						}
					}
				});
		}
		else if(message.action=="record" && message.data.type=="single")
		{
			Single_record.findrecord(
				message.data,
				function(err,result){
					if(err){
						console.log(err);
					}
					else{
						console.log(result);
						if(result[0]!=null)
						{
							console.log("record test1");
							console.log(result);
							send={message:"record",record:result[0].record};
							console.log(send);
							send = JSON.stringify(send);
							ws.send(send);
						}
						else{
							console.log("record test2");
						}
					}
				});
		}
		
		
		//添加联系人
		else if(message.action=="add_contact")
		{
			console.log(message);
			//查找要添加的联系人是已注册用户
			User.findbycontact_id(
				message.data,
				function(err,user)
				{
					if(err){
						console.log(err);
					}
					else{
						console.log("test1");
						console.log(user);
						//如果联系人时已注册用户
						if(user[0]!=null)
						{
							console.log("test2");
							console.log(user);
							var exist=false;
							//查找要添加的联系人的联系人名单，看发起添加好友的用户是否在名单里
							user[0].contact_id.forEach(function(contact_temp){
								console.log("test3");
								if(contact_temp==message.data.user){
									console.log("test4");
									exist=true;
									var add_contact_temp={message:"contact_exist"};
									var add_contact = JSON.stringify(add_contact_temp);
									ws.send(add_contact);
								}
							});
								
							//如果不是好友，添加好友
							if(exist==false)
							{	
								console.log("test4");
								//添加联系人
								User.addcontact(
									message.data.contact_id,
									message.data.user,
									function(err,user)
									{
										if(err) {
											console.log(err);
										}
										else {
											console.log(user);
										}
									});

								//添加联系人
								User.addcontact(
									message.data.user,
									message.data.contact_id,
									function(err,user)
									{
										if(err) {
											console.log(err);
										}
										else {
											console.log(user);
											add_contact_temp={message:"add_contact_success",contact_id:message.data.contact_id};
											add_contact = JSON.stringify(add_contact_temp);
											ws.send(add_contact);
										}
									});
								
							}
	
						}
						else
						{
							//提示用户不存在
							add_contact_temp={message:"member_add_notexist"};
							add_contact = JSON.stringify(add_contact_temp);
							ws.send(add_contact);
						}
					}
				});
		}
			
		//建立群组部分
		else if(message.action=="add_member")
		{
			//查找加入群组的成员是否存在
			User.findbyuser(
				message.data,
				function(err,user)
				{
					if(err){
						console.log(err);
					}
					
					else{
						console.log("test add");
						//如果用户不存在
						if(user[0]==null)
						{
							
							let result_temp={message:"member_add_notexist"};
							let result = JSON.stringify(result_temp);
							ws.send(result);
						}
						else
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
										
										//若群组不存在，则新建一个用户信息只有自己的群组
										if(groupchat[0] == null){
											Groupchat.create(
											message.data,
											function(err,groupchat){
												if(err){
													console.log(err);
												}
												else{
													let result_temp={message:"group_creat_success",group_id:message.data.group_id};
													let result = JSON.stringify(result_temp);
													ws.send(result);
													//将群组名添加到用户的群组信息中
													User.add_group_id_to_user(
													message.data,
													function(err,result){
														if(err) {
															console.log(err);
														}
														else {
															console.log(result);
														}
													});
													//向新建的群组中加入成员信息
													console.log(groupchat);
													Groupchat.add_member_id(message,function(err,group){
														if(err) {
															console.log(err);
														}
														else {
															console.log(group);
															//向用户信息中加入群的信息
															User.add_group_id_to_member(
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
											User.findbycreateuser(
											message.data,
											function(err,user)
											{
												if(err) {
													console.log(err);
												}
												else {
													console.log("aaaaaaaa");
													console.log(user);
													let position = user[0].group_id.indexOf(message.data.group_id);
													console.log(position)
													if(position!=-1)
													{
														Groupchat.add_member_id(message,function(err,result){
															if(err) {
																console.log(err);
															}
															else {
																console.log(result);
																User.add_group_id_to_member(
																	message.data,
																	function(err,user){
																		if(err) {
																			console.log(err);
																		}
																		else {
																			console.log(user);
																		}	
																	});
																//如果用户已经存在群中
																if(result.nModified==0)
																{
																	let result_temp={message:"member_exist"};
																	let result = JSON.stringify(result_temp);
																	ws.send(result);
																}
																else
																{
																	let result_temp={message:"member_add_success"};
																	let result = JSON.stringify(result_temp);
																	ws.send(result);
																}
															}
														});
													}
													else{
														let result_temp={message:"permission_denied"};
														let result = JSON.stringify(result_temp);
														ws.send(result);
													}
												}
											});
										/*	Groupchat.update({chatroomname:message.data.group_id},
											{$addToSet:{member_id:data.member_id}});
											console.log("have");*/
										}
									}
								});
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
							if(groupchat[0]!=null)
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
								
								Group_record.findbychatroom_name(
										message.data.target,
										function(err,record){
											if(err){
												console.log(err);
											}
											else{
												console.log(record);
												//如果没有消息记录，则新建一条记录
												if(record[0]==null){
													Group_record.create_record(
														message.data,
														function(err,record){
															if(err){
																console.log(err);
															}
															else{
																console.log(record);
															}
														});
												}
												
												else
												{
													//在数据库中添加消息记录
													Group_record.add_record(
														message.data,
														function(err,result){
															if(err){
																console.log(err);
															}
															else{
																console.log(result);
															}
														});
												}
														
											}
										});
								
							}
						}
					});
			}
			
			else if(message.data.type === "single")
			{
				console.log("this is a testhh");
				console.log(message);
				clients.forEach(function(ws_temp){
					var send_content = JSON.stringify(message.data);
					if(message.data.target == ws_temp.user || message.data.user == ws_temp.user){
						//使用ws_temp中的ws来获取连接，并进行发送消息
						ws_temp.ws.send(send_content);
					}
				});
				Single_record.findbyuser(
					message.data,
					function(err,result)
					{	
						if(err){
							console.log(err);
						}
						else{
							console.log(result);					
							if(result[0]==null)
							{
								console.log("this is a test3");
								Single_record.create_record(
									message.data,
									function(err,result){
										if(err){
											console.log(err);
										}
										else{
											console.log(result);
										}
									});
							}
							else{
								console.log("this is a test2");
								Single_record.addrecord(
									message.data,
									function(err,record){
										if(err){
											console.log(err);
										}
										else{
											console.log(record);
										}
								
									});
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
