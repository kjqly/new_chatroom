var Record = require('../schema/group_record.js')
var mongoose=require('mongoose');

exports.create_record=function(message,callback)
{
	console.log("a test");
	console.log(message);
	record=new Record({
		chatroom_name:message.target,
		record:{sender:message.user,content:message.content,time:message.time}
    });
    record.save(function(err,record){
        if(!err){
            callback(null,record);
        }
        else{
　　　　　　callback(record,null);
        }
    });
}

exports.findbychatroom_name=function(chatroom_name,callback)
{
	Record.find({"chatroom_name":chatroom_name},function(err,result){
		console.log("testtest");
    	console.log(result);
 		callback(err,result);
    });
};

exports.add_record=function(message,callback)
{
	Record.update({"chatroom_name":message.target},
	{$push:{record:{sender:message.user,content:message.content,time:message.time}}},
	function(err,result){
    	console.log(result);
 		callback(err,result);
    });
};