/**
 * Created by Truth on 2017/6/27.
 * 用于
 */

// /**
//  * Define a namespace for the application.
//  */

var app = {};


/**
 * @constructor
 * @extends {ol.interaction.Pointer}
 */
app.Drag = function() {

    ol.interaction.Pointer.call(this, {
        handleDownEvent: app.Drag.prototype.handleDownEvent,
        handleDragEvent: app.Drag.prototype.handleDragEvent,
        handleMoveEvent: app.Drag.prototype.handleMoveEvent,
        handleUpEvent: app.Drag.prototype.handleUpEvent
    });

    /**
     * @type {ol.Pixel}
     * @private
     */
    this.coordinate_ = null;

    /**
     * @type {string|undefined}
     * @private
     */
    this.cursor_ = 'pointer';

    /**
     * @type {ol.Feature}
     * @private
     */
    this.feature_ = null;

    /**
     * @type {string|undefined}
     * @private
     */
    this.previousCursor_ = undefined;

};
ol.inherits(app.Drag, ol.interaction.Pointer);


/**
 * @param {ol.MapBrowserEvent} evt Map browser event.
 * @return {boolean} `true` to start the drag sequence.
 */
app.Drag.prototype.handleDownEvent = function(evt) {
    var map = evt.map;
    var feature = map.forEachFeatureAtPixel(evt.pixel,
        function(feature) {
            return feature;
        });
    if(feature){
        // var id = feature.get('id');
        var id = feature.getId();
        var name =  feature.get('name');
        console.log(id);
        console.log(name);
        if(name === "park_icon" || id === "Box" || id === "Polygon" || id === "Circle"){
            this.coordinate_ = evt.coordinate;
            this.feature_ = feature;
            return true
        }
    }
    return false
    // return !!feature
};



/**
 * @param {ol.MapBrowserEvent} evt Map browser event.
 */
app.Drag.prototype.handleDragEvent = function(evt) {
    var deltaX = evt.coordinate[0] - this.coordinate_[0];
    var deltaY = evt.coordinate[1] - this.coordinate_[1];

    var geometry = /** @type {ol.geom.SimpleGeometry} */
        (this.feature_.getGeometry());
    geometry.translate(deltaX, deltaY);

    this.coordinate_[0] = evt.coordinate[0];
    this.coordinate_[1] = evt.coordinate[1];
};

/**
 * @param {ol.MapBrowserEvent} evt Event.
 */
app.Drag.prototype.handleMoveEvent = function(evt) {
    if (this.cursor_) {
        var map = evt.map;
        var feature = map.forEachFeatureAtPixel(evt.pixel,
            function(feature) {
                return feature;
            });
        var element = evt.map.getTargetElement();
        if (feature) {
            if (element.style.cursor != this.cursor_) {
                this.previousCursor_ = element.style.cursor;
                element.style.cursor = this.cursor_;
            }
        } else if (this.previousCursor_ !== undefined) {
            element.style.cursor = this.previousCursor_;
            this.previousCursor_ = undefined;
        }
    }
};


/**
 * @return {boolean} `false` to stop the drag sequence.
 * 可以针对这个操作写一个写入事件
 */
app.Drag.prototype.handleUpEvent = function(evt) {
    if(this.feature_.get("name") === "park_icon") {
        console.log(ol.proj.toLonLat(evt.coordinate));
        var lon_lat = ol.proj.toLonLat(evt.coordinate);
        var cluster_id = this.feature_.get('cluster_id');
        var lon = lon_lat[0];
        var lat = lon_lat[1];
        var changePosition = confirm("移动图标至该位置: " + lon + ", " + lat + "  ?");
        if( changePosition){
            var info = allPoints[cluster_id];
            info["lon"] = lon;
            info["lat"] = lat;
            allPoints[cluster_id] = info;
            $.ajax({
                data: {cluster_id: cluster_id, lon: lon, lat: lat},
                // async: false,
                url: "/icon/modifyLonLatInfo",
                dataType: 'jsonp',
                cache: true,
                timeout: 500000,
                type:'GET',
                success: function(data) {
                    var res = data;
                    // point.getSource().clear();
                    // 成功获取数据,数据结构<cluster_id, [[lon, lat], ...]
                    if (res[0] === '200') {
                        console.log(res[1]);
                        $('.alert').html('更新位置成功').addClass('alert-success').show().delay(1000).fadeOut();
                    }
                    else{
                        console.log("修改失败");
                        $('.alert').html('更新位置失败，请重新操作').addClass('alert-warning').show().delay(1000).fadeOut();
                    }
                }
            })
        }
    }
    this.coordinate_ = null;
    this.feature_ = null;
    return false;
};


