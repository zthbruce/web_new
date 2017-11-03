/**
 * Created by ShiTianCi on 2017/6/19.
 */
// 引入依赖
// var blmDbmysql = require('../db/BlmDbMysql');
var blmDbmysql = require('../db/BlmMysql');
var util = require('util');
var express = require('express');
var router = express.Router();
var utils = require('../util/Utils');

//获取港口位置列表
router.get('/', function(req, res, next){
    var sql = util.format('SELECT PortID, Name, CNName, LatitudeNumeric, LongitudeNumeric,Level FROM T2101_Port');
    blmDbmysql.query(sql, function (err, results) {
        if(err){
            console.log(utils.eid1);
            res.jsonp(['304', utils.eid1]);
            console.log("here")
        }else{
            console.log("成功连接数据库");
            var sendData = "{";
            for (var i = 0; i < results.length; i++) {
                // console.log(results.length);
                if (i > 0) {
                    sendData += ",";
                }
                sendData += util.format('"%s":{"ENName":"%s", "CNName":"%s", "LatitudeNumeric":"%s", "LongitudeNumeric":"%s", "Level":"%s"}',
                    results[i].PortID, results[i].Name, results[i].CNName, results[i].LatitudeNumeric, results[i].LongitudeNumeric, results[i].Level);
            }
            sendData += "}";
            res.jsonp(['200', sendData]);
        }
    });
});

//获取主要港口位置列表
router.get('/reqMainPortList', function(req, res, next){
    var sql = util.format('SELECT PortID FROM world_port_tmp');
    blmDbmysql.query(sql, function (err, results) {
        if(err){
            console.log(utils.eid1);
            res.jsonp(['304', utils.eid1]);
            console.log("here")
        }else{
            console.log("成功连接数据库");
            var sendData = "[";
            for (var i = 0; i < results.length; i++) {
                if (i > 0) {
                    sendData += ",";
                }
                sendData += util.format('{"PortID":"%s"}',results[i].PortID);
            }
            sendData += "]";
            res.jsonp(['200', sendData]);
        }
    });
});

//获取单个港口基本信息
router.get('/reqOnePortBasic', function(req, res, next){
    var data=req.query;
    var reqParam=JSON.parse(data.param);
    console.log(reqParam.PortID);
    var sql = util.format('SELECT t1.PortID,t1.ISO3,t1.Name,t1.CNName,t1.Timezone,t1.ChartNo,t1.Latitude,t1.Longitude,' +
        't2.Name AS CompanyENName FROM T2101_Port AS t1 ' +
        'LEFT JOIN T1101_Company AS t2 ON t1.CompanyNumber = t2.CompanyNumber WHERE t1.PortID = '+reqParam.PortID);
    blmDbmysql.query(sql, function (err, results) {
        if(err){
            console.log(utils.eid1);
            res.jsonp(['304', utils.eid1]);
            console.log("here");
        }else {
            console.log("成功连接数据库");
            console.log(results[0]);
            var sendData = "[";
            results[0].ChartNo = results[0].ChartNo==null? '': results[0].ChartNo.replace(/\n|\r/g,'');
            results[0].Latitude = results[0].Latitude.replace('"','\\"');
            results[0].Longitude = results[0].Longitude.replace('"','\\"');
            results[0].CompanyENName = results[0].CompanyENName==null ? '' : results[0].CompanyENName;
            sendData += util.format('{"PortID":"%s", "ISO3":"%s", "ENName":"%s", "CNName":"%s", "Timezone":"%s", "ChartNo":"%s", "Latitude":"%s", "Longitude":"%s", "CompanyENName":"%s"}',
                results[0].PortID, results[0].ISO3, results[0].Name, results[0].CNName, results[0].Timezone, results[0].ChartNo, results[0].Latitude, results[0].Longitude, results[0].CompanyENName);
            sendData += "]";
            console.log(sendData);
            res.jsonp(['200', sendData]);
        }
    });
});

//获取单个港口码头列表
router.get('/reqOnePortPierList', function(req, res, next){
    var data=req.query;
    var reqParam=JSON.parse(data.param);
    console.log(reqParam.PortID);
    var sql = util.format('SELECT TerminalKey,Name,Longitude,Latitude FROM T2102_Terminal WHERE PortID = '+reqParam.PortID);
    blmDbmysql.query(sql, function (err, results) {
        if(err){
            console.log(utils.eid1);
            res.jsonp(['404', utils.eid1]);
            console.log("here")
        }else {
            console.log("成功连接数据库");
            console.log(results);
            var sendData = "[";
                for(var i=0;i<results.length;i++){
                    if (i > 0) {sendData += ",";}
                    // results[i].Latitude = results[i].Latitude.replace('"','\\"');
                    // results[i].Longitude = results[i].Longitude.replace('"','\\"');
                    sendData += util.format('{"TerminalKey":"%s", "Name":"%s", "Longitude":"%s", "Latitude":"%s"}',
                        results[i].TerminalKey, results[i].Name, results[i].Longitude, results[i].Latitude);
                }

            sendData += "]";
            console.log(sendData);
            res.jsonp(['200', sendData]);
        }
    });
});

