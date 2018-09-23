var mongoose = require('../db.js')

var group_Schema = new mongoose.Schema({
	chatroom_name:String,
	record:[{
		sender:String,
		content:String,
		time:String,
	}]
})


module.exports = mongoose.model('group_record',group_Schema);