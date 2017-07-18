<template>
	
	<div>
		<router-view @listen_to_sign_login="send" @listen_to_websocket="send2" @listen_to_websocket_change="clear"
		v-bind:chatroom_user=something
		v-bind:contentList_for_web=[].concat(contentList)
		v-bind:groupList_for_web=[].concat(groupList) 
		v-bind:contactList_for_web=[].concat(contactList)>
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
		},

		clear(data){
			this.contentList.length=0;
		},
	},	
	created() {
		this.ws_server = new WebSocket('ws://127.0.0.1:8081');
		this.ws_cube = new WebSocket('ws://172.21.4.47:13888','cube-wsport');
		let self = this;
		self.ws_server.onopen = function(e) {
			alert("connect server");
		}
		
		self.ws_cube.onopen = function(e) {
			alert("connect cube");
			let test={"HEAD":{"tag":"MESG","version":65537,"record_type":"MESSAGE","record_subtype":"BASE_MSG","flow":0,"record_num":1,"expand_num":0,"nonce":""},"RECORD":[{"message":"hello,world!"}],"EXPAND":[]}
			test = JSON.stringify(test);
			self.ws_cube.send(test);
		}
		self.ws_cube.onmessage = function(e) {
			console.log(e.data);
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
				else{
					console.log(msg);
					self.contentList.push({sender:msg.user,content:msg.content});
				}
			}
		}
	}
}
</script>

<style lang="stylus" rel="stylesheet/stylus">

</style>