//获取单个码头详细信息
router.get('/reqOnePierDetail', function(req, res, next){
    var data=req.query;
    var reqParam=JSON.parse(data.param);
    console.log(reqParam.TerminalKey);
    var sql = util.format('SELECT t2.ENName,t1.Des,t1.Name,t3.Name AS CargoTypeName,t1.Longitude,t1.Latitude,t1.Salinity,' +
        't1.Location,t4.ENName AS companyENName,t1.Tide,t1.BerthQuantity,t1.ImportExportType,t1.Type FROM T2102_Terminal AS t1 ' +
        'LEFT JOIN T2101_Port AS t2 ON t1.PortID = t2.PortID LEFT JOIN T9917_CargoType AS t3 ON t1.CargoTypeKey = t3.CargoTypeKey ' +
        'LEFT JOIN T1101_Company AS t4 ON t1.BelongtoCompany = t4.CompanyNumber WHERE t1.TerminalKey = '+reqParam.TerminalKey);
    blmDbmysql.query(sql, function (err, results) {
        if(err){
            console.log(utils.eid1);
            res.jsonp(['304', utils.eid1]);
            console.log("here")
        }else {
            console.log("成功连接数据库");
            console.log(results)
            var sendData = "[";
            // results[0].Latitude = results[0].Latitude.replace('"','\\"');
            // results[0].Longitude = results[0].Longitude.replace('"','\\"');
            sendData += util.format('{"ENName":"%s", "Des":"%s", "Name":"%s", "CargoTypeName":"%s", "Longitude":"%s", "Latitude":"%s", "Salinity":"%s"' +
                ', "Location":"%s", "companyENName":"%s", "Tide":"%s", "BerthQuantity":"%s", "ImportExportType":"%s", "Type":"%s"}',
                results[0].ENName, results[0].Des, results[0].Name, results[0].CargoTypeName, results[0].Longitude, results[0].Latitude, results[0].Salinity,
                results[0].Location, results[0].companyENName, results[0].Tide, results[0].BerthQuantity, results[0].ImportExportType, results[0].Type);
            sendData += "]";
            console.log(sendData);
            res.jsonp(['200', sendData]);
        }
    });
});

//获取单个所属港口列表
router.get('/reqOneBoxBerth', function(req, res, next){
    var data=req.query;
    var reqParam=JSON.parse(data.param);
    console.log(reqParam.PortID);
    var sql = util.format("SELECT ENName,ISO3,LatitudeNumeric,LongitudeNumeric,Timezone,ChartNo FROM T2101_Port WHERE PortID = " +reqParam.PortID);
    blmDbmysql.query(sql, function (err, results) {
        if(err){
            console.log(utils.eid1);
            res.jsonp(['304', utils.eid1]);
            console.log("here")
        }else {
            console.log("成功连接数据库");
            console.log(results)
            var sendData = "[";
            sendData += util.format('{"ENName":"%s", "ISO3":"%s", "LatitudeNumeric":"%s", "LongitudeNumeric":"%s", "Timezone":"%s", "ChartNo":"%s" }',
                results[0].ENName, results[0].ISO3, results[0].LatitudeNumeric, results[0].LongitudeNumeric, results[0].Timezone, results[0].ChartNo);
            sendData += "]";
            console.log(sendData);
            res.jsonp(['200', sendData]);
        }
    });
});

//获取单个码头泊位列表
router.get('/reqOnePierBerthList', function(req, res, next){
    var data=req.query;
    var reqParam=JSON.parse(data.param);
    console.log(reqParam.pierTerminalKey);
    var sql = util.format('SELECT TerminalKey,Seq,LOA,Moulded_Beam,AirDraft,Draft,Length,Depth,' +
        'LoadDischargeRate,EquipmentQuantity,Travel,Outreach, StationaryAreaKey FROM T2103_TerminalDetails WHERE TerminalKey = '+reqParam.pierTerminalKey);
    blmDbmysql.query(sql, function (err, results) {
        if(err){
            console.log(utils.eid1);
            res.jsonp(['304', utils.eid1]);
        }else {
            console.log("成功连接数据库");
            console.log(results);
            var sendData = "[";
            for(var i=0;i<results.length;i++){
                if (i > 0) {sendData += ",";}
                sendData += util.format('{"TerminalKey":"%s", "Seq":"%s", "LOA":"%s", "Moulded_Beam":"%s", "AirDraft":"%s", "Draft":"%s", "Length":"%s"' +
                    ', "Depth":"%s", "LoadDischargeRate":"%s", "EquipmentQuantity":"%s", "Travel":"%s", "Outreach":"%s","StationaryAreaKey":"%s"}',
                    results[i].TerminalKey, results[i].Seq, results[i].LOA, results[i].Moulded_Beam, results[i].AirDraft, results[i].Draft, results[i].Length,
                    results[i].Depth, results[i].LoadDischargeRate, results[i].EquipmentQuantity, results[i].Travel, results[i].Outreach, results[i].StationaryAreaKey);
            }
            sendData += "]";
            console.log(sendData);
            res.jsonp(['200', sendData]);
        }
    });
});

