<template>
	<div class="login_interface">
		<h2>
			欢迎使用聊天室
		</h2>
		<br/>	
		<br/>
		<br/>
		<div>
			用户名<br/>
			<input type="text" class="form-control" id="user">
		</div>	
		<br/>	
		<div>
			密码<br/>
			<input type="password" class="form-control" id="password">
		</div>
		<br/>
		<div class="two_button">
			<div class="login">
				<button class="btn btn-default" @click="login">登陆</button>
			</div>
			<div class="signup">
				<button class="btn btn-default" @click="signup">注册</button>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name:'login',
	data(){
		return{
			user:"",
			password:"",
			send_content:""
		}
	},
	methods: {
		signup(){
			let sign_up_user_temp = document.getElementById("user");
			this.user=sign_up_user_temp.value;
			
			let sign_up_password_temp = document.getElementById("password");
			this.password=sign_up_password_temp.value;
			
			this.send_content = {action:"sign_up",data:{user:this.user,password:this.password}};


			console.log(this.send_content);
			
			this.$emit("listen_to_sign_login",this.send_content);

		//	this.ws_server.send(this.send_content);
			
		},
		login(){
			//console.log(this.mark);
			let user_tmp = document.getElementById("user");
			this.user = user_tmp.value;
			//console.log(this.target);
			
			let password_tmp = document.getElementById("password");
			let temp = password_tmp.value;
			this.password = password_tmp.value;
			//console.log(this.content);
			console.log(temp);
			
			this.send_content = {action:"login",data:{user:this.user,password:this.password}};
			//this.send_content = { "HEAD":{"tag":"MESG","version":65537,"record_type":"TRUSTCHAT_DEMO","record_subtype":"LOGIN_INFO","record_num":1},"RECORD":[{"user":this.user,"passwd":this.password,}],"EXPAND" :[]}

			this.$emit("listen_to_sign_login",this.send_content);
		},	
	  }
}
</script>

<style lang="stylus" rel="stylesheet/stylus">

.login_interface
	background:url(login2.png) no-repeat
	background-size:cover
	color:#FFFFFF
	display:flex
	justify-content:center
	align-items:center
	position: absolute
	flex-direction:column
	height:100%
	width:100%
	.two_button
		width:150px
		display:flex
		flex-direction:row
		justify-content:space-around
</style>

