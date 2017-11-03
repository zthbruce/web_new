/**
 * 显示大锚地信息
 */
let anchInfoList = {};

function getAllAnch() {
    anchInfoList ={}; // 初始化
    $.ajax({
        url: "/anch/getAnchShowInfo",
        dataType: 'json',
        cache: false,
        timeout: 5000,
        type: 'GET',
        success: function (data) {
            let res = data;
            if (res[0] === '200') {
                console.log('成功获取信息');
                let sendData = res[1];
                for (let i = 0; i < sendData.length; i++) {
                    let ele = sendData[i];
                    let anchorageKey = ele.AnchorageKey;
                    let location = ele.Location;
                    let name = ele.Name;
                    // 中心点坐标
                    let lon = ele.CenterLon;
                    let lat = ele.CenterLat;
                    if(location !== "") {
                        let lonLatInfo = location.split(";");
                        let lonLatList = [];
                        for (let j = 0; j < lonLatInfo.length; j++) {
                            let lon_lat = lonLatInfo[j].split("#");
                            let lat_lon = WGS84transformer(parseFloat(lon_lat[1]), parseFloat(lon_lat[0]));
                            // 正常情况
                            if(lon_lat.length === 2) {
                                lonLatList.push(ol.proj.fromLonLat([lat_lon[1], lat_lon[0]]))
                            }
                        }
                        anchInfoList[anchorageKey] ={
                            anchorageKey: anchorageKey,
                            name: name,
                            lonLatList: lonLatList,
                            lon: lon,
                            lat: lat
                        }
                    }
                }
                anchLayer(initLevel);
            }
        },
        error: function (data, status, e) {
            console.log(e);
        }
    })
}


/**
 *  根据锚地表显示相应的区域
 */
function anchLayer(zoom){
    console.log("加载锚地详细区域");
    anch.getSource().clear();
    // let features = [];
    let style = {
        stroke: new ol.style.Stroke({
            color: 'white',
            lineDash: [1, 2, 3, 4, 5, 6, 7],
            width: 3
        }),
        fill: new ol.style.Fill({
            color: 'rgba(0, 0, 0, 0.4)'
            // color: 'rgba(255, 255, 255, 0.2)'
        })
    };
    // for (let i = 0; i < anchInfoList.length; i++) {
    for (let anchorageKey in  anchInfoList) {
        let anch_info = anchInfoList[anchorageKey];
        let name = anch_info.name;
        // let anchorageKey = anch_info.anchorageKey;
        // console.log(name);
        let lon = anch_info.lon;
        let lat = anch_info.lat;
        if(zoom>=10){
            style.text=new ol.style.Text({
                // font: '10px sans-serif' 默认这个字体，可以修改成其他的，格式和css的字体设置一样
                // font: "10px",
                font:'normal 14px 微软雅黑',
                text: name !== "" ? name : "未命名锚地",
                fill: new ol.style.Fill({
                    color: 'white'
                }),
                textAlign: "center"
            })
        }
        let anch_style = new ol.style.Style(style);
        // 获取特性
        // console.log(anch_info.lonLatList.length);
        let feature = new ol.Feature({
            // name: 'parkArea',
            type: 0,
            anchKey: anchorageKey,
            lon: lon,
            lat: lat,
            geometry: new ol.geom.Polygon([anch_info.lonLatList])
        });
        feature.setStyle(anch_style);
        anch.getSource().addFeature(feature);
    }
}

// 获取所有锚地区域
getAllAnch();

// function anchLayer(level){
//     if (level >= 10) {
//         console.log("加载锚地详细区域");
//         // console.log(anchInfoList);
//         anch.getSource().clear();
//         // let features = [];
//         for (let i = 0; i < anchInfoList.length; i++) {
//             let anch_info = anchInfoList[i];
//             let name = anch_info.name;
//             let anchorageKey = anch_info.anchorageKey;
//             let lon = anch_info.lon;
//             let lat = anch_info.lat;
//             console.log(anchorageKey);
//             console.log(name);
//             let anch_style = new ol.style.Style({
//                 stroke: new ol.style.Stroke({
//                     color: 'blue',
//                     lineDash: [1, 2, 3, 4, 5, 6],
//                     width: 3
//                 }),
//                 fill: new ol.style.Fill({
//                     color: 'rgba(0, 0, 255, 0.1)'
//                 }),
//                 text: new ol.style.Text({
//                     // font: '10px sans-serif' 默认这个字体，可以修改成其他的，格式和css的字体设置一样
//                     font: "15px",
//                     text: name !== "" ? name : "未命名锚地",
//                     fill: new ol.style.Fill({
//                         color: 'black'
//                     }),
//                     textAlign: "center"
//                 })
//             });
//             // 获取特性
//             console.log(anch_info.lonLatList);
//             let feature = new ol.Feature({
//                 type: 0,
//                 anchKey: anchorageKey,
//                 lon: lon,
//                 lat: lat,
//                 geometry: new ol.geom.Polygon([anch_info.lonLatList])
//             });
//             feature.setStyle(anch_style);
//             // features.push(feature);
//             anch.getSource().addFeature(feature);
//         }
//         // anch.getSource().addFeatures(features);
//     }
//     else{
//         console.log("加载中心位置信息");
//         anch.getSource().clear();
//         // let features = [];
//         for (let i = 0; i < anchInfoList.length; i++) {
//             let anch_info = anchInfoList[i];
//             // let name = anch_info.name;
//             let anchorageKey = anch_info.anchorageKey;
//             let lon = anch_info.lon;
//             let lat = anch_info.lat;
//             // console.log(anchorageKey);
//             // console.log(name);
//             // let anch_style = new ol.style.Style({
//             //     stroke: new ol.style.Stroke({
//             //         color: 'blue',
//             //         lineDash: [1, 2, 3, 4, 5, 6],
//             //         width: 3
//             //     }),
//             //     fill: new ol.style.Fill({
//             //         color: 'rgba(0, 0, 255, 0.1)'
//             //     }),
//             //     text: new ol.style.Text({
//             //         // font: '10px sans-serif' 默认这个字体，可以修改成其他的，格式和css的字体设置一样
//             //         font: "15px",
//             //         text: name !== "" ? name : "未命名锚地",
//             //         fill: new ol.style.Fill({
//             //             color: 'black'
//             //         }),
//             //         textAlign: "center"
//             //     })
//             // });
//             // 获取特性
//             // console.log(anch_info.lonLatList);
//             let feature = new ol.Feature({
//                 type: 0,
//                 anchKey: anchorageKey,
//                 lon: lon,
//                 lat: lat,
//                 geometry: new ol.geom.Point(ol.proj.fromLonLat([lon, lat]))
//                 // geometry: new ol.geom.Polygon([anch_info.lonLatList])
//             });
//             feature.setStyle(exist_anch_style);
//             anch.getSource().addFeature(feature);
//         }
//     }
// }