//修改单个码头备注信息
router.get('/modifyOnePierRemark', function(req, res, next){
    var data=req.query;
    var reqParam=JSON.parse(data.param);
    console.log(reqParam.pierTerminalKey);
    var sql = util.format('UPDATE T2102_Terminal SET Des = "'+reqParam.remark+'" WHERE TerminalKey='+reqParam.pierTerminalKey);
    blmDbmysql.query(sql, function (err, results) {
        if(err){
            console.log(utils.eid1);
            res.jsonp(['304', utils.eid1]);
            console.log("here")
        }else {
            console.log("成功连接数据库");
        }
    });
});

//修改单个码头详细信息
router.get('/modifyOnePierDetail', function(req, res, next){
    var data=req.query;
    var reqParam=JSON.parse(data.param);
    console.log(reqParam);
    var sql = util.format("SELECT t1.PortID,t2.CompanyNumber,t3.CargoTypeKey FROM T2101_Port AS t1," +
        "T1101_Company AS t2,T9917_CargoType AS t3 WHERE t1.ENName = '%s' AND t2.ENName = '%s' AND t3.Name = '%s'",
        reqParam.PortName,reqParam.BelongotoCompanyName,reqParam.CargoTypeName);
    blmDbmysql.query(sql, function (err, results) {
        if(err){
            console.log(utils.eid1);
            res.jsonp(['304', utils.eid1]);
            console.log("here")
        }else {
            console.log("成功连接数据库");
            // console.log(results);
            // console.log(results[0]);
            var sqls = util.format("UPDATE T2102_Terminal SET NAME='%s',BerthQuantity='%s',Longitude='%s'," +
                "Latitude='%s',Salinity='%s',Location='%s',Tide='%s',ImportExportType='%s',PortID='%s'," +
                "BelongtoCompany='%s',CargoTypeKey='%s' WHERE TerminalKey='%s'",
                reqParam.Name,reqParam.BerthQuantity,reqParam.Longitude,reqParam.Latitude,
                reqParam.Salinity,reqParam.Location,reqParam.Tide,reqParam.ImportExportType,
                results[0].PortID,results[0].CompanyNumber,results[0].CargoTypeKey,reqParam.TerminalKey);
            blmDbmysql.query(sqls, function (err, results) {
                if(err){
                    console.log(utils.eid1);
                    res.jsonp(['304', utils.eid1]);
                    console.log("here")
                }else {
                    console.log("成功连接数据库");
                    res.send('修改成功');
                    // console.log(results);
                    // console.log(results[0]);
                }
            });
        }
    });
});
//添加单个码头详细信息
router.get('/addOnePier', function(req, res, next){
    var data=req.query;
    var reqParam=JSON.parse(data.param);
    console.log(123);
    console.log(reqParam);
    // var sql = util.format("SELECT t1.PortID FROM T2101_Port AS t1," +
    //     "T1101_Company AS t2,T9917_CargoType AS t3 WHERE t1.ENName = '%s' AND t2.ENName = '%s' AND t3.Name = '%s'",
    //     reqParam.PortName);
    // blmDbmysql.query(sql, function (err, results) {
    //     if(err){
    //         console.log(utils.eid1);
    //         res.jsonp(['404', utils.eid1]);
    //         console.log("here")
    //     }else {
    //         console.log("成功连接数据库");
    //         // console.log(results);
    //         console.log(results[0]);
            var sqls = util.format("INSERT INTO T2102_Terminal (TerminalKey,Name,PortID,BerthQuantity,Des," +
                "Location,Latitude,Longitude,Salinity,Tide,ImportExportType,BelongtoCompany,CargoTypeKey,Type) " +
                "VALUES ('%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s')",
                reqParam.TerminalKey,reqParam.Name,reqParam.PortID,reqParam.BerthQuantity,reqParam.Des,reqParam.Location,
                reqParam.Latitude,reqParam.Longitude,reqParam.Salinity,reqParam.Tide,reqParam.ImportExportType,
                reqParam.BelongotoCompanyName,reqParam.CargoTypeName,reqParam.Type);
            blmDbmysql.query(sqls, function (err, results) {
                if(err){
                    console.log(utils.eid1);
                    res.jsonp(['404', utils.eid1]);
                    console.log("here")
                }else {
                    console.log("成功连接数据库");
                    console.log(results);
                    res.send('添加成功');
                }
            });
    //     }
    // });
});

//删除单个码头信息
router.get('/deleteOnePier', function(req, res, next){
    var data=req.query;
    var reqParam=JSON.parse(data.param);
    console.log(reqParam.TerminalKey);
    var sql = util.format("DELETE FROM T2102_Terminal WHERE TerminalKey = '%s'",reqParam.TerminalKey);
    blmDbmysql.query(sql, function (err, results) {
        if(err){
            console.log(utils.eid1);
            res.jsonp(['304', utils.eid1]);
            console.log("here")
        }else {
            console.log("成功连接数据库");
            res.send('删除成功');
        }
    });
});

