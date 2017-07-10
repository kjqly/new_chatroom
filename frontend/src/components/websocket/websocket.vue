<template>
<div v-if=mark class="login_interface">
	<div class="sender">
		用户名<br/>
		<input type="text" id="user">
	</div>	
	<br/>	
	<div class="target">
		密码<br/>
		<input type="password" id="password">
	</div>
	<br/>
	<div class="login">
		<button @click="login">登陆</button>
	</div>
</div>

<div v-else=mark class="background-wrapper">
	<div class="title-wrapper">
		聊天界面
	</div>
	
	<div class="content-wrapper">
		<div class="friends-wrapper">
			<div class="sender">
				{{user}}
			</div>		
			<div class="target">
				输入群名<br/>
				<input type="text" id="target_id">
			</div>
			
			<div class="group-chat-class">
				<br/>
				<br/>
				<br/>
				<br/>
				添加群<br/>
				群聊ID<br/>
				<input type="text" id="group_chat_id">
			</div> 
			<div class="group-chat-class">
				添加的成员ID<br/>
				<input type="text" id="member_id">
			</div> 
			<br/>
			<div class="button-add">
				<button @click="addmember">添加</button>
				
			</div>
		</div>
		<div class="chat">
			<div class="chat_title">
				好友
			</div>
			
			<div class="chat_interface">
				<div class="single_interface">
					<ul>
						<li v-for="content in contentList1">
								{{content.msg}}		
						</li>
					</ul>
				</div>
				
				<div class="group_interface">
					<ul>
						<li v-for="content in contentList2">
								{{content.msg}}			
						</li>
					</ul>
				</div>
			</div>
			
			<div class="chat_input">
				<textarea id="input"></textarea>
			</div>
			
			<div class="chat_send">
				<button @click="send" id="send_button">发送</button>
			</div>
		</div>		
	</div>
</div>
</template>

<script type="text/esmascript-6">
export default {
	data() {
		return {
			ws_server: '',
			ws_cube: '',
			contentList1: [{
  				msg: "1"
  			},{
  				msg:"2"
  			}],
			contentList2: [{
  				msg: "a"
  			},{
  				msg:"b"
  			}],
			
			friendList: [{
  				friend: "好友1"
  			},{
  				friend: "好友2"
  			}],
			sender: "",
			target: "",
			content: "",
			send_content: "",
			mark:true,
			user:"",
			password:"",
			groupname:""
		}
	},
	methods: {
		login(){
			//console.log(this.mark);
			let user_tmp = document.getElementById("user");
			this.user = user_tmp.value;
			//console.log(this.target);
			
			let password_tmp = document.getElementById("password");
			this.password = password_tmp.value;
			//console.log(this.content);

			
			this.send_content = {action:"login",data:{user:this.user,password:this.password}};
			this.send_content = JSON.stringify(this.send_content);

			console.log(this.send_content);

			this.ws_server.send(this.send_content);
		},		

		send() {
			let target_name = document.getElementById("target_id");
			this.target = target_name.value;
			//console.log(this.target);
			
			let send_content = document.getElementById("input");
			this.content = send_content.value;
			//console.log(this.content);

			//let sender_name = document.getElementById("sender_id");
			//this.sender = sender_name.value;
			//console.log(this.sender);

			
			this.send_content = {action:"message",data:{type:"all",user:this.user,target:this.target,content:this.content}};
			this.send_content = JSON.stringify(this.send_content);

			console.log(this.send_content);

			this.ws_server.send(this.send_content);
		},
		
		addmember() {
			var group_id_tmp = document.getElementById("group_chat_id");
			var group_id=group_id_tmp.value;
			//console.log(this.content)

			var member_id_tmp = document.getElementById("member_id");
			var member_id=member_id_tmp.value;
			
			var temp = {action:"add",data:{group_id:group_id,member_id:member_id}};
			temp = JSON.stringify(temp);
			this.ws_server.send(temp);
		}
	},
	created() {
		this.ws_server = new WebSocket('ws://127.0.0.1:8081');
		let self = this;
		self.ws_server.onopen = function(e) {
			alert("connect");
		}
		
		self.ws_server.onmessage = function(e) {
			
			let msg;
			msg = e.data;
			console.log("watch msg");
			console.log(msg);
			if(msg.replace(/(^s*)|(s*$)/g, "").length != 0){
				
				msg = JSON.parse(msg);
				
				if(msg.message=="login_permit")
				{
					self.mark=false;
				}
				else if(msg.message=="login_denied")
				{
					alert("login failed");
				}
				else if(msg.message=="need_join")
				{
					alert("you havn't join this group");
				}
				else{
					console.log(msg);
	
					/*self.contentList2.push({
						msg:msg
					})*/
				
					if(msg.type=="all")
					{	
					/*	var msg_tmp = JSON.stringify(msg.content)
						msg_tmp.replace(/"/g, "")*/
						self.contentList2.push({
							msg:msg.content
						})
					}
					else
					{	
						self.contentList1.push({
							msg:msg.content
						})
					}
					/*if(msg.HEAD.record_type=="SYNI") {
						;
					}*/
				}
			}
		}
	}
};
</script>

<style lang="stylus" rel="stylesheet/stylus">
.login_interface
	background-color:#3D7878
	color:#FFFFFF
	display:flex
	justify-content:center	
	align-items:center
	position: absolute
	flex-direction:column
	height:100%
	width:100%
	margin-left:-8px
	margin-top:-8px
	

.background-wrapper
	display:flex
	position: absolute
	flex-direction:column
	height:100%
	width:100%
	margin-left:-8px
	margin-top:-8px
	
	.title-wrapper
		height:50px
		display:flex
		justify-content:center	
		align-items:center
		background-color:#444444
		color:#FFFFFF
		font-family:"Microsoft Yahei"
		
	.content-wrapper
		display:flex
		flex:1
		flex-direction:row
		justify-content:flex-start
		font-family:"Microsoft Yahei"
		
		.friends-wrapper		
			flex:0 0 300px
			display:flex
			flex-direction:column
			align-items:center
			background-color:#888888
			display:flex
		
		.chat
			witdth:100%
			display:flex
			flex:1
			flex-direction:column
			background-color:#FFFFCE
			justify-content:space-between
			
			.chat_title
				background-color:#E0E0E0
				height:30px
				display:flex
				align-items:center
				justify-content:center
			
			.chat_interface
				background-color:#F0F0F0		
				height:300px
				display:flex
				flex-direction:row
				justify-content:center
				.single_interface
					width:400px
					display:flex
					justify-content:center
					flex:1
				.group_interface
					width:400px
					display:flex
					justify-content:center
					flex:1
			.chat_send
				display:flex
				ustify-content:center
				align-items:center
				background-color:#B9B9FF
			.chat_input	
				width:100%
				display:flex
				background-color:#E0E0E0
				flex:1
				#input
					display:flex
					flex:1
					width:100%
	
</style>
