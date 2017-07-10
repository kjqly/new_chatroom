var User = require('../schema/user.js')
var mongoose=require('mongoose');




exports.findbyuser=function(login_message,callback){
	console.log(login_message);
    User.find({"user":login_message.user,"password":login_message.password},function(err,user){
    	console.log(user);
 		callback(err,user);
    });
};