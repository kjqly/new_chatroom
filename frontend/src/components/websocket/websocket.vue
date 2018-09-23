<template>
<div class="background-wrapper">
	<nav class="navbar navbar-inverse navbar-fixed-top" role="navigation">
		<div class="container">
			<div class="navbar-header">
				<a class="navbar-brand" href="#">聊天室</a>
				<button type="button" class="navbar-toggle" data-toggle="collapse" data-target="#navbar-collapse">
					<span class="icon-bar"></span>
					<span class="icon-bar"></span>
					<span class="icon-bar"></span>
				</button>
			</div>
			<div class="collapse navbar-collapse" id="navbar-collapse">
				<ul class="nav navbar-nav navbar-right">
					<li class="active"><a href="#websocket"><span class="glyphicon glyphicon-user"></span> 用户: {{chatroom_user}}</a></li>
					<li class="dropdown">
						<a href="#" class="dropdown-toggle" data-toggle="dropdown">
						<span class="glyphicon glyphicon-plus-sign"></span>
						 添加好友
						<b class="caret"></b>
						</a>
						<ul class="dropdown-menu">
							<li>
								<input type="text" id="contact_id" class="form-control" placeholder="好友ID">
							</li>
							<li role="separator" class="divider"></li>
							<li>
								<button @click="addcontact" class="btn btn-primary btn-sm btn-block">确定</button>
							</li>
						</ul>
					</li>
					<li class="dropdown">
						<a href="#" class="dropdown-toggle" data-toggle="dropdown">
						<span class="glyphicon glyphicon-plus"></span>
						 新建群聊
						<b class="caret"></b>
						</a>
						<ul class="dropdown-menu">
							<li>
								<input type="text" id="group_chat_id" class="form-control" placeholder="群聊名称">
								<input type="text" id="member_id" class="form-control" placeholder="要添加的好友">
							</li>	
							<li role="separator" class="divider"></li>
							<li>
								<button @click="addmember" class="btn btn-primary btn-sm btn-block">确定</button>
							</li>
								
						</ul>
					</li>
				</ul>
			</div>
			
			<div class="dropdown">
				
			</div>
		</div>
	</nav>
	<br/><br/>
	<div class="content-wrapper">
		<div class="friends-wrapper">
			<br/>
			<div class=contact_list>
				<ul class="nav nav-pills nav-stacked">
					<li class="list-group-item active">好友列表</li>
					<li class="list-group-item" v-for="(content,index) in contactList_for_web">
						<a href="#websocket" @click="changecontact(content,index)">{{content}}<span v-if="message_prompt_for_web_single[index]" class="badge">未读信息</span></a>	
					</li>
				</ul>
			</div>
			<br/>
			<div class=group_list>
				<ul class="nav nav-pills nav-stacked">
					<li class="list-group-item active">群组列表</li>
					<li class="list-group-item" v-for="(content,index) in groupList_for_web">
						<a href="#websocket" @click="changegroup(content,index)">{{content}}<span v-if="message_prompt_for_web[index]" class="badge">未读信息</span></a>
					</li>
				</ul>
			</div>
		</div>
		<div class="chat">
			<div class="chat_title">
				{{contactnow}}
			</div>
			
			<div style="overflow:auto; width:100%; height:400px" class="chat_interface">
				<ul style="width:100%;padding-left:100px;padding-right:100px;padding-top:20px;">
					<li style="list-style-type: none" v-for="content in contentList_for_web">
						<div style="width:900px;word-wrap:break-word" :class="{'right_msg':content.sender == chatroom_user}" class="chat_msg">
							<div style="width:300px;background-color:#DDDDFF"> 
								{{content.sender}}: <br/>{{content.content}}
							</div>
							<br/>	
						</div>
						<br/>
					</li>
				</ul>
			</div>
			
			<div class="chat_input">
				<textarea id="input"></textarea>
			</div>
			
			<div class="chat_send">
				<select id="select">
				  <option value="CRYPT">加密</option>
				  <option value="SIGN">签名</option>
				  <option value="NOEMAL">不加密</option>
				</select>
				<button class="btn btn-primary btn-sm btn-block" @click="send" id="send_button">发送</button>
			</div>
		</div>		
	</div>
</div>
</template>