// var draw; // global so we can remove it later
//
// function addInteraction(value) {
//     // var value = typeSelect.value;
//     // if(draw)
//     map.removeInteraction(draw);
//     if (value !== 'None') {
//         var geometryFunction;
//         if (value === 'Square') {
//             value = 'Circle';
//             geometryFunction = ol.interaction.Draw.createRegularPolygon(4);
//         } else if (value === 'Box') {
//             value = 'Circle';
//             geometryFunction = ol.interaction.Draw.createBox();
//         } else if (value === 'Star') {
//             value = 'Circle';
//             geometryFunction = function(coordinates, geometry) {
//                 if (!geometry) {
//                     geometry = new ol.geom.Polygon(null);
//                 }
//                 var center = coordinates[0];
//                 var last = coordinates[1];
//                 var dx = center[0] - last[0];
//                 var dy = center[1] - last[1];
//                 var radius = Math.sqrt(dx * dx + dy * dy);
//                 var rotation = Math.atan2(dy, dx);
//                 var newCoordinates = [];
//                 var numPoints = 12;
//                 for (var i = 0; i < numPoints; ++i) {
//                     var angle = rotation + i * 2 * Math.PI / numPoints;
//                     var fraction = i % 2 === 0 ? 1 : 0.5;
//                     var offsetX = radius * fraction * Math.cos(angle);
//                     var offsetY = radius * fraction * Math.sin(angle);
//                     newCoordinates.push([center[0] + offsetX, center[1] + offsetY]);
//                 }
//                 newCoordinates.push(newCoordinates[0].slice());
//                 geometry.setCoordinates([newCoordinates]);
//                 return geometry;
//             };
//         }
//         draw = new ol.interaction.Draw({
//             source: source,
//             type: /** @type {ol.geom.GeometryType} */ (value),
//             geometryFunction: geometryFunction
//         });
//         map.addInteraction(draw);
//     }
// }

// 保存按钮的变化情况
var saveStatus = false;

/**
 * 地图最外层图标单击事件入口
 */
mapImgClick = blmol.bind.addOnClickListener(map, function (map, coordinate, feature, evt) {
    if (feature.length != 0) {
        if (feature[0].get('port_id') != undefined) {
            console.log(feature[0].get('port_id'));
            var portId = feature[0].get('port_id');
            reqOnePortBasicInfo(portId);
        } else if (feature[0].get('cluster_id') != undefined) {
            console.log(feature[0].get('cluster_id'));
            console.log(feature[0].get('type'));
            var clusterId = feature[0].get('cluster_id');
            var clusterType = feature[0].get('type');
            var lon = feature[0].get('lon');
            var lat = feature[0].get('lat');
            // 可以获取统计信息
            showSNStatistic([clusterId]);

            $('#stillArea_show').attr('cluster_id',clusterId);

            // 增加泊位
            addBerth(clusterId, lon, lat, AllPortBasicList,clusterType);
            //增加锚地
            addAnch(clusterId, lon, lat, AllPortBasicList,clusterType);

            $('#stillArea_show').attr('type', clusterType);
            // 请求基本信息
            if (clusterType !== 2) {
                reqStillAreaInfo(clusterId, clusterType);
            } else {
                $('.stillArea_contents').html('<div class="stillArea_promptInfo">暂无信息</div>');
                $('#stillArea_show .stillArea_btn_list>.stillArea_addBerth').text('设为泊位');
                $('#stillArea_show .stillArea_btn_list>.stillArea_addAnch').text('设为锚地');
                //清空锚地弹出框已有文本信息
                $('#anch_select').attr('anch_id','');
                $('#anch_select .anchInfo_select_content>div:nth-child(2)>input').val('');
                $('#anch_select .anchInfo_select_content>div>textarea').val('');
                //清空泊位弹出框已有文本信息
                // $('#berth_add .berth_add_content input').val('');
                $('#berth_select .berth_detail input').val('');
            }
            //弹出框显示
            portDivZIndex++;
            $('#stillArea_show').css('zIndex', portDivZIndex);
            // $('#stillArea_show').attr('cluster_id',clusterId);
            $('#stillArea_show').css('display','block');


        }
    }
});

