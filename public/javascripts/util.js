/**
 * 公用的函数和接口
 * Created by Truth on 2017/7/27.
 */

let EARTH_RADIUS = 6378.1370;    //地球的半径(Km)
let PI = Math.PI;

/**
 * 根据经纬度获得两点之间的数值距离
 * @param lon1
 * @param lat1
 * @param lon2
 * @param lat2
 * @returns {number}
 */
function getDistance(lon1, lat1, lon2, lat2){
    return Math.sqrt((lon1 - lon2) * (lon1 - lon2) + (lat1 - lat2) * (lat1 - lat2))
}

/**
 * 将角度转换为弧度
 * @param d
 * @returns {number}
 */
function getRad(d){
    return d * PI / 180.0;
}

/**
 * 计算大圆航线距离
 * @param lon1
 * @param lat1
 * @param lon2
 * @param lat2
 * @returns {number} 单位km
 */
function getGreatCircleDistance(lon1, lat1, lon2, lat2){
    let radLat1 = getRad(lat1);
    let radLat2 = getRad(lat2);
    let a = radLat1 - radLat2;
    let b = getRad(lon1) - getRad(lon2);
    let s = 2*Math.asin(Math.sqrt(Math.pow(Math.sin(a/2),2) + Math.cos(radLat1)*Math.cos(radLat2)*Math.pow(Math.sin(b/2),2)));
    s = s*EARTH_RADIUS;
    s = Math.round(s*10000)/10000.0;
    return s;
}

/**
 * 根据当前点坐标获得最近的港口列表
 * 锚地和泊位都有这个需求
 * @param lon
 * @param lat
 * @param portList
 * @param n 最近的n个港口
 */
function getClosePortList(lon, lat, portList, n){
    let len = portList.length;
    let distanceList = [];
    let port;
    let port_lon;
    let port_lat;
    for(let key in portList){
        port = portList[key];
        port_lon = port.LongitudeNumeric;
        port_lat = port.LatitudeNumeric;
        distanceList.push({PortID: key, distance: getDistance(lon, lat, port_lon, port_lat)});
        // i++;
    }
    // sort by distance
    distanceList.sort(function (x, y) {
        if(isNaN(x.distance)){
            return 1
        }
        if(isNaN(y.distance)){
            return -1
        }
        return x.distance - y.distance
    });

    if(len < n){
        n = len;
    }
    let closePortList = new Array(n);
    for(let j = 0; j < n; j++){
        let portID = distanceList[j].PortID;
        port = portList[portID];
        closePortList[j] = {PortID : portID, ENName:port.ENName, CNName: port.CNName}
    }
    return closePortList
}


/**
 * 根据时间生成码头的ID
 * @returns {string}
 */
function generateNewPierKey(){
    //新建码头key值
    let nowdate = new Date();
    let nowday = nowdate.toLocaleDateString();
    // console.log(date);
    // console.log(nowdate);
    let nowDayArr = nowday.split('/');
    nowDayArr[1] = nowDayArr[1].length<2 ? '0'+nowDayArr[1]:nowDayArr[1];
    nowDayArr[2] = nowDayArr[2].length<2 ? '0'+nowDayArr[2]:nowDayArr[2];
    let nowDayStr = nowDayArr.join('');
    let nowdate_hours=nowdate.getHours();
    let nowdate_minutes=nowdate.getMinutes();
    let nowdate_seconds=nowdate.getSeconds();
    nowdate_hours = nowdate_hours<10?'0'+nowdate_hours:nowdate_hours;
    nowdate_minutes = nowdate_minutes<10?'0'+nowdate_minutes:nowdate_minutes;
    nowdate_seconds = nowdate_seconds<10?'0'+nowdate_seconds:nowdate_seconds;
    nowDayStr = nowDayStr + nowdate_hours + nowdate_minutes + nowdate_seconds;
    console.log(nowDayStr);
    return nowDayStr;
}

/**
 * 将数值转化为度分秒
 * @param value
 */
function transLonLat(value) {
    let d1 = parseInt(value); // °
    let d2 = (Math.abs(value - d1) * 60).toFixed(4); // ' 含小数
    // let d3 = parseInt(((value - d1) * 60 - d1) * 60);
    return [d1, d2]
}