//添加单个泊位详细信息
router.get('/addOneberthDetail', function(req, res, next){
    var data=req.query;
    var reqParam=JSON.parse(data.param);
    console.log(reqParam);
    console.log(reqParam.PortID);
    var seq = reqParam.seq;
    if(reqParam.type=='1'){
        var sql1 = util.format("SELECT Seq FROM T2103_TerminalDetails WHERE StationaryAreaKey='%s' AND TerminalKey='%s'",
            reqParam.cluster_id,reqParam.TerminalKey);
        blmDbmysql.query(sql1, function (err, results) {
            if(err){
                console.log(utils.eid1);
                res.jsonp(['304', utils.eid1]);
                console.log("here")
            }else {
                console.log("成功连接数据库");
                console.log(results);
                if(results.length>0){
                    seq = results[0].Seq;
                }
                console.log(seq);
                var sql = util.format("UPDATE T2103_TerminalDetails SET TerminalKey='%s',Seq='%s',LOA='%s',Moulded_Beam='%s',AirDraft='%s',Draft='%s'," +
                    "LENGTH='%s',Depth='%s',LoadDischargeRate='%s',EquipmentQuantity='%s',Travel='%s',Outreach='%s', PortID ='%s'" +
                    "WHERE StationaryAreaKey='"+reqParam.cluster_id+"'",reqParam.TerminalKey,seq,reqParam.berth_LOA,reqParam.berth_Moulded_Beam,
                    reqParam.berth_AirDraft,reqParam.berth_draft,reqParam.berth_Length,reqParam.berth_Depth,reqParam.berth_LoadDischargeRate,
                    reqParam.berth_EquipmentQuantity,reqParam.berth_Travel,reqParam.berth_Outreach, reqParam.PortID);
                blmDbmysql.query(sql, function (err, results) {
                    if(err){
                        console.log(utils.eid1);
                        res.jsonp(['304', utils.eid1]);
                        console.log("here")
                    }else {
                        console.log("成功连接数据库");
                        res.send('修改成功');
                    }
                });
            }
        });
    }else if(reqParam.type=='0'){
        var sql3 = util.format("DELETE FROM T2104_Anchorage WHERE StationaryAreaKey='%s'",reqParam.cluster_id);
        blmDbmysql.query(sql3, function (err, results) {
            if(err){
                console.log(utils.eid1);
                res.jsonp(['304', utils.eid1]);
                console.log("here")
            }else {
                console.log("成功连接数据库");
                var sql = util.format("INSERT IGNORE INTO T2103_TerminalDetails (TerminalKey,Seq,LOA,Moulded_Beam," +
                    "AirDraft,Draft,LENGTH,Depth,LoadDischargeRate,EquipmentQuantity,Travel,Outreach,PortID,StationaryAreaKey) " +
                    "VALUES('"+reqParam.TerminalKey+"','"+seq+"','"+reqParam.berth_LOA+"','"+reqParam.berth_Moulded_Beam+
                    "','"+ reqParam.berth_AirDraft+"','"+reqParam.berth_draft+"','"+reqParam.berth_Length+"','"+reqParam.berth_Depth+
                    "','"+ reqParam.berth_LoadDischargeRate+"','" + reqParam.berth_EquipmentQuantity +"','"+reqParam.berth_Travel+"','"+reqParam.berth_Outreach+"','"+reqParam.PortID+"','"+reqParam.cluster_id+"')");
                blmDbmysql.query(sql, function (err, results) {
                    if(err){
                        console.log(utils.eid1);
                        res.jsonp(['304', utils.eid1]);
                        console.log("here")
                    }else {
                        console.log("成功连接数据库");
                        console.log(results);
                        res.send('修改成功');
                    }
                });
            }
        });
    }else{
        var sql = util.format("INSERT IGNORE INTO T2103_TerminalDetails (TerminalKey,Seq,LOA,Moulded_Beam," +
            "AirDraft,Draft,LENGTH,Depth,LoadDischargeRate,EquipmentQuantity,Travel,Outreach,PortID,StationaryAreaKey) " +
            "VALUES('"+reqParam.TerminalKey+"','"+seq+"','"+reqParam.berth_LOA+"','"+reqParam.berth_Moulded_Beam+
            "','"+ reqParam.berth_AirDraft+"','"+reqParam.berth_draft+"','"+reqParam.berth_Length+"','"+reqParam.berth_Depth+
            "','"+ reqParam.berth_LoadDischargeRate+"','" + reqParam.berth_EquipmentQuantity +"','"+reqParam.berth_Travel+"','"+reqParam.berth_Outreach+"','"+reqParam.PortID+"','"+reqParam.cluster_id+"')");
        blmDbmysql.query(sql, function (err, results) {
            if(err){
                console.log(utils.eid1);
                res.jsonp(['304', utils.eid1]);
                console.log("here")
            }else {
                console.log("成功连接数据库");
                console.log(results);
                res.send('添加成功');
            }
        });
    }
});


// '{"TerminalKey":"'+TerminalKey +'","seq":"'+seq+'","berth_LOA":"'+berth_LOA+'","berth_draft":"'+berth_draft+
// '","berth_AirDraft":"'+berth_AirDraft+'","berth_MouldedBeam":"'+berth_MouldedBeam+'","berth_Length":"'+berth_Length+'"' +
// ',"berth_Depth":"'+berth_Depth+'","berth_loaderNum":"'+berth_loaderNum+'","berth_loadingRate":"'+berth_loadingRate+'"' +
// ',"berth_mobile":"'+berth_mobile+'","berth_extend":"'+berth_extend+'"}';

