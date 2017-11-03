/**
 * Created by Truth on 2017/6/30.
 */
// 引入依赖
var mysql = require('../db/BlmMysql');
var util = require('util');
var utils = require('../util/Utils');
var express = require('express');
var router = express.Router();

// 作为全局变量获取一次流水数据就不必再获取了
// var SNData;



/**
 * 请求流水数据
 */
router.get('/getSNData', function(req, res, next){
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
    var sql = "SELECT SN, IMO, FROM_UNIXTIME(Arrival, '%Y-%m-%d %H:%i:%s') AS Arrival, FROM_UNIXTIME(Departure, '%Y-%m-%d %H:%i:%s') AS Departure , Duration / 3600 AS Duration, LOA, Moulded_Beam, Draft, AirDraft, DWT, Level2 AS ShipType FROM T3102_CallSN AS t1 LEFT JOIN T9904_ShipType AS t2 ON t1.ShipTypeKey = t2.ShipTypeKey WHERE StationaryAreaKey IN " +  cluster_id_set;
    console.log(sql);
    mysql.query(sql, function (err, results) {
        if(err){
            console.log(utils.eid1);
            res.jsonp(['404', utils.eid1]);
        }else{
            if(results.length < 1){
                console.log("return nothing");
                res.jsonp(['304', "return nothing"])
            }
            console.log("成功连接数据库");
            console.log(results.length);
            var sendData = JSON.stringify(results);
            // var sendData = "[";
            // for (var i = 0; i < SNData.length; i++) {
            //     ele = SNData[i];
            //     if (i > 0) {
            //         sendData += ",";
            //     }
            //     sendData += util.format('{"SN":%s, "IMO":%s, "Arrival":%s, "Departure":%s, "Duration":%s, "LOA":%s,' +
            //         ' "Moulded_Beam":%s, "Draft":%s, "AirDraft":%s, "DWT":%s, "ShipType":%s}',
            //         ele.SN, ele.IMO, ele.Arrival, ele.Departure,  ele.Duration, ele.LOA, ele.Moulded_Beam, ele.Draft, ele.AirDraft, ele.DWT, ele.ShipType);
            // }
            // sendData += "]";
            console.log(sendData);
            res.jsonp(['200', sendData])
        }
    });
});

// /**
//  * 获取相应字段的统计数据
//  * @param attr
//  */
// function getSendData(attr) {
//     var array = [];
//     var attrValue;
//     console.log(SNData);
//     for (var i = 0; i < SNData.length; i++) {
//         attrValue = SNData[i][attr];
//         if (attrValue !== null) {
//             array.push(attrValue)
//         }
//     }
//     var len = array.length;
//     if(len > 0) {
//         var min = array.reduce(getMin);
//         var max = array.reduce(getMax);
//         var mean = (array.reduce(getSum) / len).toFixed(4);
//         var sigma = Math.sqrt(array.map(function (x) {
//                 return x - mean
//             }).map(getSquare).reduce(getSum) / len).toFixed(4);
//         return util.format('"%s" : {"min": %s, "max": %s, "mean": %s, "sigma": %s}', attr, min, max, mean, sigma)
//     }
//     return util.format('"%s" : {"min": null, "max": null, "mean": null, "sigma": null}', attr)
// }
//
// /**
//  * 获取统计数据
//  * 返回数据{"LOA" : {"min", "max", "mean", "sigma"}, ...}
//  */
// router.get('/getSNStatistic', function(req, res, next){
//     console.log("统计结果");
//     var sendData = '{';
//     sendData += getSendData("LOA") + ",";
//     sendData +=  getSendData("Moulded_Beam") + ",";
//     sendData += getSendData("Draft") + ",";
//     sendData += getSendData("AirDraft") + ",";
//     sendData += getSendData("Duration") + ",";
//     sendData += getSendData("DWT");
//     sendData += "}";
//     console.log(sendData);
//     res.jsonp(['200', sendData])
// });

// 作为中间路由传递
module.exports = router;

