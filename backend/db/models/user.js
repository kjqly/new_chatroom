var User = require('../schema/user.js')
var mongoose=require('mongoose');




exports.verify=function(login_message,callback){
	console.log(login_message);
    User.find({"user":login_message.user,"password":login_message.password},function(err,user){
    	console.log(user);
 		callback(err,user);
    });
};

exports.findbyuser=function(user_message,callback){
	console.log(user_message);
	User.find({"user":user_message.user},function(err,user){
    	console.log(user);
 		callback(err,user);
    });
};

exports.addcontact=function(user_message,callback){		
	console.log("test");
	console.log(user_message);
	User.update({"user":user_message.user},{$push:{contact_id:user_message.contact_id}},function(err,user){

		console.log(user);
		callback(err,user);
    });
}