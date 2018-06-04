var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var db = require('./connect.db');
var salt = (new Date()).getTime();
var path = require('path');
var fs = require('fs');
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
        const user = results[0];
        const {username} = user;
        const saltForImg = (new Date()).getTime();
        const imgBaseURL = './assets/primitive/'
        const img = `${imgBaseURL}${username}_${saltForImg}.jpg`;
        base64topjpg(imageOne, img)
          .then(function(path){
            console.log(path);

          })
          .catch(function(err){
            console.error(err);
          })
        const options = {
          mode: 'binary',
          args: ['./assets/stickers/hat2.png', img, `${username}_${saltForImg}.jpg`]
        };
        pythonShell.run('./pyScript/add_hat.py', options, (err, results) => {
          if (err) {
            console.log(err);
          }
          else {
            const url = `./assets/img/done_${username}_${saltForImg}.jpg`;
            fs.readFile(url, (err, data) => {
                if (err) {
                  console.log(err);
                }
                else {
                  const dataBase64 = data.toString('base64');
                  const imgBase64 = `data:image/jpeg;base64,${dataBase64}`;
                  const img = {
                    "resultImg": imgBase64,
                    "code": 0
                  }
                  res.send(img)
                }
            })
          }
        })
      }
    })
  }
});
module.exports = router;