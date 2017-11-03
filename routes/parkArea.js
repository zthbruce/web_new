/**
 * Created by Truth on 2017/6/15.
 */

// 引入依赖
var mysql = require('../db/BlmMysql');
var util = require('util');
var utils = require('../util/Utils');
var express = require('express');
var router = express.Router();

/**
 * 请求停泊区域基本信息
 * 返回格式：{cluster_id: {"lon", "lat", "level", "type"}, cluster_id:...}
 */
router.get('/getInfo', function(req, res, next){
    var sql = 'SELECT t1.*, t2.TerminalKey, t3.PortID FROM `T2105_ParkArea` t1 LEFT JOIN `T2103_TerminalDetails` t2 ON t1.`cluster_id` ' +
        '= t2.`StationaryAreaKey` LEFT JOIN `T2102_Terminal` t3 ON t2.`TerminalKey` = t3.TerminalKey';
    mysql.query(sql, function (err, results) {
        if(err){
            console.log(utils.eid1);
            res.jsonp(['304', utils.eid1]);
        }else{
            console.log("成功连接数据库");
            var sendData = "{";
            console.log(results.length);
            for (var i = 0; i < results.length; i++) {
                if (i > 0) {
                    sendData += ",";
                }
                sendData += util.format('"%s":{"lon":%s, "lat":%s, "type":%s, "LOA_MAX":%s, "BEAM_MAX":%s, "DRAFT_MAX":%s,' +
                    ' "DWT_MAX": %s, "Checked": %s,"PortID":"%s", "TerminalKey":"%s"}',
                    results[i].cluster_id, results[i].lon, results[i].lat, results[i].type, results[i].LOA_MAX,
                    results[i].BEAM_MAX, results[i].DRAFT_MAX, results[i].DWT_MAX, results[i].Checked, results[i].PortID, results[i].TerminalKey);
                // sendData += util.format('"%s":{"lon":%s, "lat":%s, "type":%s}',
                //     results[i].cluster_id, results[i].lon, results[i].lat, results[i].type);
            }
            sendData += "}";
            // var sendData = JSON.stringify(results);
            console.log(sendData);
            res.jsonp(['200', sendData])
        }
    });
});

// /**
//  * 修改经纬度信息
//  */
// router.get('/modifyLonLatInfo', function(req, res, next){
//     var cluster_id = req.query.cluster_id;
//     var lon = req.query.lon;
//     var lat = req.query.lat;
//     var sql = util.format('UPDATE T2105_ParkArea SET lon = %s, lat = %s WHERE cluster_id = "%s"', lon, lat, cluster_id);
//     mysql.query(sql, function (err, results) {
//         if(err){
//             console.log(utils.eid1);
//             res.jsonp(['304', utils.eid1]);
//         }else{
//             console.log("修改经纬度信息成功");
//             res.jsonp(['200', "修改经纬度信息成功"])
//         }
//     });
// });
//
// /**
//  * 修改区域类型
//  */
// router.get('/modifyType', function(req, res, next){
//     var cluster_id = req.query.cluster_id;
//     var type = req.query.type;
//     var sql = util.format('UPDATE T2105_ParkArea SET type = %s WHERE cluster_id = "%s"', type, cluster_id);
//     mysql.query(sql, function (err, results) {
//         if(err){
//             console.log(utils.eid1);
//             res.jsonp(['404', utils.eid1]);
//         }else{
//             console.log("修改停泊区域类型成功");
//             res.jsonp(['200', "修改停泊区域类型成功"])
//         }
//     });
// });

// 作为中间路由传递
module.exports = router;