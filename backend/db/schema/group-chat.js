var mongoose = require('../db.js')

var groupchatSchema = new mongoose.Schema({
	chatroom_name:String,  //群聊名称
	member_id:[String],

})

module.exports = mongoose.model('groupchat',groupchatSchema);//groupchat为表名

