/**
 * Created by admin on 16/10/28.
 */
// sessionStorage.setItem('nowHtml', nowHtml);
/**********************************长度和面积测量方法*****************************************************/
/**
 * 计算线长度
 * @param {ol.geom.LineString} line The line.
 * @return {string} The formatted length.
 */
var formatLength = function(line) {
    var length;
    var output;
    length = Math.round(line.getLength() * 100) / 100;
    output = (Math.round(length / 1000 * 100) / 100);
    return output;
};
/**
 * 计算多边形面积
 * @param {ol.geom.Polygon} polygon The polygon.
 * @return {string} Formatted area.
 */
var formatArea = function(polygon) {
    var area;
    var output;
    area = polygon.getArea();
    output = (Math.round(area / 1000000 * 100) / 100); //+ ' ' + 'km<sup>2</sup>';
    return output;
};
/**
 * 获取所有点中心点
 * @param str
 * @returns {*[]}
 */
var getCenterByStr = function (str) {
    var strArr = str.split(',');
    var len = strArr.length;
    var minx = 0;
    var maxx = 0;
    var miny = 0;
    var maxy = 0;
    var startNum = 0;
    for(var i=0;i<len;i++){
        if(strArr[i] != ''){
            strArr[i] = parseFloat(strArr[i]);
            strArr[i+1] = parseFloat(strArr[i+1]);
            if(i == startNum){
                startNum = 0;
                minx = strArr[i];
                maxx = strArr[i];
                miny = strArr[i+1];
                maxy = strArr[i+1];
            }else{
                if(strArr[i]>maxx){
                    maxx = strArr[i];
                }else if(strArr[i]<minx){
                    minx = strArr[i];
                }
                if(strArr[i+1]>maxy){
                    maxy = strArr[i+1];
                }else if(strArr[i+1]<miny){
                    miny = strArr[i+1];
                }
            }
            i++;
        }else{
            startNum++;
        }
    }
    return [(minx+maxx)/2,(miny+maxy)/2];
}
/**
 * 根据输入起始点位置获取椭圆几何信息
 * @param coordinates
 * @param opt_geometry
 * @returns {*}
 */
var geomFun1 = function (coordinates, opt_geometry) {
    var center = coordinates[0];
    var coord = coordinates[1];
    var centerPx = center;
    var coordPx = coord;
    // 椭圆的长轴
    var dmax = Math.max(100, Math.abs(centerPx[0] - coordPx[0]),
        Math.abs(centerPx[1] - coordPx[1]));
    dmax = Math.round(dmax / 100);
    var tmp = ol.interaction.Draw.createRegularPolygon(dmax, 0);
    var geom = tmp(coordinates, opt_geometry);
    var ext = geom.getExtent();
    var scx = (center[0] - coord[0]) / (ext[0] - ext[2]);
    var scy = (center[1] - coord[1]) / (ext[1] - ext[3]);
    var t = [center[0] - ext[0] * scx, center[1] - ext[1] * scy];
    geom.applyTransform(function (g1, g2, dim) {
        for (var i = 0; i < g1.length; i += dim) {
            g2[i] = g1[i] * scx + t[0];
            g2[i + 1] = g1[i + 1] * scy + t[1];
        }
        return g2;
    });
    return geom;
};
/**************************************创建修改标签相关方法********************************************/
var linestyle = new ol.style.Style({
    fill: new ol.style.Fill({
        color: 'rgba(255, 255, 255, 0.2)'
    }),
    stroke: new ol.style.Stroke({
        color: 'rgba(0, 0, 0, 0.5)',
        lineDash: [10, 10],
        width: 2
    }),
    image: new ol.style.Circle({
        radius: 5,
        stroke: new ol.style.Stroke({
            color: 'rgba(0, 0, 0, 0.7)'
        }),
        fill: new ol.style.Fill({
            color: 'rgba(255, 255, 255, 0.2)'
        })
    })
});

function circleUpdateFeatures(points) {
    var features = [];
    var point1 = [points[0],points[1]];
    var point2 = [points[2],points[1]];
    var point3 = [points[2],points[3]];
    var point4 = [points[0],points[3]];
    points.push(point1);
    points.push([(point1[0]+point2[0])/2,(point1[1]+point2[1])/2]);
    points.push(point2);
    points.push([(point2[0]+point3[0])/2,(point2[1]+point3[1])/2]);
    points.push(point3);
    points.push([(point3[0]+point4[0])/2,(point3[1]+point4[1])/2]);
    points.push(point4);
    points.push([(point4[0]+point1[0])/2,(point4[1]+point1[1])/2]);
    for(var i=0;i<8;i++){
        var point = new ol.Feature({
            geometry: new ol.geom.Circle(points[i], 2000),
        });
        point.setStyle(circleStyle);
        point.setId('circle,update,'+i);
        features.push(point);
    }
    points.push(points[0]);
    var line = new ol.Feature({
        geometry: new ol.geom.LineString(points)
    });
    line.setStyle(linestyle);
    line.setId('circle,update,0');
    features.push(line);
    return features;
}
/***************************************全局变量******************************************************/

// var draw = new ol.interaction.Draw({});
//
// /**
//  * 设置图层元素
//  * @type {ol.source.Vector}
//  */
// var source = new ol.source.Vector({wrapX:true});
// /**
//  * 设置图层
//  * @type {ol.layer.Vector}
//  */
// var vector = new ol.layer.Vector({
//     source:source
// });

/**
 * 记录绘制过的图形类型
 * @type {Array}
 */
var drewFeatures = [];
var drewFeaturesType = [];
// var map = blmol.map.createMap('map', [123.861, 30.217], 8, [blmol.layer.createTianDiTile("blmLayer"),vector], false, false, false);
var points = [];
var shuxing = null;
var area_info = {
    points:[],
    area_type:'',
    area_name:'',
    user_id:'',
    area_id:'',
    area_shuxing:'',
    init:function (points,area_type,area_name,user_id,area_id,shuxing) {
        this.points= points;
        this.area_type = area_type;
        this.area_name = area_name;
        this.user_id = user_id;
        this.area_id = area_id;
        this.area_shuxing = shuxing;
    }
};

//当前设置标签保存了的信息
var nowAreaInfo = null;
//当前设置标签,不包括线标签
var nowSetFeature = null;
//当前绘制好的标签点信息,不包括线标签
var nowPoints = [];
//当前绘制图形类型
var areaType = '';
/**
 * 定义绘制开始样式
 * @type {ol.style.Style}
 */
var drawStyle = new ol.style.Style({
    fill: new ol.style.Fill({
        color: 'rgba(255, 255, 255, 0.2)'
    }),
    stroke: new ol.style.Stroke({
        color: '#ffcc33',
        width: 2
    }),
    image: new ol.style.Circle({
        radius: 7,
        fill: new ol.style.Fill({
            color: '#ffcc33'
        })
    })
});

/**
 * 定义绘制结束样式
 * @type {ol.style.Style}
 */
var drewStyle = new ol.style.Style({
    fill: new ol.style.Fill({
        color: 'rgba(255, 255, 255, 0.2)'
    }),
    stroke: new ol.style.Stroke({
        color: '#ffcc33',
        width: 2
    }),
    image: new ol.style.Circle({
        radius: 7,
        fill: new ol.style.Fill({
            color: 'rgba(43, 135, 193, 1)'
        })
    })
});
/**
 * 小圆标签样式
 * @type {ol.style.Style}
 */
var circleStyle = new ol.style.Style({
    fill: new ol.style.Fill({
        color: '#ffcc33'
    }),
    stroke: new ol.style.Stroke({
        color: '#ffcc33',
        width: 0.000001
    })
});

/**
 * 标签修改时的样式
 * @type {ol.style.Style}
 */
var updateStyle = new ol.style.Style({
    fill: new ol.style.Fill({
        color: 'rgba(255, 255, 255, 0.2)'
    }),
    stroke: new ol.style.Stroke({
        color: '#0066CC',
        width: 2
    }),
    image: new ol.style.Circle({
        radius: 7,
        fill: new ol.style.Fill({
            color: 'rgba(43, 135, 193, 1)'
        })
    })
});
/**********************绘制图形方法*************************/
/**
 * 添加区域到数据库
 * @param obj
 * @param callback
 */
function addGraphToData(obj,callback) {
    if(obj==null){callback(-1);return;};
    if(obj.area_type == 0){
        var point1 = ol.proj.toLonLat([obj.points[0],obj.points[1]]);
        var point2 = ol.proj.toLonLat([obj.points[2],obj.points[3]]);
        obj.points = [point1[0],point1[1],point2[0],point2[1]];
    }else if(obj.area_type == 1 || obj.area_type == 4){
        for(var i = 0;i<obj.points.length;i++){
            obj.points[i] = ol.proj.toLonLat(obj.points[i]);
        }
    }else if(obj.area_type == 2 || obj.area_type == 3){
        for(var i = 0;i<obj.points[0].length;i++){
            obj.points[0][i] = ol.proj.toLonLat(obj.points[0][i]);
        }
    }

    var param = '{"seq":"","area":"'+ obj.area_shuxing +'","name":"'+ obj.area_name +'","xys":'+ JSON.stringify(obj.points)
        +',"type":'+ obj.area_type +',"userId":"'+obj.user_id+'"}';
    var req = {"cmd":0x91,"param":param};
    $.ajax({
        type: "POST",
        url: "/graph",
        data: req,
        success:function (data,status) {
            if(status == 'success'){
                //alert(data);
                var dataObj = jQuery.parseJSON(data);
                callback(dataObj.id);
            }else{
                callback('');
            }
        },
        error: function(data,status){
            if(status == 'error'){
                callback(-1);
                alert('failed to request data');
            }
        }
    })
}
/**
 * 更新区域信息
 * @param obj
 */
function refreshAreaInfo(obj) {
    if(obj.area_id == ''||obj.area_id == null||obj.area_id == undefined){
        addGraphToData(nowAreaInfo,function (id) {
            updateRuleDate(id);
        });
    }else{
        if(obj.area_type == 0){
            var point1 = ol.proj.toLonLat([obj.points[0],obj.points[1]]);
            var point2 = ol.proj.toLonLat([obj.points[2],obj.points[3]]);
            obj.points = [point1[0],point1[1],point2[0],point2[1]];
        }else if(obj.area_type == 1 || obj.area_type == 4){
            for(var i = 0;i<obj.points.length;i++){
                obj.points[i] = ol.proj.toLonLat(obj.points[i]);
            }
        }else if(obj.area_type == 2 || obj.area_type == 3){
            for(var i = 0;i<obj.points[0].length;i++){
                obj.points[0][i] = ol.proj.toLonLat(obj.points[0][i]);
            }
        }
        var param = '{"seq":"","areaId":"'+ obj.area_id +'","name":"'+ obj.area_name +'","xys":'
            +JSON.stringify(obj.points)+',"area":"'+ obj.area_shuxing +'","type":"'+ obj.area_type +'","userId":"1"}';
        //alert(param);
        var req = {"cmd":0x93,"param":param};
        $.ajax({
            type: "POST",
            url: "/graph",
            data: req,
            success:function (data,status) {
                if(status == 'success'){
                    updateRuleDate(nowAreaInfo.area_id);
                }else{
                    alert('failed1 to request data');
                }
            },
            error: function(data,status){
                if(status == 'error'){
                    addGraphToData(nowAreaInfo,function (id) {
                        updateRuleDate(id);
                    });
                }
            }
        })
    }
}
/**
 * 根据区域id请求区域信息
 * @param areaId
 */
