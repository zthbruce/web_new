/**
 * 泊位管理的函数和操作， 上部分为函数，下部分为操作事件
 * Created by Truth on 2017/7/27.
 */


/**
 * 获取码头详细信息
 * @param terminalKey
 */
function getPierDetail(terminalKey) {
    $.ajax({
        url: '/berth/getPierInfo',
        type: 'get',
        data: {TerminalKey: terminalKey},
        success: function (data) {
            console.log(data);
            // // 初始化
            // var cargo_ele = $("#cargo_type_key");
            // cargo_ele.val('');
            // var cargo_num_ele = cargo_ele.next();
            // cargo_num_ele.text('');
            if (data[0] === "200") {
                var jsonData = data[1];
                var pierInfo = jsonData[0]; // 获取当前码头信息
                // var cargoInfoList = jsonData["CargoType"];
                // $(".pierInfo_list").attr("terminalKey", terminalKey);
                port_name_ele.attr("port_id", pierInfo.PortID);
                port_name_ele.text(pierInfo.PortName);
                pier_name_ele.val(pierInfo.Name); // 码头名字
                // $("#company_name").val(pierInfo.BelongtoCompany); // 公司名字
                company_name_ele.attr("companyNumber", pierInfo.BelongtoCompany);
                company_name_ele.val(pierInfo.CompanyName); // 公司名字
                $("#berth_num").val(pierInfo.BerthQuantity); // 泊位数量
                // $("#tide").val(pierInfo.Tide); // 潮汐
                $("#import_export_type").text(pierInfo.ImportExportType); // 进出口
                var purpose_ele =  $("#use_type_key");
                purpose_ele.text(pierInfo.Purpose); // 用途
                purpose_ele.attr("value", pierInfo.PurposeID); // 赋值
                // // 获取货物信息
                // var cargoNum = cargoInfoList.length;
                // if(cargoNum >= 1){
                //     // 如果有数目就更新
                //     var cargoType = '';
                //     for(var i=0; i < cargoNum; i++){
                //         if(i > 0){
                //             cargoType += ", "
                //         }
                //         cargoType += cargoInfoList[i].Name;
                //     }
                //     cargo_ele.val(cargoType);
                //     cargo_num_ele.text("(" + cargoNum + ")");
                // }
                // 下拉列表更新
                getCargoTypeList(terminalKey);
                // getCargoInfo(TerminalKey)
                // var cargo_ele = $("#cargo_type_key");
                // cargo_ele.text(pierInfo.CargoType); // 货物类型
                // cargo_ele.attr(); // 货物类型
                // 经纬度的显示
                $("#LON_LAT").val(pierInfo.Latitude + ", " + pierInfo.Longitude);
                $("#LON_LAT").attr("numeric", pierInfo.LatitudeNumeric + "," + pierInfo.LongitudeNumeric);
                $("#location").val(pierInfo.Location); //位置
                $("#des").val(pierInfo.Des); // 说明
                // 获得码头下最近的疑似泊位
                getCloseBerthList(terminalKey, pierInfo.LongitudeNumeric, pierInfo.LatitudeNumeric, allPoints, 20, 10)
            }
            // 如果不属于某个数据, 就显示默认信息
        },
        error: function (err) {
            console.log(err);
        }
    });
}

/**
 * 根据输入的部分码头名来获取码头
 * @param pierStr
 */
function addPierSelectPierName(pierStr){
    // 清空列表
    $.ajax({
        url:'/berth/addPierSelectPierName',
        type:'get',
        data:{PierStr: pierStr},
        success: function(data){
            console.log(data);
            $("#pier_name_list").empty();
            if(data[0] === "200"){
                var jsonData = data[1];
                for(var i=0;i<jsonData.length;i++){
                    console.log(i);
                    var pierName = jsonData[i].Name;
                    var terminalKey =  jsonData[i].TerminalKey;
                    // 显示码头列表
                    $("#pier_name_list").append('<li terminalKey = ' + terminalKey + '>' + pierName + '</li>');
                }
                $("#pier_name_list").slideDown(200);
                // 点击选择按钮
                $('#pier_name_list>li').on('click', function () {
                    console.log($(this).text());
                    console.log($(this).attr("terminalKey"));
                    // $('#company_name').val($(this).text());
                    var terminalKey = $(this).attr("terminalKey");
                    $('#pier_name').attr("terminalKey", terminalKey);
                    $('#pier_name').val($(this).text());
                    // 刷新附近泊位信息
                    getPierDetail(terminalKey);
                    // getCloseBerthList(terminalKey, current_lon, current_lat, allPoints, 10, 20);
                    $(this).slideUp(400)
                });
            }
        },
        error: function(err){
            console.log(err);
        }
    });
}

/**
 * 根据输入的部分公司名来匹配数据库中的公司名
 * @param companyStr
 */
function addPierSelectCompanyName(companyStr){
    $.ajax({
        url:'/berth/addPierSelectCompanyName',
        type:'get',
        data:{companyStr: companyStr},
        success: function(data){
            // console.log(data);
            // 清空列表
            $("#company_name_list").empty();
            if(data[0] === "200"){
                var jsonData = data[1];
                for(var i=0;i<jsonData.length;i++){
                    var companyName = jsonData[i].Name;
                    var companyNumber =  jsonData[i].CompanyNumber;
                    // 显示公司列表
                    $("#company_name_list").append('<li companyNumber = ' + companyNumber + '>' + companyName + '</li>');
                }
                $("#company_name_list").slideDown(200);
                // 点击选择按钮
                $('#company_name_list>li').on('click', function () {
                    console.log($(this).text());
                    console.log($(this).attr("companyNumber"));
                    // $('#company_name').val($(this).text());
                    $('#company_name').attr("companyNumber", $(this).attr("companynumber"));
                    $('#company_name').val($(this).text());
                    $(this).slideUp(400)
                });
            }
        },
        error: function(err){
            console.log(err);
        }
    });
}
// /**
//  * 根据输入的部分码头名来匹配数据库中的码头名
//  * @param companyStr
//  */
// function addPierSelectPierName(pierStr){
//     $.ajax({
//         url:'/berth/addPierSelectPierName',
//         type:'get',
//         data:{companyStr: pierStr},
//         success: function(data){
//             console.log(data);
//             if(data[0] === "200"){
//                 var jsonData = data[1];
//                 for(var i=0;i<jsonData.length;i++){
//                     var pierName = jsonData[i].Name;
//                     var pierNumber =  jsonData[i].PierNumber;
//                     // 显示码头列表
//                     $("#pier_name_list").append('<li "pierNumber" = ' + pierNumber + '>' + pierName + '</li>');
//                 }
//                 $("#pier_name_list").slideDown(200);
//                 // 点击选择按钮
//                 $('#pier_name_list>li').on('click', function () {
//                     console.log($(this).text());
//                     // $('#company_name').val($(this).text());
//                     $('#pier_name').attr("pierNumber", $(this).attr("pierNumber"));
//                     $(".pierInfo_list").attr("terminalKey", $(this).attr("pierNumber"));
//                     $('#pier_name').val($(this).text());
//                     $(this).slideUp(400);
//                 });
//             }
//         },
//         error: function(err){
//             console.log(err);
//         }
//     });
// }