/**
 * 根据经纬度获得两点之间的距离
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
 * 根据当前点坐标获得最近的港口列表
 * @param lon
 * @param lat
 * @param portList
 * @param n 最近的n个港口
 */
function getClosePortList(lon, lat, portList, n){
    var len = portList.length;
    var distanceList = new Array(len);
    var closePortList = new Array(n);
    var port;
    var port_lon;
    var port_lat;
    for(var i = 0; i< len; i++){
        port = portList[i];
        port_lon = port.LongitudeNumeric;
        port_lat = port.LatitudeNumeric;
        distanceList[i] = {index: i, distance: getDistance(lon, lat, port_lon, port_lat)}
    }
    // 做排序
    distanceList.sort(function (x, y) {
        return x.distance - y.distance
    });
    if(len < n){
        n = len;
    }
    for(var j =0; j < n; j++){
        port = portList[distanceList[j].index];
        closePortList[j] = {PortID : port.PortID, ENName:port.ENName, CNName: port.CNName}
    }
    return closePortList
}

/**
 * 针对增加泊位按钮写的一个函数
 * 单击事件产生的
 * @param cluster_id
 * @param lon
 * @param lat
 * @param portList 港口列表
 */
function addBerth(cluster_id, lon, lat, portList, type){
    // 静止区域基本信息弹出框，添加泊位按钮添加单击事件
    $('.stillArea_addBerth').off('cilick').on('click',function(){
        $('#stillArea_show').css('display','none');
        portDivZIndex++;
        $('#berth_select').css('zIndex',portDivZIndex);
        $('#berth_select').slideDown(400);
        // 获取最近的5个港口
        var nearPort;
        var nearPortNum = 5;
        var nearPortList = getClosePortList(lon, lat, portList, nearPortNum);
        console.log(nearPortList);
        $('#berth_select .addBerth_port_list').empty();
        // 增加泊位的功能（从其他状态转至泊位)
        if(type != 1){
            // 当从锚地和未知区域点进的时候需要显示最近的港口
            saveStatus = true;
            changeSaveButton(saveStatus, 1); // 将泊位的按钮激活
            var defaultPort = nearPortList[0];
            console.log(defaultPort);
            console.log(defaultPort.ENName);
            var defaultPortName = defaultPort.ENName===''? defaultPort.CNName:defaultPort.ENName;
            $('#berth_select .port_select>span:nth-child(2)').attr('port_id',defaultPort.PortID).text(defaultPortName);
            $('#berth_add .berth_add_content>div:first-child').attr('port_id',defaultPort.PortID);
            $('#berth_add .berth_add_content>div:first-child>input').val(defaultPortName);
            reqPierListFromPort(defaultPort.PortID);
            // 将保存按钮设为active
            // modifyStatus = 1
        }
        for(var i=0;i<nearPortNum;i++){
            nearPort = nearPortList[i];
            var portName = nearPort.ENName==''? nearPort.CNName:nearPort.ENName;
            $('#berth_select .addBerth_port_list').append('<li port_id="'+nearPort.PortID+'">'+portName+'</li>');
        }
        $('#berth_select .addBerth_port_list>li').off('click').on('click',function(){
            var portID = $(this).attr('port_id');
            $('#berth_select .port_select>span:nth-child(2)').attr('port_id',portID).text($(this).text());
            $('#berth_add .berth_add_content>div:first-child').attr('port_id',portID);
            $('#berth_add .berth_add_content>div:first-child>input').val($(this).text());
            $(this).parent().slideUp(200);
            console.log(portID);
            // 从港口获得码头列表
            reqPierListFromPort(portID);
            $('#berth_select .pier_details_mousedown_list span:nth-child(2)').text('');
            // 如果是非激活状态，更新为激活状态
            if(!saveStatus){
                saveStatus = true;
                changeSaveButton(saveStatus, 1);
            }
        });
        console.log(nearPortList[0].PortID);
    });

}