function addFeatureById(areaId) {
    var param = '{"seq":"","areaId":'+ areaId +',"userId":"1"}';
    var req = {"cmd":0x94,"param":param};
    $.ajax({
        type: "POST",
        url: "/graph",
        data: req,
        success:function (data,status) {
            if(status == 'success'){
                //alert(data);
                var data_obj=jQuery.parseJSON(data);
                var dataObj = data_obj.data[0];
                if(dataObj.type == 11) {
                    return;
                }
                //将字符串转化为几何信息
                var pointss = dataObj.xys.split('|');
                var len = pointss.length;
                var pointes = [];
                for(var i=0;i<len;i++){
                    var point = pointss[i].split(',');
                    pointes.push(ol.proj.fromLonLat([parseFloat(point[0]),parseFloat(point[1])]));
                }
                if(dataObj.type == 0){
                    dataObj.xys = [pointes[0][0],pointes[0][1],pointes[1][0],pointes[1][1]];
                }else if(dataObj.type == 1 || dataObj.type == 4){
                    dataObj.xys = pointes;
                }else {
                    dataObj.xys = [pointes];
                }
                //将获取到的区域设置为当前区域
                nowAreaInfo = new area_info.init(dataObj.xys,dataObj.type,dataObj.name,1,areaId,dataObj.area);
                points = dataObj.xys;
                var geom1 = geomFun1([[dataObj.xys[0],dataObj.xys[1]],[dataObj.xys[2],dataObj.xys[3]]]);
                var nowFeature;
                if(dataObj.type == 0){
                    nowFeature = new ol.Feature({
                        id: 'Circle',
                        geometry: geom1
                    });
                    nowFeature.setId('Circle');
                    nowFeature.setStyle(drewStyle);
                    source.addFeature(nowFeature);
                    nowPoints = points;
                    nowSetFeature = nowFeature;
                    $(".circle-set").mydrag();
                    showFeatureInfo('Circle',nowPoints,nowFeature);
                    $('.circle-set').css('display','none');
                    // updateModifyFeatureStyle([]);
                }else if(dataObj.type == 1){
                    var nowFeature1 = new ol.Feature({
                        id: 'editLine',
                        geometry: new ol.geom.LineString(dataObj.xys)
                    });
                    nowFeature1.setStyle(drewStyle);
                    var features = [];
                    for(var i =0;i<dataObj.xys.length;i++){
                        var point = new ol.Feature({
                            geometry: new ol.geom.Circle(dataObj.xys[i], 2000)
                        });
                        point.setStyle(circleStyle);
                        features.push(point);
                    }
                    features.push(nowFeature1);
                    source.addFeatures(features);
                }else if(dataObj.type == 2){
                    nowFeature = new ol.Feature({
                        id: 'editPolygon',
                        geometry: new ol.geom.Polygon(dataObj.xys)
                    });
                    nowFeature.setId('Polygon');
                    nowFeature.setStyle(drewStyle);
                    source.addFeature(nowFeature);
                    nowPoints = points;
                    nowSetFeature = nowFeature;
                    $(".polygon-set").mydrag();
                    showFeatureInfo('Polygon',nowPoints,nowFeature);
                    $('.polygon-set').css('display','none');
                    // updateModifyFeatureStyle([]);
                }else if(dataObj.type == 3){
                    nowFeature = new ol.Feature({
                        id: 'editBox',
                        geometry: new ol.geom.Polygon(dataObj.xys)
                    });
                    nowFeature.setId('box');
                    nowFeature.setStyle(drewStyle);
                    source.addFeature(nowFeature);
                    nowPoints = points;
                    nowSetFeature = nowFeature;
                    $(".box-set").mydrag();
                    showFeatureInfo('box',nowPoints,nowFeature);
                    $('.box-set').css('display','none');
                    // updateModifyFeatureStyle([]);
                }else if(dataObj.type == 4){
                    nowFeature = new ol.Feature({
                        id: 'editArrow',
                        geometry: new ol.geom.LineString(dataObj.xys)
                    });
                    map.addLayer(arrowVector);
                    source.addFeature(nowFeature);
                }else{

                }
                if(nowAreaInfo.area_name == '' || nowAreaInfo.area_name == null || nowAreaInfo.area_name == undefined){
                    $('.map-area-name').text('我的区域');
                }else {
                    $('.map-area-name').text(nowAreaInfo.area_name);
                }
                var linepoint = nowFeature.getGeometry().getCoordinates()[0];
                var len = linepoint.length;
                var j = [];
                for(var i=0;i<len;i++){
                    if(i==0){
                        j = [0,linepoint[0][1]];
                    }else{
                        if(linepoint[i][1]>j[1]){
                            j=[i,linepoint[i][1]];
                        }
                    }
                }
                var element = document.getElementById('map-region-click');
                $('#map-region-click').css('display','block');
                var popup = new ol.Overlay({
                    element: element,
                    positioning: 'top-left',
                    stopEvent: false,
                    offset: [0, -38]
                });
                popup.setMap(map);
                popup.setPosition(linepoint[j[0]]);


                //设置最后一个点为地图中心点
                var areasString = dataObj.xys.toString();
                var center1 = getCenterByStr(areasString);
                map.getView().setCenter(center1);
            }else{
                alert('failed to request data');
            }
        },
        error: function(data,status){
            if(status == 'error'){
                // alert('failed to request data');
            }
        }
    })
}


/****************************************HTML控件相关监听方法*******************************************/
/**
 * 点击地图放大按钮事件监听方法
 */
$(".map-big").on("click", function () {
    blmol.operation.zoomOut(map);
});
/**
 * 点击地图缩小按钮事件监听方法
 */
$(".map-small").on("click", function () {
    blmol.operation.zoomIn(map);
});
/**
 * 保存按钮点击事件监听方法
 */
$("#area_save").on("click",function(){
    $(".area").css("display","none");
});


// /**
//  * 取消按钮点击事件监听方法
//  */
// $('#quxiao').on("click",function () {
//     $("#speed-area").hide();
//
//     if(nowHtml == 'business' || nowHtml == 'regulation'){
//
//     }else{
//         nowAreaInfo = new area_info.init([],11,'',1,nowAreaInfo == null?'':nowAreaInfo.area_id,shuxing);
//         blmol.layer.clear(vector);
//     }
// });
/**************************************地图相关操作***************************************/
/**
 * 批量为线标签产生箭头样式
 * @param feature
 * @returns {*[]}
 */
var styleFunction = function(feature) {
    var geometry = feature.getGeometry();
    var styles = [
        new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: '#ffcc33',
                width: 2
            })
        })
    ];
    geometry.forEachSegment(function(start, end) {
        var dx = end[0] - start[0];
        var dy = end[1] - start[1];
        var rotation = Math.atan2(dy, dx);
        styles.push(new ol.style.Style({
            geometry: new ol.geom.Point(end),
            image: new ol.style.Icon({
                src: 'https://openlayers.org/en/v3.19.1/examples/data/arrow.png',
                anchor: [0.75, 0.5],
                rotateWithView: false,
                rotation: -rotation
            })
        }));
    });
    return styles;
};

/**
 * 为地图所有没有样式线标签添加箭头样式
 * @type {ol.layer.Vector}
 */
var arrowVector = new ol.layer.Vector({
    source: source,
    style: styleFunction
});

/**
 * 记录是否是第一次点击地图
 * @type {boolean}
 */
var firstDown = true;
//是否正在绘制活动
var isDrawing = false;
//是否刚刚完成最后一次绘制
var isLastPan = false;


/**
 * 根据类型添加绘制对象
 *
 * @param selectType
 */
function addInteraction(selectType) {
    draw.setActive(true);
    // modify.setActive(false);
    // select.setActive(false);
    areaType = selectType;
    if (selectType === 'Circle'){
        draw = blmol.draw.ellipseDraw(map, source, drawStyle);
    }else if(selectType === 'arrow'){
        map.removeLayer(arrowVector);
        draw = blmol.draw.lineDraw(map, source, drawStyle);
        map.addLayer(arrowVector);
    }else if (selectType === 'Box'){
        draw = new ol.interaction.Draw({
            source: source,
            type: 'LineString',
            style: drawStyle,
            maxPoints: 2,
            geometryFunction: function(coordinates, geometry){
                if(!geometry){
                    geometry = new ol.geom.Polygon(null);
                }
                var start = coordinates[0];
                var end = coordinates[1];
                geometry.setCoordinates([
                    [start, [start[0], end[1]], end, [end[0], start[1]], start]
                ]);
                return geometry;
            }
        })
    }else if(selectType === 'Polygon'){
        draw = blmol.draw.polygonDraw(map,source,drawStyle);
    } else if(selectType === 'LineString'){
        draw = blmol.draw.lineDraw(map,source,drawStyle);
    }
    // 将画，选择，修改添加
    map.addInteraction(draw);


    /**
     * 绘制对象结束绘制监听方法
     */
    blmol.bind.addDrawEndListener(draw, function (drawer, feature, evt) {
        alert("draw completed");
        isLastPan = true;
        //获取标签面积或长度
        if(selectType == 'LineString' || selectType == 'arrow'){
            shuxing = formatLength(feature.getGeometry());
        }else{
            shuxing = formatArea(feature.getGeometry());
        }
        isDrawing = false;
        drewFeaturesType.push(selectType);
        if(selectType == 'Circle'){
            // 获得相应的范围
            points = feature.getGeometry().getExtent();
            feature.setId('Circle');
            $('.circle-set').css('display','block');
            $(".circle-set").mydrag();
            showFeatureInfo('Circle', points, feature);
            nowSetFeature = feature;
            nowPoints = points;
            // console.log(feature.getId());
            // console.log(ol.proj.toLonLat(points));
        }else if(selectType == 'LineString'){
            points = feature.getGeometry().getCoordinates();
            var features = [];
            for(var i =0;i<points.length;i++){
                var point = new ol.Feature({
                    geometry: new ol.geom.Circle(points[i], 2000)
                });
                // if(nowHtml == 'regulation'){
                //     if($("#type").val()=="分道通航"){
                //         point.setId('隔离带,'+i+','+gldLines.length);
                //     }else{
                //         point.setId('VTS报告线,'+i+','+vtsLines.length);
                //     }
                // }
                drewFeatures.push(point);
                point.setStyle(circleStyle);
                features.push(point);
            }
            source.addFeatures(features);
        }else if(selectType == 'Polygon'){
            points = feature.getGeometry().getCoordinates();
            feature.setId('Polygon');
            $('.polygon-set').css('display','block');
            $(".polygon-set").mydrag();
            showFeatureInfo('Polygon',points,feature);
            nowSetFeature = feature;
            nowPoints = points;
        }else if(selectType=='Box'){
            feature.setId('Box');
            $('.box-set').css('display','block');
            $(".box-set").mydrag();
            points = feature.getGeometry().getCoordinates();
            showFeatureInfo('Box',points,feature);
            nowSetFeature = feature;
            nowPoints = points;
        }else if(selectType == 'arrow'){
            points = feature.getGeometry().getCoordinates();
        }
        drewFeatures.push(feature);
        if(selectType != 'arrow'){
            feature.setStyle(drewStyle);
        }else{
            styleFunction(feature);
        }
        // if(nowHtml == 'business'){
        //     changeTipArea(feature.getGeometry().getCoordinates());
        //     if($("#rule_type").val()=="习惯航线"){
        //         $('.business1-set').css('display','block');
        //         showLineBusiness1(feature);
        //     }else{
        //         $('.business2-set').css('display','block');
        //         showLineBusiness2(feature);
        //     }
        // }else{
        //     $('#input-area-name').val('');
        // }
        // if(nowHtml == 'regulation'){
        //     setRegulationFeature(selectType,feature);
        //     nowClickFeature = feature.getId();
        //     $('#speed-area').show();
        // }
        map.removeInteraction(draw);
        draw.setActive(false);
        // select.setActive(true);
        // modify.setActive(true);
        firstDown = true;
        changeAllColor();
    });

    /**
     * 绘制对象开始绘制事件监听方法
     */
    blmol.bind.addDrawStartListener(draw, function (drawer, feature, evt) {
        console.log("draw start");
        // modify.setActive(false);
        select.setActive(false);
        $('.polygon-set').css('display','none');
        $('.circle-set').css('display','none');
        $('.box-set').css('display','none');
        $('#map-region-click').css('display','none');
        //清空当前绘制对象
        nowAreaInfo = new area_info.init([],11,'',1,nowAreaInfo == null?'':nowAreaInfo.area_id,shuxing);
        isDrawing = true;
        // if (nowHtml != 'regulation'){
        //     if(select.getFeatures().a.length==1){
        //         select.getFeatures().a[0].setStyle(new ol.style.Style({
        //             fill: new ol.style.Fill({
        //                 color: 'rgba(0,0,0,0)'
        //             }),
        //             stroke: new ol.style.Stroke({
        //                 color: 'rgba(0,0,0,0)'
        //             })
        //         }));
        //     }
        //     blmol.layer.clear(vector);
        // }
        // if(nowHtml == 'business'){
        //     nowAreaInfo1.speeds = [];
        //     $('.business1-set').css('display','none');
        //     $('.business2-set').css('display','none');
        // }
    });
}