/**
 * 将经纬度转化为常用写法
 * @param lat
 * @param lon
 */
function transLonLatToNormal(lat, lon) {
    let latitudeDetail = transLonLat(lat);
    let latitude = latitudeDetail[0] > 0 ? latitudeDetail[0] + "°" + latitudeDetail[1] + "'N": Math.abs(latitudeDetail[0]) + "°" + latitudeDetail[1] + "'S";
    let longitudeDetail = transLonLat(lon);
    let longitude = longitudeDetail[0] > 0 ? longitudeDetail[0] + "°" + longitudeDetail[1] + "'E": Math.abs(longitudeDetail[0]) + "°" + longitudeDetail[1] + "'W";
    return [latitude, longitude]
}

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
 * 由时间戳获得真实时间
 * @param timeStamp
 * @returns {string}
 */
function getRealTime(timeStamp) {
    let date = new Date(timeStamp * 1000);
    let Y = date.getFullYear();
    let M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1);
    let D = date.getDate() < 10 ? '0'+ date.getDate(): date.getDate();
    let h = date.getHours() < 10 ? '0'+ date.getHours() :date.getHours();
    let m = date.getMinutes() < 10 ? '0'+ date.getMinutes() : date.getMinutes();
    let s = date.getSeconds() < 10 ? '0'+ date.getSeconds()  : date.getSeconds() ;
    return Y+ '-' + M+ '-' + D+ ' ' + h + ':'+m + ':' +s
}

/**
 * 时间戳间距（单位秒）
 * @param period
 */
function getDuration(period) {
    let s = period % 60;
    let m = Math.floor(period / 60);
    if(m === 0){
        return '0m'
    }
    let h = Math.floor(m / 60);
    if(h === 0){
        return m + "m"
    }
    m = m % 60;
    let D = Math.floor(h / 24);
    if(D === 0){
        return h + "h" + m + "m"
    }
    h = h % 24;
    return D +"d" + h + "h" + m + "m"
}





/*********************************分割线*******************************************************************************/
/**
 * 地图图标单击事件入口(真实入口)
 */
