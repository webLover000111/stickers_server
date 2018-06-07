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
  if (!token) {
    res.send({
      "msg": "登陆过期，请重新登陆",
      "code": 401
    });
  } else {
    db('select * from user where token=?', [token], (error, results, fields) => {
      if (error) {
        console.log(error);
      } else if (results.toString()) {
        const user = results[0];
        const {username} = user;
        const saltForImg = (new Date()).getTime();
        const imgBaseURL = './assets/primitive/'
        const img = `${imgBaseURL}${username}_${saltForImg}.jpg`;
        const random = Math.floor(Math.random()*11);
        const randomSticker = `./assets/stickers/hat_${random}.png`;
        const randomStar = `./assets/starImg/star_${random}.jpg`;
        base64topjpg(imageOne, img)
          .then(function(path){
            console.log(path);

          })
          .catch(function(err){
            console.error(err);
          })
        const options = {
          mode: 'binary',
          args: [randomSticker, img, `${username}_${saltForImg}.jpg`]
        };
        pythonShell.run('./pyScript/add_hat.py', options, (err, results) => {
          if (err) {
            console.log(err);
            return;
          }
          else {
            const done_img = `./assets/img/done_${username}_${saltForImg}.jpg`;
            db('select * from img where username=?', [username], (err, results) => {
              if (err) {
                console.log(err);
                return;
              }
              else if (results && results.length){
                const database_primitive = results[0].primitive ? results[0].primitive.split(','): [];
                const database_img = results[0].img? results[0].img.split(','):[];
                database_primitive.push(img);
                database_img.push(done_img);
                db('update img set primitive=?,img=?', [database_primitive.toString(), database_img.toString() ], (err, results) =>{
                  if (err) {
                    console.log(err);
                    return;
                  }
                });
              } else {
                db('insert into img (username, primitive, img) values (?,?,?)', [username, img, done_img], (err, results) =>{
                  if (err) {
                    console.log(err);
                    return;
                  }
                });
              }
             });
            fs.readFile(done_img, (err, data_img) => {
                if (err) {
                  console.log(err);
                }
                else {
                  const dataBase64 = data_img.toString('base64');
                  fs.readFile(randomStar, (err,data_star) => {
                    if (err) {
                      console.log(err);
                      return;
                    }
                    else {
                      const dataStarBase64 = data_star.toString('base64');
                      const starBase64 = `data:image/jpeg;base64,${dataStarBase64}`;
                      const imgBase64 = `data:image/jpeg;base64,${dataBase64}`;
                      const img = {
                        "resultImg": imgBase64,
                        'star': starBase64,
                        "code": 0
                      };
                      res.send(img);
                    }
                  })
                }
            });
          }
        });
      }
    })
  }
});
module.exports = router;