/**
 * 测量按钮点击事件监听方法
 */
function finishDraw() {
    map.removeInteraction(draw);
}
/**
 * 地图单击事件监听方法
 */
// blmol.bind.addOnClickListener(map,function () {
//     if (isClickButton === false) {
//         updateModifyFeatureStyle([]);
//     } else {
//         isClickButton = false;
//     }
// })


/**
 * 地图上鼠标移动事件监听方法
 */
blmol.bind.addOnMouseMoveListener(map,function (map,wz,features,evt) {

});

/**
 * 地图双击事件监听方法
 */
// blmol.bind.addOnDoubleClickListener(map, function () {
//    if(nowHtml == 'business' && $("#rule_type").val()!="习惯航线"&&firstDown==false){
//        // $("#speed-area").show();
//        // $('#speed-input').val('');
//        // nowAreaInfo1.speeds.push(0);
//    }
// });
// var nowClickFeature = undefined;
// var clickMarker = function (map, points, markers) {
//     if(nowHtml != 'business' && nowHtml != 'regulation' && markers.length > 0){
//         if(isDrawing == false){
//             select.setActive(true);
//             $('#input-area-name').val(nowAreaInfo.area_name);
//             updateModifyFeatureStyle(markers);
//         }else{
//
//         }
//     }else if(nowHtml == 'business'&& isDrawing == false && markers.length > 0){
//         select.setActive(true);
//         modify.setActive(true);
//         if($("#rule_type").val()=="习惯航线"){
//             showLineBusiness1(nowShowFeature);
//         }else{
//             showLineBusiness2(nowShowFeature);
//         }
//     }else if(nowHtml == 'regulation' && isDrawing == false && isLastPan == false){
//         var feature1 = getFeatureById('隔离带,-1,0');
//         var feature2 = getFeatureById('VTS报告线,-1,0');
//         var feature3 = getFeatureById('进入方向,-1,0');
//         if(feature1 != null){
//             feature1.setStyle(drawStyle);
//         }
//         if(feature2 != null){
//             feature2.setStyle(drawStyle);
//         }
//         if(feature3 != null){
//             feature3.setStyle();
//         }
//         if(markers.length == 0){
//             return;
//         }
//         for(var i=0;i<markers.length;i++) {
//             if(markers[i].getId() == undefined||markers[i].getId() ==null||markers[i].getId() ==''){
//                 return;
//             }
//             select.setActive(true);
//             modify.setActive(true);
//             // console.log(selected.a);
//             // var ssd = selected.a.length;
//             // console.log(ssd);
//             if(markers[i].getId() == '隔离带,-1,0' && i==0){
//                 startUpdateRegulation(getFeatureById('隔离带,-1,0'));
//                 getFeatureById('隔离带,-1,0').setStyle(updateStyle);
//             }else if(markers[i].getId() == 'VTS报告线,-1,0' && i==0){
//                 startUpdateRegulation(getFeatureById('VTS报告线,-1,0'));
//                 getFeatureById('VTS报告线,-1,0').setStyle(updateStyle);
//             }else{
//                 // startUpdateRegulation(markers[i]);
//                 // markers[i].setStyle(updateStyle);
//             }
//
//         }
//     }
//     isLastPan = false;
// };
// blmol.bind.addOnClickListener(map, clickMarker);
/************************地图标签修改方法*****************************/

//
// var select = new ol.interaction.Select();
// map.addInteraction(select);
//
// var selected = select.getFeatures();
//
// var modify = new ol.interaction.Modify({
//     features: selected
// });
// map.addInteraction(modify);
//
// modify.on('modifystart',function (evt) {
//     console.log("start modify");
//
// });

var pointer = new ol.interaction.Pointer();

/**
 * 修改标签结束方法
 * 将图形进行修改
 *
 */
// modify.on('modifyend',function (evt) {
//     var point = nowPoints;
//     var feature = source.getFeatures()[0];
//     if(feature.getId()=='Circle'){
//         //鼠标开始点击点
//         var startEndArr = evt.target.j[0][0].na;
//         var x0 = Math.abs(startEndArr[0][0]-point[0]);
//         var x1 = Math.abs(startEndArr[0][0]-point[2]);
//         var y0 = Math.abs(startEndArr[0][1]-point[1]);
//         var y1 = Math.abs(startEndArr[0][1]-point[3]);
//         var len1 = startEndArr[1][0] - startEndArr[0][0];
//         var len2 = startEndArr[1][1] - startEndArr[0][1];
//         var circlesArr = [];
//         if(x0<=x1 && y0<=y1){
//             circlesArr = [[point[0]+len1,point[1]+len2],[point[2],point[3]]];
//         }else if(x0<=x1 && y0>=y1){
//             circlesArr = [[point[0]+len1,point[1]],[point[2],point[3]+len2]];
//         }else if(x0>=x1 && y0<=y1){
//             circlesArr = [[point[0],point[1]+len2],[point[2]+len1,point[3]]];
//         }else if(x0>=x1 && y0>=y1){
//             circlesArr = [[point[0],point[1]],[point[2]+len1,point[3]+len2]];
//         }
//         nowPoints=[circlesArr[0][0],circlesArr[0][1],circlesArr[1][0],circlesArr[1][1]];
//         var geom1 = geomFun1(circlesArr);   // 重新
//         feature.setGeometry(geom1);
//         // $('.circle-set').css('display','block');
//         // $(".circle-set").mydrag();
//         // showFeatureInfo('Circle', nowPoints, feature);
//     }else if(feature.getId()=='box'){
//         var endFeature = evt.features.a[0];
//         if(endFeature.getGeometry().getCoordinates()[0].length==4){
//             feature.getGeometry().setCoordinates(nowPoints);
//         }else if(endFeature.getGeometry().getCoordinates()[0].length==5){
//             var startEndArr = evt.target.j[0][0].na;
//             var changeId = 0;
//             for(var i=0;i<4;i++){
//                 var onePoint = point[0][i];
//                 if(onePoint[0]==startEndArr[0][0]&&onePoint[1]==startEndArr[0][1]){
//                     if(i==3){
//                         changeId==0;
//                     }else{
//                         changeId = i+1;
//                     }
//                 }
//             }
//             var points = point[0];
//             var x = startEndArr[1][0]-points[changeId][0];
//             var y = startEndArr[1][1]-points[changeId][1];
//             if(changeId == 0){
//                 x = startEndArr[0][0]-points[changeId][0];
//                 y = startEndArr[0][1]-points[changeId][1];
//             }
//             if(changeId===0){
//                 point = [[[points[0][0]+x,points[0][1]+y],[points[1][0]+x,points[1][1]],
//                     points[2],[points[3][0],points[3][1]+y],[points[4][0]+x,points[4][1]+y]]];
//             }else if(changeId==1){
//                 point = [[[points[0][0]+x,points[0][1]],[points[1][0]+x,points[1][1]+y],
//                     [points[2][0],points[2][1]+y],points[3],[points[4][0]+x,points[4][1]]]];
//             }else if(changeId==2){
//                 point = [[points[0],[points[1][0],points[1][1]+y],[points[2][0]+x,points[2][1]+y],
//                     [points[3][0]+x,points[3][1]],points[4]]];
//             }else{
//                 point = [[[points[0][0],points[0][1]+y],points[1],[points[2][0]+x,points[2][1]],
//                     [points[3][0]+x,points[3][1]+y],[points[4][0],points[4][1]+y]]];
//             }
//             points=point;
//             nowPoints=points;
//             feature.getGeometry().setCoordinates(points);
//         }else if(endFeature.getGeometry().getCoordinates()[0].length==6){
//             var points1 = evt.target.j[0][0].na;
//             var points2 = evt.target.j[1][0].na;
//             var point1 = points1[0];
//             var point2 = points2[1];
//             var x=0;
//             var y=0;
//             if(point1[0] == point2[0]){
//                 x = points1[1][0]-points1[0][0];
//             }else if(point1[1] == point2[1]){
//                 y = points1[1][1]-points1[0][1];
//             }
//             var point = nowPoints[0];
//             for(var i=0;i<5;i++){
//                 if(point[i][0] == point1[0] && point[i][1] == point1[1]){
//                     point[i] = [point1[0]+x,point1[1]+y];
//                 }else if(point[i][0] == point2[0] && point[i][1] == point2[1]){
//                     point[i] = [point2[0]+x,point2[1]+y];
//                 }
//             }
//             nowPoints = [point];
//             feature.getGeometry().setCoordinates(nowPoints);
//         }else{
//             feature.getGeometry().setCoordinates(nowPoints);
//         }
//         // $('.box-set').css('display','block');
//         // $(".box-set").mydrag();
//         // showFeatureInfo('box',nowPoints,feature);
//     }else if(feature.getId() == 'Polygon'){
//         // $('.polygon-set').css('display','block');
//         // $(".polygon-set").mydrag();
//         // nowPoints = feature.getGeometry().getCoordinates();
//         // showFeatureInfo('Polygon',feature.getGeometry().getCoordinates(),feature);
//     }
//     // else if(nowHtml == 'regulation'){
//     //     var endFeature = evt.features.a[0];
//     //     if(endFeature.getId().split(',')[0] == '航道边界'){
//     //         endFeature.setStyle();
//     //     }else{
//     //         endFeature.setStyle(updateStyle);
//     //     }
//     //
//     //     startUpdateRegulation(endFeature);
//     // }
//     // else if(nowHtml == 'business'){
//     //     var endFeature = evt.features.a[0];
//     //     nowShowFeature = feature;
//     //     nowShowPoints = feature.getGeometry().getCoordinates();
//     //     changeTipArea(nowShowPoints);
//     //     if($("#rule_type").val()=="习惯航线"){
//     //         showLineBusiness1(endFeature);
//     //     }else{
//     //         showLineBusiness2(endFeature);
//     //     }
//     // }
//     drewFeatures.push(feature);
// });


// /**
//  * 修改标签开始监听方法
//  */
// modify.on('modifystart',function (evt) {
//     $('#map-region-click').css('display','none');
//     // modify.handleDragEvent = function(evt) {
//     //     console.log(evt);
//     //     console.log(12);
//     // }
// });


// modify.on('propertychange',function () {
//    // updateModifyFeatureStyle();
// });
//
// selected.on('propertychange',function () {
// //    updateModifyFeatureStyle();
// });