/**
 * 根据静止区域ID获取码头详情信息
 * @param clusterId
 * @param lon
 * @param lat
 */
var port_name_ele = $("#port_name");
var pier_name_ele = $("#pier_name");
var company_name_ele = $("#company_name");
function getPierInfo(clusterId, lon, lat){
    var title = $('.newBerthAnch_title');
    title.attr("lon", lon);
    title.attr("lat", lat);
    saveStatus = false; //
    console.log(lon+ "," + lat);
    var closePortList = getClosePortList(lon, lat, AllPortBasicList, 10);
    console.log(closePortList);
    /* 港口列表模块 */
    $("#berth_port_list").empty();
    for(var i = 0; i < closePortList.length; i++){
        var port = closePortList[i];
        $("#berth_port_list").append('<li port_id="'+port.PortID+'">'+port.ENName+'</li>');
    }
    // 可点击选择港口
    $('#berth_port_list>li').on('click', function () {
        $("#port_name").attr("port_id", $(this).attr("port_id"));
        $('#port_name').text($(this).text());
        changeBerthSaveButton(true);
        $(this).parent().slideUp(200);
    });
    // 请求码头信息
    $.ajax({
        url:'/berth/getTerminal',
        type:'get',
        data:{staticAreaKey : clusterId},
        success: function(data) {
            console.log(data);
            var terminalKey = "";
            if (data[0] === "200") {
                var jsonData = data[1];
                var pierInfo = jsonData[0]; // 获取当前码头信息
                // console.log(pierInfo);
                terminalKey = pierInfo.TerminalKey;
                getPierDetail(terminalKey)
                // $.ajax({
                //     url: '/berth/getPierInfo',
                //     type: 'get',
                //     data: {TerminalKey: terminalKey},
                //     success: function (data) {
                //         console.log(data);
                //         if (data[0] === "200") {
                //             var jsonData = data[1];
                //             var pierInfo = jsonData[0]; // 获取当前码头信息
                //             // $(".pierInfo_list").attr("terminalKey", terminalKey);
                //             port_name_ele.attr("port_id", pierInfo.PortID);
                //             port_name_ele.text(pierInfo.PortName);
                //             pier_name_ele.val(pierInfo.Name); // 码头名字
                //             // $("#company_name").val(pierInfo.BelongtoCompany); // 公司名字
                //             company_name_ele.attr("companyNumber", pierInfo.BelongtoCompany);
                //             company_name_ele.val(pierInfo.CompanyName); // 公司名字
                //             $("#berth_num").val(pierInfo.BerthQuantity); // 泊位数量
                //             $("#tide").val(pierInfo.Tide); // 潮汐
                //             $("#import_export_type").text(pierInfo.ImportExportType);
                //             $("#cargo_type_key").text(pierInfo.CargoTypeKey);
                //             // 经纬度的显示
                //             $("#LON_LAT").val(pierInfo.Latitude + ", " + pierInfo.Longitude);
                //             $("#LON_LAT").attr("numeric", pierInfo.LatitudeNumeric + "," + pierInfo.LongitudeNumeric);
                //             $("#location").val(pierInfo.Location); //位置
                //             $("#des").val(pierInfo.Des) // 说明
                //             // 获得码头下最近的疑似泊位
                //             getCloseBerthList(terminalKey, pierInfo.LongitudeNumeric, pierInfo.LatitudeNumeric, allPoints, 10, 20)
                //         }
                //         // 如果不属于某个数据, 就显示默认信息
                //     },
                //     error: function (err) {
                //         console.log(err);
                //     }
                // });
            }
            else {
                console.log("不属于任何码头");
                // $(".pierInfo_list").attr("terminalKey", "");
                var default_port = closePortList[0];
                port_name_ele.attr("port_id", default_port.PortID);
                port_name_ele.text(default_port.ENName);
                pier_name_ele.val("");
                company_name_ele.attr("companyNumber", "");
                company_name_ele.val("");
                $("#berth_num").val(""); // 泊位数量
                $("#location").val("");//位置
                $("#des").val("");// 说明
                // $(".pier_info>input").val(""); //初始化输入
                $("#import_export_type").text("进口");
                // $("#cargo_type_key").text("Iron Ore");
                // 经纬度显示当前泊位的中心点
                var latLonInfo = transLonLatToNormal(lat, lon);
                $("#LON_LAT").val(latLonInfo[0] + ", " + latLonInfo[1]);
                $("#LON_LAT").attr("numeric", lat + "," + lon);
                // 获得当前点附近的疑似泊位
                getCloseBerthList(terminalKey, lon, lat, allPoints, 20, 10);
                getCargoTypeList(terminalKey); // 获取对应的货物种类
            }
            // console.log(terminalKey);
            // 增加码头key值信息
            // $(".pierInfo_list").attr("terminalKey", terminalKey);
            pier_name_ele.attr("terminalKey", terminalKey);
            // getCloseBerthList(terminalKey, lon, lat, allPoints, 10, 20)
        }, error: function (err) {
                console.log(err);
            }
        })
}
// function getPierInfo(clusterId, lon, lat){
//     saveStatus = false; //
//     console.log(lon+ "," + lat);
//     var closePortList = getClosePortList(lon, lat, AllPortBasicList, 10);
//     console.log(closePortList);
//     /* 港口列表模块 */
//     $("#berth_port_list").empty();
//     for(var i = 0; i < closePortList.length; i++){
//         var port = closePortList[i];
//         $("#berth_port_list").append('<li port_id="'+port.PortID+'">'+port.ENName+'</li>');
//     }
//     // 可点击选择港口
//     $('#berth_port_list>li').on('click', function () {
//         $("#port_name").attr("port_id", $(this).attr("port_id"));
//         $('#port_name').text($(this).text());
//         changeBerthSaveButton(true);
//         $(this).parent().slideUp(200);
//     });
//     // 请求码头信息
//     $.ajax({
//         url:'/berth/getTerminal',
//         type:'get',
//         data:{staticAreaKey : clusterId},
//         success: function(data){
//             console.log(data);
//             // 如果有数据就显示当前码头数据
//             var terminalKey = "";
//             var port_name_ele = $("#port_name");
//             var pier_name_ele = $("#pier_name");
//             var company_name_ele = $("#company_name");
//             if(data[0] === "200"){
//                 var jsonData = data[1];
//                 var pierInfo = jsonData[0]; // 获取当前码头信息
//                 console.log(pierInfo);
//                 terminalKey = pierInfo.TerminalKey;
//                 // $(".pierInfo_list").attr("terminalKey", terminalKey);
//                 port_name_ele.attr("port_id", pierInfo.PortID);
//                 port_name_ele.text(pierInfo.PortName);
//                 pier_name_ele.val(pierInfo.Name); // 码头名字
//                 // $("#company_name").val(pierInfo.BelongtoCompany); // 公司名字
//                 company_name_ele.attr("companyNumber", pierInfo.BelongtoCompany);
//                 company_name_ele.val(pierInfo.CompanyName); // 公司名字
//                 $("#berth_num").val(pierInfo.BerthQuantity); // 泊位数量
//                 $("#tide").val(pierInfo.Tide); // 潮汐
//                 $("#import_export_type").text(pierInfo.ImportExportType);
//                 $("#cargo_type_key").text(pierInfo.CargoTypeKey);
//                 // 经纬度的显示
//                 $("#LON_LAT").val(pierInfo.Latitude + ", " + pierInfo.Longitude);
//                 $("#LON_LAT").attr("numeric", pierInfo.LatitudeNumeric + "," + pierInfo.LongitudeNumeric);
//                 $("#location").val(pierInfo.Location); //位置
//                 $("#des").val(pierInfo.Des) // 说明
//                 // 获得码头下最近的
//                 getCloseBerthList(terminalKey, pierInfo.LongitudeNumeric, pierInfo.LatitudeNumeric, allPoints, 10, 20)
//             }
//             // 如果没有数据, 就显示默认信息
//             else{
//                 console.log("不属于任何码头");
//                 // $(".pierInfo_list").attr("terminalKey", "");
//                 var default_port =  closePortList[0];
//                 port_name_ele.attr("port_id", default_port.PortID);
//                 port_name_ele.text(default_port.ENName);
//                 $("#pier_name").val("");
//                 company_name_ele.attr("companyNumber", "");
//                 company_name_ele.val("");
//                 $("#berth_num").val(""); // 泊位数量
//                 $("#location").val("");//位置
//                 $("#des").val("");// 说明
//                 // $(".pier_info>input").val(""); //初始化输入
//                 $("#import_export_type").text("进口");
//                 $("#cargo_type_key").text("Iron Ore");
//                 // 经纬度显示当前泊位的中心点
//                 var latLonInfo = transLonLatToNormal(lat, lon);
//                 $("#LON_LAT").val( latLonInfo[0] + ", " + latLonInfo[1]);
//                 $("#LON_LAT").attr("numeric", lat + "," + lon);
//                 // 获得当前点附近的疑似泊位
//                 getCloseBerthList(terminalKey, lon, lat, allPoints, 10, 20)
//             }
//             // console.log(terminalKey);
//             // 增加码头key值信息
//             // $(".pierInfo_list").attr("terminalKey", terminalKey);
//             pier_name_ele.attr("terminalKey", terminalKey);
//             // getCloseBerthList(terminalKey, lon, lat, allPoints, 10, 20)
//         },
//         error: function(err){
//             console.log(err);
//         }
//     });
// }