let routeStatus = false;
let old_feature;
let port_ul;
let status;
// 图标分为两类
// 1. 实体类: 锚地, 泊位, 港口
// 2. 标记类: 确认图标, 添加图标
mapImgClick = blmol.bind.addOnClickListener(map, function (map, coordinate, feature, evt) {
    if (feature.length !== 0) {
        let current_feature =  feature[0];
        let type = current_feature.get('type');
        console.log(current_feature.get('cluster_id'));
        // 实体类图标
        if (current_feature.get('pointer') === undefined){
            console.log("实体类图标");
            // 港口图标
            if (current_feature.get('port_id') !== undefined) {
                console.log(current_feature.get('port_id'));
                let portId = current_feature.get('port_id');
                reqOnePortBasicInfo(portId);
            }
            // 停泊区域图标
            else{
                let lon = current_feature.get('lon');
                let lat = current_feature.get('lat');
                // let staticAreaKey = current_feature.get("cluster_id");
                // 初始化锚地保存状态
                // 锚地管理弹出框, 不管是原生锚地区域还是锚地聚类区域, type都设为0, 表示锚地
                if (type === 0) {
                    // 锚地弹出框
                    $("#newAnch").fadeIn("normal");
                    anchStatus = true; // 表示进入锚地状态
                    let anchKey = current_feature.get('anchKey') === undefined ? "" : current_feature.get('anchKey');
                    changeAnchSaveButton(false);
                    old_feature = current_feature;
                    let name = current_feature.get('name');
                    if(name !== "parkArea"){
                        current_feature.setId("current"); // 将当前的大锚地设为current
                    }
                    getAnchInfo(anchKey, lon, lat); // 获取信息
                }
                // 泊位管理弹出框
                if (type === 1) {
                    let clusterId = current_feature.get('cluster_id');
                    changeBerthSaveButton(false); // 初始化泊位保存状态
                    // 弹出泊位的弹出框
                    $('#newBerth').fadeIn("normal");
                    // 请求码头整体信息
                    getPierInfo(clusterId, lon, lat);
                }
            }
        }
        else{
            let staticAreaKey = current_feature.get("cluster_id");
            console.log("标记类图标");
            let pointer = current_feature.get('pointer');
            // 泊位确认图标
            if(pointer === 'berth'){
                let choosed_ele = $('.oneBerth_info>li [staticAreaKey="' + staticAreaKey + '"]');
                updateChooseBerth(choosed_ele.parent().prev().children("span"), current_feature); // 更新列表里面对应的信息
            }
            // 港口确认图标
            else if(pointer === 'port'){
                // 如果是已选的话，点击标为未选
                let portID = current_feature.get('port_id');
                if(port_type === 0){
                    if(routeId[0] === "T"){
                        port_ul = $("#routeInfo .routeStartPort_Select .StartEndPort_List");
                    }
                    else{
                        port_ul = $("#LeaseRouteInfo .routeStartPort_Select .StartEndPort_List");
                    }
                }
                else{
                    if(routeId[0] === "T") {
                        port_ul = $("#routeInfo .routeEndPort_Select .StartEndPort_List");
                    }
                    else{
                        port_ul = $("#LeaseRouteInfo .routeEndPort_Select .StartEndPort_List");
                    }
                }
                if(current_feature.get("type") === "choosed"){
                    // let portList = port_ul.children("li");
                    let current_li = port_ul.find("[portid=" + portID +"]");
                    removePort(current_li, current_feature);
                }
                // 如果是未选的话，点击标为选择
                else if(current_feature.get("type") === "toChoose"){
                    console.log("增加");
                    // 将港口高亮
                    current_feature.set("type", "choosed");
                    current_feature.setStyle(point_status[0]);
                    // 增加港口
                    let port = AllPortBasicList[portID];
                    let port_li =  '<li portID='+ portID+'><span>'+ port.ENName + '</span><i class = "close"></i></li>';
                    port_ul.append(port_li);
                    // 将对应的港口下的泊位高亮
                    showSelectedBerth([portID])
                }
            }
            // 锚地确认按钮
            else if(pointer === 'anch'){
                console.log("锚地确认按钮");
                    let id = current_feature.get("id");
                    // 当属于本锚地时，点击之后取消选定
                    if(id === "choosed"){
                        // 获取行号
                        let number = current_feature.get("number");
                        console.log("行号" + number + "将被取消");
                        let ele = $(".selected_LonLat>li:eq(" + (number - 1) + ")");
                        let lon = parseFloat(ele.attr("lon"));
                        let lat = parseFloat(ele.attr("lat"));
                        let clusterId = ele.attr("clusterId"); // 不重新赋予新的
                        ele.remove();
                        updateLocationList();
                        getAnchCheckPointer();
                        // current_feature.setStyle(point_status[1]);
                        // current_feature.set('id', 'tochoose');
                        // 根据当前点画出轮廓线
                        writeContourLine(locationList);
                        changeAnchSaveButton(true);
                    }
                    else{
                        // 如果不属于本锚地, 点击之后标为选定
                        // let clusterId = current_feature.get('cluster_id');
                        // let anchKey = current_feature.get('anchKey') === undefined ? "" : current_feature.get('anchKey');
                        // // console.log(anchKey);
                        // // 如果点击旧锚地图标, 将其加入选择列表
                        // if (type === 0 && clusterId !== undefined) {
                            console.log("加入");
                            let lon = current_feature.get('lon');
                            let lat = current_feature.get('lat');
                            let number = parseInt($(".selected_LonLat>li:last-child>span:first-child").text()) + 1;
                            number = isNaN(number) ? 1 : number;
                            let normalLonLatStr = transLonLatToNormal(lon, lat);
                            // console.log(clusterId);
                            let chooseStr = '<li lon=' + lon + ' lat=' + lat + '><span>' + number + '</span><span class = "anch_belong"></span><span>' + normalLonLatStr + '</span></li>';
                            // let chooseStr = '<li clusterId= "' + clusterId +  '" lon=' + lon + ' lat=' + lat + '><span>' + number + '</span><span class = "anch_belong"></span><span>' + normalLonLatStr + '</span></li>';
                            // console.log(chooseStr);
                            // 添加到最后一行
                            $(".selected_LonLat").append(chooseStr);
                            // 更新轮廓点
                            updateLocationList();
                            getAnchCheckPointer();
                            // current_feature.setStyle(point_status[0]); // 变成已确认
                            // current_feature.set('id', 'choosed');
                            // current_feature.set('number', number);
                            // console.log(locationList);
                            // 根据当前所选点，画出轮廓线
                            writeContourLine(locationList);
                            changeAnchSaveButton(true);
                        }
                    // }
            }
        }
    //     if (current_feature.get('port_id') !== undefined) {
    //         if(routeStatus){
    //             // 如果是已选的话，点击标为未选
    //             let portID = current_feature.get('port_id');
    //             if(port_type === 0){
    //                 if(routeId[0] === "T"){
    //                     port_ul = $("#routeInfo .routeStartPort_Select .StartEndPort_List");
    //                 }
    //                 else{
    //                     port_ul = $("#LeaseRouteInfo .routeStartPort_Select .StartEndPort_List");
    //                 }
    //             }
    //             else{
    //                 if(routeId[0] === "T") {
    //                     port_ul = $("#routeInfo .routeEndPort_Select .StartEndPort_List");
    //                 }
    //                 else{
    //                     port_ul = $("#LeaseRouteInfo .routeEndPort_Select .StartEndPort_List");
    //                 }
    //             }
    //             if(current_feature.get("type") === "choosed"){
    //                 // let portList = port_ul.children("li");
    //                 let current_li = port_ul.find("[portid=" + portID +"]");
    //                 removePort(current_li, current_feature);
    //             }
    //             // 如果是未选的话，点击标为选择
    //             else if(current_feature.get("type") === "toChoose"){
    //                 console.log("增加");
    //                 // 将港口高亮
    //                 current_feature.set("type", "choosed");
    //                 current_feature.setStyle(port_yes);
    //                 // 增加港口
    //                 let port = AllPortBasicList[portID];
    //                 let port_li =  '<li portID='+ portID+'><span>'+ port.ENName + '</span><i class = "close"></i></li>';
    //                 port_ul.append(port_li);
    //                 // 将对应的港口下的泊位高亮
    //                 showSelectedBerth([portID])
    //             }
    //         }
    //         // 普通模式
    //         else{
    //             // 点击港口图标
    //             console.log(current_feature.get('port_id'));
    //             let portId = current_feature.get('port_id');
    //             reqOnePortBasicInfo(portId);
    //         }
    //     }
    //     // 点击锚地的图标
    //     else if (current_feature.get('cluster_id') !== undefined || current_feature.get('anchKey') !== undefined) {
    //         let type = current_feature.get('type');
    //         let lon = current_feature.get('lon');
    //         let lat = current_feature.get('lat');
    //         let staticAreaKey = current_feature.get("cluster_id");
    //         console.log("静止区域ID: " + staticAreaKey);
    //         // 锚地状态
    //         if(anchStatus){
    //             let id = current_feature.get("id");
    //             // 当属于本锚地时，点击之后取消选定
    //             if(id === "choosed"){
    //                 // 获取行号
    //                 let number = current_feature.get("number");
    //                 console.log("行号" + number + "将被取消");
    //                 let ele = $(".selected_LonLat>li:eq(" + (number - 1) + ")");
    //                 let lon = parseFloat(ele.attr("lon"));
    //                 let lat = parseFloat(ele.attr("lat"));
    //                 let clusterId = ele.attr("clusterId"); // 不重新赋予新的
    //                 ele.remove();
    //                 updateLocationList();
    //                 // 根据当前点画出轮廓线
    //                 writeContourLine(locationList);
    //                 changeAnchSaveButton(true);
    //             }
    //             else{
    //                 // 如果不属于本锚地, 点击之后标为选定
    //                 let clusterId = current_feature.get('cluster_id');
    //                 let anchKey = current_feature.get('anchKey') === undefined ? "" : current_feature.get('anchKey');
    //                 console.log(anchKey);
    //                 // 如果点击旧锚地图标, 将其加入选择列表
    //                 if (type === 0 && clusterId !== undefined) {
    //                     console.log("加入");
    //                     let number = parseInt($(".selected_LonLat>li:last-child>span:first-child").text()) + 1;
    //                     number = isNaN(number) ? 1 : number;
    //                     let normalLonLatStr = transLonLatToNormal(lon, lat);
    //                     console.log(clusterId);
    //                     let chooseStr = '<li clusterId= "' + clusterId +  '" lon=' + lon + ' lat=' + lat + '><span>' + number + '</span><span class = "anch_belong"></span><span>' + normalLonLatStr + '</span></li>';
    //                     // console.log(chooseStr);
    //                     // 添加到最后一行
    //                     $(".selected_LonLat").append(chooseStr);
    //                     // 更新轮廓点
    //                     updateLocationList();
    //                     // console.log(locationList);
    //                     // 根据当前所选点，画出轮廓线
    //                     writeContourLine(locationList);
    //                     changeAnchSaveButton(true);
    //                 }
    //             }
    //         }
    //         else {
    //             // let status = current_feature.get("status");
    //             let name = current_feature.get('name');
    //             console.log(name);
    //             if (name === 'parkArea') {
    //                 console.log("here");
    //                 // 初始化锚地保存状态
    //                 // 锚地管理弹出框, 不管是原生锚地区域还是锚地聚类区域, type都设为0, 表示锚地
    //                 if (type === 0) {
    //                     // 锚地弹出框
    //                     $("#newAnch").fadeIn("normal");
    //                     anchStatus = true; // 表示进入锚地状态
    //                     let anchKey = current_feature.get('anchKey') === undefined ? "" : current_feature.get('anchKey');
    //                     console.log(anchKey);
    //                     changeAnchSaveButton(false);
    //                     old_feature = current_feature;
    //                     current_feature.setId("current"); // 将当前的设为current
    //                     getAnchInfo(anchKey, lon, lat); // 获取信息
    //                 }
    //                 // 泊位管理弹出框
    //                 if (type === 1) {
    //                     let clusterId = current_feature.get('cluster_id');
    //                     changeBerthSaveButton(false); // 初始化泊位保存状态
    //                     // 弹出泊位的弹出框
    //                     $('#newBerth').fadeIn("normal");
    //                     // 请求码头整体信息
    //                     getPierInfo(clusterId, lon, lat);
    //                 }
    //             }
    //             // 点击确认按钮
    //             else{
    //                 let choosed_ele = $('.oneBerth_info>li [staticAreaKey="' + staticAreaKey + '"]');
    //                 updateChooseBerth(choosed_ele.parent().prev().children("span"), current_feature); // 更新列表里面对应的信息
    //             }
    //         }
    //     }
    }
});