// 单击监听事件
// function updateModifyFeatureStyle(features) {
//     if(nowSetFeature == undefined || nowSetFeature == null || isDrawing == true){return};
//     if(modify.getActive() == false && isDrawing == false && features.length>0){
//         //可修改状态
//         nowSetFeature.setStyle(updateStyle);
//         modify.setActive(true);
//         dragDrop.setActive(false);
//         if(nowSetFeature.getId() == 'Circle'){
//             $('.circle-set').css('display','block');
//             $('.polygon-set').css('display','none');
//             $('.box-set').css('display','none');
//         }else if(nowSetFeature.getId() == 'Polygon'){
//             $('.circle-set').css('display','none');
//             $('.polygon-set').css('display','block');
//             $('.box-set').css('display','none');
//         }else if(nowSetFeature.getId() == 'box'){
//             $('.circle-set').css('display','none');
//             $('.polygon-set').css('display','none');
//             $('.box-set').css('display','block');
//         }
//     }else{
//         //可拖拽状态
//         nowSetFeature.setStyle(drawStyle);
//         modify.setActive(false);
//         dragDrop.setActive(true);
//         $('#map-click-set').css('display','block');
//     }
// }


/*************************地图拖拽事件监听方法***************************************/
// /**
//  * Define a namespace for the application.
//  */
// var app = {};
// /**
//  * @constructor
//  * @extends {ol.interaction.Pointer}
//  */
// app.Drag = function() {
//     ol.interaction.Pointer.call(this, {
//         handleDownEvent: app.Drag.prototype.handleDownEvent,
//         handleDragEvent: app.Drag.prototype.handleDragEvent,
//         handleMoveEvent: app.Drag.prototype.handleMoveEvent,
//         handleUpEvent: app.Drag.prototype.handleUpEvent
//     });
//     /**
//      * @type {ol.Pixel}
//      * @private
//      */
//     this.coordinate_ = null;
//     /**
//      * @type {string|undefined}
//      * @private
//      */
//     this.cursor_ = 'pointer';
//     /**
//      * @type {ol.Feature}
//      * @private
//      */
//     this.feature_ = null;
//     /**
//      * @type {string|undefined}
//      * @private
//      */
//     this.previousCursor_ = undefined;
// };
// ol.inherits(app.Drag, ol.interaction.Pointer);
// /**
//  * @param {ol.MapBrowserEvent} evt Map browser event.
//  * @return {boolean} `true` to start the drag sequence.
//  */
// app.Drag.prototype.handleDownEvent = function(evt) {
//     var map = evt.map;
//     var feature = map.forEachFeatureAtPixel(evt.pixel,
//         function(feature) {
//             return feature;
//         });
//     if (feature) {
//         this.coordinate_ = evt.coordinate;
//         this.feature_ = feature;
//     }
//     return !!feature;
// };
//
// /**
//  * @param {ol.MapBrowserEvent} evt Map browser event.
//  */
// app.Drag.prototype.handleDragEvent = function(evt) {
//     var deltaX = evt.coordinate[0] - this.coordinate_[0];
//     var deltaY = evt.coordinate[1] - this.coordinate_[1];
//     var geometry = /** @type {ol.geom.SimpleGeometry} */
//         (this.feature_.getGeometry());
//     geometry.translate(deltaX, deltaY);
//     this.coordinate_[0] = evt.coordinate[0];
//     this.coordinate_[1] = evt.coordinate[1];
//     if(nowSetFeature.getId() == 'Circle' && isDrawing == false){
//         var feature = nowSetFeature;
//         showFeatureInfo('Circle',[nowPoints[0]+deltaX,nowPoints[1]+deltaY,nowPoints[2]+deltaX,nowPoints[3]+deltaY],feature);
//         changeTipArea1(feature.getGeometry().getCoordinates()[0]);
//         $('.circle-set').css('display','block');
//         nowPoints = [nowPoints[0]+deltaX,nowPoints[1]+deltaY,nowPoints[2]+deltaX,nowPoints[3]+deltaY];
//         points = nowPoints;
//         return;
//     }else if(nowSetFeature.getId() == 'box'&& isDrawing == false){
//         var feature = nowSetFeature;
//         showFeatureInfo('box',feature.getGeometry().getCoordinates(),feature);
//         changeTipArea1(feature.getGeometry().getCoordinates()[0]);
//         $('.box-set').css('display','block');
//     }else if(nowSetFeature.getId() == 'Polygon'&& isDrawing == false){
//         var feature = nowSetFeature;
//         showFeatureInfo('Polygon',feature.getGeometry().getCoordinates(),feature);
//         changeTipArea1(feature.getGeometry().getCoordinates()[0]);
//         $('.polygon-set').css('display','block');
//     }else{
//         return;
//     }
//     nowPoints = nowSetFeature.getGeometry().getCoordinates();
//     points = nowPoints;
// };
// /**
//  * @param {ol.MapBrowserEvent} evt Event.
//  */
// app.Drag.prototype.handleMoveEvent = function(evt) {
//     if (this.cursor_) {
//         var map = evt.map;
//         var feature = map.forEachFeatureAtPixel(evt.pixel,
//             function(feature) {
//                 return feature;
//             });
//         var element = evt.map.getTargetElement();
//         if (feature) {
//             if (element.style.cursor != this.cursor_) {
//                 this.previousCursor_ = element.style.cursor;
//                 element.style.cursor = this.cursor_;
//             }
//         } else if (this.previousCursor_ !== undefined) {
//             element.style.cursor = this.previousCursor_;
//             this.previousCursor_ = undefined;
//         }
//     }
// };
// /**
//  * @return {boolean} `false` to stop the drag sequence.
//  */
// app.Drag.prototype.handleUpEvent = function() {
//     this.coordinate_ = null;
//     this.feature_ = null;
//     return false;
// };

// var dragDrop = new app.Drag();
// dragDrop.setActive(false);
// map.addInteraction(dragDrop);

/*************************初始化绘制完成区域信息方法*******************************/
// use this to show the lon, lat information
function showFeatureInfo(type, points, feature) {
    if(type == 'Circle'){
        // 左下角
        var point1 = ol.proj.toLonLat([points[0],points[1]]);
        // 右上角
        var point2 = ol.proj.toLonLat([points[2],points[3]]);
        var s1 = new ol.Feature(new ol.geom.LineString([[points[0],points[1]],[points[2],points[1]]]));
        var s2 = new ol.Feature(new ol.geom.LineString([[points[2],points[1]],[points[2],points[3]]]));
        var short = formatLength(s1.getGeometry())/2;
        var long = formatLength(s2.getGeometry())/2;
        var center = [(point1[0]+point2[0])/2,(point1[1]+point2[1])/2];

        $('.circle-set-lonlat-in').remove();
        $('.circle-set-lonlat').append('<div class="circle-set-lonlat-in">'
            +'<input id="circle-lon-dfs-d" style="width: 22px" value="'+ getDFSByD(center[1])[0] +'">'
            +'<div>°</div>'
            +'<input id="circle-lon-dfs-f" style="width: 17px" value="'+ getDFSByD(center[1])[1] +'">'
            +'<div>′</div>'
            +'<input id="circle-lon-dfs-s" style="width: 17px" value="'+ getDFSByD(center[1])[2] +'">'
            +'<div>″</div>'
            +'<div id="circle-lon-img"></div>'
            +'</div>'
            +'<div class="circle-set-lonlat-in" style="right: 10px">'
            +'<input id="circle-lat-dfs-d" style="width: 22px" value="'+ getDFSByD(center[0])[0] +'">'
            +'<div>°</div>'
            +'<input id="circle-lat-dfs-f" style="width: 17px" value="'+ getDFSByD(center[0])[1] +'">'
            +'<div>′</div>'
            +'<input id="circle-lat-dfs-s" style="width: 17px" value="'+ getDFSByD(center[0])[2] +'">'
            +'<div>″</div>'
            +'<div id="circle-lat-img"></div>'
            +'</div>');
        $('.circle-set-select-text').text('度分秒');
        $('#circle-lon-img').hover(function () {
            $('#circle-lon-img').css('background-position',getPositionByLon(center[1])[1]);
        },function () {
            $('#circle-lon-img').css('background-position',getPositionByLon(center[1])[0]);
        });
        $('#circle-lon-img').css('background-position',getPositionByLon(center[1])[0]);
        $('#circle-lat-img').hover(function () {
            $('#circle-lat-img').css('background-position',getPositionByLat(center[0])[1]);
        },function () {
            $('#circle-lat-img').css('background-position',getPositionByLat(center[0])[0]);
        });
        $('#circle-lat-img').css('background-position',getPositionByLat(center[0])[0]);
        var short1 = short<long?short:long;
        var long1 = short>long?short:long;
        if(nowAreaInfo.area_name==''||nowAreaInfo.area_name==undefined||nowAreaInfo.area_name==null){
            $('.circle-set-inputName').val('')
        }else{
            $('.circle-set-inputName').val(nowAreaInfo.area_name);
        }
        $('.circle-set-textlong').text('长半径:'+ long1 + 'km');
        $('.circle-set-textsort').text('短半径:'+ short1 + 'km');
        $('.circle-set-textarea').text('区域面积:' + formatArea(feature.getGeometry()) + 'k㎡');
        $('.circle-set-lonlat input').bind('input propertychange',function () {
            updateCircleInfo();
        });

    }else if(type == 'Polygon'){
        $('.polygon-set-select-text').text('度分秒');
        $("#polygon-tr").remove();
        $(".polygon-set-lonlat").append("<table id=\"polygon-tr\">"+"</table>");
        for(var i = 0;i<points[0].length-1;i++){
            var point = ol.proj.toLonLat(points[0][i]);
            $('#polygon-tr').append('<tr>'
                +'<td>'+ (i+1) +'</td>'
                +'<td>'
                +'<div class="polygon-set-lonlat-in">'
                +'<input id="polygon-set-lon1-'+ i +'" style="width: 22px" value="'+ getDFSByD(point[1])[0] +'">'
                +'<div>°</div>'
                +'<input id="polygon-set-lon2-'+ i +'" style="width: 17px" value="'+ getDFSByD(point[1])[1] +'">'
                +'<div>′</div>'
                +'<input id="polygon-set-lon3-'+ i +'" style="width: 17px" value="'+ getDFSByD(point[1])[2] +'">'
                +'<div>″</div>'
                +'<div class="polygon-lon-img" id="polygon-lon-img'+i+'" style="width: 14px"></div>'
                +'</div>'
                +'</td>'
                +'<td>'
                +'<div class="polygon-set-lonlat-in" style="right: 1px">'
                +'<input id="polygon-set-lat1-'+ i +'" style="width: 22px"  value="'+ getDFSByD(point[0])[0] +'">'
                +'<div>°</div>'
                +'<input id="polygon-set-lat2-'+ i +'" style="width: 17px" value="'+ getDFSByD(point[0])[1] +'">'
                +'<div>′</div>'
                +'<input id="polygon-set-lat3-'+ i +'" style="width: 17px" value="'+ getDFSByD(point[0])[2] +'">'
                +'<div>″</div>'
                +'<div class="polygon-lat-img" id="polygon-lat-img'+i+'" style="width: 14px"></div>'
                +'</div>'
                +'</td>'
                +'<td style="width: 25px">'
                +'<div class="polygon-set-delete" id="polygon-set-delete'+ i +'"></div>'
                +'</td>'
                +'</tr>');
            if(nowAreaInfo.area_name==''||nowAreaInfo.area_name==undefined||nowAreaInfo.area_name==null){
                $('.polygon-set-inputName').val('')
            }else{
                $('.polygon-set-inputName').val(nowAreaInfo.area_name);
            }
            $('.polygon-set-textarea').text('区域面积:' + formatArea(feature.getGeometry()) + 'k㎡');
            $('#polygon-lon-img'+i).css('background-position',getPositionByLon(point[0])[0]);
            $('#polygon-lat-img'+i).css('background-position',getPositionByLat(point[1])[0]);
            $(".polygon-set-lonlat input").bind("input propertychange",function(){
                updatePolygonInfo();
            });
        }
        // $('.polygon-set').css('display','block');
    }else if(type == 'Box'){
        var maxx;
        var maxy;
        var minx;
        var miny;
        for(var i = 0;i<points[0].length;i++){
            var point = ol.proj.toLonLat(points[0][i]);
            if(i==0){
                maxx = point[0];
                minx = point[0];
                maxy = point[1];
                miny = point[1];
            }else{
                if(point[0]>maxx){maxx = point[0];}
                if(point[0]<minx){minx = point[0];}
                if(point[1]>maxy){maxy = point[1];}
                if(point[1]<miny){miny = point[1];}
            }
        }
        $('#box-set-lonlat-in1').empty();
        $('#box-set-lonlat-in1').append('<input id="box-lon-dfs-d" style="width: 22px" value="'+ getDFSByD(miny)[0] +'">'
            +'<div>°</div>'
            +'<input id="box-lon-dfs-f" style="width: 17px" value="'+ getDFSByD(miny)[1] +'">'
            +'<div>′</div>'
            +'<input id="box-lon-dfs-s" style="width: 17px" value="'+ getDFSByD(miny)[2] +'">'
            +'<div>″</div>'
            +'<div id="box-lon-img1" style="float:right;height: 15px"></div>');
        $('#box-set-lonlat-in2').empty();
        $('#box-set-lonlat-in2').append('<input id="box-lat-dfs-d" style="width: 22px" value="'+ getDFSByD(minx)[0] +'">'
            +'<div>°</div>'
            +'<input id="box-lat-dfs-f" style="width: 17px" value="'+ getDFSByD(minx)[1] +'">'
            +'<div>′</div>'
            +'<input id="box-lat-dfs-s" style="width: 17px" value="'+ getDFSByD(minx)[2] +'">'
            +'<div>″</div>'
            +'<div id="box-lat-img1" style="float:right;height: 15px"></div>');
        $('#box-set-lonlat-in3').empty();
        $('#box-set-lonlat-in3').append('<input id="box-lon-dfs-d1" style="width: 22px" value="'+ getDFSByD(maxy)[0] +'">'
            +'<div>°</div>'
            +'<input id="box-lon-dfs-f1" style="width: 17px" value="'+ getDFSByD(maxy)[1] +'">'
            +'<div>′</div>'
            +'<input id="box-lon-dfs-s1" style="width: 17px" value="'+ getDFSByD(maxy)[2] +'">'
            +'<div>″</div>'
            +'<div id="box-lon-img2" style="float:right;height: 15px"></div>');
        $('#box-set-lonlat-in4').empty();
        $('#box-set-lonlat-in4').append('<input id="box-lat-dfs-d1" style="width: 22px" value="'+ getDFSByD(maxx)[0] +'">'
            +'<div>°</div>'
            +'<input id="box-lat-dfs-f1" style="width: 17px" value="'+ getDFSByD(maxx)[1] +'">'
            +'<div>′</div>'
            +'<input id="box-lat-dfs-s1" style="width: 17px" value="'+ getDFSByD(maxx)[2] +'">'
            +'<div>″</div>'
            +'<div id="box-lat-img2" style="float:right;height: 15px"></div>');
        $('.box-set-select-text').text('度分秒');
        $('#box-lon-img1').hover(function () {
            $('#box-lon-img1').css('background-position',getPositionByLon(minx)[1]);
        },function () {
            $('#box-lon-img1').css('background-position',getPositionByLon(minx)[0]);
        });
        $('#box-lon-img1').css('background-position',getPositionByLon(minx)[0]);
        $('#box-lat-img1').hover(function () {
            $('#box-lat-img1').css('background-position',getPositionByLat(miny)[1]);
        },function () {
            $('#box-lat-img1').css('background-position',getPositionByLat(miny)[0]);
        });
        $('#box-lat-img1').css('background-position',getPositionByLat(miny)[0]);
        $('#box-lon-img2').hover(function () {
            $('#box-lon-img2').css('background-position',getPositionByLon(maxx)[1]);
        },function () {
            $('#box-lon-img2').css('background-position',getPositionByLon(maxx)[0]);
        });
        $('#box-lon-img2').css('background-position',getPositionByLon(maxx)[0]);
        $('#box-lat-img2').hover(function () {
            $('#box-lat-img2').css('background-position',getPositionByLat(maxy)[1]);
        },function () {
            $('#box-lat-img2').css('background-position',getPositionByLat(maxy)[0]);
        });
        $('#box-lat-img2').css('background-position',getPositionByLat(maxy)[0]);
        if(nowAreaInfo.area_name==''||nowAreaInfo.area_name==undefined||nowAreaInfo.area_name==null){
            $('.box-set-inputName').val('')
        }else{
            $('.box-set-inputName').val(nowAreaInfo.area_name);
        }
        $('.box-set-textarea').text('区域面积:' + formatArea(feature.getGeometry()) + 'k㎡');
        $('.box-set-lonlat input').bind('input propertychange',function () {
            updateBoxInfo();
        });
        // $('.box-set').css('display','block');
    }
}

