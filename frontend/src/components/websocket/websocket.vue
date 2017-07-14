<template>

<div class="background-wrapper">
	<div class="title-wrapper">
		聊天界面
	</div>
	
	<div class="content-wrapper">
		<div class="friends-wrapper">
			<div class="sender">
				{{chatroom_user}}
			</div>		
			<div class="group_target">
				输入群名<br/>
				<input type="text" id="target_id">
			</div>
			<br/><br/>
			<div class="single_target">
				输入好友名<br/>
				<input type="text" id="single_target_id">
			</div>
			<br/>

			<br/>
			<div class="group-chat-class">
				
				添加群<br/>
				群聊ID<br/>
				<input type="text" id="group_chat_id">
			</div> 
			<div class="group-chat-class">
				添加的成员ID<br/>
				<input type="text" id="member_id">
			</div> 
			<br/>
			<div class="button-add1">
				<button @click="addmember">添加</button>
				
			</div>
			<br/>
			<div class="add_contact">
				添加好友<br/>
				添加的联系人ID<br/>
				<input type="text" id="contact_id">
			</div> 
			<br/>
			<div class="button-add2">
				<button @click="addcontact">添加</button>
			</div>
			<div class=contact_list>
				<ul>
					<li v-for="content in contactList_for_web">
						{{content}}		
					</li>
				</ul>
			</div>
			<div class=group_list>
				<ul>
					<li v-for="content in groupList_for_web">
						{{content}}		
					</li>
				</ul>
			</div>
		</div>
		<div class="chat">
			<div class="chat_title">
				好友
			</div>
			
			<div class="chat_interface">
				<div class="single_interface">
					<ul>
						<li v-for="content in contentList1_for_web">
								{{content.msg}}		
						</li>
					</ul>
				</div>
				
				<div class="group_interface">
					<ul>
						<li v-for="content in contentList2_for_web">
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
	props:["chatroom_user","contentList2_for_web","contentList1_for_web","contactList_for_web","groupList_for_web"],
	data() {
		return {
			contactList:[],
			groupList:[],
			target: "",
			content: "",
			send_content: "",
		}
	},
	methods: {
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

			
			this.send_content = {action:"message",data:{type:"all",user:this.chatroom_user,target:this.target,content:this.content}};
			this.send_content = JSON.stringify(this.send_content);

			console.log(this.send_content);

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
				justify-content:flex-end
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