// mapImgClick = blmol.bind.addOnClickListener(map, function (map, coordinate, feature, evt) {
//     if (feature.length !== 0) {
//         let current_feature =  feature[0];
//         if (current_feature.get('port_id') !== undefined) {
//             if(routeStatus){
//                 // 如果是已选的话，点击标为未选
//                 let portID = current_feature.get('port_id');
//                 if(port_type === 0){
//                     if(routeId[0] === "T"){
//                         port_ul = $("#routeInfo .routeStartPort_Select .StartEndPort_List");
//                     }
//                     else{
//                         port_ul = $("#LeaseRouteInfo .routeStartPort_Select .StartEndPort_List");
//                     }
//                 }
//                 else{
//                     if(routeId[0] === "T") {
//                         port_ul = $("#routeInfo .routeEndPort_Select .StartEndPort_List");
//                     }
//                     else{
//                         port_ul = $("#LeaseRouteInfo .routeEndPort_Select .StartEndPort_List");
//                     }
//                 }
//                 if(current_feature.get("type") === "choosed"){
//                     // let portList = port_ul.children("li");
//                     let current_li = port_ul.find("[portid=" + portID +"]");
//                     // for(let j=0; j< portList.length; j++) {
//                     //     let li = portList.eq(j);
//                     //     if(li.attr('portID') === portID){
//                     //         current_li = li;
//                     //     }
//                     // }
//                     removePort(current_li, current_feature);
//                 }
//                 // 如果是未选的话，点击标为选择
//                 else if(current_feature.get("type") === "toChoose"){
//                     console.log("增加");
//                     // 将港口高亮
//                     current_feature.set("type", "choosed");
//                     current_feature.setStyle(port_yes);
//                     // 增加港口
//                     let port = AllPortBasicList[portID];
//                     let port_li =  '<li portID='+ portID+'><span>'+ port.ENName + '</span><i class = "close"></i></li>';
//                     port_ul.append(port_li);
//                     // 将对应的港口下的泊位高亮
//                     showSelectedBerth([portID])
//                 }
//             }
//             // 普通模式
//             else{
//                 // 点击港口图标
//                 console.log(current_feature.get('port_id'));
//                 let portId = current_feature.get('port_id');
//                 reqOnePortBasicInfo(portId);
//             }
//         }
//         // 点击锚地的图标
//         else if (current_feature.get('cluster_id') !== undefined || current_feature.get('anchKey') !== undefined) {
//             let type = current_feature.get('type');
//             let lon = current_feature.get('lon');
//             let lat = current_feature.get('lat');
//             let staticAreaKey = current_feature.get("cluster_id");
//             console.log("静止区域ID: " + staticAreaKey);
//             // 锚地状态
//             if(anchStatus){
//                 let id = current_feature.get("id");
//                 // 当属于本锚地时，点击之后取消选定
//                 if(id === "choosed"){
//                     // 获取行号
//                     let number = current_feature.get("number");
//                     console.log("行号" + number + "将被取消");
//                     let ele = $(".selected_LonLat>li:eq(" + (number - 1) + ")");
//                     let lon = parseFloat(ele.attr("lon"));
//                     let lat = parseFloat(ele.attr("lat"));
//                     let clusterId = ele.attr("clusterId"); // 不重新赋予新的
//                     // let number = parseInt($(".unselected_LonLat>li:last-child>span:first-child").text()) + 1;
//                     // number = isNaN(number) ? 1: number;
//                     // let normalLonLatStr = $(this).next().text();
//                     // let chooseStr = '<li clusterId=' + ele.attr("clusterId") + ' lon=' + ele.attr("lon")  + ' lat=' + ele.attr("lat") +'><span>' + number + '</span><span class = "anch_notBelong"></span><span>' + normalLonLatStr + '</span></li>';
//                     // $(".unselected_LonLat").append(chooseStr);
//                     // 移除本行
//                     // let nextDomList = ele.nextAll();
//                     // for(let i = 0; i < nextDomList.length; i++){
//                     //     let num = parseInt(nextDomList.eq(i).children("span:first-child").text()) -1;
//                     //     nextDomList.eq(i).children("span:first-child").text(num);
//                     // }
//                     ele.remove();
//                     updateLocationList();
//                     // 根据当前点画出轮廓线
//                     // current.getSource().removeFeature(current_feature); // 将本标签删除
//                     writeContourLine(locationList);
//                     // 将下一层进行还原
//                     // if(feature[1] !== undefined){
//                     //     let icon_feature = feature[1];
//                     //     console.log(icon_feature);
//                     //     icon_feature.setStyle(park_style[0])
//                     // }
//                     // 将删除的点重新拿出来, 显示在地图上, 以备选择, 目前没有保留clusterID这个字段
//                     // let feature = new ol.Feature({
//                     //     'lon' : lon,
//                     //     'lat': lat,
//                     //     'name': "park_icon",
//                     //     'type': 0,
//                     //     'cluster_id' : clusterId,
//                     //     geometry: new ol.geom.Point(ol.proj.fromLonLat([lon, lat]))
//                     // });
//                     // feature.setStyle(park_style[0]); // 还原成锚地图标
//                     // icon.getSource().addFeature(feature);
//                     changeAnchSaveButton(true);
//                 }
//                 else{
//                     // 如果不属于本锚地, 点击之后标为选定
//                     let clusterId = current_feature.get('cluster_id');
//                     let anchKey = current_feature.get('anchKey') === undefined ? "" : current_feature.get('anchKey');
//                     console.log(anchKey);
//                     // 如果点击旧锚地图标, 将其加入选择列表
//                     if (type === 0 && clusterId !== undefined) {
//                         console.log("加入");
//                         let number = parseInt($(".selected_LonLat>li:last-child>span:first-child").text()) + 1;
//                         number = isNaN(number) ? 1 : number;
//                         let normalLonLatStr = transLonLatToNormal(lon, lat);
//                         console.log(clusterId);
//                         let chooseStr = '<li clusterId= "' + clusterId +  '" lon=' + lon + ' lat=' + lat + '><span>' + number + '</span><span class = "anch_belong"></span><span>' + normalLonLatStr + '</span></li>';
//                         // console.log(chooseStr);
//                         // 添加到最后一行
//                         $(".selected_LonLat").append(chooseStr);
//                         // 更新轮廓点
//                         updateLocationList();
//                         // console.log(locationList);
//                         // 根据当前所选点，画出轮廓线
//                         writeContourLine(locationList);
//                         changeAnchSaveButton(true);
//                     }
//                 }
//             }
//             //
//             // else if(routeStatus){
//             // let zoom =  blmol.operation.getZoom(map);
//             // // 如果zoom >= 10 且点击的是泊位图标
//             // if(zoom >= 10 && type === 1){
//             //     let id = current_feature.getId();
//             //     console.log(id);
//             //     // 如果当前是选择的，那么删除该选择的区域
//             //     if(id === "choosed"){
//             //         console.log("删去");
//             //         // current_feature.setStyle();
//             //         current.getSource().removeFeature(current_feature);
//             //         // $(".routeStartPort_Select>.StartEndPort_List>li['portID' = " + portID +"]").remove();
//             //     }
//             //     else{
//             //         // 添加该图标
//             //         console.log("增加");
//             //         // current_feature.setStyle(choosed);
//             //         // current_feature.setId("choosed");
//             //         // current.getSource().addFeature(current_feature);
//             //         // 克隆一下, 当下
//             //         feature = current_feature.clone();
//             //         feature.setStyle(choosed);
//             //         feature.setId("choosed");
//             //         current.getSource().addFeature(feature);
//             //         // 获取 portID 和 portName
//             //         // let port_li =  '<li portID='+ portID+'><span>'+ portName + '</span><i></i></li>';
//             //         // $('.add_StartPort').before(port_li)
//             //     }
//             // }
//             // }
//             // 原始模式
//             else {
//                 // let status = current_feature.get("status");
//                 let name = current_feature.get('name');
//                 console.log(name);
//                 if (name === 'parkArea') {
//                     console.log("here");
//                     changeBerthSaveButton(false); // 初始化泊位保存状态
//                     // 初始化锚地保存状态
//                     // 锚地管理弹出框, 不管是原生锚地区域还是锚地聚类区域, type都设为0, 表示锚地
//                     if (type === 0) {
//                         // 锚地弹出框
//                         $("#newAnch").fadeIn("normal");
//                         anchStatus = true; // 表示进入锚地状态
//                         let anchKey = current_feature.get('anchKey') === undefined ? "" : current_feature.get('anchKey');
//                         console.log(anchKey);
//                         changeAnchSaveButton(false);
//                         old_feature = current_feature;
//                         current_feature.setId("current"); // 将当前的设为current
//                         getAnchInfo(anchKey, lon, lat); // 获取信息
//                     }
//                     // 泊位管理弹出框
//                     if (type === 1) {
//                         let clusterId = current_feature.get('cluster_id');
//                         // 弹出泊位的弹出框
//                         $('#newBerth').fadeIn("normal");
//                         // 请求码头整体信息
//                         getPierInfo(clusterId, lon, lat);
//                     }
//                 }
//                 // 点击确认按钮, 分为
//                 else{
//                     // console.log("here");
//                     // if(status===0) {
//                     //     status = 1;
//                     // }else{
//                     //     status = 0;
//                     // }
//                     // 改变状态
//                     // current_feature.set('status', status);
//                     // current_feature.setStyle(point_status[status]);
//                     // current_fearure.setStyle(point_status[status]);
//                     let choosed_ele = $('.oneBerth_info>li [staticAreaKey="' + staticAreaKey + '"]');
//                     updateChooseBerth(choosed_ele.parent().prev().children("span"), current_feature); // 更新列表里面对应的信息
//                 }
//             }
//         }
//     }
// });



