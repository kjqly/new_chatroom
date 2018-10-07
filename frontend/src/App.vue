<template>	
	<div>
		<router-view @listen_to_sign_login="send" @listen_to_websocket="send2" @listen_to_websocket_change="clear"
		v-bind:chatroom_user=something
		v-bind:contentList_for_web=[].concat(contentList)
		v-bind:groupList_for_web=[].concat(groupList) 
		v-bind:contactList_for_web=[].concat(contactList)
		v-bind:message_prompt_for_web=[].concat(message_prompt2)
		v-bind:message_prompt_for_web_single=[].concat(message_prompt_single)>
		</router-view>
	</div>	
</template>

<script type="text/esmascript-6">
import login from './components/login/login.vue'
import websocket from './components/websocket/websocket.vue'
export default {
	name:'app',
	components:{
		login,
		websocket
	},

	data() {
		return {
			ws_server: '',
			ws_cube: '',
			contentList:[],			
			groupList:[],
			contactList:[],
			sender: "",
			target: "",
			content: "",
			send_content: "",
			mark:true,
			password:"",
			groupname:"",
			something:"",
			message_prompt:[],
			message_prompt2:[],
			message_prompt_single_tmp:[],
			message_prompt_single:[]
		}
	},
	methods: {
		send(data){
			this.something=data.data.user;
			var servData = JSON.stringify(data);
			console.log("向server发送的消息");
			console.log(servData);
			this.ws_server.send(servData);	
			if(data.action == "login"){			
				var cubeData = { "HEAD":{"tag":"MESG","version":65537,"record_type":"TRUSTCHAT_DEMO","record_subtype":"LOGIN_INFO","record_num":1},"RECORD":[{"user":data.data.user,"passwd":data.data.password,}],"EXPAND" :[]};
				cubeData = JSON.stringify(cubeData);
				console.log(cubeData);
				this.ws_cube.send(cubeData);
			}
		},

		send2(data) {
			console.log("这里进入发送步骤，目前全部转发给server")
			console.log(data);
			this.ws_server.send(data);

			//将发送给server的内容转发一份给cube
			this.ws_cube.send(data);
			
			//直接发送到服务端的消息
			// if(JSON.parse(data).action == "add_contact"){
			// 	console.log("发送到server");
			// 	console.log(data.action);
			// 	this.ws_server.send(data);
			// }
			// //发送到cube的消息
			// else {
			// 	console.log("发送到cube")
			// 	console.log(data);
			// 	this.ws_cube.send(data);
			// }
		},

		clear(data){
			this.target=data.target;
			this.contentList.length=0;
			if(data.type=="all")
				this.message_prompt2[data.position]=false;
			else
				this.message_prompt_single[data.position]=false;
			data={action:"record",data:{type:data.type,sender:data.sender,target:data.target}};
			
			data = JSON.stringify(data);
			this.ws_server.send(data);
		},
	},	
	created() {
		this.ws_server = new WebSocket('ws://127.0.0.1:8081');
		//this.ws_cube = new WebSocket('ws://172.21.4.71:13888','cube-wsport');
		this.ws_cube = new WebSocket('ws://192.168.159.138:13888','cube-wsport');
		let self = this;
		self.ws_server.onopen = function(e) {
			alert("connect server");
		}
		
		self.ws_cube.onopen = function(e) {
			alert("connect cube");
		}
		self.ws_cube.onmessage = function(e) {
			console.log("cube返回消息");
			console.log(e.data);
			console.log(JSON.parse(e.data).HEAD.record_subtype);
			//判断是否加密回来发送的消息
			if(JSON.parse(e.data).HEAD.record_subtype == "WEB_MSG"){
				var data = JSON.parse(e.data);
				console.log(data.RECORD[0]);
				var tmpData = {
								action :data.RECORD[0].action,
								data:{
									flag : data.RECORD[0].data.flag, 
									type : data.RECORD[0].data.type, 
									user : data.RECORD[0].data.user, 
									target : data.RECORD[0].data.target, 
									content : data.RECORD[0].data.content, 
									time : data.RECORD[0].data.time,	
									EXPAND: data.EXPAND
									}
								};
				tmpData = JSON.stringify(tmpData);
				console.log("发送到server");
				console.log(tmpData);
				self.ws_server.send(tmpData);
			}
			//判断是否为解密回来的消息
			else if(JSON.parse(e.data).HEAD.record_subtype == "WEB_MSG_DATA"){
				let msg;
				msg = e.data;
				console.log(msg);
				if(msg.replace(/(^s*)|(s*$)/g, "").length != 0){
					msg = JSON.parse(msg);
					msg = msg.RECORD[0]
					if(msg.type=="all")
					{
						if(self.target==msg.target){
							self.contentList.push({sender:msg.user,content:msg.content});
						}
						else
						{
							for(var i=0;i<self.groupList.length;i++)
							{	
								if(self.groupList[i]==msg.target)
									self.message_prompt[i]=true;
							}
							self.message_prompt2=[].concat(self.message_prompt);

						}
					}
					else{
						if(self.target==msg.target || self.target==msg.user){
							self.contentList.push({sender:msg.user,content:msg.content});
						}
						else{
							for(var i=0;i<self.contactList.length;i++)
							{	
								if(self.contactList[i]==msg.user)
									self.message_prompt_single_tmp[i]=true;
							}
							self.message_prompt_single=[].concat(self.message_prompt_single_tmp);
						}
					}
							
							
				}
			}
					
		}
		self.ws_server.onmessage = function(e) {
			console.log("server返回的消息");
			console.log(e.data);
			let msg = e.data;
			msg = JSON.parse(msg);
			if(msg.type){
				// //这里消息需要重新组装成新的结构				
				// console.log(msg);
				// var tpmMsg ={ 
				// 				"HEAD":
				// 				{"record_subtype":"WEB_MSG_DATA"},
				// 				"RECORD":
				// 				[      
				// 				{
				// 					flag : msg.flag , 
				// 					type : msg.type, 
				// 					user : msg.user, 
				// 					target : msg.target, 
				// 					content : msg.content, 
				// 					time : msg.time	
				// 				}									
				// 				],
				// 				"EXPAND":msg.EXPAND,								
				// 			};
				// console.log(tpmMsg);
				// tpmMsg = JSON.stringify(tpmMsg);
				// console.log("接收方发送到cube");
				// console.log(tpmMsg);
				// self.ws_cube.send(tpmMsg);
				let msg;
				msg = e.data;
				console.log(msg);
				if(msg.replace(/(^s*)|(s*$)/g, "").length != 0){
					msg = JSON.parse(msg);
					//msg = msg.RECORD[0]
					if(msg.type=="all")
					{
						if(self.target==msg.target){
							self.contentList.push({sender:msg.user,content:msg.content});
						}
						else
						{
							for(var i=0;i<self.groupList.length;i++)
							{	
								if(self.groupList[i]==msg.target)
									self.message_prompt[i]=true;
							}
							self.message_prompt2=[].concat(self.message_prompt);

						}
					}
					else{
						if(self.target==msg.target || self.target==msg.user){
							self.contentList.push({sender:msg.user,content:msg.content});
						}
						else{
							for(var i=0;i<self.contactList.length;i++)
							{	
								if(self.contactList[i]==msg.user)
									self.message_prompt_single_tmp[i]=true;
							}
							self.message_prompt_single=[].concat(self.message_prompt_single_tmp);
						}
					}		
							
				}
			}
			else{
				msg = JSON.stringify(msg);
				if(msg.replace(/(^s*)|(s*$)/g, "").length != 0){
					
					msg = JSON.parse(msg);
					if(msg.message=="sign_up_success")
					{
						alert("Sign up successful");
					}
					else if(msg.message=="sign_up_fail")
					{
						alert("You've already registered");
					}
					else if(msg.message=="login_permit")
					{
						alert("login successful");
						self.mark=false;
						self.groupList=[].concat(msg.data.group_id);
						self.contactList=[].concat(msg.data.contact_id);
						console.log("test");
						console.log(msg.data.group_id);
						self.$router.push({path:'/websocket'});

					}
					else if(msg.message=="login_denied")
					{
						alert("login failed");
					}
					else if(msg.message=="need_join")
					{
						alert("you havn't join this group");
					}
					else if(msg.message=="add_contact_success")
					{
						alert("add contact success!");
						self.contactList.push(msg.contact_id);
					}
					else if(msg.message=="contact_exist")
					{
						alert("you have already added this contact!")

					}
					else if(msg.message=="member_exist")
					{
						alert("This member have already in this group");
					}
					else if(msg.message=="member_add_success")
					{
						alert("add member successful");
					}
					else if(msg.message=="member_add_notexist")
					{
						alert("user not exist");
					}
					else if(msg.message=="group_creat_success")
					{
						alert("group creat successful");
						self.groupList.push(msg.group_id);
					}	
					else if(msg.message=="permission_denied")
					{
						alert("permission denied");
					}
					else if(msg.message=="record")
					{
						self.contentList=[].concat(msg.record);
					}
				}
			}

		}
	}
}
</script>

<style lang="stylus" rel="stylesheet/stylus">

</style>
