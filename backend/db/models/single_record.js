var Record = require('../schema/single_record.js')
var mongoose=require('mongoose');

exports.create_record=function(message,callback)
{
	console.log("a test");
	console.log(message);
	record1=new Record({
		username:message.user,
		contact_id:message.target,
		record:{sender:message.user,content:message.content,time:message.time}
    });
	
	record2=new Record({
		username:message.target,
		contact_id:message.user,
		record:{sender:message.user,content:message.content,time:message.time}
    });
	
	let promise_array = [];
	
	promise_array.push(new Promise(function(resolve,reject){
	record1.save(function(err,result){
		resolve(result);
		reject(err);
		})
	}))
	
	promise_array.push(new Promise(function(resolve,reject){
    record2.save(function(err,result){
		resolve(result);
		reject(err);
		})
	}))
	Promise.all(promise_array).then(function(err,value){
		console.log(value[0]);
		console.log(value[1]);
		if(value[0] != ""){
		  console.log("save one successful");
		}
		if(value[1] != "") {
		  console.log("save two successful");
		}
		callback(err,value);
	});
}


exports.findbyuser=function(message,callback)
{
	console.log(message);
	Record.find({"username":message.user,"contact_id":message.target},function(err,result){
		callback(err,result);
	})
}


exports.findrecord=function(message,callback)
{
	console.log(message);
	Record.find({"username":message.sender,"contact_id":message.target},function(err,result){
		callback(err,result);
	});
}

exports.addrecord=function(message,callback)
{
	let promise_array = [];
	promise_array.push(new Promise(function(resolve,reject){
	Record.update({"username":message.user,"contact_id":message.target},
	{$push:{record:{sender:message.user,content:message.content,time:message.time}}},
	function(err,result){
		resolve(result);
		console.log(result);
		reject(err);
		})
	}))
	promise_array.push(new Promise(function(resolve,reject){
    Record.update({"username":message.target,"contact_id":message.user},
	{$push:{record:{sender:message.user,content:message.content,time:message.time}}},
	function(err,result){
		resolve(result);
		console.log(result);
		reject(err);
		})
	}))

	Promise.all(promise_array).then(function(value){
		console.log(value[0]);
		console.log(value[1]);
		if(value[0] != ""){
		  console.log("查询信息1成功");
		}
		if(value[1] != "") {
		  console.log("查询信息2成功");
		}
		callback(err,value);
	});
}