/**
 * 确认选择泊位的出现
 * @param status
 * @param staticAreaKey
 * @param lon
 * @param lat
 */
// var visible_berth_list = [];
function getBerthCheckPointer(status, staticAreaKey, lon, lat) {
    // var icon_feature = icon.getSource().getFeatureById(staticAreaKey);
    // icon_feature.setStyle(invisible_style); // 隐藏对应图标
    // visible_berth_list.push(staticAreaKey); // 更新隐藏列表
    // icon_feature.set("visible", false);
    var lat_lon = WGS84transformer(lat, lon);
    var fearure = new ol.Feature({
        pointer: 'berth',
        status: status,
        cluster_id: staticAreaKey,
        geometry: new ol.geom.Point(ol.proj.fromLonLat([lat_lon[1], lat_lon[0]]))
    });
    fearure.setId(staticAreaKey);
    fearure.setStyle(point_status[status]);
    current.getSource().addFeature(fearure);
}

/**
 * 更新当前所属泊位
 * @param ele
 * @param current_feature
 */
function updateChooseBerth(ele, current_feature) {
    var status = current_feature.get("status");
    // 改变选择图标
    if(status===0) {
        status = 1;
    }else{
        status = 0;
    }
    // 改变状态
    current_feature.set('status', status);
    current_feature.setStyle(point_status[status]);
    // 点击那一行高亮显示
    changeBerthSaveButton(true); // 改变保存状态
    // 第一个不允许修改状态
    // if($(this).attr('seq') === "1"){
    //     console.log("第一个不允许修改");
    //     return;
    // }
    // 高亮显示
    var li_ele = ele.parent().parent().parent();
    $('.berth_list>li').removeAttr("highLight");
    li_ele.attr("highLight", true);
    // 确认显示， 改变列表选择状态
    var ul_ele = ele.parent().next().children();
    if (ele.attr('class') === "notBelong") {
        // $(this).removeClass("notBelong");
        // $(this).addClass("belong");
        ele.attr("class", "belong");
        ul_ele.attr("status", "0")
    }else{
        // $(this).removeClass("belong");
        // $(this).addClass("notBelong");
        ele.attr("class", "notBelong");
        ul_ele.attr("status", "1")
    }
    // 改变对应码头的位置信息
    var i = 0;
    var lonSum = 0;
    var latSum = 0;
    $("[status='0']").each(function () {
        // console.log(i);
        i++;
        lonSum += parseFloat($(this).attr("lon"));
        latSum += parseFloat($(this).attr("lat"));
    });
    var lon_lat_ele = $("#LON_LAT");
    if(i > 0){
        var latCenter = latSum / i;
        var lonCenter = lonSum / i;
        var latLonInfo = transLonLatToNormal(latCenter, lonCenter);
        var lon_lat_info = latLonInfo[0] + "," + latLonInfo[1];
    }
    else{
        var latCenter = '';
        var lonCenter = '';
        var lon_lat_info = '';
    }
    lon_lat_ele.val(lon_lat_info);
    lon_lat_ele.attr("numeric", latCenter + "," + lonCenter);
}

/**
 * 根据当前中心点，获取公里范围内的泊位列表
 * @param terminalKey 码头ID， 如果为空
 * @param centerLon
 * @param centerLat
 * @param allPoints
 * @param n
 * @param maxDistance
 */