// TerminalKey,Seq,LOA,Moulded_Beam," +
// "AirDraft,Draft,LENGTH,Depth,LoadDischargeRate,EquipmentQuantity,Travel,Outreach,PortID,CompanyNumber,StationaryAreaKey

//修改单个泊位详细信息
router.get('/modifyOneberthDetail', function(req, res, next){
    var data=req.query;
    var reqParam=JSON.parse(data.param);
    console.log(reqParam);
    var sql = util.format("UPDATE T2103_TerminalDetails SET LOA='%s',Moulded_Beam='%s',AirDraft='%s',Draft='%s'," +
        "LENGTH='%s',Depth='%s',LoadDischargeRate='%s',EquipmentQuantity='%s',Travel='%s',Outreach='%s' " +
        "WHERE TerminalKey='"+reqParam.TerminalKey+"' AND Seq='"+reqParam.seq+"'",reqParam.berth_LOA,reqParam.berth_MouldedBeam,
        reqParam.berth_AirDraft,reqParam.berth_draft,reqParam.berth_Length,reqParam.berth_Depth,reqParam.berth_loadingRate,
        reqParam.berth_loaderNum,reqParam.berth_mobile,reqParam.berth_extend);
    blmDbmysql.query(sql, function (err, results) {
        if(err){
            console.log(utils.eid1);
            res.jsonp(['304', utils.eid1]);
            console.log("here")
        }else {
            console.log("成功连接数据库");
            res.send('修改成功');
        }
    });
});

//删除单个泊位详细信息
router.get('/deleteOneberth', function(req, res, next){
    var data=req.query;
    var reqParam=JSON.parse(data.param);
    console.log(reqParam.TerminalKey);
    var sql = util.format("DELETE FROM T2103_TerminalDetails WHERE	TerminalKey='%s' AND Seq='%s'",reqParam.TerminalKey, reqParam.seq);
    blmDbmysql.query(sql, function (err, results) {
        if(err){
            console.log(utils.eid1);
            res.jsonp(['304', utils.eid1]);
            console.log("here")
        }else {
            console.log("成功连接数据库");
            res.send('删除成功');
        }
    });
});



/**
 * Created by ShiTianCi on 2017/6/27.
 */
