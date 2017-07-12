var User = require('../schema/user.js')
var mongoose=require('mongoose');




exports.verify=function(login_message,callback){
	console.log("test login4");
	console.log(login_message);
    User.find({"username":login_message.user,"password":login_message.password},function(err,user){
    	console.log(user);
 		callback(err,user);
    });
};

exports.findbyuser=function(user_message,callback){
	console.log(user_message);
	User.find({"username":user_message.user},function(err,user){
    	console.log(user);
 		callback(err,user);
    });
};

exports.findbymember_id=function(user_message,callback){
	console.log("test add2");
	console.log(user_message);
	User.find({"username":user_message.member_id},function(err,user){
    	console.log(user);
 		callback(err,user);
    });
};

exports.addcontact=function(user_message,callback){		
	console.log(user_message);
	User.update({"user":user_message.user},{$addToSet:{contact_id:user_message.contact_id}},function(err,user){

		console.log(user);
		callback(err,user);
    });
}

exports.add_group_id_to_user=function(group_message,callback)
{
	console.log("a test");
	console.log(group_message);
	User.update({"username":group_message.member_id},{$addToSet:{group_id:group_message.group_id}},function(err,user){
		console.log(user);
		callback(err,user);
    });
}

exports.add_user=function(sign_up_message,callback)
{
	console.log(sign_up_message);
	user=new User({
		username:sign_up_message.user,
		password:sign_up_message.password,
    });
    user.save(function(err,user){
        if(!err){
            callback(null,user);
        }
        else{
　　　　　　callback(user,null);
        }
    });
}