function getCloseBerthList(terminalKey, centerLon, centerLat, allPoints, n, maxDistance){
    // 首先会获取该码头下的stationAreaKey
    // console.log("here");
    var title = $('.newBerthAnch_title');
    // 如果经纬度为空，那么选取当前点的经纬度
    if(centerLon === 0.0 && centerLat === 0.0){
        centerLon = parseFloat(title.attr("lon"));
        centerLat = parseFloat(title.attr("lat"));
    }
    var belongDistanceList = {};
    $.ajax({
        url:'/berth/getBerthListFromPier',
        type:'get',
        data:{TerminalKey: terminalKey},
        success: function(data){
            console.log(data);
            if(data[0] === "200") {
                belongDistanceList = data[1];
            }
            var distanceList = [];
            // 遍历所有静止区域中心点
            for(var key in allPoints) {
                var ele = allPoints[key];
                var type = ele['type']; // 属于哪一类， 目前有0：锚地， 1：泊位， 2：未知区域
                if(type === 1){
                    var lon = ele['lon'];
                    var lat = ele['lat'];
                    var distance = getGreatCircleDistance(centerLon, centerLat, lon, lat);
                    if(distance <= maxDistance){
                        var status = 1; // 1表示默认不属于该码头
                        var info = {LOA: "", Moulded_Beam: "", Draft: "", LoadDischargeRate: ""};
                        if(key in belongDistanceList){
                            status = 0; // 属于该码头的泊位状态
                            info = belongDistanceList[key];
                        }
                        distanceList.push({cluster_id: key, distance: distance, status: status, LOA: info.LOA, Moulded_Beam: info.Moulded_Beam,
                            Draft: info.Draft, LoadDischargeRate: info.LoadDischargeRate})
                    }
                }
            }
            // 按照从小到大的顺序
            distanceList.sort(function (x, y) {
                if(x.status < y.status){
                    return -1;
                }
                if(x.status > y.status){
                    return 1;
                }
                if(isNaN(x.distance)){
                    return 1
                }
                if(isNaN(y.distance)){
                    return -1
                }
                return (x.distance  - y.distance)
            });

            // 获取最近的N个静止区域的统计信息列表
            var len = distanceList.length;
            // console.log("长度为:" + len);
            n = Math.min(len, n);
            // 初始化泊位列表
            $(".berth_list").empty();
            var num = 0;
            current.getSource().clear(); // 清空当前图层
            // visible_berth_list = []; // 隐藏图标
            for(var i = 0; i < n; i++){
                var berthInfo = distanceList[i];
                var staticAreaKey = berthInfo.cluster_id;
                status = berthInfo.status;
                var belongStatus = status === 0 ? "belong" : "notBelong";
                var ele = allPoints[staticAreaKey];
                var belongTerminalKey = ele.TerminalKey === 'null'? '': ele.TerminalKey;
                // 如果还没有归属的或者是当前码头的情况
                if(ele.Checked === 0 || terminalKey === belongTerminalKey) {
                    // 将信息写入html, 并赋予一个状态,根据状态进行筛选
                    // 当前静止区域默认属于
                    num++;
                    // 第一个默认属于该码头
                    // if (i === 0) {
                    //     belongStatus = "belong";
                    //     status = 0;
                    // }
                    // 图上显示确认图标
                    getBerthCheckPointer(status, staticAreaKey, ele.lon, ele.lat);
                    // getCheckPointer(status, staticAreaKey, ele.lon, ele.lat);
                    // 显示列表
                    var str = '<li><ul class="oneBerth_info"><li>' + num + '</li><li><span class = ' + belongStatus + ' seq=' + num + '>' +
                        '</span></li> <li> <ul class="oneBerth_list" status=' + status + ' staticAreaKey = ' + staticAreaKey + ' lon = ' + ele.lon + ' lat=' + ele.lat + '><li>LOA: '
                        + ele.LOA_MAX + ' m</li><li>Beam: ' + ele.BEAM_MAX + ' m</li><li>Draft: ' + ele.DRAFT_MAX + ' m</li> <li>DWT: ' + ele.DWT_MAX
                        + ' T</li><li>长: <input type="text" placeholder="0.00" value=' + berthInfo.LOA + '>M</li> <li>宽: <input type="text" placeholder="0.00" value=' + berthInfo.Moulded_Beam + '>M</li> ' +
                        '<li>深: <input type="text" placeholder="0.00" value=' + berthInfo.Draft + '>M</li> <li>装载率: <input type="text" placeholder="0.00" value=' + berthInfo.LoadDischargeRate + '>t/h</li></ul> </li> </ul> </li>';
                    $(".berth_list").append(str);
                }
            }
            // 点击是否属于按钮
            $(".oneBerth_info>li:nth-child(2)>span").click(function () {
                var staticAreaKey = $(this).parent().next().children().attr("staticareakey");
                // console.log(staticAreaKey);
                var current_feature = current.getSource().getFeatureById(staticAreaKey);
                updateChooseBerth($(this), current_feature);
                // changeBerthSaveButton(true); // 改变保存状态
                // // 第一个不允许修改状态
                // // if($(this).attr('seq') === "1"){
                // //     console.log("第一个不允许修改");
                // //     return;
                // // }
                // if ($(this).attr('class') === "notBelong") {
                //     // $(this).removeClass("notBelong");
                //     // $(this).addClass("belong");
                //     $(this).attr("class", "belong");
                //     $(this).parent().next().children().attr("status", "0")
                // }else{
                //     // $(this).removeClass("belong");
                //     // $(this).addClass("notBelong");
                //     $(this).attr("class", "notBelong");
                //     $(this).parent().next().children().attr("status", "1")
                // }
                // // 改变对应码头的位置信息
                // var i = 0;
                // var lonSum = 0;
                // var latSum = 0;
                // $("[status='0']").each(function () {
                //     console.log(i);
                //     i++;
                //     lonSum += parseFloat($(this).attr("lon"));
                //     latSum += parseFloat($(this).attr("lat"));
                // });
                // var lon_lat_ele = $("#LON_LAT");
                // if(i > 0){
                //     var latCenter = latSum / i;
                //     var lonCenter = lonSum / i;
                //     var latLonInfo = transLonLatToNormal(latCenter, lonCenter);
                //     var lon_lat_info = latLonInfo[0] + "," + latLonInfo[1];
                // }
                // else{
                //     var latCenter = '';
                //     var lonCenter = '';
                //     var lon_lat_info = '';
                // }
                // lon_lat_ele.val(lon_lat_info);
                // lon_lat_ele.attr("numeric", latCenter + "," + lonCenter);
            });
            // 监听输入
            $('.oneBerth_list>li>input, .pier_BerthNum>input').keyup(function(){
            // $('.oneBerth_list>li>input').keyup(function(){
                console.log("输入信息");
                var nowVal = $(this).val();
                if(isNaN(nowVal)){
                    // dataIsEffective=false;
                    changeBerthSaveButton(false); //
                    // $(this).css({'border-color':'#f00','box-shadow':'0px 0px 1px 1px #f00'});
                    $(this).css({'color':'#f00'});
                }
                else{
                    $(this).css({'color':'#060205'});
                    changeBerthSaveButton(true);
                }
            });
        },
        error: function(err){
            console.log(err);
        }
    });
}

