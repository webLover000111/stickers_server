var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var db = require('./connect.db');
var salt = (new Date()).getTime();
function hashData(str){
    let md5 = crypto.createHash('md5');
    md5.update(str);
    return md5.digest('hex');
}

router.post('/', function(req, res, next ) {
    let username = req.body.username;
    let password = req.body.password;
    let email = req.body.email;
    const token = hashData(username + salt);
    db('select * from user where username =?',[username], function(error, results, fields){
        if (error) {
            console.log(error);
            return;
        }
        else if (results.toString()) {
            res.send({
                "msg":"用户名已经存在!",
                "code":400
            });
        }
        else if (!results.toString()) {
          db('select * from user where email =?',[email], function(error, results, fields) {
            if (error) {
              console.log(error);
              return;
            }
            else if (results.toString()) {
              res.send({
                "msg": "邮箱已经注册",
                "code": 400
              });
            }
            else {
              db('insert into user (username, password, token, email) values (?,?,?,?)', [username, password, token, email], function(error, results, fields) {
                if (error) {
                  console.log(error);
                  return;
                }
                else {
                  let date = new Date();
                  date.setTime(date.getTime()+0.5*3600*1000);
                  res.setHeader('Set-Cookie', `token=${token}; Expires=${date.toGMTString()};HttpOnly`);
                  res.send({
                    "code": 0
                  });
                }
              });
            }
          });
        }

    });
});
module.exports = router;