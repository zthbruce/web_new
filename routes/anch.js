/**
 * Created by Truth on 2017/7/30.
 */

// 引入依赖
var mysql = require('../db/BlmMysql');
var util = require('util');
var utils = require('../util/Utils');
var express = require('express');
var router = express.Router();

/**
 * 根据锚地主键获得对应的信息
 * 传入参数 anchKey
 */
router.get('/getAnchInfo', function(req, res, next){
    var anchKey = req.query.anchKey;
    var sqls = util.format("SELECT * FROM T2104_Anchorage WHERE AnchorageKey = '%s'", anchKey);
    mysql.query(sqls, function (err, results) {
        if(err){
            console.log(utils.eid1);
            res.jsonp(['404', utils.eid1]);
        }else {
            console.log("成功连接数据库");
            if(results.length>0){
                res.jsonp(['200', results]);
            }else{
                res.jsonp(['304', "return nothing"]);
            }
        }
    });
});


/**
 * 根据名字进行搜索
 */
router.get('/anchNameSearch', function(req, res, next){
    var anchNameStr = req.query.anchNameStr;
    var sqls = util.format("SELECT AnchorageKey, Name, Purpose, Des, centerLon, centerLat FROM T2104_Anchorage WHERE binary Name LIKE '" + anchNameStr  + "%'  LIMIT 20" );
    mysql.query(sqls, function (err, results) {
        if(err){
            console.log(utils.eid1);
            res.jsonp(['404', utils.eid1]);
        }else {
            console.log("成功连接数据库");
            // console.log(results);
            if(results.length>0){
                // 符合名字的
                res.jsonp(['200', results]);
            }else{
                res.jsonp(['304', "return nothing"]);
            }
        }
    });
});

/**
 * 根据港口列表
 */
router.get('/portNameSearch', function(req, res, next){
    var portNameStr = req.query.PortNameStr;
    var sqls = util.format("SELECT PortID, Name AS ENName, CNName FROM T2101_Port WHERE Name LIKE '%" + portNameStr + "%' " +
        "OR CNName LIKE '%" + portNameStr + "%'" );
    mysql.query(sqls, function (err, results) {
        if(err){
            console.log(utils.eid1);
            res.jsonp(['404', utils.eid1]);
        }else {
            console.log("成功连接数据库");
            // console.log(results);
            if(results.length>0){
                // 符合名字的
                res.jsonp(['200', results]);
            }else{
                res.jsonp(['304', "return nothing"]);
            }
        }
    });
});

// /**
//  * 根据cluster_id列表 删除Park_Area中相关的数据
//  */
// router.get('/deleteStaticArea', function(req, res, next){
//     // 直接用都好相连
//     var clusterIDListStr = req.query.clusterIDList.join(",");
//     var sqls = util.format("DELETE FROM T2105_ParkArea WHERE cluster_id IN (%s)", clusterIDListStr);
//         mysql.query(sqls, function (err, results) {
//         if(err){
//             console.log(utils.eid1);
//             res.jsonp(['404', utils.eid1]);
//         }else {
//             console.log("成功连接数据库");
//             // console.log(results);
//             res.jsonp(["200", "成功删除静止区域"])
//         }
//     });
// });

/**
 * 保存锚地信息
 */
router.post('/saveAnchInfo', function(req, res, next){
    var anchInfo = req.body;
    // console.log(anchInfo);
    // var anchInfo = req.query.anchInfo;
    var sqls = util.format("REPLACE INTO `T2104_Anchorage` (AnchorageKey, Name, Purpose, Des, CenterLon, CenterLat, Location," +
        " DestinationPort) VALUE ('%s', '%s', '%s','%s', '%s', '%s', '%s','%s')", anchInfo.AnchorageKey, anchInfo.Name,
        anchInfo.Purpose, anchInfo.Des, anchInfo.CenterLon, anchInfo.CenterLat, anchInfo.Location, anchInfo.DestinationPort);
    mysql.query(sqls, function (err, results) {
        if(err){
            console.log(utils.eid1);
            res.jsonp(['404', utils.eid1]);
        }else {
            console.log("成功连接数据库");
            // console.log(results);
            res.jsonp(["200", "成功保存锚地信息"])
        }
    });
});