/**
 * 获取目前归为该码头下泊位的输入信息
 * @param portID
 * @param terminalKey
 * @returns {Array}
 */
function getBerthList(portID, terminalKey) {
    var berthList = [];
    var i = 0;
    $("[status='0']").each(function () {
        i++;
        var LOA = $(this).children().eq(4).children().val();
        var BEAM = $(this).children().eq(5).children().val();
        var DRAFT = $(this).children().eq(6).children().val();
        var LoadRate = $(this).children().eq(7).children().val();
        var staticAreaKey = $(this).attr("staticAreaKey");
        berthList.push({TerminalKey:terminalKey, Seq:i, LOA: LOA, Moulded_Beam: BEAM, Draft: DRAFT,
            LoadDischargeRate: LoadRate, StationaryAreaKey:staticAreaKey})
    });
    return berthList;
}

/**
 * 获取货物类型列表
 */
// var cargoTypeList = {};
function getCargoTypeList(terminalKey) {
    var cargoType_ul = $(".pier_CargoType>ul");
    // 初始化
    var cargo_ele = $("#cargo_type_key");
    cargo_ele.val('');
    var cargo_num_ele = cargo_ele.next();
    cargo_num_ele.text('');
    $.ajax({
        url:"/berth/getCargoType",
        type:'get',
        success: function(data){
            var cargoInfo = data[1];
            // var cargoList2Terminal = [];
            $.ajax({
                url: "/berth/getCargo2Terminal",
                type: 'get',
                data:{TerminalKey: terminalKey},
                success: function (data) {
                    // 获取货物信息
                    // 内容显示
                    var cargoList2Terminal = [];
                    if(data[0] === '200') {
                        var cargoInfoList = data[1];
                        var cargoNum = cargoInfoList.length;
                        var cargoType = '';
                        for (var i = 0; i < cargoNum; i++) {
                            var cargo = cargoInfoList[i];
                            if (i > 0) {
                                cargoType += ", "
                            }
                            cargoList2Terminal.push(cargo.CargoTypeKey);
                            // console.log(cargo.Name);
                            cargoType += cargo.Name;
                        }
                        cargo_ele.val(cargoType);
                        cargo_num_ele.text("(" + cargoNum + ")");
                    }
                    // 列表显示
                    cargoType_ul.empty(); // 初始化
                    var str = '';
                    console.log(cargoList2Terminal);
                    for(var i = 0; i < cargoInfo.length; i++){
                        var cargoType = cargoInfo[i];
                        console.log(cargoType.ID);
                        if(cargoList2Terminal.indexOf(cargoType.ID) !== -1){
                            str += '<li><label for=' + cargoType.ID +'><input type="checkbox" checked="checked" id=' + cargoType.ID + '>' +
                                cargoType.Name + '</label></li>'
                        }
                        else{
                            str += '<li><label for=' + cargoType.ID +'><input type="checkbox"  id=' + cargoType.ID + '>' +
                                cargoType.Name + '</label></li>'
                        }
                    }
                    cargoType_ul.append(str);
                }
            })
        }
    })
}
// getCargoTypeList();



/**
 * 根据所选的泊位改变码头位置信息
 * @param berthLonLatList [[lon, lat], [lon, lat], ...]
 * @return
 */
// function changePierCenter(berthLonLatList) {
//     var lonSum = 0;
//     var latSum = 0;
//     var len = berthLonLatList.length;
//     for(var i = 0; i < len; i++){
//         lonSum += berthLonLatList[i][0];
//         latSum += berthLonLatList[i][1];
//     }
//     return [lonSum / len, latSum / len]
// }




/*********************************分割线*******************************************************************************/
// 交互事件模块
/**
 * 地图弹出框拖动事件
 */
var newBerthDown = false; //泊位管理弹出框
var newAnchDown = false; //泊位管理弹出框
var newBerthStatDown = false; //泊位信息统计弹出框
var DivLeft;
var DivTop;

// 拖动效果
$('.newBerthAnch_title').mousedown(function(event){
    var changeDivId = $(this).parent().attr('id');
    if(changeDivId=='newBerth'){newBerthDown = true;}
    if(changeDivId=='newAnch'){newAnchDown = true;}
    if(changeDivId=='newBerthStatistics'){newBerthStatDown = true;}
    DivLeft = event.clientX - $(this).offset().left;
    DivTop = event.clientY - $(this).offset().top;
    $(this).css('cursor','all-scroll');
});
var portDivZIndex = 0;
$('#newBerth,#newAnch,#newBerthStatistics').click(function(){
    portDivZIndex++;
    $(this).css('zIndex',portDivZIndex);
});

$('.newBerthAnch_title').mouseup(function(){
    var changeDivId = $(this).parent().attr('id');
    if(changeDivId=='newBerth'){newBerthDown = false;}
    if(changeDivId=='newAnch'){newAnchDown = false;}
    if(changeDivId=='newBerthStatistics'){newBerthStatDown = false;}
    $(this).css('cursor','auto');
});

$(window).mousemove(function(event){
    var newLeft = event.clientX-DivLeft;
    var newTop = event.clientY-DivTop;
    if(newLeft<=0){newLeft = 0;}
    if(newTop<=0){newTop = 0;}
    if(newBerthDown){
        if(newLeft>$(document).width()-$('#newBerth>.newBerthAnch_title').width()){newLeft = $(document).width()-$('#newBerth>.newBerthAnch_title').width();}
        if(newTop>$(window).height()-$('#newBerth>.newBerthAnch_title').height()){newTop = $(window).height()-$('#newBerth>.newBerthAnch_title').height();}
        $('#newBerth').offset({top:newTop,left:newLeft});
    }else if(newAnchDown){
        if(newLeft>$(document).width()-$('#newAnch>.newBerthAnch_title').width()){newLeft = $(document).width()-$('#newAnch>.newBerthAnch_title').width();}
        if(newTop>$(window).height()-$('#newAnch>.newBerthAnch_title').height()){newTop = $(window).height()-$('#newAnch>.newBerthAnch_title').height();}
        $('#newAnch').offset({top:newTop,left:newLeft});
    }else if(newBerthStatDown){
        if(newLeft>$(document).width()-$('#newBerthStatistics>.newBerthAnch_title').width()){newLeft = $(document).width()-$('#newBerthStatistics>.newBerthAnch_title').width();}
        if(newTop>$(window).height()-$('#newBerthStatistics>.newBerthAnch_title').height()){newTop = $(window).height()-$('#newBerthStatistics>.newBerthAnch_title').height();}
        $('#newBerthStatistics').offset({top:newTop,left:newLeft});
    }
});

