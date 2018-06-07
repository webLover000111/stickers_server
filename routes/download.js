var express = require('express');
var router = express.Router();
const fs  = require('fs');

router.get('/:name', (req, res, err) => {
  const name = req.params.name;
  if (name.indexOf('jpg')) {
    fs.readFile(`./assets/img/${name}`, (err, data) =>{
      if (err) {
        console.log(err);
        return;
      }
      res.send(data);
    });
  } else if (name.indexOf('gif')) {
    fs.readFile(`./assets/gif/${name}`, (err, data) =>{
      if (err) {
        console.log(err);
        return;
      }
      res.send(data);
    });
  } else {
    return;
  }
});

module.exports = router;