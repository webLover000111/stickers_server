var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var db = require('./connect.db');
var salt = (new Date()).getTime();

function hashData(str) {
  let md5 = crypto.createHash('md5');
  md5.update(str);
  return md5.digest('hex');
}
router.post('/', function (req, res, next) {
  let username = req.body.username;
  let password = req.body.password;
  const token = hashData(username+salt);
  /*     name = hashData(name);
      password = hashData(password); */
  db('select * from user where username =?', [username], function (error, results, fields) {
    if (error) {
      throw error;
    } else if (!results.toString()) {
      res.send({
        "msg": "用户名不存在!",
        "status": false
      });
    } else if (results.toString()) {
      db('select * from user where password=?', [password], function (error, results, fields) {
        if (error) {
          console.log(error);
        } else if (!results.toString()) {
          res.send({
            "msg": '密码错误!',
            "status": false
          });

        } else if (results.toString()) {
          db('update user set token = ? where username = ?', [token,  username], function (error, results, fields) {
            if (error) {
              console.log(error);
            } else {
              let date = new Date();
              date.setTime(date.getTime()+0.5*3600*1000);
              res.setHeader('Set-Cookie', `token=${token}; Expires=${date.toGMTString()};HttpOnly`);
              res.send({
                "code": 0,
              });
            }
          });
        }
      });
    }

  });
});
module.exports = router;