// 输入下拉框
$('.span_select>span:nth-child(2),.pier_CargoType>span:nth-child(2)').click(function(){
    $(this).next('ul').slideDown(200);
});

$('.span_select,.input_select,.pier_CargoType').mouseleave(function(){
    $(this).children('ul').slideUp(200);
});

// 选择下拉框 按钮
$('.span_select>ul>li,.input_select>ul>li').click(function(){
    var val = $(this).text();
    $(this).parent().prev('span').text(val);
    $(this).parent().prev('input').val(val);
    $(this).parent().slideUp(200);
    changeBerthSaveButton(true);
});

// 用途下拉
$(".pier_UseType>ul>li").click(function() {
    var val = $(this).text();
    var purpose_span = $(this).parent().prev('span');
    purpose_span.text(val);
    purpose_span.attr("value", $(this).attr('value'));
    $(this).parent().slideUp(200);
    changeBerthSaveButton(true);
});

//货物多选按钮点击
$('.pier_CargoType>ul').delegate("li", "click", function(){
    var CargoTextArr = [];
    var CargoTextStr = '';
    var CargoTextLength = $(this).parent().find('input:checked').length;
    for(var i=0;i<CargoTextLength;i++){
        if(i>0){CargoTextStr+=", ";}
        var CargoText = $(this).parent().find('input:checked').eq(i).parent().text();
        CargoTextArr.push(CargoText);
        CargoTextStr += CargoText;
    }
    var cargo_type_key_ele = $('#cargo_type_key');
    cargo_type_key_ele.val(CargoTextStr);
    cargo_type_key_ele.next('span').text('('+CargoTextLength+')');
    changeBerthSaveButton(true);
});

// 泊位管理界面关闭
$('#berth_cancel').click(function () {
    // var features = icon.getSource().getFeatures();
    // for(var i =0; i< visible_berth_list.length; i++){
    //     var cluster_id  = visible_berth_list[i];
    //     var feature = icon.getSource().getFeatureById(cluster_id);
    //     if(feature.get('Checked') === 0){
    //         feature.setStyle(park_style[1]);
    //     }
    //     else{
    //         feature.setStyle(berth_yes);
    //     }
    // }
    $('#newBerth').fadeOut("normal");
    current.getSource().clear();
    position.getSource().clear();
});

// 港口下拉框的点击
$('#berth_port_list>li').on('click', function () {
    console.log("click port");
   $('#port_name').text($(this).text())
});

// var pierStatus = false;
// var berthStatus = false;
// var saveStatus = false;
// 关于保存按钮的状态

// 保存按钮单击事件
$('#berth_save').click(function () {
    console.log("保存当前信息");
    changeBerthSaveButton(false); // 改变按钮
    // 公司ID
    var companyNumber = $("#company_name").attr('companynumber');
    var companyName = $("#company_name").val();
    // 保存公司信息
    if(companyName !== '' && companyNumber === ""){
        companyNumber = 'C' + generateNewPierKey();
        // 公司信息入库
        $.ajax({
            url: '/berth/savePierCompany',
            type: 'get',
            data: {CompanyNumber: companyNumber, Name:companyName},
            success: function (data) {
                console.log(data[1])
            },
            error: function (err) {
                console.log(err);
            }
        });
    }

    // var terminalKey = $(".pierInfo_list").attr("terminalKey"); //TerminalKey
    // 码头ID 生成
    var terminalKey = $("#pier_name").attr("terminalKey"); //TerminalKey
    if (terminalKey === "") {
        // 生成一个码头ID
        terminalKey = generateNewPierKey();
    }
    var portID = $("#port_name").attr("port_id");
    // 码头发生改变时保存码头信息
    console.log("保存码头信息");
    var lat = '';
    var lon = '';
    var Lat_Lon = $("#LON_LAT").val().split(",");
    if(Lat_Lon.length > 1){
        lat = Lat_Lon[0];
        lon = Lat_Lon[1];
    }
    var Lat_Lon_Numeric = $("#LON_LAT").attr("numeric").split(",");
    var lat_numeric = Lat_Lon_Numeric[0];
    var lon_numeric = Lat_Lon_Numeric[1];
    var reqPram = {
        TerminalKey: terminalKey,
        Name: $("#pier_name").val(),
        PortID: portID,
        // BelongtoCompany: $("#company_name").val(),
        BelongtoCompany: companyNumber,
        BerthQuantity: $("#berth_num").val(),
        ImportExportType: $("#import_export_type").text(),
        Purpose: $("#use_type_key").attr("value"),
        // CargoTypeKey: $("#cargo_type_key").text(),
        LatitudeNumeric: lat_numeric,
        LongitudeNumeric: lon_numeric,
        Latitude: lat,
        Longitude: lon,
        Location: $("#location").val(),
        Des: $("#des").val()
    };
    $.ajax({
        url: '/berth/saveTerminal',
        type: 'get',
        data: reqPram,
        success: function (data) {
            console.log(data[1])
        },
        error: function (err) {
            console.log(err);
        }
    });
    // 保存货物信息
    var choose_ele_list = $('.pier_CargoType>ul').find("input:checked");
    var cargoList = [];
    console.log(choose_ele_list.length);
    for(var j = 0; j < choose_ele_list.length; j++){
        // console.log(choose_ele_list.eq(j).attr("id"));
        cargoList.push(choose_ele_list.eq(j).attr("id"));
    }
    console.log(cargoList);
    $.ajax({
        url: '/berth/saveCargoInfo',
        type: 'get',
        data: {TerminalKey: terminalKey, CargoList: cargoList},
        success: function (data) {
            console.log(data[1])
        },
        error: function (err) {
            console.log(err);
        }
    });


    // 保存泊位信息
    // var berthList = getBerthList(portID, terminalKey);
    // 内存信息更新
    var berthList = [];
    var i = 0;
    // $("[status='0']").each(function () {
    //     i++;
    //     var LOA = $(this).children().eq(4).children().val();
    //     var BEAM = $(this).children().eq(5).children().val();
    //     var DRAFT = $(this).children().eq(6).children().val();
    //     var LoadRate = $(this).children().eq(7).children().val();
    //     var staticAreaKey = $(this).attr("staticAreaKey");
    //     berthList.push({TerminalKey:terminalKey, Seq:i, LOA: LOA, Moulded_Beam: BEAM, Draft: DRAFT,
    //         LoadDischargeRate: LoadRate, StationaryAreaKey:staticAreaKey})
    // });
    // return berthList;
    $("[status='0']").each(function () {
        var staticAreaKey = $(this).attr("staticAreaKey");
        i++;
        var LOA = $(this).children().eq(4).children().val();
        var BEAM = $(this).children().eq(5).children().val();
        var DRAFT = $(this).children().eq(6).children().val();
        var LoadRate = $(this).children().eq(7).children().val();
        // var staticAreaKey = $(this).attr("staticAreaKey");
        berthList.push({TerminalKey:terminalKey, Seq:i, LOA: LOA, Moulded_Beam: BEAM, Draft: DRAFT,
            LoadDischargeRate: LoadRate, StationaryAreaKey:staticAreaKey});
        var feature = icon.getSource().getFeatureById(staticAreaKey);
        allPoints[staticAreaKey]["Checked"] = 1; // 更新状态
        allPoints[staticAreaKey]['TerminalKey'] = terminalKey; // 更新码头值
        feature.setStyle(berth_yes);
    });
    $("[status='1']").each(function () {
        var staticAreaKey = $(this).attr("staticAreaKey");
        console.log(staticAreaKey);
        var feature = icon.getSource().getFeatureById(staticAreaKey);
        allPoints[staticAreaKey]["Checked"] = 0;
        allPoints[staticAreaKey]['TerminalKey'] = '';
        feature.setStyle(berth_style);
    });
    console.log("保存泊位信息");
    $.ajax({
        url: '/berth/saveBerthList',
        type: 'get',
        data: {berthList: berthList, TerminalKey: terminalKey},
        success: function (data) {
            console.log(data[1]);
            // $('.alert').html('保存信息成功').addClass('alert-success').show().delay(1000).fadeOut();
        },
        error: function (err) {
            console.log(err);
        }
    });
    // 弹出框消失
    $('#newBerth').fadeOut("normal");
    current.getSource().clear();
    position.getSource().clear();
});

