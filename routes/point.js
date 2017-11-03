
/**
 * Created by Truth on 2017/6/19.
 */

// 引入依赖
var mysql = require('../db/BlmMysql');
var util = require('util');
var utils = require('../util/Utils');
var express = require('express');
var moment = require("moment");
var request = require("request");
var router = express.Router();


/**
 * 从hbase中取数据
 * @param table
 * @param keyStart
 * @param keyEnd
 * @param limit
 * @param cb
 */

function getDataDuring(table, keyStart, keyEnd, limit, cb){
    if(!table || !keyStart || !keyEnd){
        cb("params error");
        return;
    }
    var sql = util.format("select CONVERT_FROM(t.f.v,'UTF8') as info from hbase.\`%s\` t where row_key>= '%s' and row_key<='%s' ", table, keyStart, keyEnd);
    // if(desc){
    //     sql += "order by 1 desc ";
    // }
    if(limit){
        sql += util.format("limit %s", limit)
    }
    console.log(sql);
    request.post({
        url:'http://192.168.30.80:83/query.json',
        json: {
            "queryType": "SQL",
            "query":sql
        }
    }, function (err, httpResponse, data){
        if(!err && data && data.rows) {
            // var result = data.rows;
            cb(["200", data.rows])
        } else{
            cb(["404", err])
        }
    })
}

// router.get('/', function(req, res, next) {
//     var table = 'result';
//     var cluster_id = req.query.cluster_id;
//     console.log('目前只有一个停泊区域');
//     console.log(cluster_id);
//     var zero = "0000000000";
//     var startKey = zero.substring(0, 10 - cluster_id.length) + cluster_id;
//     var endKey = startKey + "*";
//     getDataDuring(table, startKey, endKey, false, function(result){
//         if(result[0] === "200"){
//             var lon_lat_info = result[1];
//             // var count = lon_lat_info.length;
//             var sendData = util.format('{"cluster_id": "%s", "lat_lon_info":[', cluster_id);
//             for (var i = 0; i < lon_lat_info.length; i++) {
//                 // if (lon_lat_info[i] !== undefined && lon_lat_info[i] !== 'undefined') {
//                 if (i > 0) {
//                     sendData += ",";
//                 }
//                 var info = lon_lat_info[i].info.split(",");
//                 sendData += util.format('[%s, %s, %s]', info[0], info[1], info[3]);
//             }
//             // }
//             sendData += ']}';
//             console.log(sendData);
//             res.jsonp(['200', sendData])
//         }else{
//             console.log(utils.eid1);
//             res.jsonp(['404', utils.eid1]);
//         }
//     })
// });

/**
 * 从mysql中请求点的信息
 *
 */
router.get('/', function(req, res, next) {
    var cluster_id_list = req.query.cluster_id_list; //请求数据 cluster_id
    var cluster_id_set = '(';
    var len = cluster_id_list.length;
    for(var i=0; i< len; i++){
        if( i > 0 && i < len){
            cluster_id_set += ","
        }
        cluster_id_set += util.format("'%s'", cluster_id_list[i]);
    }
    cluster_id_set += ')';
    console.log("显示点");
    // console.log(cluster_id);
    // var sql = util.format('SELECT Longitudedd as lon, Latitudedd as lat FROM T3105_StationaryAreaPointSet WHERE StationaryAreaKey = "%s"', cluster_id);
    var sql = util.format('SELECT Longitude as lon, Latitude as lat FROM `T2108_StationaryAreaPointSet` WHERE StationaryAreaKey IN %s', cluster_id_set);
    mysql.query(sql, function (err, results) {
        if (err) {
            console.log(utils.eid1);
            res.jsonp(['404', utils.eid1]);
        } else {
            console.log("成功连接数据库");
            // var sendData = util.format('{"cluster_id": "%s", "lat_lon_info":[', cluster_id);
            var sendData = '{"lat_lon_info":[';
            for (var i = 0; i < results.length; i++) {
                if (i > 0) {
                    sendData += ",";
                }
                sendData += util.format('[%s, %s]', results[i].lon, results[i].lat);
            }
            sendData += ']}';
            res.jsonp(['200', sendData])
        }
    });
});


// 作为中间路由传递
module.exports = router;


