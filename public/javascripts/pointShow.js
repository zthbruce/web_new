/**
 * Created by Truth on 2017/6/19.
 */
// // 静止点的显示
// let point_style = new ol.style.Style({
//         image: new ol.style.Circle({
//             radius: 2,
//             stroke: new ol.style.Stroke({
//                 color: 'black'
//             }),
//             fill: new ol.style.Fill({
//                 color: 'blue'
//             })
//         })
//     });
// function pointLayer(cluster_id)
// {
//     $.ajax({
//         data: {cluster_id: cluster_id},
//         // async: false,
//         url: "/pointShow",
//         dataType: 'jsonp',
//         cache: true,
//         timeout: 500000,
//         type:'GET',
//         success: function(data){
//             let res = data;
//             // point.getSource().clear();
//             // 成功获取数据,数据结构<cluster_id, [[lon, lat], ...]
//             if(res[0] === '200')
//             {
//                 console.log('成功获取信息');
//                 let ele;
//                 let feature;
//                 let sendData = res[1];
//                 // console.log(sendData);
//                 let jsonData = JSON.parse(sendData);
//                 let lon_lat_info = jsonData['lat_lon_info'];
//                 let count = lon_lat_info.length;
//                 let features = new Array(count);  //形成图标集合列表,Array<ol.Features>
//                 console.log(count);
//                 while(count--) {
//                     ele = lon_lat_info[count];
//                     feature = new ol.Feature({
//                         id: jsonData['cluster_id'],
//                         geometry: new ol.geom.Point(ol.proj.fromLonLat([parseFloat(ele[0]), parseFloat(ele[1])]))
//                     });
//                     feature.setStyle(point_style);
//                     features[count] = feature;
//                 }
//                 point.getSource().addFeatures(features);
//             }
//             else
//             {
//                 console.log( res[0] + ': return nothing');
//             }
//         },
//         error: function(data, status, e){
//             console.log("unknown error");
//         }
//     });
// }

// 根据当前区域做请求
function pointLayer(level, area) {
    let _cluster_id_list = [];
    for(let key in allPoints) {
        let ele = allPoints[key];
        let lat_lon = WGS84transformer(ele['lat'], ele['lon']);
        let lat = lat_lon[0];
        let lon = lat_lon[1];
        // 范围内部的点击加载
        if (lon >= area[0] && lon <= area[2] && lat >= area[1] && lat <= area[3]) {
            _cluster_id_list.push(key);
        }
    }
    if(level >= 17 && cluster_id_list.toString() !== _cluster_id_list.toString()){
        console.log("显示点集");
        cluster_id_list = _cluster_id_list;
        point.getSource().clear();
        // 点图
        $.ajax({
            data: {cluster_id_list: cluster_id_list},
            url: "/pointShow",
            dataType: 'jsonp',
            cache: true,
            timeout: 500000,
            type:'GET',
            success: function(data){
                let res = data;
                // point.getSource().clear();
                // 成功获取数据,数据结构<cluster_id, [[lon, lat], ...]
                if(res[0] === '200')
                {
                    console.log('成功获取信息');
                    let ele;
                    let feature;
                    let sendData = res[1];
                    let jsonData = JSON.parse(sendData);
                    let lon_lat_info = jsonData['lat_lon_info'];
                    let count = lon_lat_info.length;
                    let features = new Array(count);  //形成图标集合列表,Array<ol.Features>
                    console.log(count);
                    while(count--) {
                        ele = lon_lat_info[count];
                        let lat_lon = WGS84transformer(parseFloat(ele[1]), parseFloat(ele[0]));
                        feature = new ol.Feature({
                            // id: jsonData['cluster_id'],
                            geometry: new ol.geom.Point(ol.proj.fromLonLat([lat_lon[1], lat_lon[0]]))
                        });
                        feature.setStyle(point_style);
                        features[count] = feature;
                    }
                    point.getSource().addFeatures(features);
                }
                else
                {
                    console.log( res[0] + ': return nothing');
                }
            },
            error: function(data, status, e){
                console.log("unknown error");
            }
        });
    }
    else {
        if(level < 17){
            cluster_id_list = [];
            point.getSource().clear()
        }
    }
}


