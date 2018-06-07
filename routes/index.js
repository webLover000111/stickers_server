var express = require('express');
var router = express.Router();

router.get('/', (req, res, err) => {
  console.log(req);
  return;
})

module.exports = router;