/************************************椭圆、多边形、矩形的'度分秒'切换响应方法*****************************************/
//椭圆度分秒改变响应方法
$('.circle-set-select-left,.circle-set-select-right').on('click',function () {
    var nowType;
    if(this.class=='circle-set-select-left'){
        nowType = getNewShowdw($('.circle-set-select-text').text(),'up');
    }else{
        nowType = getNewShowdw($('.circle-set-select-text').text(),'down');
    }
    $('.circle-set-select-text').text(nowType);
    var point1 = ol.proj.toLonLat([nowPoints[0],nowPoints[1]]);
    var point2 = ol.proj.toLonLat([nowPoints[2],nowPoints[3]]);
    var center = [(point1[0]+point2[0])/2,(point1[1]+point2[1])/2];
    if(nowType=='度分秒'){
        $('.circle-set-lonlat-in').remove();
        $('.circle-set-lonlat').append('<div class="circle-set-lonlat-in">'
            +'<input id="circle-lon-dfs-d" style="width: 22px" value="'+ getDFSByD(center[1])[0] +'">'
            +'<div>°</div>'
            +'<input id="circle-lon-dfs-f" style="width: 17px" value="'+ getDFSByD(center[1])[1] +'">'
            +'<div>′</div>'
            +'<input id="circle-lon-dfs-s" style="width: 17px" value="'+ getDFSByD(center[1])[2] +'">'
            +'<div>″</div>'
            +'<div id="circle-lon-img"></div>'
            +'</div>'
            +'<div class="circle-set-lonlat-in" style="right: 10px">'
            +'<input id="circle-lat-dfs-d" style="width: 22px" value="'+ getDFSByD(center[0])[0] +'">'
            +'<div>°</div>'
            +'<input id="circle-lat-dfs-f" style="width: 17px" value="'+ getDFSByD(center[0])[1] +'">'
            +'<div>′</div>'
            +'<input id="circle-lat-dfs-s" style="width: 17px" value="'+ getDFSByD(center[0])[2] +'">'
            +'<div>″</div>'
            +'<div id="circle-lat-img"></div>'
            +'</div>')
    }else if(nowType=='度分'){
        $('.circle-set-lonlat-in').remove();
        $('.circle-set-lonlat').append(
            '<div class="circle-set-lonlat-in">'
            +'<input id="circle-lon-dfs-d" style="width: 22px" value="'+ getDFByD(center[1])[0] +'">'
            +'<div>°</div>'
            +'<input id="circle-lon-dfs-f" style="width: 38px" value="'+ getDFByD(center[1])[1] +'">'
            +'<div>′</div>'
            +'<div id="circle-lon-img"></div>'
            +'</div>'
            +'<div class="circle-set-lonlat-in" style="right: 10px">'
            +'<input id="circle-lat-dfs-d" style="width: 22px" value="'+ getDFByD(center[0])[0] +'">'
            +'<div>°</div>'
            +'<input id="circle-lat-dfs-f" style="width: 38px" value="'+ getDFByD(center[0])[1] +'">'
            +'<div>′</div>'
            +'<div id="circle-lat-img"></div>'
            +'</div>')
    }else{
        $('.circle-set-lonlat-in').remove();
        $('.circle-set-lonlat').append('<div class="circle-set-lonlat-in">'
            +'<input id="circle-lon-dfs-d" style="width: 55px" value="'+ getDByD(center[1])[0] +'">'
            +'<div>°</div>'
            +'<div id="circle-lon-img"></div>'
            +'</div>'
            +'<div class="circle-set-lonlat-in" style="right: 10px">'
            +'<input id="circle-lat-dfs-d" style="width: 55px" value="'+ getDByD(center[0])[0] +'">'
            +'<div>°</div>'
            +'<div id="circle-lat-img"></div>'
            +'</div>')
    }
    $('#circle-lon-img').hover(function () {
        $('#circle-lon-img').css('background-position',getPositionByLon(center[0])[1]);
    },function () {
        $('#circle-lon-img').css('background-position',getPositionByLon(center[0])[0]);
    });
    $('#circle-lon-img').css('background-position',getPositionByLon(center[0])[0]);
    $('#circle-lat-img').hover(function () {
        $('#circle-lat-img').css('background-position',getPositionByLat(center[1])[1]);
    },function () {
        $('#circle-lat-img').css('background-position',getPositionByLat(center[1])[0]);
    });
    $('#circle-lat-img').css('background-position',getPositionByLat(center[1])[0]);
});
//多边形度分秒改变响应方法
$('.polygon-set-select-left,.polygon-set-select-right').on('click',function () {
    var nowType;
    if(this.class == 'polygon-set-select-left'){
        nowType = getNewShowdw($('.polygon-set-select-text').text(),'up');
    }else{
        nowType = getNewShowdw($('.polygon-set-select-text').text(),'next');
    }
    $('.polygon-set-select-text').text(nowType);
    var points = nowPoints;
    var feature = vector.getSource().getFeatures()[0];
    if(nowType == '度分秒'){
        $("#polygon-tr").remove();
        $(".polygon-set-lonlat").append("<table id=\"polygon-tr\">"+"</table>");
        for(var i = 0;i<points[0].length-1;i++){
            var point = ol.proj.toLonLat(points[0][i]);
            $('#polygon-tr').append('<tr>'
                +'<td>'+ (i+1) +'</td>'
                +'<td>'
                +'<div class="polygon-set-lonlat-in">'
                +'<input id="polygon-set-lon1-'+ i +'" style="width: 22px" value="'+ getDFSByD(point[1])[0] +'">'
                +'<div>°</div>'
                +'<input id="polygon-set-lon2-'+ i +'" style="width: 17px" value="'+ getDFSByD(point[1])[1] +'">'
                +'<div>′</div>'
                +'<input id="polygon-set-lon3-'+ i +'" style="width: 17px" value="'+ getDFSByD(point[1])[2] +'">'
                +'<div>″</div>'
                +'<div class="polygon-lon-img" id="polygon-lon-img'+i+'" style="width: 15px"></div>'
                +'</div>'
                +'</td>'
                +'<td>'
                +'<div class="polygon-set-lonlat-in" style="right: 1px">'
                +'<input id="polygon-set-lat1-'+ i +'" style="width: 22px"  value="'+ getDFSByD(point[0])[0] +'">'
                +'<div>°</div>'
                +'<input id="polygon-set-lat2'+ i +'" style="width: 17px" value="'+ getDFSByD(point[0])[1] +'">'
                +'<div>′</div>'
                +'<input id="polygon-set-lat3-'+ i +'" style="width: 17px" value="'+ getDFSByD(point[0])[2] +'">'
                +'<div>″</div>'
                +'<div class="polygon-lat-img" id="polygon-lat-img'+i+'" style="width: 15px"></div>'
                +'</div>'
                +'</td>'
                +'<td style="width: 25px">'
                +'<div class="polygon-set-delete" id="polygon-set-delete'+ i +'"></div>'
                +'</td>'
                +'</tr>');
            $('.polygon-set-textarea').text('区域面积:' + formatArea(feature.getGeometry()) + 'k㎡');
            $('#polygon-lon-img'+i).css('background-position',getPositionByLon(point[0])[0]);
            $('#polygon-lat-img'+i).css('background-position',getPositionByLat(point[1])[0]);
        }
    }else if(nowType == '度分'){
        $("#polygon-tr").remove();
        $(".polygon-set-lonlat").append("<table id=\"polygon-tr\">"+"</table>");
        for(var i = 0;i<points[0].length-1;i++){
            var point = ol.proj.toLonLat(points[0][i]);
            $('#polygon-tr').append('<tr>'
                +'<td>'+ (i+1) +'</td>'
                +'<td>'
                +'<div class="polygon-set-lonlat-in">'
                +'<input id="polygon-set-lon1-'+ i +'" style="width: 22px" value="'+ getDFByD(point[1])[0] +'">'
                +'<div>°</div>'
                +'<input id="polygon-set-lon2-'+ i +'" style="width: 40px" value="'+ getDFByD(point[1])[1] +'">'
                +'<div>′</div>'
                +'<div class="polygon-lon-img" id="polygon-lon-img'+i+'" style="width: 15px"></div>'
                +'</div>'
                +'</td>'
                +'<td>'
                +'<div class="polygon-set-lonlat-in" style="right: 1px">'
                +'<input id="polygon-set-lat1-'+ i +'" style="width: 22px"  value="'+ getDFByD(point[0])[0] +'">'
                +'<div>°</div>'
                +'<input id="polygon-set-lat2-'+ i +'" style="width: 40px" value="'+ getDFByD(point[0])[1] +'">'
                +'<div>′</div>'
                +'<div class="polygon-lat-img" id="polygon-lat-img'+i+'" style="width: 15px"></div>'
                +'</div>'
                +'</td>'
                +'<td  style="width: 25px">'
                +'<div class="polygon-set-delete" id="polygon-set-delete'+ i +'"></div>'
                +'</td>'
                +'</tr>');
            $('.polygon-set-textarea').text('区域面积:' + formatArea(feature.getGeometry()) + 'k㎡');
            $('#polygon-lon-img'+i).css('background-position',getPositionByLon(point[0])[0]);
            $('#polygon-lat-img'+i).css('background-position',getPositionByLat(point[1])[0]);
        }
    }else{
        $("#polygon-tr").remove();
        $(".polygon-set-lonlat").append("<table id=\"polygon-tr\">"+"</table>");
        for(var i = 0;i<points[0].length-1;i++){
            var point = ol.proj.toLonLat(points[0][i]);
            $('#polygon-tr').append('<tr>'
                +'<td>'+ (i+1) +'</td>'
                +'<td>'
                +'<div class="polygon-set-lonlat-in">'
                +'<input id="polygon-set-lon1-'+ i +'" style="width: 62px" value="'+ getDByD(point[1])[0] +'">'
                +'<div>°</div>'
                +'<div class="polygon-lon-img" id="polygon-lon-img'+i+'" style="width: 15px"></div>'
                +'</div>'
                +'</td>'
                +'<td>'
                +'<div class="polygon-set-lonlat-in" style="right: 1px">'
                +'<input id="polygon-set-lat1-'+ i +'" style="width: 62px"  value="'+ getDByD(point[0])[0] +'">'
                +'<div>°</div>'
                +'<div class="polygon-lat-img" id="polygon-lat-img'+i+'" style="width: 15px"></div>'
                +'</div>'
                +'</td>'
                +'<td  style="width: 25px">'
                +'<div class="polygon-set-delete" id="polygon-set-delete'+ i +'"></div>'
                +'</td>'
                +'</tr>');
            $('.polygon-set-textarea').text('区域面积:' + formatArea(feature.getGeometry()) + 'k㎡');
            $('#polygon-lon-img'+i).css('background-position',getPositionByLon(point[0])[0]);
            $('#polygon-lat-img'+i).css('background-position',getPositionByLat(point[1])[0]);
        }
    }
});
//矩形度分秒改变响应方法
$('.box-set-select-left,.box-set-select-right').on('click',function () {
    var nowType;
    if(this.class=='box-set-select-left'){
        nowType = getNewShowdw($('.box-set-select-text').text(),'up');
    }else{
        nowType = getNewShowdw($('.box-set-select-text').text(),'down');
    }
    $('.box-set-select-text').text(nowType);
    var points = nowPoints;
    var maxx;
    var maxy;
    var minx;
    var miny;
    for(var i = 0;i<points[0].length;i++){
        var point = ol.proj.toLonLat(points[0][i]);
        if(i==0){
            maxx = point[0];
            minx = point[0];
            maxy = point[1];
            miny = point[1];
        }else{
            if(point[0]>maxx){maxx = point[0];}
            if(point[0]<minx){minx = point[0];}
            if(point[1]>maxy){maxy = point[1];}
            if(point[1]<miny){miny = point[1];}
        }
    }
    if(nowType=='度分秒'){
        $('#box-set-lonlat-in1').empty();
        $('#box-set-lonlat-in1').append('<input id="box-lon-dfs-d" style="width: 22px" value="'+ getDFSByD(miny)[0] +'">'
            +'<div>°</div>'
            +'<input id="box-lon-dfs-f" style="width: 17px" value="'+ getDFSByD(miny)[1] +'">'
            +'<div>′</div>'
            +'<input id="box-lon-dfs-s" style="width: 17px" value="'+ getDFSByD(miny)[2] +'">'
            +'<div>″</div>'
            +'<div id="box-lon-img1" style="float:right;height: 15px"></div>');
        $('#box-set-lonlat-in2').empty();
        $('#box-set-lonlat-in2').append('<input id="box-lat-dfs-d" style="width: 22px" value="'+ getDFSByD(minx)[0] +'">'
            +'<div>°</div>'
            +'<input id="box-lat-dfs-f" style="width: 17px" value="'+ getDFSByD(minx)[1] +'">'
            +'<div>′</div>'
            +'<input id="box-lat-dfs-s" style="width: 17px" value="'+ getDFSByD(minx)[2] +'">'
            +'<div>″</div>'
            +'<div id="box-lat-img1" style="float:right;height: 15px"></div>');
        $('#box-set-lonlat-in3').empty();
        $('#box-set-lonlat-in3').append('<input id="box-lon-dfs-d1" style="width: 22px" value="'+ getDFSByD(maxy)[0] +'">'
            +'<div>°</div>'
            +'<input id="box-lon-dfs-f1" style="width: 17px" value="'+ getDFSByD(maxy)[1] +'">'
            +'<div>′</div>'
            +'<input id="box-lon-dfs-s1" style="width: 17px" value="'+ getDFSByD(maxy)[2] +'">'
            +'<div>″</div>'
            +'<div id="box-lon-img2" style="float:right;height: 15px"></div>');
        $('#box-set-lonlat-in4').empty();
        $('#box-set-lonlat-in4').append('<input id="box-lat-dfs-d1" style="width: 22px" value="'+ getDFSByD(maxx)[0] +'">'
            +'<div>°</div>'
            +'<input id="box-lat-dfs-f1" style="width: 17px" value="'+ getDFSByD(maxx)[1] +'">'
            +'<div>′</div>'
            +'<input id="box-lat-dfs-s1" style="width: 17px" value="'+ getDFSByD(maxx)[2] +'">'
            +'<div>″</div>'
            +'<div id="box-lat-img2" style="float:right;height: 15px"></div>');
    }else if(nowType=='度分'){
        $('#box-set-lonlat-in1').empty();
        $('#box-set-lonlat-in1').append('<input id="box-lon-dfs-d" style="width: 22px" value="'+ getDFByD(miny)[0] +'">'
            +'<div>°</div>'
            +'<input id="box-lon-dfs-f" style="width: 38px" value="'+ getDFByD(miny)[1] +'">'
            +'<div>′</div>'
            +'<div id="box-lon-img1" style="float:right;height: 15px"></div>');
        $('#box-set-lonlat-in2').empty();
        $('#box-set-lonlat-in2').append('<input id="box-lat-dfs-d" style="width: 22px" value="'+ getDFByD(minx)[0] +'">'
            +'<div>°</div>'
            +'<input id="box-lat-dfs-f" style="width: 38px" value="'+ getDFByD(minx)[1] +'">'
            +'<div>′</div>'
            +'<div id="box-lat-img1" style="float:right;height: 15px"></div>');
        $('#box-set-lonlat-in3').empty();
        $('#box-set-lonlat-in3').append('<input id="box-lon-dfs-d1" style="width: 22px" value="'+ getDFByD(maxy)[0] +'">'
            +'<div>°</div>'
            +'<input id="box-lon-dfs-f1" style="width: 38px" value="'+ getDFByD(maxy)[1] +'">'
            +'<div>′</div>'
            +'<div id="box-lon-img2" style="float:right;height: 15px"></div>');
        $('#box-set-lonlat-in4').empty();
        $('#box-set-lonlat-in4').append('<input id="box-lat-dfs-d1" style="width: 22px" value="'+ getDFByD(maxx)[0] +'">'
            +'<div>°</div>'
            +'<input id="box-lat-dfs-f1" style="width: 38px" value="'+ getDFByD(maxx)[1] +'">'
            +'<div>′</div>'
            +'<div id="box-lat-img2" style="float:right;height: 15px"></div>');
    }else{
        $('#box-set-lonlat-in1').empty();
        $('#box-set-lonlat-in1').append('<input id="box-lon-dfs-d" style="width: 55px" value="'+ getDByD(miny)[0] +'">'
            +'<div>°</div>'
            +'<div id="box-lon-img1" style="float:right;height: 15px"></div>');
        $('#box-set-lonlat-in2').empty();
        $('#box-set-lonlat-in2').append('<input id="box-lat-dfs-d" style="width: 55px" value="'+ getDByD(minx)[0] +'">'
            +'<div>°</div>'
            +'<div id="box-lat-img1" style="float:right;height: 15px"></div>');
        $('#box-set-lonlat-in3').empty();
        $('#box-set-lonlat-in3').append('<input id="box-lon-dfs-d1" style="width: 55px" value="'+ getDByD(maxy)[0] +'">'
            +'<div>°</div>'
            +'<div id="box-lon-img2" style="float:right;height: 15px"></div>');
        $('#box-set-lonlat-in4').empty();
        $('#box-set-lonlat-in4').append('<input id="box-lat-dfs-d1" style="width: 55px" value="'+ getDByD(maxx)[0] +'">'
            +'<div>°</div>'
            +'<div id="box-lat-img2" style="float:right;height: 15px"></div>');
    }
    $('#box-lon-img1').hover(function () {
        $('#box-lon-img1').css('background-position',getPositionByLon(minx)[1]);
    },function () {
        $('#box-lon-img1').css('background-position',getPositionByLon(minx)[0]);
    });
    $('#box-lon-img1').css('background-position',getPositionByLon(minx)[0]);
    $('#box-lat-img1').hover(function () {
        $('#box-lat-img1').css('background-position',getPositionByLat(miny)[1]);
    },function () {
        $('#box-lat-img1').css('background-position',getPositionByLat(miny)[0]);
    });
    $('#box-lat-img1').css('background-position',getPositionByLat(miny)[0]);
    $('#box-lon-img2').hover(function () {
        $('#box-lon-img2').css('background-position',getPositionByLon(maxx)[1]);
    },function () {
        $('#box-lon-img2').css('background-position',getPositionByLon(maxx)[0]);
    });
    $('#box-lon-img2').css('background-position',getPositionByLon(maxx)[0]);
    $('#box-lat-img2').hover(function () {
        $('#box-lat-img2').css('background-position',getPositionByLat(maxy)[1]);
    },function () {
        $('#box-lat-img2').css('background-position',getPositionByLat(maxy)[0]);
    });
    $('#box-lat-img2').css('background-position',getPositionByLat(maxy)[0]);
    $('.box-set-lonlat input').bind('input propertychange',function () {
        updateBoxInfo();
    });
});