// 统计按钮
$('#berth_statistic').click(function(){
    // $('#newBerth').fadeOut("normal");
    var berthZIndex = $('#newBerth').css('zIndex');
    berthZIndex++;
    console.log(berthZIndex);
    $('#newBerthStatistics').fadeIn(600);
    $('#newBerthStatistics').css('zIndex',berthZIndex);
    var shipType = $('#newBerthStatistics .berthStat_shipType>span:nth-child(2)').text();
    var staticareakey = $('#newBerth>.berth_list>li:first-child .oneBerth_list').attr('staticareakey');
    reqBerthStaticData(shipType,staticareakey);
});


// 监听码头信息, 改变码头修改状态
$('.pierInfo_list>.pier_info').bind('input propertychange',function() {
    //进行相关操作
    // content_is_changed = true;
    // pierStatus = true;
    // 将状态保存为可保存状态
    changeBerthSaveButton(true);
});

// 公司名称字符匹配
$('.company_select>input').keyup(function(){
    console.log("输入公司信息");
    var nowVal = $(this).val();
    // 做一下规范化,将" '等符号正则化
    nowVal = nowVal.replace(/[\'\"]/g,"");
    $('#company_name').attr("companyNumber", '');
    // 根据输入字符串请求数据
    addPierSelectCompanyName(nowVal);
    // 根据字符串向数据库请求
});

// 码头名称字符匹配
$('.pier_select>input').keyup(function(){
    console.log("输入码头名称");
    var nowVal = $(this).val();
    // 做一下规范化,将" '等符号正则化
    nowVal = nowVal.replace(/[\'\"]/g,"");
    // $('#pier_name').attr("terminalKey", '');
    // 根据输入字符串请求数据
    addPierSelectPierName(nowVal);
    // 根据字符串向数据库请求
});

// 点击状态会定位
// $(".berth_list").delegate("li>ul>li:nth-child(3)", "click",function(){
//     // var lon = parseFloat($(this).find($(".oneBerth_list")).attr("lon"));
//     // var lat = parseFloat($(this).find($(".oneBerth_list")).attr("lat"));
//     var lon = parseFloat($(this).children().attr("lon"));
//     var lat = parseFloat($(this).children().attr("lat"));
//     console.log(lon + "," + lat);
//     var position_feature = new ol.Feature({
//         geometry: new ol.geom.Point(ol.proj.fromLonLat([lon, lat]))
//     });
//     position_feature.setStyle(position_style);
//     position.getSource().clear();
//     // console.log(position_feature);
//     position.getSource().addFeatures([position_feature]);
// });

$('.berth_list').delegate('li', 'click', function () {
    $('.berth_list>li').removeAttr("highLight");
    $(this).attr("highLight", true);
});

/**
 * 根据保存状态，改变按钮状态
 * @param saveStatus
 */
function changeBerthSaveButton(saveStatus) {
    if(saveStatus){
        $('#berth_save').removeAttr("style");
        $('#berth_save').removeAttr("disabled")
    }
    else{
        $('#berth_save').attr("style", "background:#ccc");
        $('#berth_save').attr("disabled", "disabled")
    }
}




/**
 * 泊位统计分析弹出框事件
 */
//弹出框关闭事件
$('.newBerthAnch_title>.close_btn').click(function(){
    $(this).parent().parent().css('display','none');
    // $('#newBerth').fadeIn(600);
});
//船舶类型选择
$('.berthStat_shipType>ul>li').click(function(){
    var shipType = $(this).text();
    $('.berthStat_shipType>span:nth-child(2)').text(shipType);
    $(this).parent().slideUp(200);
    //获取统计数据
    var staticareakey = $('#newBerth>.berth_list>li:first-child .oneBerth_list').attr('staticareakey');
    reqBerthStaticData(shipType,staticareakey);
});

//设置获取泊位统计数据函数
function reqBerthStaticData(shipType,staticareakey){
    // console.log(shipType);
    var param = '{"shipType":"'+shipType+'","staticareakey":"'+staticareakey+'"}';
    $.ajax({
        url:'/berth/reqShipStaticData',
        type:'get',
        data:{param:param},
        success: function(data){
            // console.log(data);
            var sendData = data[1];
            var jsonData = JSON.parse(sendData);
            // console.log(jsonData);
            $('#BerthStatistics>tbody').empty();
            var MAXLOA = [0,0,0,0,0,0,0,0,0,0,0,0];
            var MAXBEAM = [0,0,0,0,0,0,0,0,0,0,0,0];
            var MAXDRAFT = [0,0,0,0,0,0,0,0,0,0,0,0];
            var MAXDWT = [0,0,0,0,0,0,0,0,0,0,0,0];
            var MAXDTPH = [0,0,0,0,0,0,0,0,0,0,0,0];
            for(var i=0;i<jsonData.length;i++) {
                var j = parseInt(jsonData[i].Date.substr(4,2))-1;
                var LOA = jsonData[i].LOA=='null' ? 0 : parseFloat(jsonData[i].LOA);
                var BRAM = jsonData[i].MouldedBeam=='null' ? 0 : parseFloat(jsonData[i].MouldedBeam);
                var DRAFT = jsonData[i].DesignedDraft=='null' ? 0 : parseFloat(jsonData[i].DesignedDraft);
                var DWT = jsonData[i].DWT=='null' ? 0 : parseInt(jsonData[i].DWT);
                var DTPH = jsonData[i].DTPH=='null' ? 0 : parseFloat(jsonData[i].DTPH);
                if(LOA > parseFloat(MAXLOA[j])){MAXLOA[j] = LOA;}
                if(BRAM > parseFloat(MAXBEAM[j])){MAXBEAM[j] = BRAM;}
                if(DRAFT > parseFloat(MAXDRAFT[j])){MAXDRAFT[j] = DRAFT;}
                if(DWT > parseInt(MAXDWT[j])){MAXDWT[j] = DWT;}
                if(DTPH > parseFloat(MAXDTPH[j])){MAXDTPH[j] = DTPH;}
            }
            for(var i=0;i<12;i++){
                var StaticInfoStr = '<tr><td>'+parseInt(i+1)+'月</td><td>'+MAXLOA[i]+'</td><td>'+MAXBEAM[i]+'</td><td>'+MAXDRAFT[i]+'</td><td>'+MAXDWT[i]+'</td><td>'+MAXDTPH[i]+'</td></tr>';
                // var StaticInfoStr = '<tr><td>'+parseInt(i+1)+'月</td><td>'+MAXLOA[i]+'</td><td>'+MAXBEAM[i]+'</td><td>'+MAXDRAFT[i]+'</td><td>'+MAXDWT[i]+'</td></tr>';
                $('#BerthStatistics>tbody').append(StaticInfoStr);
            }
        },
        error: function(err){
            console.log(err);
        }
    });
}

/**
 * 锚地管理
 */

// //锚地目的港列表显示
// $('.add_oneIntentPort_btn').click(function(){
//     $(this).next().slideDown(200);
// });
// $('.anchInfo_intentPort').mouseleave(function(){
//     $(this).children('.anch_IntentPort').children('.AllIntentPort_List').slideUp(200);
// });
// // shiptest();
// function shiptest(){
//     var sendData = "[";
//     sendData += '{"LOA":"111", "BEAM":"111", "DRAFT":"111", "DWT":"111111", "DTPH":"111111", "date":"2017/01/11 11:11:11"},';
//     sendData += '{"LOA":"121", "BEAM":"121", "DRAFT":"121", "DWT":"122221", "DTPH":"112111", "date":"2017/01/12 11:11:11"},';
//     sendData += '{"LOA":"101", "BEAM":"121", "DRAFT":"121", "DWT":"100001", "DTPH":"100001", "date":"2017/01/14 11:11:11"},';
//     sendData += '{"LOA":"222", "BEAM":"222", "DRAFT":"222", "DWT":"222222", "DTPH":"222222", "date":"2017/02/12 11:11:11"},';
//     sendData += '{"LOA":"333", "BEAM":"333", "DRAFT":"333", "DWT":"333333", "DTPH":"333333", "date":"2017/03/13 11:11:11"},';
//     sendData += '{"LOA":"444", "BEAM":"444", "DRAFT":"444", "DWT":"444444", "DTPH":"444444", "date":"2017/04/14 11:11:11"},';
//     sendData += '{"LOA":"123", "BEAM":"123", "DRAFT":"123", "DWT":"112323", "DTPH":"212313", "date":"2017/05/14 11:11:11"},';
//     sendData += '{"LOA":"123", "BEAM":"434", "DRAFT":"234", "DWT":"3232131", "DTPH":"123123", "date":"2017/06/14 11:11:11"},';
//     sendData += '{"LOA":"425", "BEAM":"234", "DRAFT":"345", "DWT":"131232", "DTPH":"341232", "date":"2017/07/14 11:11:11"},';
//     sendData += '{"LOA":"345", "BEAM":"435", "DRAFT":"456", "DWT":"212334", "DTPH":"413223", "date":"2017/08/14 11:11:11"},';
//     sendData += '{"LOA":"879", "BEAM":"345", "DRAFT":"567", "DWT":"312345", "DTPH":"512323", "date":"2017/09/14 11:11:11"},';
//     sendData += '{"LOA":"213", "BEAM":"768", "DRAFT":"567", "DWT":"967123", "DTPH":"412335", "date":"2017/10/14 11:11:11"},';
//     sendData += '{"LOA":"324", "BEAM":"678", "DRAFT":"546", "DWT":"131232", "DTPH":"431235", "date":"2017/11/14 11:11:11"},';
//     sendData += '{"LOA":"456", "BEAM":"678", "DRAFT":"565", "DWT":"312324", "DTPH":"123123", "date":"2017/12/14 11:11:11"}';
//     sendData += "]";
//     var jsonData = JSON.parse(sendData);
//     console.log(jsonData);
//     $('#BerthStatistics>tbody').empty();
//     var date = new Date;
//     var MAXLOA = [0,0,0,0,0,0,0,0,0,0,0,0];
//     var MAXBEAM = [0,0,0,0,0,0,0,0,0,0,0,0];
//     var MAXDRAFT = [0,0,0,0,0,0,0,0,0,0,0,0];
//     var MAXDWT = [0,0,0,0,0,0,0,0,0,0,0,0];
//     var MAXDTPH = [0,0,0,0,0,0,0,0,0,0,0,0];
//     for(var i=0;i<jsonData.length;i++) {
//         date = new Date(jsonData[i].date);
//         var j = date.getMonth();
//         // console.log(j);
//         if(parseFloat(jsonData[i].LOA) > parseFloat(MAXLOA[j])){MAXLOA[j] = parseFloat(jsonData[i].LOA);}
//         if(parseFloat(jsonData[i].BEAM) > parseFloat(MAXBEAM[j])){MAXBEAM[j] = parseFloat(jsonData[i].BEAM);}
//         if(parseFloat(jsonData[i].DRAFT) > parseFloat(MAXDRAFT[j])){MAXDRAFT[j] = parseFloat(jsonData[i].DRAFT);}
//         if(parseInt(jsonData[i].DWT) > parseInt(MAXDWT[j])){MAXDWT[j] = parseInt(jsonData[i].DWT);}
//         if(parseInt(jsonData[i].DTPH) > parseInt(MAXDTPH[j])){MAXDTPH[j] = parseInt(jsonData[i].DTPH);}
//     }
//     for(var i=0;i<12;i++){
//         var StaticInfoStr = '<tr><td>'+parseInt(i+1)+'月</td><td>'+MAXLOA[i]+'</td><td>'+MAXBEAM[i]+'</td><td>'+MAXDRAFT[i]+'</td><td>'+MAXDWT[i]+'</td><td>'+MAXDTPH[i]+'</td></tr>';
//         $('#BerthStatistics>tbody').append(StaticInfoStr);
//     }
// }