/**
 * 保存锚地详细信息
 */
router.post('/saveAnchDetailInfo', function(req, res, next){
    var anchKey = req.body.AnchorageKey;
    var parkAreaList = req.body.ParkAreaList;
    var sql1 = "UPDATE T2105_ParkArea SET Checked = '0' WHERE cluster_id IN (SELECT StationaryAreaKey FROM T2112_AnchorageDetails WHERE AnchorageKey ='" + anchKey + "')";
    mysql.query(sql1, function (err, results) {
        if (err) {
            // console.log(utils.eid1);
            res.jsonp(['404', "初始化静止区域确认信息失败"]);
        } else {
            console.log("初始化静止区域确认信息成功");
            var sql2 = util.format('DELETE FROM T2112_AnchorageDetails WHERE AnchorageKey = "%s"', anchKey);
            mysql.query(sql2, function (err, results) {
                if (err) {
                    res.jsonp(['404', "初始化锚地详细信息失败"]);
                } else {
                    console.log("初始化锚地详细信息成功");
                    if (parkAreaList !== undefined) {
                    var sql3 = "INSERT INTO T2112_AnchorageDetails VALUES ";
                        for (var i = 0; i < parkAreaList.length; i++) {
                            if (i > 0) {
                                sql3 += ","
                            }
                            sql3 += "('" + anchKey + "','" + parkAreaList[i] + "')";
                        }
                        mysql.query(sql3, function (err, results) {
                            if (err) {
                                console.log("保存锚地详细信息出错");
                                res.jsonp(['404', "保存锚地详细信息出错"]);
                            }
                            else {
                                var sql4 = "UPDATE T2105_ParkArea SET Checked = '1' WHERE cluster_id IN " +
                                    "(SELECT StationaryAreaKey FROM T2112_AnchorageDetails WHERE AnchorageKey ='" + anchKey + "')";
                                mysql.query(sql4, function (err, results) {
                                    if (err) {
                                        console.log("保存锚地详细信息出错");
                                        res.jsonp(['404', "保存锚地详细信息出错"]);
                                    }
                                    else {
                                        res.jsonp(['200', "保存锚地详细信息成功"]);
                                    }
                                })
                            }
                        })
                    }
                    else{
                        res.jsonp(['200', "保存锚地详细信息成功"]);
                    }
                }
            })
        }
    })
});


/**
 * 获取锚地显示信息
 */
router.get('/getAnchShowInfo', function(req, res, next){
    var sqls = util.format("SELECT AnchorageKey, Name, CenterLon, CenterLat, Location FROM T2104_Anchorage");
    mysql.query(sqls, function (err, results) {
        if(err){
            console.log(utils.eid1);
            res.jsonp(['404', utils.eid1]);
        }else {
            console.log("成功连接数据库");
            if(results.length>0){
                res.jsonp(['200', results]);
            }else{
                res.jsonp(['304', "return nothing"]);
            }
        }
    });
});

/**
 * 获取停泊区域
 */
router.get('/getParkAreaList', function (req, res, next) {
    var anchKey = req.query.AnchorageKey;
    var sql = util.format("SELECT StationaryAreaKey FROM T2112_AnchorageDetails WHERE AnchorageKey = '%s'", anchKey);
    mysql.query(sql, function (err, results) {
        if(err){
            console.log(utils.eid1);
            res.jsonp(['404', utils.eid1]);
        }
        else{
            var parkAreaList = [];
            if(results.length > 0){
                for(var i = 0; i < results.length; i++){
                    parkAreaList.push(results[i].StationaryAreaKey)
                }
                res.jsonp(['200', parkAreaList])
            }
            else{
                res.jsonp(['304', "return nothing"]);
            }
        }
    })
});


module.exports = router;