// //椭圆保存按钮响应方法
// $('.circle-set-save').on('click',function () {
//     $('.circle-set').css('display','none');
//     var areaName = $('.circle-set-inputName').val();
//     saveInfoTo(areaName);
//     updateModifyFeatureStyle([]);
// });

// //多边形保存按钮响应方法
// $('.polygon-set-save').on('click',function () {
//     $('.polygon-set').css('display','none');
//     var areaName = $('.polygon-set-inputName').val();
//     saveInfoTo(areaName);
//     updateModifyFeatureStyle([]);
// });

// //矩形保存按钮响应方法
// $('.box-set-save').on('click',function () {
//     $('.box-set').css('display','none');
//     var areaName = $('.box-set-inputName').val();
//     saveInfoTo(areaName);
//     updateModifyFeatureStyle([]);
// });

//椭圆取消按钮响应方法
$('.circle-set-my-quxiao').on('click',function () {
    $('.circle-set').css('display','none');
    quxiaoClick();
});
//多边形取消按钮响应方法
$('.polygon-set-my-quxiao').on('click',function () {
    $('.polygon-set').css('display','none');
    quxiaoClick();
});
//矩形取消按钮响应方法
$('.box-set-my-quxiao').on('click',function () {
    $('.box-set').css('display','none');
    quxiaoClick();
});
//标签删除按钮响应方法
$('#map-click-close').on('click',function () {
    $('#map-region-click').css('display','none');
    blmol.layer.clear(vector);
    //清空当前绘制对象
    nowAreaInfo = new area_info.init([],11,'',1,nowAreaInfo == null?'':nowAreaInfo.area_id,shuxing);
    nowSetFeature.setStyle(new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'rgba(0,0,0,0)'
        }),
        stroke: new ol.style.Stroke({
            color: 'rgba(0,0,0,0)'
        })
    }));
});
var isClickButton = false;
//标签设置按钮响应方法
$('#map-click-set').on('click',function () {
    // updateModifyFeatureStyle([1]);
    isClickButton = true;
    if(nowSetFeature.getId()=='Circle'){
        $('.circle-set').css('display','block');
    }else if(nowSetFeature.getId()=='Polygon'){
        $('.polygon-set').css('display','block');
    }else{
        $('.box-set').css('display','block');
    }

});
/*********************************图片按钮、输入框点击或改变响应方法*************************************/
/**
 * 椭圆图片点击
 */
