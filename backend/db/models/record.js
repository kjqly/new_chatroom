var Record = require('../schema/record.js')
var mongoose=require('mongoose');

exports.create_record=function(message,callback)
{
	console.log("a test");
	console.log(message);
	record=new Record({
		chatroom_name:message.group_id,
		sender:message.user,
		target:message.target,
		record:{sender:message.user,target:message.target,content:message.content,time:message.time}
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

exports.findbysender=function(message,callback)
{
	Record.find({"sender":message.user,"target":message.target},function(err,result){
		console.log("testtest");
    	console.log(result);
 		callback(err,result);
    });
};

exports.addrecord=function(sender,target,callback)
{
	Record.update({"sender":message.user,"target":message.target},
	{$push:{record:{sender:message.user,target:message.target,content:message.content,time:message.time}}},
	function(err,result){
    	console.log(result);
 		callback(err,result);
    });
};