//获取单个港口锚地列表
router.get('/reqOnePortAnchList', function(req, res, next){
    var data=req.query;
    var reqParam=JSON.parse(data.param);
    console.log(reqParam.PortID);
        var sql = util.format('SELECT t1.AnchorageKey,t1.Name,t1.Purpose,t1.Des,t2.ENName, t1.StationaryAreaKey FROM T2104_Anchorage AS t1 LEFT JOIN T2101_Port AS t2 ON t1.PortID=t2.PortID WHERE t1.PortID = '+reqParam.PortID);
    blmDbmysql.query(sql, function (err, results) {
        if(err){
            console.log(utils.eid1);
            res.jsonp(['304', utils.eid1]);
            console.log("here")
        }else {
            console.log("成功连接数据库");
            console.log(results);
            var sendData = "[";
            for(var i=0;i<results.length;i++){
                if (i > 0) {sendData += ",";}
                sendData += util.format('{"AnchorageKey":"%s", "Name":"%s", "Purpose":"%s", "Des":"%s", "ENName":"%s", "StationaryAreaKey": "%s"}',
                    results[i].AnchorageKey, results[i].Name, results[i].Purpose, results[i].Des, results[i].ENName, results[i].StationaryAreaKey);
            }

            sendData += "]";
            console.log(sendData);
            res.jsonp(['200', sendData]);
        }
    });
});
//修改单个锚地说明信息
router.get('/modifyOneAnchRemark', function(req, res, next){
    var data=req.query;
    var reqParam=JSON.parse(data.param);
    // console.log(reqParam.AnchorageKey);
    var sql = util.format('UPDATE T2104_Anchorage SET Des = "'+reqParam.remark+'" WHERE AnchorageKey='+reqParam.AnchorageKey);
    blmDbmysql.query(sql, function (err, results) {
        if(err){
            console.log(utils.eid1);
            res.jsonp(['304', utils.eid1]);
            console.log("here")
        }else {
            console.log("成功连接数据库");
            res.send('修改成功');
        }
    });
});
//修改单个锚地详细信息
router.get('/modifyOneAnchDetail', function(req, res, next){
    var data=req.query;
    var reqParam=JSON.parse(data.param);
    console.log(reqParam);
    var sql = util.format("SELECT PortID FROM T2101_Port WHERE ENName='%s'",
        reqParam.PortName);
    blmDbmysql.query(sql, function (err, results) {
        if(err){
            console.log(utils.eid1);
            res.jsonp(['304', utils.eid1]);
            console.log("here")
        }else {
            console.log("成功连接数据库");
            // console.log(results);
            // console.log(results[0]);
            var sqls = util.format("UPDATE T2104_Anchorage SET NAME='%s',Purpose='%s',PortID='%s' WHERE AnchorageKey='%s'",
                reqParam.Name,reqParam.Purpose,results[0].PortID,reqParam.AnchorageKey);
            blmDbmysql.query(sqls, function (err, results) {
                if(err){
                    console.log(utils.eid1);
                    res.jsonp(['304', utils.eid1]);
                    console.log("here")
                }else {
                    console.log("成功连接数据库");
                    res.send('修改成功');
                    // console.log(results);
                    // console.log(results[0]);
                }
            });
        }
    });
});
//添加单个锚地详细信息
router.get('/addOneAnch', function(req, res, next){
    var data=req.query;
    var reqParam=JSON.parse(data.param);
    console.log(reqParam);
    console.log(reqParam.type);
    if(reqParam.type=='1'){
        var sql1 = util.format("DELETE FROM T2103_TerminalDetails WHERE	StationaryAreaKey='%s'",reqParam.clusterId);
        blmDbmysql.query(sql1, function (err, results) {
            if(err){
                console.log(utils.eid1);
                res.jsonp(['304', utils.eid1]);
                console.log("here")
            }else {
                console.log("成功连接数据库");
                var sql = util.format("INSERT INTO T2104_Anchorage (PortID,AnchorageKey,NAME,Purpose,Des,StationaryAreaKey) " +
                    "VALUES ('%s','%s','%s','%s','%s','%s')",reqParam.PortID,reqParam.AnchorageKey,reqParam.Name,
                    reqParam.Purpose,reqParam.Des,reqParam.clusterId);
                console.log(sql);
                console.log(22);
                blmDbmysql.query(sql, function (err, results) {
                    if(err){
                        console.log(utils.eid1);
                        res.jsonp(['304', utils.eid1]);
                        console.log("here")
                    }else {
                        console.log("成功连接数据库");
                        res.send('添加成功');
                    }
                });
            }
        });
    }else if(reqParam.type=='0'){
        var sql2 = util.format("SELECT AnchorageKey FROM T2104_Anchorage WHERE StationaryAreaKey='%s'",reqParam.clusterId);
        blmDbmysql.query(sql2, function (err, results) {
            if(err){
                console.log(utils.eid1);
                res.jsonp(['304', utils.eid1]);
                console.log("here")
            }else {
                console.log("成功连接数据库");
                var sqls = util.format("UPDATE T2104_Anchorage SET Des='%s',NAME='%s',Purpose='%s',PortID='%s',AnchorageKey='%s' WHERE StationaryAreaKey='%s'",
                    reqParam.Des,reqParam.Name,reqParam.Purpose,reqParam.PortID,results[0].AnchorageKey,reqParam.clusterId);
                blmDbmysql.query(sqls, function (err, results) {
                    if(err){
                        console.log(utils.eid1);
                        res.jsonp(['304', utils.eid1]);
                        console.log("here")
                    }else {
                        console.log("成功连接数据库");
                        res.send('修改成功');
                    }
                });
            }
        });
    }else{
        var sql = util.format("INSERT INTO T2104_Anchorage (PortID,AnchorageKey,NAME,Purpose,Des,StationaryAreaKey) " +
            "VALUES ('%s','%s','%s','%s','%s','%s')",reqParam.PortID,reqParam.AnchorageKey,reqParam.Name,
            reqParam.Purpose,reqParam.Des,reqParam.clusterId);
        console.log(sql);
        blmDbmysql.query(sql, function (err, results) {
            if(err){
                console.log(utils.eid1);
                res.jsonp(['304', utils.eid1]);
                console.log("here")
            }else {
                console.log("成功连接数据库");
                res.send('添加成功');
            }
        });
    }

});

//删除单个锚地信息
router.get('/deleteOneAnch', function(req, res, next){
    var data=req.query;
    var reqParam=JSON.parse(data.param);
    console.log(reqParam.AnchorageKey);
    var sql = util.format("DELETE FROM T2104_Anchorage WHERE AnchorageKey = '%s'",reqParam.AnchorageKey);
    blmDbmysql.query(sql, function (err, results) {
        if(err){
            console.log(utils.eid1);
            res.jsonp(['304', utils.eid1]);
            console.log("here")
        }else {
            console.log("成功连接数据库");
            res.send('删除成功111');
        }
    });
});

//获取单个锚地经纬度列表
router.get('/reqOneAnchBLatLongList', function(req, res, next){
    var data=req.query;
    var reqParam=JSON.parse(data.param);
    console.log(reqParam.AnchorageKey);
    var sql = util.format('SELECT TerminalKey,Seq,LOA,Moulded_Beam,AirDraft,Draft,Length,Depth,' +
        'LoadDischargeRate,EquipmentQuantity,Travel,Outreach FROM T2103_TerminalDetails WHERE TerminalKey = '+reqParam.pierTerminalKey);
    blmDbmysql.query(sql, function (err, results) {
        if(err){
            console.log(utils.eid1);
            res.jsonp(['304', utils.eid1]);
            console.log("here")
        }else {
            console.log("成功连接数据库");
            console.log(results)
            var sendData = "[";
            for(var i=0;i<results.length;i++){
                if (i > 0) {sendData += ",";}
                sendData += util.format('{"TerminalKey":"%s", "Seq":"%s", "LOA":"%s", "Moulded_Beam":"%s", "AirDraft":"%s", "Draft":"%s", "Length":"%s"' +
                    ', "Depth":"%s", "LoadDischargeRate":"%s", "EquipmentQuantity":"%s", "Travel":"%s", "Outreach":"%s"}',
                    results[i].TerminalKey, results[i].Seq, results[i].LOA, results[i].Moulded_Beam, results[i].AirDraft, results[i].Draft, results[i].Length,
                    results[i].Depth, results[i].LoadDischargeRate, results[i].EquipmentQuantity, results[i].Travel, results[i].Outreach);
            }
            sendData += "]";
            console.log(sendData);
            res.jsonp(['200', sendData]);
        }
    });
});