<script type="text/esmascript-6">
export default {
	props:["chatroom_user","contentList_for_web","contactList_for_web","groupList_for_web","message_prompt_for_web","message_prompt_for_web_single"],
	data() {
		return {
			contactList:[],
			groupList:[],
			target: {type:"",target:""},
			content: "",
			send_content: "",
			contactnow:"",
			timestamp:""
		}
	},

	methods: {

		changecontact(content,index)
		{
			this.target={type:"single",sender:this.chatroom_user,target:this.contactList_for_web[index],position:index};
			this.contactnow=this.contactList_for_web[index];
			this.contentList_for_web.length=0;
			this.$emit("listen_to_websocket_change",this.target);
		},
		
		changegroup(content,index)
		{
			this.target={type:"all",sender:this.chatroom_user,target:this.groupList_for_web[index],position:index};
			this.contactnow=this.groupList_for_web[index];
			this.contentList_for_web.length=0;
			this.$emit("listen_to_websocket_change",this.target);
		},
		
		send() {
			this.timestamp = (new Date()).valueOf();
			let send_content = document.getElementById("input");
			this.content = send_content.value;
			var options = document.getElementById("select");
			alert(options.value);
			this.send_content = { 
									"HEAD":
									{"tag":"MESG","version":65537, "record_type":"TRUSTCHAT_DEMO","record_subtype":"WEB_MSG","record_num":1, "expand_num":1, },
									"action":"message",
									"data":
									{
									"flag":options.value, 
									"type":this.target.type,
									"user":this.chatroom_user,
									"target":this.target.target,
									"content":this.content,
									"time":this.timestamp
									},
									"EXPAND" :[
									{
									"type":"TRUSTCHAT_EXPAND",
									"subtype":"EXPAND_INFO",
									"expand":{
									"sender":this.chatroom_user,
									"receiver":this.target.target,
									"flags":options.value}
									}
									]
								}
		//	this.send_content = {action:"message",data:{flag:options.value, type:this.target.type,user:this.chatroom_user,target:this.target.target,content:this.content,time:this.timestamp}};
			this.send_content = JSON.stringify(this.send_content);

			this.$emit("listen_to_websocket",this.send_content);
		},
		
		addmember() {
			var group_id_tmp = document.getElementById("group_chat_id");
			var group_id=group_id_tmp.value;
			//console.log(this.content)

			var member_id_tmp = document.getElementById("member_id");
			var member_id=member_id_tmp.value;
			
			var temp = {action:"add_member",data:{group_id:group_id,user:member_id,create_user:this.chatroom_user}};
			temp = JSON.stringify(temp);
			this.$emit("listen_to_websocket",temp);
		},
		
		addcontact(){
			var contact_id_tmp = document.getElementById("contact_id");
			var contact_id=contact_id_tmp.value;

			var temp = {action:"add_contact",data:{contact_id:contact_id,user:this.chatroom_user}};
			temp = JSON.stringify(temp);
			this.$emit("listen_to_websocket",temp);
		}	
	},

};
</script>

<style lang="stylus" rel="stylesheet/stylus">

.background-wrapper
	display:flex
	position: absolute
	flex-direction:column
	height:100%
	width:100%
	font-family:"Microsoft Yahei"
	.title-wrapper
		height:50px
		display:flex
		justify-content:center	
		align-items:center
		color:#FFFFFF
		
	.content-wrapper
		display:flex
		flex:1
		flex-direction:row
		justify-content:flex-start
		
		.friends-wrapper	
			flex:0 0 200px
			display:flex
			flex-direction:column
			background-color:#E0E0E0
			display:flex
			.contact_list
				padding:8px
			.group_list
				padding:8px
		
		.chat
			witdth:100%
			display:flex
			flex:1
			flex-direction:column
			background-color:#FFFFCE
			justify-content:space-between
			
			.chat_title
				background-color:#d0d0d0
				height:40px
				display:flex
				align-items:center
				justify-content:center
				font-size:18px
			
			.chat_interface
				background-color:#F0F0F0	
				display:flex
				height:700px
				flex-direction:row
				font-size:18px 
	
				.chat_msg
					text-align:left
					display:flex
					justify-content:flex-start
					&.right_msg
						text-align:right
						display:flex
						justify-content:flex-end
				
			.chat_send
				display:flex		
				justify-content:flex-end
				align-items:center
				background-color:#B9B9FF
				
			.chat_input	
				width:100%
				height:100px
				display:flex
				flex:1
				
				#input
					display:flex
					flex:1
					width:100%
	
</style>