$(".circle-set-lonlat").delegate("#circle-lon-img,#circle-lat-img","click",function(){
    changeImage($(this));
    updateCircleInfo();
});
/**
 * 多边形图片点击
 */
$(".polygon-set-lonlat").delegate(".polygon-lon-img,.polygon-lat-img","click",function(){
    changeImage($(this));
    updatePolygonInfo();
});
/**
 * 多边形增加按钮点击
 */
$('.polygon-set-add').on('click',function () {
    var polygonPoints = nowSetFeature.getGeometry().getCoordinates()[0];
    var len = polygonPoints.length;
    var oneArr = [polygonPoints[0][0],polygonPoints[0][1]];
    var endArr = [polygonPoints[len-1][0],polygonPoints[len-1][1]];
    polygonPoints[len-1] = endArr;
    polygonPoints.push(oneArr);
    points = [polygonPoints];
    nowPoints = points;
    nowSetFeature.getGeometry().setCoordinates(nowPoints);
    showFeatureInfo('Polygon',nowPoints,nowSetFeature);
    updatePolygonInfo();
    changeTipArea1(nowPoints[0]);

});
/**
 * 多边形删除按钮点击
 */
$(".polygon-set-lonlat").delegate(".polygon-set-delete","click",function(){
    var arr = $(this).attr('id').split('delete');
    var index = arr[1];
    if(nowPoints[0].length<=4){
        return;
    }
    if(index == 0){
        nowPoints[0].splice(index,1);
        nowPoints[0].splice(nowPoints[0].length-1,1);
        var point = nowPoints[0][0];
        nowPoints[0].push([point[0],point[1]]);
    }else{
        nowPoints[0].splice(index,1);
    }
    points = nowPoints;
    nowSetFeature.getGeometry().setCoordinates(nowPoints);
    showFeatureInfo('Polygon',nowPoints,nowSetFeature);
    updatePolygonInfo();
    changeTipArea1(nowPoints[0]);

});
/**
 * 矩形输入框监听
 */
$('.box-set-lonlat input').bind('input propertychange',function () {
    updateBoxInfo();
});
/**
 * 矩形图片按钮点击
 */
$(".box-set-lonlat").delegate("#box-lon-img1,#box-lat-img1,#box-lon-img2,#box-lat-img2","click",function(){
    changeImage($(this));
    updateBoxInfo();
});
/******************************自定义处理更新绘制图形信息************************************/
/**
 * 更新椭圆信息
 */
function updateCircleInfo() {
    var lon1 = $('#circle-lon-dfs-d').val();
    var lon2 = $('#circle-lon-dfs-f').val();
    var lon3 = $('#circle-lon-dfs-s').val();
    var lat1 = $('#circle-lat-dfs-d').val();
    var lat2 = $('#circle-lat-dfs-f').val();
    var lat3 = $('#circle-lat-dfs-s').val();
    var img1 = $('#circle-lon-img').css('background-position');
    var img2 = $('#circle-lat-img').css('background-position');
    var center = getLonLatByInput(lon1,lon2,lon3,lat1,lat2,lat3,img1,img2);
    var center1 =[(nowPoints[0]+nowPoints[2])/2,(nowPoints[1]+nowPoints[3])/2];
    var x = center[0]-center1[0];
    var y = center[1]-center1[1];
    nowPoints[0] = nowPoints[0]+x;
    nowPoints[1] = nowPoints[1]+y;
    nowPoints[2] = nowPoints[2]+x;
    nowPoints[3] = nowPoints[3]+y;
    points = nowPoints;
    nowSetFeature.setGeometry(geomFun1([[nowPoints[0],nowPoints[1]],[nowPoints[2],nowPoints[3]]]));
    changeTipArea1(nowSetFeature.getGeometry().getCoordinates()[0]);
}
/**
 * 更新多边形信息
 */
function updatePolygonInfo() {
    var polygonPoints = [];
    for(var i =0;i<nowPoints[0].length-1;i++){
        var lon1 = $('#polygon-set-lon1-'+i).val();
        var lon2 = $('#polygon-set-lon2-'+i).val();
        var lon3 = $('#polygon-set-lon3-'+i).val();
        var lat1 = $('#polygon-set-lat1-'+i).val();
        var lat2 = $('#polygon-set-lat2-'+i).val();
        var lat3 = $('#polygon-set-lat3-'+i).val();
        var img1 = $('#polygon-lon-img'+i).css('background-position');
        var img2 = $('#polygon-lat-img'+i).css('background-position');
        var point = getLonLatByInput(lon1,lon2,lon3,lat1,lat2,lat3,img1,img2);
        polygonPoints.push(point);
    }
    polygonPoints.push(polygonPoints[0]);
    nowPoints = [polygonPoints];
    points = nowPoints;
    nowSetFeature.getGeometry().setCoordinates(nowPoints);
    changeTipArea1(nowPoints[0]);
}
/**
 * 更新矩形信息
 */
function updateBoxInfo() {
    var lon11 = $('#box-lon-dfs-d').val();
    var lon12 = $('#box-lon-dfs-f').val();
    var lon13 = $('#box-lon-dfs-s').val();
    var lat11 = $('#box-lat-dfs-d').val();
    var lat12 = $('#box-lat-dfs-f').val();
    var lat13 = $('#box-lat-dfs-s').val();
    var lon21 = $('#box-lon-dfs-d1').val();
    var lon22 = $('#box-lon-dfs-f1').val();
    var lon23 = $('#box-lon-dfs-s1').val();
    var lat21 = $('#box-lat-dfs-d1').val();
    var lat22 = $('#box-lat-dfs-f1').val();
    var lat23 = $('#box-lat-dfs-s1').val();
    var img11 = $('#box-lon-img1').css('background-position');
    var img12 = $('#box-lat-img1').css('background-position');
    var img21 = $('#box-lon-img2').css('background-position');
    var img22 = $('#box-lat-img2').css('background-position');
    var pointzx = getLonLatByInput(lon11,lon12,lon13,lat11,lat12,lat13,img11,img12);
    var pointys = getLonLatByInput(lon21,lon22,lon23,lat21,lat22,lat23,img21,img22);
    nowPoints = [[pointzx,[pointzx[0],pointys[1]],pointys,[pointys[0],pointzx[1]],pointzx]];
    points = nowPoints;
    nowSetFeature.getGeometry().setCoordinates(nowPoints);
    changeTipArea1(nowPoints[0]);
}
/**
 * 取消按钮点击清空未保存的标签
 */
function quxiaoClick() {
    if(nowAreaInfo == null || nowAreaInfo.points.length == 0){
        blmol.layer.clear(vector);
        nowSetFeature.setStyle(new ol.style.Style({
            fill: new ol.style.Fill({
                color: 'rgba(0,0,0,0)'
            }),
            stroke: new ol.style.Stroke({
                color: 'rgba(0,0,0,0)'
            })
        }));
    }
}
/**
 * 保存按钮点击监听方法
 * @param areaName
 */
function saveInfoTo(areaName) {
    var area_types;
    areaType = nowSetFeature.getId();
    if(areaType == 'Circle'){area_types = 0;
    }else if(areaType == 'LineString'){area_types = 1;
    }else if(areaType == 'Polygon'){area_types = 2;
    }else if(areaType == 'box'){area_types = 3;
    }else if(areaType == 'arrow'){area_types = 4;
    }else{area_types = nowAreaInfo.area_type};
    var linepoint = nowSetFeature.getGeometry().getCoordinates()[0];
    var len = linepoint.length;
    var j = [];
    for(var i=0;i<len;i++){
        if(i==0){
            j = [0,linepoint[0][1]];
        }else{
            if(linepoint[i][1]>j[1]){
                j=[i,linepoint[i][1]];
            }
        }
    }
    var element = document.getElementById('map-region-click');
    $('#map-region-click').css('display','block');
    var popup = new ol.Overlay({
        element: element,
        positioning: 'top-left',
        stopEvent: false,
        offset: [0, -38]
    });
    popup.setMap(map);
    popup.setPosition(linepoint[j[0]]);
    if(areaName==''||areaName==null||areaName==undefined){
        $('.map-area-name').text('我的区域');
    }else{
        $('.map-area-name').text(areaName);
    }
    shuxing = formatArea(nowSetFeature.getGeometry());
    nowAreaInfo = new area_info.init(nowPoints,area_types,areaName,1,
        nowAreaInfo == null?'':nowAreaInfo.area_id,shuxing);

}
/**
 * 根据界面经纬度信息获取经纬度数组
 * @returns {ol.Coordinate}
 */
function getLonLatByInput(lon1,lon2,lon3,lat1,lat2,lat3,img1,img2) {
    var x = getRInput(lat1)+getRInput(lat2)/60+getRInput(lat3)/3600;
    var num = parseInt(x/180);
    x= num>0?x-num*180:x+num*180;
    if(getRImage(img2)<0){
        x = -x;
    }
    return ol.proj.fromLonLat([x, getRImage(img1)*(getRInput(lon1)+getRInput(lon2)/60+getRInput(lon3)/3600)]);
}
/**
 * 经纬度图片点击后修改背景图片方法
 * @param obj
 */
function changeImage(obj) {
    var img = obj.css('background-position');
    var arr = img.split(' ');
    if(arr[0]== '0px'){
        arr[0] = '-30px';
    }else if(arr[0]=='-15px'){
        arr[0] = '-45px';
    }else if(arr[0]=='-30px'){
        arr[0] = '0px';
    }else{
        arr[0] = '-15px';
    }
    obj.css('background-position',arr[0] + ' ' + '0px');
    obj.hover(function () {
        obj.css('background-position',arr[0] + ' ' + '-15px');
    },function () {
        obj.css('background-position',arr[0] + ' ' + '0px');
    });

}
/****************************自定义辅助处理方法********************************/
/**
 * 度分秒切换逻辑
 * @param nowShow
 * @param type
 * @returns {*}
 */
