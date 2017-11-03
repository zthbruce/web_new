/**
 * Created by Shitc on 2017/5/18.
 */
/**
 * 右上侧工具栏操作
 */
//工具栏显示隐藏
let rightToolDisplay = false;
$('#right_tool_btn').click(function(){
    if(rightToolDisplay){
        $('#right_tool').animate({'right':'-160px'},300);
        $(this).css('background-position-y','-287px');
    }
    else{
        $('#right_tool').animate({'right':'0px'},300);
        $(this).css('background-position-y','-245px');
    }
    rightToolDisplay = !rightToolDisplay;
});


$('.basic_map_list>div').hover(function(){
    $(this).addClass('map_mouse_move');
},function(){
    $(this).removeClass('map_mouse_move');
});
//地图点击切换状态
$(".basic_map_list>div").click(function(){
    $(".basic_map_list>div").removeClass("map_mouse_select")
    $(this).addClass("map_mouse_select");
});

let mapTypeListDisplay = false;
let coorContentDisplay = false;
let rangingDisplay = false;
let polygonContentDisplay = false;
$('.switch_map').click(function(){
    if(mapTypeListDisplay){$('.right_basic_map').slideUp(200);}
    else{$('.right_basic_map').slideDown(200);}
    mapTypeListDisplay = !mapTypeListDisplay;
    // $('.obtain_content').slideUp(200);
    // coorContentDisplay = false;
    // $('.polygon_content').slideUp(200);
    // polygonContentDisplay = false;
});
let obtainMouseMove;
let obtainMouseClick;
$('.obtain_coordinate').click(function(){
    if(coorContentDisplay){
        $('.obtain_content').slideUp(200);
        $('#mouse_rightBottom_text').css('display','none');
        blmol.bind.removeOnClickListener(obtainMouseMove);
        blmol.bind.removeOnClickListener(obtainMouseClick);
    }
    else{
        $('.obtain_content').slideDown(200);
        $('#mouse_rightBottom_text').css('display','block');
        obtainMouseMove = blmol.bind.addOnMouseMoveListener(map,function(map,coordinate,feature,evt){
            followMouseMove(event);
            $('#mouse_rightBottom_text').text(coordinate[0].toFixed(6)+','+coordinate[1].toFixed(6));
        });
        obtainMouseClick = blmol.bind.addOnClickListener(map,function(map,coordinate,feature,evt){
            $('.obtain_content>input').val(coordinate[0].toFixed(6)+','+coordinate[1].toFixed(6));
        });
    }
    coorContentDisplay = !coorContentDisplay;
    // $('.right_basic_map').slideUp(200);
    // mapTypeListDisplay = false;
    // $('.polygon_content').slideUp(200);
    // polygonContentDisplay = false;
});
//复制坐标经纬度
$('#copy_obtain_coordinate').click(function(event){
    $('.obtain_content>input').select();
    document.execCommand("Copy"); // 执行浏览器复制命令
    event.stopPropagation();
});

//标尺单击事件
let rangingMouseMove;
let rangingMouseClick;
let rangingMouseDoubleClick;

//设置开始测量标志
let startRangingLogo = false;
let pointId = 'point';
let pointIdNum = 0;
$('.screen_scale').click(function(){
    if(polygonContentDisplay){
        map.removeInteraction(draw);
        // map.removeInteraction(select);
        // map.removeInteraction(modify);
        // map.getOverlays().clear();
        // blmol.layer.clear(vector);
        vector.getSource().clear();
    }
    if(rangingDisplay){
        blmol.bind.removeOnClickListener(rangingMouseMove);
        blmol.bind.removeOnClickListener(rangingMouseClick);
        blmol.bind.removeOnClickListener(rangingMouseDoubleClick);
        $(document).off('click');
        helpTooltipElement.classList.add('hidden');
        rangingInLogo = false;
        map.removeInteraction(draw);
        map.getOverlays().clear();
        blmol.layer.clear(range_vector);
        range_vector.getSource().clear();
        pointIdNum = 0;
        startRangingLogo = false;
    }else{
        rangingMouseMove = blmol.bind.addOnMouseMoveListener(map,function(map,coordinate,feature,evt){
            map.getViewport().addEventListener('mouseout', function() {
                helpTooltipElement.classList.add('hidden');
            });
            pointerMoveHandler(evt);
        });
        //添加鼠标单击监听事件
        rangingMouseClick = blmol.bind.addOnClickListener(map,function(map,coordinate,feature,evt){
            rangingPaintingPoint(coordinate);
        });
        rangingMouseDoubleClick = blmol.bind.addOnDoubleClickListener(map,function(map,coordinate,feature,evt){
            rangingPaintingPoint(coordinate);
        });
        addRangingInteraction();
        $(document).on('click',function(evt){
            rangingInLogo = true;
        });
    }
    rangingDisplay = !rangingDisplay;
});

