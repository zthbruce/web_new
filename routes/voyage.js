/**
 * Created by Truth on 2017/7/12.
 * 获取航线数据
 */

// 引入依赖
var mysql = require('../db/BlmMysql');
var util = require('util');
var utils = require('../util/Utils');
var express = require('express');
var router = express.Router();
var moment = require("moment");
var request = require("request");


/**
 * 获取所有船信息
 * 返回数据[{"mmsi", "ENName", "CNName"}]
 */

router.post('/getShipInfo', function(req, res, next){
    var sql = 'SELECT MMSI, ENNAME FROM T9101_ShipInfo';
    mysql.query(sql, function (err, results) {
        if(err){
            console.log(utils.eid1);
            res.jsonp(['404', utils.eid1]);
        }else{
            console.log("成功连接数据库");
            // var sendData = "[";
            // console.log(results.length);
            // for (var i = 0; i < results.length; i++) {
            //     if (i > 0) {
            //         sendData += ",";
            //     }
            //     sendData += util.format('{"MMSI": %s, "ENName": %s , "CNName": %s}',
            //         results[i].MMSI, results[i].ENName, results[i].CNName);
            // }
            // sendData += "]";
            var sendData = JSON.stringify(results);
            console.log(sendData);
            res.jsonp(['200', sendData])
        }
    });
});


/**
 * 从hbase中取数据
 * @param table
 * @param timeList
 * @param limit
 * @param cb
 */

// function getDataDuring(table, MMSI, timeList, limit, cb){
//     if(!table || !timeList){
//         cb("params error");
//         return;
//     }
//     var sql = util.format("select CONVERT_FROM(t.f.v,'UTF8') as info from hbase.\`%s\` t WHERE",  table);
//     for (var i = 0; i < timeList.length; i++) {
//         if( i > 0){
//             sql += "OR"
//         }
//         var ele = timeList[i];
//         var startKey = util.format('%s%s', MMSI, ele.TS1);
//         var endKey = util.format('%s%s', MMSI, ele.TS2);
//         sql += util.format(" (row_key>= '%s' and row_key<='%s') ",  startKey, endKey)
//     }
//     if(limit){
//         sql += util.format("limit %s", limit)
//     }
//     console.log(sql);
//     request.post({
//         url:'http://192.168.30.80:83/query.json',
//         json: {
//             "queryType": "SQL",
//             "query":sql
//         }
//     }, function (err, httpResponse, data){
//         if(!err && data && data.rows) {
//             cb(["200", data.rows])
//         } else{
//             cb(["404", err])
//         }
//     })
// }

/**
 * 根据MMSI从数据库中获取数据， 从hbase的ais_info中获取数据
 * 输入数据: MMSI
 * 输出：
 */
router.get('/getPoints', function(req, res, next) {
    var table = 'ais_info';
    var MMSI = req.query.MMSI;
    var limit = req.query.limit;
    var sql = util.format('SELECT TS1, TS2 FROM T9102_ShipRoute WHERE MMSI = %s ', MMSI);
    // var sql = util.format('SELECT MIN(TS1) AS TS1, MAX(TS2) AS TS2 FROM T9102_ShipRoute WHERE MMSI = %s ', MMSI);
    if(limit){
        sql += util.format("LIMIT %s", limit)
    }
    mysql.query(sql, function (err, timeList) {
        if(err){
            console.log(utils.eid1);
            res.jsonp(['404', utils.eid1]);
        }else{
            console.log("成功连接数据库获取MMSI时间段列表");
            var sendData = util.format('{"MMSI": "%s", "lat_lon_info":[', MMSI);
            var count = 0;
            console.log(timeList);
            getDataDuring(table, MMSI,  timeList, false, function (result) {
                if (result[0] === "200") {
                    var lon_lat_info = result[1];
                    console.log(lon_lat_info);
                    for (var i = 0; i < lon_lat_info.length; i++) {
                        // if (lon_lat_info[i] !== undefined && lon_lat_info[i] !== 'undefined') {
                        if (count > 0) {
                            sendData += ",";
                        }
                        var info = lon_lat_info[i].info.split("#");
                        // 获取经纬度信息
                        sendData += util.format('[%s, %s]', info[8], info[9]);
                        count++;
                    }
                    sendData += ']}';
                    // console.log(sendData);
                    res.jsonp(['200', sendData]);
                } else {
                    res.jsonp(['304', "nothing return"]);
                }
            });
        }
    });
});

