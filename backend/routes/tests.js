var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
console.log("this is tests");
console.log(req.query.msg);
let mingwen = req.query.msg+"1";
console.log(mingwen);
  res.json({"mingwen":mingwen});
});

module.exports = router;