//自定义测距时端点函数
function rangingPaintingPoint(coordinate){
    let feature = new ol.Feature({
        id: pointId+pointIdNum,
        geometry: new ol.geom.Point(ol.proj.fromLonLat(coordinate))
    });
    if(startRangingLogo&&pointIdNum!=0){
        feature.setStyle(new ol.style.Style({
            image: new ol.style.Circle({
                radius: 5,
                fill: new ol.style.Fill({color: [200,0,100]})
            })
        }));
    }else{
        feature.setStyle(new ol.style.Style({
            image: new ol.style.Circle({
                radius: 5,
                fill: new ol.style.Fill({color: [0,100,255]})
            })
        }));
    }
    if(startRangingLogo){pointIdNum++;}
    else{pointIdNum = 0;}
    range_vector.getSource().addFeature(feature);
}

let slideFlag = false;
// 画多边形的竖栏展开
$('.draw_polygon').click(function(){
    if(slideFlag){
        $('.polygon_content').slideUp(200);
        // 清空当前画法
        if(polygonContentDisplay){
            map.removeInteraction(draw);
            vector.getSource().clear();
        }
        map.removeInteraction(draw);
        // dragDrop.setActive(false);
    }
    else{
        $('.polygon_content').slideDown(200);
        // dragDrop.setActive(true);
    }
    slideFlag = !slideFlag;
});


$('.draw_polygon li').click(function(event){
    if(rangingDisplay){
        blmol.bind.removeOnClickListener(rangingMouseMove);
        blmol.bind.removeOnClickListener(rangingMouseClick);
        blmol.bind.removeOnClickListener(rangingMouseDoubleClick);
        $(document).off('click');
        helpTooltipElement.classList.add('hidden');
        rangingInLogo = false;
        map.removeInteraction(draw);
        map.getOverlays().clear();
        blmol.layer.clear(range_vector);
        range_vector.getSource().clear();
        pointIdNum = 0;
        startRangingLogo = false;
    }
    // console.log($(this).index());
    // 当前按钮的类型
    let drawClass = $(this).attr('class');
    //将之前的多边形清空
    if(polygonContentDisplay){
        map.removeInteraction(draw);
        // map.removeInteraction(select);
        // map.removeInteraction(modify);
        vector.getSource().clear();
        polygonContentDisplay = !polygonContentDisplay;
    }
    addInteraction(drawClass);
    polygonContentDisplay = !polygonContentDisplay;
    event.stopPropagation();
});

// function addDrawInteraction(value) {
//     // let value = value;
//     console.log(value);
//     if (value !== 'None') {
//         if (value === 'Box') {
//             value = 'Circle';
//             // console.log(132);
//             let geometryFunction = ol.interaction.Draw.createBox();
//             addDraw = new ol.interaction.Draw({
//                 source: source,
//                 type: (value),
//                 geometryFunction: geometryFunction
//             });
//             map.addInteraction(addDraw);
//         }else{
//             addDraw = new ol.interaction.Draw({
//                 source: source,
//                 type: (value)
//             });
//             map.addInteraction(addDraw);
//         }
//     }
// }