/**
 * 根据MMSI获取航线基本信息列表
 */
router.get('/getBasicRouteInfo', function(req, res, next) {
    var MMSI = req.query.MMSI;
    var sql = "SELECT TS1 , TS2,  FROM_UNIXTIME(TS1, '%Y-%m-%d %H:%i:%s') AS startTime , FROM_UNIXTIME(TS2, '%Y-%m-%d %H:%i:%s') AS endTime, StartingPort, DestinationPort FROM T9102_ShipRoute WHERE MMSI =  " + MMSI;
    console.log(sql);
    // var sql = util.format('SELECT MIN(TS1) AS TS1, MAX(TS2) AS TS2 FROM T9102_ShipRoute WHERE MMSI = %s ', MMSI);
    mysql.query(sql, function (err, results) {
        if (err) {
            console.log(utils.eid1);
            res.jsonp(['404', utils.eid1]);
        } else {
            console.log("成功连接数据库获取航线基本信息");
            var sendData = JSON.stringify(results);
            console.log(sendData);
            res.jsonp(['200', sendData])
        }
    })
});


/**
 *
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
            console.log(data.rows);
            cb(["200", data.rows])
        } else{
            cb(["404", err])
        }
    })
}

/**
 * 根据MMSI从数据库中获取数据， 从hbase的ais_info中获取数据
 * 输入数据: MMSI
 * 输出：
 */
router.get('/getDetailRouteInfo', function(req, res, next) {
    var table = 'ais_info';
    var MMSI = req.query.MMSI;
    var startTime = util.format('%s%s', MMSI, req.query.startTime);
    var stopTime = util.format('%s%s', MMSI, req.query.stopTime);
    getDataDuring(table, startTime, stopTime, false, function (result) {
        if (result[0] === "200") {
            var lon_lat_info = result[1];
            var sendData = util.format('{"MMSI": "%s", "lat_lon_info":[', MMSI);
            var count = 0;
            for (var i = 0; i < lon_lat_info.length; i++) {
                // if (lon_lat_info[i] !== undefined && lon_lat_info[i] !== 'undefined') {
                if (i > 0) {
                    sendData += ",";
                }
                if(lon_lat_info[i].info !== undefined){
                    var info = lon_lat_info[i].info.split("#");
                    // 获取经纬度信息
                    sendData += util.format('[%s, %s]', info[8], info[9]);
                    count++;
                }
            }
            sendData += ']}';
            if(count>0){
                res.jsonp(['200', sendData]);
            }
            else{
                res.jsonp(['304', "return nothing"]);
            }

        } else {
            res.jsonp(['404', result]);
        }
    });
});


module.exports = router;

// var table = 'ais_info';
// var MMSI = 538004900;
//
// var startTime = util.format('%s%s', MMSI, 1358102806 );
// var endTime = util.format('%s%s', MMSI, 1360690750);
// getDataDuring(table, startTime, endTime, false, function (result) {
//     if (result[0] === "200") {
//         var lon_lat_info = result[1];
//         var sendData = util.format('{"MMSI": "%s", "lat_lon_info":[', MMSI);
//         for (var i = 0; i < lon_lat_info.length; i++) {
//             // if (lon_lat_info[i] !== undefined && lon_lat_info[i] !== 'undefined') {
//             if (i > 0) {
//                 sendData += ",";
//             }
//             var info = lon_lat_info[i].info.split("#");
//             // 获取经纬度信息
//             sendData += util.format('[%s, %s]', info[8], info[9]);
//         }
//         sendData += ']}';
//         console.log(sendData)
//         // res.jsonp(['200', sendData]);
//     } else {
//         // res.jsonp(['304', "nothing return"]);
//     }
// });

// var strtime = '2013-02-12 12:39:10';
// var date = new Date(strtime);
// console.log(Date.parse(date));

// console.log(Date.parse('2013-02-12'));
// var newDay = new Date();
// console.log(Date.parse(newDay));

