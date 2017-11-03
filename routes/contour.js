/**
 * Created by Truth on 2017/6/26.
 */

// 引入依赖
var mysql = require('../db/BlmMysql');
var util = require('util');
var utils = require('../util/Utils');
var express = require('express');
var router = express.Router();

/**
 * 请求停泊区域基本信息
 */

router.get('/', function(req, res, next){
    var cluster_id = req.query.cluster_id; //请求数据 cluster_id
    console.log(util.format("current cluster_id is %s", cluster_id));
    var sql = util.format("SELECT info FROM Park_Area_Contour WHERE cluster_id = '%s'", cluster_id);

    mysql.query(sql, function (err, results) {
        if(err){
            console.log(utils.eid1);
            res.jsonp(['304', utils.eid1]);
        }else{
            if(results.length < 1){
                console.log("return nothing");
                res.jsonp(['304', "nothing return"])
            }
            console.log("成功连接数据库");
            var sendData = util.format('{"info":"%s"}', results[0].info.trim());
            console.log(sendData);
            res.jsonp(['200', sendData])
        }
    });
});

// 作为中间路由传递
module.exports = router;