//自定义跟随鼠标移动文本框函数
function followMouseMove(event){

    let divTop = event.clientY+15;
    let divLeft = event.clientX+15;
    if(divLeft>$(window).width()-140){divLeft = $(window).width()-140;}
    if(divTop>$(window).height()-20){divTop = $(window).height()-20;}
    $('#mouse_rightBottom_text').css({'top':divTop,'left':divLeft});

}

/**
 * 测距功能
 */
let sketch;//目前绘制的功能
let helpTooltipElement;//帮助工具提示元素
let helpTooltip;// 叠加显示帮助信息
let continueLineMsg = '在地图上双击鼠标左键结束测距，总距离：';//用户在绘制线时显示的消息
let rangingInLogo = false;//设置绘制中标志 rangingInLogo
let lastTimeTotalDistance = '0nm';//设置上一次总距离

// let draw;

//处理指针移动
let pointerMoveHandler = function(evt) {
    if (evt.dragging) {return;}
    let helpMsg = '在地图上单击鼠标左键开始测距';  //初始提示信息
    if (sketch) {
        let geom = (sketch.getGeometry());
        helpMsg = continueLineMsg;
    }
    helpTooltipElement.innerHTML = helpMsg;
    helpTooltip.setPosition(evt.coordinate);
    helpTooltipElement.classList.remove('hidden');
};
//格式长度输出
let formatLength = function(line) {
    let output = (Math.round(line.getLength() * 100) / 100 / 1000 * 0.5399568);
    output = output.toFixed(2);
    return output +' ' + 'nm';
};
//设置样式、函数等
function addRangingInteraction() {
    let type = 'LineString';
    let draw = new ol.interaction.Draw({
        source: range_source,
        type: (type),
        style: new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: 'rgb(174,117,40)',   //测距中线颜色
                lineDash: [1, 1],            //测距中线样式
                width: 2                       //测距中线宽度
            }),
            image: new ol.style.Circle({
                radius: 5,                     //测距点圆的大小
                stroke: new ol.style.Stroke({
                    color: 'rgba(0, 0, 0, 0.7)'  //测距点圆的线条颜色
                }),
                fill: new ol.style.Fill({
                    color: 'rgba(255, 255, 255, 0.2)'  //测距点圆的填充色
                })
            })
        })
    });
    map.addInteraction(draw);
    createHelpTooltip();
    let listener;
    draw.on('drawstart',function(evt) {
        sketch = evt.feature;
        let tooltipCoord = evt.coordinate;
        startRangingLogo = true;
        listener = sketch.getGeometry().on('change', function(evt) {
            let geom = evt.target;
            let output;
            output = formatLength(geom);
            tooltipCoord = geom.getLastCoordinate();
            if(rangingInLogo){
                let measureTooltipElement = document.createElement('div');
                measureTooltipElement.className = 'ranging_distance_show';
                let measureTooltip = new ol.Overlay({
                    offset:[8,-10],
                    element: measureTooltipElement,
                    positioning: 'bottom-center'
                });
                map.addOverlay(measureTooltip);
                let lastTimeNum = parseFloat(output)-parseFloat(lastTimeTotalDistance);
                lastTimeNum = lastTimeNum.toFixed(2);
                measureTooltipElement.innerHTML = lastTimeNum+'nm'+'/'+output;
                measureTooltip.setPosition(tooltipCoord);
                rangingInLogo = false;
                lastTimeTotalDistance = output;
            }
            helpTooltipElement.innerHTML = continueLineMsg + output;
        });
    }, this);
    draw.on('drawend',function() {
        startRangingLogo = false;
        lastTimeTotalDistance = '0nm';
        sketch = null;
        ol.Observable.unByKey(listener);
        rangingInLogo = false;
    }, this);
}
//创建右侧提示框
function createHelpTooltip() {
    if (helpTooltipElement) {
        helpTooltipElement.parentNode.removeChild(helpTooltipElement);
    }
    helpTooltipElement = document.createElement('div');
    helpTooltipElement.className = 'tooltip hidden';
    helpTooltip = new ol.Overlay({
        element: helpTooltipElement,
        offset: [15, 0],
        positioning: 'center-left'
    });
    map.addOverlay(helpTooltip);
}


