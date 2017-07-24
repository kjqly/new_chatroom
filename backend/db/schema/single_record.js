var mongoose = require('../db.js')

var single_Schema = new mongoose.Schema({
	username:String,
	contact_id:String,
	record:[{
		sender:String,
		content:String,
		time:String,
	}]
})


module.exports = mongoose.model('single_record',single_Schema);