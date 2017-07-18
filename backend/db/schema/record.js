var mongoose = require('../db.js')

var recordSchema = new mongoose.Schema({
	chatroom_name:String,	
	contact1:String,
	contact2:String,
	record:[{
		sender:String,
		target:String,
		content:String,
		time:String,
	}]
})


module.exports = mongoose.model('record',recordSchema);