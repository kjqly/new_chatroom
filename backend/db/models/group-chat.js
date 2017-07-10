var Groupchat = require('../schema/group-chat.js')
var mongoose=require('mongoose');

exports.create=function(data,callback){
    group_chat=new Groupchat({
		chatroom_name:data.chatroomname,
		//member_id:data.member_id
    });
    group_chat.save(function(err,chat){
        if(!err){
            callback(null,chat);
        }
        else{
　　　　　　callback(err,null);
        }
    });
};

exports.findbychat_name=function(name,callback){
	console.log(name);
    Groupchat.find({"chatroom_name":name},function(err,chat){
    	console.log(chat);
 		callback(err,chat);
    });
};


exports.add_member_id=function(message,callback){
	console.log(message);
	//Groupchat.update({"chatroom_name":name},{$addToSet:{"member_id":member}});
	Groupchat.update({"chatroom_name":message.data.group_id},{$addToSet:{member_id:message.data.member_id}},function(err,chat){
    	console.log(chat);
 		callback(err,chat);
    });
}

/*exports.add_member_id=function(message){
	console.log(message);
	Groupchat.update({"chatroom_name":message.data.group_id},{$push:{"member_id":"555"}})
}
*/








