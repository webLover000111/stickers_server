var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var db = require('./connect.db');
var salt = (new Date()).getTime();
var path = require('path');
const pythonShell = require('python-shell');
const base64topjpg = require('base64-to-jpg');

function hashData(str) {
  let md5 = crypto.createHash('md5');
  md5.update(str);
  return md5.digest('hex');
}

router.post('/', function (req, res, next) {
  const token = req.cookies.token;
  const imageOne = req.body.imageOne;
  console.log('sdffds')
  console.log(token)
  if (!token) {
    res.send({
      "msg": "登陆过期，请重新登陆",
      "code": 401
    });
  } else {
    db('select * from user where token=?', [token], function (error, results, fields) {
      if (error) {
        console.log(error);
      } else if (results.toString()) {
        base64topjpg(imageOne, '1231.jpg')
          .then(function(path){
            console.log('success !!');
          })
          .catch(function(err){
            console.error(err);
          })
        const options = {
          mode: 'text',
          pythonOptions: ['-u'], // get print results in real-time
          args: ['hat2.png', '1231.jpg']
        };
        pythonShell.run('./pyScript/add_hat.py', options, (err) => {
          console.log(err);
        })
      }
    })
  }
});
module.exports = router;