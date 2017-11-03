/**
 * Created by Truth on 2017/6/15.
 */
let cluster_id_list = [];
let cluster_id = '';
let allPoints = {};


// 获取点信息
function getAllPoints() {
    $.ajax({
        async: false,
        url: "/parkArea/getInfo",
        dataType: 'json',
        cache: false,
        timeout: 5000,
        type: 'GET',
        success: function (data) {
            let res = data;
            // 返回的代码
            // 成功获取数据,数据结构<cluster_id, lon, lat, level, type>
            if (res[0] === '200') {
                console.log('成功获取信息');
                let sendData = res[1];
                // console.log(sendData);
                allPoints = JSON.parse(sendData);
                parkAreaLayer(); // 首先刷新一次
            }
        },
        error: function (data, status, e) {
            console.log(e);
        }
    })
}

/**
 * 显示停泊区域图标
 */
function parkAreaLayer(){
    let ele;
    let park_feature;
    let lon;
    let lat;
    let features = [];
    for(let key in allPoints){
        ele = allPoints[key];
        lon = ele['lon'];
        lat = ele['lat'];
        let lat_lon = WGS84transformer(lat, lon);
        let type = ele['type']; // 属于哪一类， 目前有0：锚地， 1：泊位， 2：未知区域
        park_feature = new ol.Feature({
            'lon' : lon,
            'lat': lat,
            'name': 'parkArea',
            // 'CargoTypeKey': ele["CargoTypeKey"], //装载类型
            'portID': ele["PortID"],
            'type': type,
            'cluster_id' : key,
            'Checked': ele['Checked'],
            geometry: new ol.geom.Point(ol.proj.fromLonLat([lat_lon[1], lat_lon[0]]))
        });
        park_feature.setId(key);
        // if(type === 0){
        //     // 锚地
        //     park_feature.set('anch', true)
        // }
        // else{
        //     park_feature.set('berth', true)
        // }
        if(ele['Checked'] === 0){
            park_feature.setStyle(park_style[type]);
        }
        else{
            park_feature.setStyle(berth_yes);
        }
        features.push(park_feature);
    }
    icon.getSource().clear();
    icon.getSource().addFeatures(features);
}



/**
 * 更新停泊区域的类型
 * @param cluster_id
 * @param type
 * 0表示锚地， 1表示泊位，2表示不明区域
 */
function updateParkAreaType(cluster_id, type) {
    $.ajax({
        // url: OL_Action_Root + "/icon/getInfo",
        data: {cluster_id: cluster_id, type: type},
        url: "/icon/modifyType",
        dataType: 'json',
        cache: false,
        timeout: 5000,
        type: 'GET',
        success: function (data) {
            // 返回的代码
            if (data[0] === '200') {
                console.log(data[1]);
                let zoom = blmol.operation.getZoom(map);
                // 更新内存内的信息
                let info = allPoints[cluster_id];
                info["type"] = type;
                allPoints[cluster_id] = info;
                if(zoom >= 7){
                    // let extent = blmol.operation.getCurrentExtent(map);
                    parkAreaLayer();
                }
            }
            else{
                console.log('修改失败');
            }
        },
        error: function (data, status, e) {
            console.log(e);
        }
    })
}

// 得到港口的所有的泊位，锚地中心点
getAllPoints();