//添加单个锚地经纬度
router.get('/addOneAnchLongLat', function(req, res, next){
    var data=req.query;
    var reqParam=JSON.parse(data.param);
    console.log(reqParam);
    var sql = util.format("INSERT IGNORE INTO T2103_TerminalDetails (TerminalKey,Seq,LOA,Moulded_Beam," +
        "AirDraft,Draft,LENGTH,Depth,LoadDischargeRate,EquipmentQuantity,Travel,Outreach,PortID,CompanyNumber,StationaryAreaKey) " +
        "VALUES('"+reqParam.TerminalKey+"','"+reqParam.seq+"','"+reqParam.berth_LOA+"','"+reqParam.berth_MouldedBeam+
        "','"+reqParam.berth_AirDraft+"','"+reqParam.berth_draft+"','"+reqParam.berth_Length+"','"+reqParam.berth_Depth+
        "','"+reqParam.berth_loadingRate+"','"+reqParam.berth_loaderNum+"','"+reqParam.berth_mobile+"','"+reqParam.berth_extend+"','0','','')");
    // console.log(sql);
    blmDbmysql.query(sql, function (err, results) {
        if(err){
            console.log(utils.eid1);
            res.jsonp(['304', utils.eid1]);
            console.log("here")
        }else {
            console.log("成功连接数据库");
            console.log(results);
            res.send('添加成功');
        }
    });
});

//修改单个锚地经纬度
router.get('/modifyOneAnchLongLat', function(req, res, next){
    var data=req.query;
    var reqParam=JSON.parse(data.param);
    console.log(reqParam);
    var sql = util.format("UPDATE T2103_TerminalDetails SET LOA='%s',Moulded_Beam='%s',AirDraft='%s',Draft='%s'," +
        "LENGTH='%s',Depth='%s',LoadDischargeRate='%s',EquipmentQuantity='%s',Travel='%s',Outreach='%s' " +
        "WHERE TerminalKey='"+reqParam.TerminalKey+"' AND Seq='"+reqParam.seq+"'",reqParam.berth_LOA,reqParam.berth_MouldedBeam,
        reqParam.berth_AirDraft,reqParam.berth_draft,reqParam.berth_Length,reqParam.berth_Depth,reqParam.berth_loadingRate,
        reqParam.berth_loaderNum,reqParam.berth_mobile,reqParam.berth_extend);
    blmDbmysql.query(sql, function (err, results) {
        if(err){
            console.log(utils.eid1);
            res.jsonp(['304', utils.eid1]);
            console.log("here")
        }else {
            console.log("成功连接数据库");
            res.send('修改成功');
        }
    });
});

//删除单个锚地经纬度
router.get('/deleteOneAnchLongLat', function(req, res, next){
    var data=req.query;
    var reqParam=JSON.parse(data.param);
    console.log(reqParam.TerminalKey);
    var sql = util.format("DELETE FROM T2103_TerminalDetails WHERE	TerminalKey='%s' AND Seq='%s'",reqParam.TerminalKey, reqParam.seq);
    blmDbmysql.query(sql, function (err, results) {
        if(err){
            console.log(utils.eid1);
            res.jsonp(['304', utils.eid1]);
            console.log("here")
        }else {
            console.log("成功连接数据库");
            res.send('删除成功');
        }
    });
});

