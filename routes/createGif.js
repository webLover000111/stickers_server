var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var db = require('./connect.db');
var salt = (new Date()).getTime();
var path = require('path');
var fs = require('fs');
const pythonShell = require('python-shell');
const base64topjpg = require('base64-to-jpg');
function hashData(str){
    let md5 = crypto.createHash('md5');
    md5.update(str);
    return md5.digest('hex');
}

router.post('/', function (req, res, next) {
  const token = req.cookies.token;
  const imageArr = req.body.imageArr;
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
        const imgBaseURL = './assets/'
        const primitiveImg = `${imgBaseURL}primitive/${username}_${saltForImg}`;
        const addedImg = `${imgBaseURL}img/${username}_${saltForImg}`;
        const imgList = [];
        const randomSticker = `./assets/stickers/hat_${Math.floor(Math.random()*12)}.png`;

        async function saveImg (callback) {
          for ( let i = 0; i < imageArr.length; i++) {
            await callback(i);
          }
          console.log(imgList)
          const options2 = {
            mode: 'binary',
            args: [ imgList[0], imgList[1] ,imgList[2], imgList[3], imgList[4], imgList[5],imgList[6], imgList[7], imgList[8], imgList[9], imgList[10], imgList[11], 
            imgList[12], imgList[13] ,imgList[14], imgList[15], imgList[16], imgList[17],imgList[18], imgList[19], imgList[20], imgList[21], imgList[22], imgList[23],
            `./assets/gif/${username}_${saltForImg}.gif`]
          };
          pythonShell.run('./pyScript/gif_gender.py', options2, (err, results) => {
            if (err) {
              console.log(err);
            }
            else {
              const gifUrl = `./assets/gif/${username}_${saltForImg}.gif`;

              db('select * from img where username=?', [username], (err, results) => {
                if (err) {
                  console.log(err);
                  return;
                }
                else if (results.length){
                  const database_gif_primitive = results[0].gif_primitive? results[0].gif_primitive.split(','): [];
                  const database_gif = results[0].gif? results[0].gif.split(',') : [];
                  database_gif_primitive.push(primitiveImg);
                  database_gif.push(gifUrl);
                  db('update img set gif_primitive=? , gif=? where username=?', [database_gif_primitive.toString(), database_gif.toString(), username ], (err, results) =>{
                    if (err) {
                      console.log(err);
                      return;
                    }
                  });
                } else {
                  db('insert into img (username, primitive, img) values (?,?,?)', [username, primitiveImg, gifUrl], (err, results) =>{
                    if (err) {
                      console.log(err);
                      return;
                    }
                  });
                }
               });


              fs.readFile(gifUrl, (err, data) => {
                  if (err) {
                    console.log(err);
                  }
                  else {
                    const dataBase64 = data.toString('base64');
                    const gifBase64 = `data:image/gif;base64,${dataBase64}`;
                    const gif = {
                      "resultGif": gifBase64,
                      "code": 0
                    }
                    res.send(gif)
                  }
              })
            }
          });
        }
        async function fCallback (i) {
          await base64topjpg(imageArr[i],`${primitiveImg}_${i}.jpg`)
          .then(function(path){
            /* console.log(path); */
          })
          .catch(function(err){
            console.error(err);
            return
          });
          await addSticker(i);
          while (!fs.existsSync(`./assets/img/done_${username}_${saltForImg}_${i}.jpg`)) {
          }
          console.log(`add stickers for primitiveImg  ${i} successfully!`);
          imgList.push(`./assets/img/done_${username}_${saltForImg}_${i}.jpg`);
        }

        async function addSticker (i) {
          const options1 = {
            mode: 'binary',
            args: [randomSticker, `${primitiveImg}_${i}.jpg`, `${username}_${saltForImg}_${i}.jpg` ]
          };
          await pythonShell.run('./pyScript/add_hat.py', options1, (err, results) => {
            if (err) {
              console.log(err);
              return;
            }
          });
        }
        saveImg (fCallback);
      }
    })
  }
});

module.exports = router;