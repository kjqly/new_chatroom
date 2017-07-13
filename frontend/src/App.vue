<template>
	
	<div>
		<router-view @listen_to_sign_login="send" @listen_to_websocket="send2" v-bind:chatroom_user=something></router-view>
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
			
			contactList:[],
			groupList:[],
			sender: "",
			target: "",
			content: "",
			send_content: "",
			mark:true,
			password:"",
			groupname:"",
			something:""
		}
	},
	methods: {
		send(data){
			this.something=data.data.user;
			data = JSON.stringify(data);
			this.ws_server.send(data);	
		},

		send2(data) {
			this.ws_server.send(data);
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
					self.$router.push({path:'/websocket'});
					self.contactList=[].concat(msg.data.contact_id);
					self.groupList=[].concat(msg.data.group_id);
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
					self.contactList.push({contact:msg.contact});
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
					alert("member not exist");
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

				}
			}
		}
	}
}
</script>

<style lang="stylus" rel="stylesheet/stylus">

</style>
