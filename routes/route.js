/**
 * Created by Truth on 2017/8/21.
 */

// 引入依赖
var mysql = require('../db/BlmMysql');
var util = require('util');
var utils = require('../util/Utils');
var express = require('express');
var router = express.Router();

/**
 * 获取航线的基本信息
 * 返回数据{"0":[{RouteID:, Name：}], "1":{})
 */
router.get("/getRouteBasicInfo", function (req, res, next) {
    var sql = 'SELECT BelongTo, RouteId, Name FROM T4106_Travel_Route UNION (SELECT BelongTo, RouteId, Name FROM T4107_Lease_Route)';
    // var sql = 'SELECT BelongTo, RouteId, Name FROM T4103_Route';
    mysql.query(sql, function (err, results) {
        if(err){
            console.log(utils.eid1);
            res.jsonp(['404', utils.eid1])
        }
        else{
            if(results.length > 0){
                console.log("成功连接数据库");
                var route_0 = [];
                var route_1 = [];
                var route_2 = [];
                var route_3 = [];
                var route_4 = [];
                var route_5 = [];
                var route_6 = [];
                var route_7 = [];
                for(var i = 0; i < results.length; i++){
                    var ele = results[i];
                    var routeType = ele.BelongTo;
                    // console.log(routeType.length);
                    var content = {RouteId:ele.RouteId, Name: ele.Name};
                    switch (routeType)
                    {
                        case "0":
                            route_0.push(content);
                            break;
                        case "1":
                            route_1.push(content);
                            break;
                        case "2":
                            route_2.push(content);
                            break;
                        case "3":
                            route_3.push(content);
                            break;
                        case "4":
                            route_4.push(content);
                            break;
                        case "5":
                            route_5.push(content);
                            break;
                        case "6":
                            route_6.push(content);
                            break;
                        case "7":
                            route_7.push(content);
                            break;
                        default:
                            console.log("nothing");
                    }
                }
                res.jsonp(['200', {"0": route_0, "1": route_1, "2": route_2, "3": route_3, "4": route_4,
                    "5": route_5, "6": route_6, "7": route_7}])
            }
            else{
                console.log("无返回数据");
                res.jsonp(['304', "return nothing"])
            }
        }
    })
});

/**
 * 获取程租航线的具体信息
 * 请求参数 {RouteId}
 * 返回信息 航线具体信息
 */
router.get("/getRouteDetailInfo", function (req, res, next) {
    var routeId = req.query.RouteId;
    var sql = util.format("SELECT * FROM `T4106_Travel_Route`  WHERE RouteId = '%s'", routeId);
    mysql.query(sql, function (err, results) {
        if(err){
            console.log(utils.eid1);
            res.jsonp(["404", utils.eid1])
        }
        else{
            if(results.length>0){
                console.log(["200", results]);
                res.jsonp(["200", results])
            }
            else{
                console.log(["304", 'return nothing']);
                res.jsonp(["304", 'return nothing'])
            }
        }
    })
});

/**
 * 获取期租航线的具体信息
 * 请求参数 {RouteId}
 * 返回信息 航线具体信息
 */
router.get("/getLeaseRouteDetailInfo", function (req, res, next) {
    var routeId = req.query.RouteId;
    var sql = util.format("SELECT * FROM `T4107_Lease_Route`  WHERE RouteId = '%s'", routeId);
    mysql.query(sql, function (err, results) {
        if(err){
            console.log(utils.eid1);
            res.jsonp(["404", utils.eid1])
        }
        else{
            if(results.length>0){
                console.log(["200", results]);
                res.jsonp(["200", results])
            }
            else{
                console.log(["304", 'return nothing']);
                res.jsonp(["304", 'return nothing'])
            }
        }
    })
});

/**
 * 获取该航线下的货物
 */
router.get('/getCargo2Route', function(req, res, next){
    var routeId = req.query.RouteId;
    var sql = util.format('SELECT CargoTypeKey, Name, ENName FROM T4108_RouteCargo t1 ' +
        'LEFT JOIN T2110_CargoType t2 ON t1.CargoTypeKey = t2.ID ' +
        'WHERE RouteId = "%s"', routeId);
    mysql.query(sql, function (err, results) {
        if(err){
            console.log(utils.eid1);
            res.jsonp(['404', utils.eid1]);
        }else {
            res.jsonp(['200', results]);
        }
    });
});

/**
 * 获取相关的港口·
 */
router.get("/getRelatePort", function (req, res, next) {
    var sql =   "SELECT DISTINCT(portID)  FROM `T2103_TerminalDetails` t1 LEFT JOIN `T2102_Terminal`  t2 ON t1.`TerminalKey` = t2.`TerminalKey`";
    mysql.query(sql, function (err, results) {
        if(err){
            console.log(utils.eid1);
            res.jsonp(["404", utils.eid1])
        }else{
            // console.log(["200", results]);
            res.jsonp(["200", results])
        }
    })
});

