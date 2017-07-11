var mongoose = require('../db.js')

var userSchema = new mongoose.Schema({
	username:String,
	password:String,
	contact_id:[String],
	group_id:[String]
})


module.exports = mongoose.model('user',userSchema);