function getNewShowdw(nowShow,type) {
    if(nowShow == '度分秒'){
        if(type == 'up'){
            return '度';
        }else{
            return '度分';
        }
    }else if(nowShow == '度分'){
        if(type == 'up'){
            return '度分秒';
        }else{
            return '度';
        }
    }else{
        if(type == 'up'){
            return '度分';
        }else{
            return '度分秒';
        }
    }
}

/**
 * 处理输入框信息
 * @param num
 * @returns {*}
 */
function getRInput(num) {
    num = Number(num);
    if(num == null||num==''||num==undefined||isNaN(num)){
        return 0;
    }
    return num;
}
/**
 * 根据经纬度图片获取经纬度信息
 * @param img
 * @returns {number}
 */
function getRImage(img) {
    var arr = img.split(' ');
    if(arr[0]=='0px'||arr[0]=='-15px'){
        return 1;
    }else{
        return -1;
    }
}
/**
 * 获取度分秒
 * @param d 经度、纬度
 * @returns {*[]}
 */
function getDFSByD(d) {
    var dint = parseInt(d);
    var fint = parseInt((d-dint)*60);
    var sint = parseInt(((d-dint)*60-fint)*60);
    return [Math.abs(dint),Math.abs(fint),Math.abs(sint)];
}
/**
 * 获取度分
 * @param d 经度、纬度
 * @returns {*[]}
 */
function getDFByD(d) {
    var dint = parseInt(d);
    var fint = parseInt((d-dint)*60*1000)/1000;

    return [Math.abs(dint),Math.abs(fint)];
}

/**
 * 获取度
 * @param d 经度、纬度
 * @returns {*[]}
 */
function getDByD(d) {
    var dint = parseInt(d*100000)/100000;
    return [Math.abs(dint)];
}

/**
 * 根据经度获取背景图片位置
 * @param lon
 * @returns {string[]}
 */
function getPositionByLon(lon) {
    var yu = lon%360;
    if(yu<0){
        yu=yu+360;
    }
    if(yu>180){
        return ['-30px 0px','-30px -15px'];
    }else{
        return ['0px 0px','0px -15px'];
    }
}

/**
 * 根据纬度获取背景图片位置
 * @param lat
 * @returns {string[]}
 */
function getPositionByLat(lat) {
    var yu = lat%360;
    if(yu<0){
        yu=yu+360;
    }
    if(yu>180){
        return ['-45px 0px','-45px -15px'];
    }else{
        return ['-15px 0px','-15px -15px'];
    }
}

/**
 * 修改提示视图位置
 */
function changeTipArea1(linepoint) {
    var len = linepoint.length;
    var j = [];
    for(var i=0;i<len;i++){
        if(i==0){
            j = [0,linepoint[0][1]];
        }else{
            if(linepoint[i][1]>j[1]){
                j=[i,linepoint[i][1]];
            }
        }
    }
    var element = document.getElementById('map-region-click');
    $('#map-region-click').css('display','block');
    var popup = new ol.Overlay({
        element: element,
        positioning: 'top-left',
        stopEvent: false,
        offset: [0, -38]
    });
    popup.setMap(map);
    popup.setPosition(linepoint[j[0]]);
}

/****************************绘制类型改变事件监听方法***************************************/
/**
 * 绘图类型样式按钮点击事件响应方法
 */
$(".map-add").on("click",function () {
    $("#speed-area").hide();
    if ($(".map-add img").attr('src') == '/images/manage/map/add.png'){
        $(".map-add img").attr('src','/images/manage/map/add-select.png');
    }else{
        // if(nowHtml == 'business'){
        //     nowAreaInfo1.speeds = [];
        // }
        drewFeatures = [];
        drewFeaturesType = [];
        $(".map-add img").attr('src','/images/manage/map/add.png');
        $(".map-polygon img").attr('src','/images/manage/map/polygon.png');
        $(".map-circle img").attr('src','/images/manage/map/circle.png');
        $(".map-line img").attr('src','/images/manage/map/lineString.png');
        $(".map-box img").attr('src','/images/manage/map/box.png');
        $(".map-arrow img").attr('src','/images/manage/map/arrow-nor.png');

    }
});
$(".map-circle").on("click",function () {
    $("#speed-area").hide();
    if ($(".map-circle img").attr('src') == '/images/manage/map/circle.png'){
        $(".map-circle img").attr('src','/images/manage/map/circle-select.png');
        $(".map-polygon img").attr('src','/images/manage/map/polygon.png');
        $(".map-line img").attr('src','/images/manage/map/lineString.png');
        $(".map-box img").attr('src','/images/manage/map/box.png');
        $(".map-arrow img").attr('src','/images/manage/map/arrow-nor.png');
    }else{
        $(".map-circle img").attr('src','/images/manage/map/circle-select.png')
    }
});
$(".map-line").on("click",function () {
    $("#speed-area").hide();
    if ($(".map-line img").attr('src') == '/images/manage/map/lineString.png'){
        $(".map-line img").attr('src','/images/manage/map/lineString-select.png');
        $(".map-polygon img").attr('src','/images/manage/map/polygon.png');
        $(".map-circle img").attr('src','/images/manage/map/circle.png');
        $(".map-box img").attr('src','/images/manage/map/box.png');
        $(".map-arrow img").attr('src','/images/manage/map/arrow-nor.png');
    }else{
        $(".map-line img").attr('src','/images/manage/map/lineString.png')
    }
});
$(".map-polygon").on("click",function () {
    $("#speed-area").hide();
    if ($(".map-polygon img").attr('src') == '/images/manage/map/polygon.png'){
        $(".map-polygon img").attr('src','/images/manage/map/polygon-select.png');
        $(".map-circle img").attr('src','/images/manage/map/circle.png');
        $(".map-line img").attr('src','/images/manage/map/lineString.png');
        $(".map-box img").attr('src','/images/manage/map/box.png');
        $(".map-arrow img").attr('src','/images/manage/map/arrow-nor.png');
    }else{
        $(".map-polygon img").attr('src','/images/manage/map/polygon-select.png')
    }
});
$(".map-box").on("click",function () {
    $("#speed-area").hide();
    if ($(".map-box img").attr('src') == '/images/manage/map/box.png'){
        $(".map-box img").attr('src','/images/manage/map/box-select.png');
        $(".map-polygon img").attr('src','/images/manage/map/polygon.png');
        $(".map-circle img").attr('src','/images/manage/map/circle.png');
        $(".map-line img").attr('src','/images/manage/map/lineString.png');
        $(".map-arrow img").attr('src','/images/manage/map/arrow-nor.png');
    }else{
        $(".map-box img").attr('src','/images/manage/map/box-select.png')
    }
});
$(".map-arrow").on("click",function () {
    $("#speed-area").hide();
    if ($(".map-arrow img").attr('src') == '/images/manage/map/arrow-nor.png'){
        $(".map-arrow img").attr('src','/images/manage/map/arrow-select.png');
        $(".map-polygon img").attr('src','/images/manage/map/polygon.png');
        $(".map-circle img").attr('src','/images/manage/map/circle.png');
        $(".map-box img").attr('src','/images/manage/map/box.png');
        $(".map-line img").attr('src','/images/manage/map/lineString.png');
    }else{
        $(".map-arrow img").attr('src','/images/manage/map/arrow-select.png')
    }
});
$("#speed-area").hide();

function changeAllColor() {
    $(".map-arrow img").attr('src','/images/manage/map/arrow-nor.png');
    $(".map-polygon img").attr('src','/images/manage/map/polygon.png');
    $(".map-circle img").attr('src','/images/manage/map/circle.png');
    $(".map-box img").attr('src','/images/manage/map/box.png');
    $(".map-line img").attr('src','/images/manage/map/lineString.png');
}
/*********************************其他**************************************/
/**
 * 设置控件可拖动方法
 */
(function ($) {
    var move = false;           //标记控件是否处于被拖动状态
    var dragOffsetX = 0;        //控件左边界和鼠标X轴的差
    var dragOffsetY = 0;        //控件上边界和鼠标Y轴的差
    var dragObj = null;         //用于存储当前对象

    $.fn.mydrag = function () {
        dragObj = this;

        this.mousedown(function (e) {
            move = true;
            //获取鼠标和该控件的位置偏移量，并存入全局变量供后续调用
            dragOffsetX = e.clientX - e.currentTarget.offsetLeft;
            dragOffsetY = e.clientY - e.currentTarget.offsetTop;
        });

        $(document).mousemove(function (e) {
            if (move) {
                //不断获取鼠标新的坐标，并计算出控件的新坐标
                var newX = e.clientX - dragOffsetX;
                var newY = e.clientY - dragOffsetY;

                //边界控制，document.documentElement.clientWidth：可见区域宽度  document.documentElement.clientHeight：可见区域高度
                newX = newX < 0 ? 0 : newX;
                newY = newY < 0 ? 0 : newY;
                newX = newX > (document.documentElement.clientWidth - dragObj.outerWidth()) ? (document.documentElement.clientWidth - dragObj.outerWidth()) : newX;
                newY = newY > (document.documentElement.clientHeight - dragObj.outerHeight()) ? (document.documentElement.clientHeight - dragObj.outerHeight()) : newY;

                //把新的坐标重新赋值给控件
                dragObj.css({ left: newX + "px", top: newY + "px", position: 'absolute' });
            }
        });

        $(document).mouseup(function () {
            if (move) {
                move = false;
            }
        });
    };
})(jQuery);
function getShipTypeById(id) {
    var type = '';
    switch (parseInt(id)){
        case 2:
            type = '地效翼船';
            break;
        case 3:
            type = '作业船';
            break;
        case 4:
            type = '高速船';
            break;
        case 5:
            type = '特种船';
            break;
        case 6:
            type = '客船';
            break;
        case 7:
            type = '货船';
            break;
        case 8:
            type = '油轮';
            break;
        default:
            type = '其他';
            break;
    }
    return type;
}

function getEventTypeById(id) {
    var type = '';
    switch (parseInt(id)){
        case 0:
            type = '动力航行';
            break;
        case 1:
            type = '锚泊';
            break;
        case 2:
            type = '未受指令';
            break;
        case 3:
            type = '机动性受限';
            break;
        case 4:
            type = '受吃水限制';
            break;
        case 5:
            type = '锚链系泊';
            break;
        case 6:
            type = '搁浅';
            break;
        case 7:
            type = '捕捞中';
            break;
        case 8:
            type = '风帆动力航行';
            break;
        default:
            type = '未知';
            break;
    }
    return type;

}

function getIdTypeByShip(type) {
    var id = 9;
    if(type == '地效翼船'){
        id = 2
    }else if(type == '作业船'){
        id = 3
    }else if(type == '高速船'){
        id = 4
    }else if(type == '特种船'){
        id = 5
    }else if(type == '客船'){
        id = 6
    }else if(type ==  '货船'){
        id = 7
    }else if(type == '油轮'){
        id = 8
    }else if(type == '其他'){
        id = 9
    }else {
        id = 9
    }
    return id;
}

function getIdTypeByEvent(type) {
    var id = 7;
    if(type == '动力航行'){
        id = 0
    }else if(type == '锚泊'){
        id = 1
    }else if(type == '未受指令'){
        id = 2
    }else if(type == '机动性受限'){
        id = 3
    }else if(type == '受吃水限制'){
        id = 4
    }else if(type ==  '锚链系泊'){
        id = 5
    }else if(type == '搁浅'){
        id = 6
    }else if(type == '捕捞中'){
        id = 7
    }else {
        id = 7
    }
    return id;
}