/**
 * Created by Truth on 2017/6/12.
 */
var express = require('express');
var log = require("../log/blmLog");
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    log.info("index page");
    res.render('testIndex', { title: 'Express' });
});

module.exports = router;