/**
 * 针对增加锚地按钮写的
 * 单击事件产生
 * @param cluster_id
 * @param lon
 * @param lat
 * @param portList 港口列表
 */
function addAnch(cluster_id, lon, lat, portList,type){
    // 静止区域基本信息弹出框，添加锚地按钮单击事件
    $('.stillArea_addAnch').off('click').on('click',function(){
        // $('.onePort_AnchContent li').removeClass('active');
        $('#stillArea_show').css('display','none'); // 关闭对应的窗口
        portDivZIndex++;
        $('#anch_select').css('zIndex',portDivZIndex);
        $('#anch_select').slideDown(400);
        // 获取最近的5个港口
        var nearPort;
        var nearPortNum = 5;
        var nearPortList = getClosePortList(lon, lat, portList, nearPortNum);
        // console.log(nearPortList);
        $('#anch_select .addAnch_port_list').empty();
        // 增加锚地的功能
        if(type != 0){
            // 从其他状态转至锚地状态
            console.log("here");
            saveStatus = true;
            changeSaveButton(saveStatus, 0);
            var defaultPort = nearPortList[0];
            console.log(defaultPort);
            var defaultPortName = defaultPort.ENName===''? defaultPort.CNName:defaultPort.ENName;
            $('#anch_select .addAnch_port_select>span:nth-child(2)').attr('port_id',defaultPort.PortID).text(defaultPortName);
            reqAnchListFromPort(defaultPort.PortID);
        }
        // 将港口名
        for(var i=0;i<nearPortNum;i++){
            nearPort = nearPortList[i];
            var portName = nearPort.ENName==''? nearPort.CNName:nearPort.ENName;
            $('#anch_select .addAnch_port_list').append('<li port_id="'+nearPort.PortID+'">'+portName+'</li>');
        }

        $('#anch_select .addAnch_port_list>li').off('click').on('click',function(){
            var portID = $(this).attr('port_id');
            $('#anch_select .addAnch_port_select>span:nth-child(2)').attr('port_id',portID).text($(this).text());
            $(this).parent().slideUp(200);
            // 从港口获取码头
            reqAnchListFromPort(portID);
            // 如果是非激活状态，更新为激活状态
            if(!saveStatus){
                saveStatus = true;
                changeSaveButton(saveStatus, 0);
            }
        });
    });
}

/**
 * 监听泊位输入框的变化
 */
// 此处针对泊位输入框进行监听，切换港口和码头在港口，码头点击事件
$('.berthAdd_inputNum, .berth_detail_input').bind('input propertychange',function() {
    //进行相关操作
    // content_is_changed = true;
    if(!saveStatus){
        saveStatus = true;
        changeSaveButton(saveStatus, 1);
    }
});


// 此处针对锚地输入框进行监听，切换港口监听在港口点击的事件
$('.anch_detail_input').bind('input propertychange',function() {
    //进行相关操作
    // content_is_changed = true;
    if(!saveStatus){
        saveStatus = true;
        changeSaveButton(saveStatus, 0);
    }
});


// $('.berth_detail_input').bind('input propertychange',function() {
//     //进行相关操作
//     // content_is_changed = true;
//     if(!saveStatus){
//         saveStatus = true;
//         changeSaveButton(saveStatus, 1);
//     }
// });

// $(".port_select").change(function(){
//     console.log("here");
//     if(!saveStatus){
//         saveStatus = true;
//         changeSaveButton(saveStatus, 1);
//     }
// });