/**
 * 保存程租信息
 */
router.get("/saveRouteDetailInfo", function (req, res, next) {
    var param = req.query;
    var sql = util.format("UPDATE T4106_Travel_Route SET DeparturePort = '%s',  ArrivalPort = '%s', DWT = '%s', Draft= '%s', MaxAge= '%s', " +
        "LoadingWaitTime= '%s', LoadSunHoliday= '%s', LoadTPH = '%s', LoadDWTPH= '%s', " +
        "DischargeWaitTime= '%s', DischargeSunHoliday= '%s', DischargeTPH='%s', DischargeDWTPH= '%s', " +
        "ENDes= '%s', CNDes = '%s', Weight = %s WHERE RouteId = '%s'",
        param.DeparturePort, param.ArrivalPort, param.DWT,  param.Draft, param.MaxAge,
        param.LoadingWaitTime, param.LoadSunHoliday, param.LoadTPH, param.LoadDWTPH,
        param.DischargeWaitTime, param.DischargeSunHoliday, param.DischargeTPH, param.DischargeDWTPH,
        param.ENDes, param.CNDes, param.Weight, param.RouteId);
    mysql.query(sql, function (err, results) {
        if(err){
            console.log(utils.eid1);
            res.jsonp(["404", utils.eid1])
        }else{
            console.log(["200", "成功保存航线信息"]);
            res.jsonp(["200", "成功保存航线信息"])
        }
    })
});

/**
 * 保存期租信息
 */
router.get("/saveLeaseRouteDetailInfo", function (req, res, next) {
    var param = req.query;
    var sql = util.format("UPDATE T4107_Lease_Route SET DeliveryArea = '%s',  RedeliveryArea = '%s', DeliveryCenterLon = '%s', " +
        "DeliveryCenterLat= '%s', RedeliveryCenterLon = '%s', RedeliveryCenterLat = '%s', DeliveryPort= '%s', RedeliveryPort = '%s', " +
        "Weight= '%s', Commission = '%s', Min_Lease_Term = '%s', Max_Lease_Term ='%s', DWT= '%s', MaxAge= '%s', Draft = '%s', " +
        "Volume = '%s', LOA = '%s', Beam = '%s', No_Diesel_At_Sea = '%s', EmptyLoad_Speed = '%s', EmptyLoad_Fuel_Consumption = '%s', " +
        "FullLoad_Speed = '%s', FullLoad_Fuel_Consumption='%s', ENDes='%s', CNDes='%s' WHERE RouteId = '%s'",
        param.DeliveryArea,param.RedeliveryArea,param.DeliveryCenterLon,
        param.DeliveryCenterLat,param.RedeliveryCenterLon,param.RedeliveryCenterLat,param.DeliveryPort,
        param.RedeliveryPort,param.Weight,param.Commission,param.Min_Lease_Term,param.Max_Lease_Term,
        param.DWT,param.MaxAge,param.Draft,param.Volume,param.LOA,param.Beam,param.No_Diesel_At_Sea,
        param.EmptyLoad_Speed,param.EmptyLoad_Fuel_Consumption,param.FullLoad_Speed,
        param.FullLoad_Fuel_Consumption,param.ENDes,param.CNDes,param.RouteId);
    mysql.query(sql, function (err, results) {
        if(err){
            console.log(utils.eid1);
            res.jsonp(["404", utils.eid1])
        }else{
            console.log(["200", "成功保存航线信息"]);
            res.jsonp(["200", "成功保存航线信息"])
        }
    })
});


// 保存货物信息
router.get('/saveCargoInfo', function(req, res, next) {
    var routeId =  req.query.RouteId;
    var cargoList = req.query.CargoList;
    // 初始化清空
    var sql1 = util.format('DELETE FROM T4108_RouteCargo WHERE RouteId = "%s"', routeId);
    mysql.query(sql1, function (err, results) {
        if (err) {
            console.log(utils.eid1);
            res.jsonp(['404', "清空航线货物出错"]);
        } else {
            console.log("成功连接数据库");
            var sql2 = "INSERT INTO T4108_RouteCargo VALUES ";
            for(var i = 0; i< cargoList.length; i++){
                if(i > 0){
                    sql2 += ","
                }
                sql2 += "('" + routeId + "','" + cargoList[i] + "')";
            }
            console.log(sql2);
            mysql.query(sql2, function (err, results) {
                if (err) {
                    console.log("保存货物信息出错");
                    res.jsonp(['404', "保存货物信息出错"]);
                }
                else {
                    res.jsonp(['200', "保存货物信息成功"]);
                }
            })
        }
    });
});

module.exports = router;