//请求单个静止区域基本信息
router.get('/reqOneStillArea', function(req, res, next){
    var data=req.query;
    var reqParam=JSON.parse(data.param);
    console.log(reqParam.ClusterID);
    if(reqParam.ClusterType=='1'){
        var sql = util.format("SELECT t2.ENName,t3.Name,t1.LOA,t1.Moulded_Beam,t1.AirDraft,t1.Draft,t1.Length," +
            "t1.Depth,t1.LoadDischargeRate,t1.EquipmentQuantity,t1.Travel,t1.Outreach,t1.PortID,t1.TerminalKey FROM T2103_TerminalDetails " +
            "AS t1 LEFT JOIN T2101_Port AS t2 ON t1.PortID = t2.PortID LEFT JOIN T2102_Terminal AS t3 " +
            "ON t3.TerminalKey = t1.TerminalKey WHERE t1.StationaryAreaKey = '%s'",reqParam.ClusterID);
    }
    else if(reqParam.ClusterType=='0'){
        var sql = util.format("SELECT t2.ENName,t1.Name,t1.Purpose,t1.Des,t1.AnchorageKey,t1.PortID FROM T2104_Anchorage AS t1 " +
            "LEFT JOIN T2101_Port AS t2 ON t1.PortID = t2.PortID WHERE t1.StationaryAreaKey = '%s'", reqParam.ClusterID);
    }
    console.log(sql);
    blmDbmysql.query(sql, function (err, results) {
        if(err){
            console.log(utils.eid1);
            console.log("here");
            res.jsonp(['404', utils.eid1]);
        }else {
            console.log("成功连接数据库");
            if (results.length > 0) {
                var sendData = "[";
                if (reqParam.ClusterType == '1') {
                    sendData += util.format('{"ENName":"%s", "Name":"%s", "LOA":"%s", "Moulded_Beam":"%s", "AirDraft":"%s",' +
                        ' "Draft":"%s", "Length":"%s", "Depth":"%s", "LoadDischargeRate":"%s", "EquipmentQuantity":"%s",' +
                        ' "Travel":"%s", "Outreach":"%s", "PortID":"%s", "TerminalKey":"%s"}', results[0].ENName, results[0].Name, results[0].LOA, results[0].Moulded_Beam,
                        results[0].AirDraft, results[0].Draft, results[0].Length, results[0].Depth, results[0].LoadDischargeRate,
                        results[0].EquipmentQuantity, results[0].Travel, results[0].Outreach, results[0].PortID, results[0].TerminalKey);
                }
                else if (reqParam.ClusterType == '0') {
                    sendData += util.format('{"ENName":"%s", "Name":"%s", "Purpose":"%s", "Des":"%s", "AnchorageKey":"%s", "PortID":"%s"}',
                        results[0].ENName, results[0].Name, results[0].Purpose, results[0].Des, results[0].AnchorageKey, results[0].PortID);
                }
                sendData += "]";
                console.log(sendData);
                res.jsonp(['200', sendData]);
            }
            else{
                res.jsonp(['304', "return nothing"]);
            }
        }
    });
});

//从静止区域修改单个锚地详细信息
router.get('/modifyOneAnchDetailFromPort', function(req, res, next){
    var data=req.query;
    var reqParam=JSON.parse(data.param);
    console.log(reqParam);
    var sqls = util.format("UPDATE T2104_Anchorage SET NAME='%s',Purpose='%s',Des='%s' WHERE AnchorageKey='%s'",
        reqParam.Name,reqParam.Purpose,reqParam.Des,reqParam.AnchorageKey);
    blmDbmysql.query(sqls, function (err, results) {
        if(err){
            console.log(utils.eid1);
            res.jsonp(['304', utils.eid1]);
            console.log("here")
        }else {
            console.log("成功连接数据库");
            res.send('修改成功');
        }
    });
});

/**
 * 修改单个码泊位信息
 */
router.get('/modifyBerthDetail', function(req, res, next){
    var data = req.query;
    var sql = util.format("UPDATE T2103_TerminalDetails SET LOA='%s',Moulded_Beam='%s',AirDraft='%s',Draft='%s'," +
        "Length='%s',Depth='%s',LoadDischargeRate='%s',EquipmentQuantity='%s',Travel='%s',Outreach='%s', PortID = '%s', TerminalKey = '%s'， Seq = '%s'" +
        "WHERE StationaryAreaKey = %s", data.LOA, data.Moulded_Beam, data.AirDraft, data.Draft, data.Length, data.Depth,
            data.LoadDischargeRate, data.EquipmentQuantity, data.Travel, data.Outreach, data.PortID, data.TerminalKey, data.Seq, data.StationaryAreaKey);
    blmDbmysql.query(sql, function (err, results) {
        if(err){
            console.log(utils.eid1);
            res.jsonp(['304', utils.eid1]);
        }else {
            console.log("成功连接数据库");
            res.send(['200', '修改泊位详细信息成功']);
        }
    });
});

//添加码头部分，根据所属公司名字模糊查询公司名及其代码
router.get('/addPierSelectCompanyName', function(req, res, next){
    var data=req.query;
    var reqParam=JSON.parse(data.param);
    var sqls = util.format("SELECT ENName,CNName,CompanyNumber FROM T1101_Company WHERE CNName LIKE '"+reqParam.companyStr+"%' OR ENName LIKE '"+reqParam.companyStr+"%'",
        reqParam.companyStr);
    blmDbmysql.query(sqls, function (err, results) {
        if(err){
            console.log(utils.eid1);
            res.jsonp(['304', utils.eid1]);
            console.log("here")
        }else {
            console.log("成功连接数据库");
            console.log(results);
            if(results.length<=50&&results.length>0){
                var sendData = "[";
                var name = '';
                for(var i=0;i<results.length;i++){
                    if (i > 0) {sendData += ",";}
                    if(results[i].CNName!=null&&results[i].CNName!=''&&(results[i].ENName==''||results[i].ENName==null)){
                        name = results[i].CNName;
                    }else{}
                    sendData += util.format('{"ENName":"%s", "CNName":"%s", "CompanyNumber":"%s"}',
                        results[i].ENName, results[i].CNName, results[i].CompanyNumber);
                }
                sendData += "]";
                console.log(sendData);
                res.jsonp(['200', sendData]);
            }else{
                res.send('数据过多');
            }
        }
    });
});

// 作为中间路由传递
module.exports = router;