/**
 * 即 blm openLayer, 如果 blmol 未定义则模拟一个全局的命名空间，否则直接使用 blmol
 *
 * @type {{}}
 */
var blmol = blmol || {
        obj:{},
        feature:{},
        bind:{},
        math:{},
        layer:{}
    };

/**
 * map 是一个下层命名空间，包括了向地图中添加、移除组件的多个函数，例如：向地图中添加图层、添加瓷片、添加视图等等
 *
 * @type {{}}
 */
blmol.map = {};

/**
 * 根据指定的参数创建一个 map 实例，默认使用 天地图 作为底图图层 id 为 blmLayer，且不显示 + 、-、i 这三个按钮
 *
 * @param target 地图绑定到的 html 元素的 id
 * @param initCenter {Array.<number>} 启动时的地图中心点
 * @param initZoom  启动时的地图 Zoom 等级范围
 * @param layers {Array.<ol.layer.Base>|undefined} 起始时的图层列表，如果未指定则默认为天地图，id 为 blmLayer
 * @param showZoomControl {boolean|undefined} 是否显示左上角的 +、- 这两个 zoom 按钮，未指定则默认为 false
 * @param showAttribution {boolean|undefined} 是否显示右下角的 i 这个 attribution 按钮，未指定则默认为 false
 * @param enableRotation {boolean|undefined} 是否启用地图旋转，默认启用
 * @returns {ol.Map}
 */
blmol.map.createMap = function (target, initCenter, initZoom, layers, showZoomControl,
                                showAttribution, enableRotation) {
    showZoomControl = showZoomControl ? showZoomControl : false;
    showAttribution = showAttribution ? showAttribution : false;
    enableRotation = enableRotation ? enableRotation : true;

    // if (layers == null) {
    //     layers = [
    //         blmol.layer.createTianDiTile("blmLayer")
    //     ];
    // }
    if (layers == null) {
        layers = [
            blmol.layer.createBasicTile("blmLayer")
        ];
    }

    return new ol.Map({
        layers: layers,
        controls: ol.control.defaults({
            /* 为 false 时，不显示右下角的 i 按钮 */
            attribution: showAttribution,
            /* 为 false 时，不显示右上角的 + - 按钮 */
            zoom: showZoomControl
        }),
        view: new ol.View({
            center: ol.proj.fromLonLat(initCenter),
            zoom: initZoom,
            enableRotation: enableRotation
        }),
        target: target
    });
};

/**
 * 添加指定的图层或图层组到指定的地图，添加的 layer，必须指定 id，否则添加失败
 *
 * @param map {ol.Map} 指定的地图
 * @param layer {ol.layer.Base} 添加的指定的图层或图层组，必须指定 id
 */
blmol.map.addLayer = function (map, layer) {
    if (typeof layer.get("id") != "string") {
        console.log("the id of layer must be string!");
        return;
    }

    map.addLayer(layer);
};

/**
 * 从地图中删除指定的图层或图层组
 *
 * @param map {ol.Map} 指定的地图
 * @param layer {ol.layer.Base} 要删除的图层或图层组
 * @return {ol.layer.Base|undefined} 如果地图存在此 layer，则返回之，否则返回 undefined
 */
blmol.map.removeLayer = function (map, layer) {
    return map.removeLayer(layer);
};

/**
 * 根据给定的 id 从 map 查找图层
 *
 * @param map {ol.Map} 指定的地图
 * @param id {string} 想要查找的图层的 id，id 必须是严格的字符串类型，在比较过程中会使用全等比较 ===
 * @returns {ol.layer.Base|undefined} 成功查找到的话，返回查找到的图层或图层组，否则返回 undefined
 */
blmol.map.getLayerById = function (map, id) {
    var layers = map.getLayers().getArray();
    for(var i = 0; i < layers.length; i++) {
        if(layers[i].get("id") === id) {
            return layers[i];
        }
    }
};

/**
 * 返回指定地图的所有图层和图层组
 *
 * @param map {ol.Map} 指定的地图
 * @returns {Array.<ol.layer.Base>} 所有的图层和图层组
 */
blmol.map.getAllLayers = function (map) {
    return map.getLayers().getArray();
};

/**
 * 获取地图的容器，即在 html 中用来容纳 map 的元素
 *
 * @param map {ol.Map} 指定的地图
 * @return {Element|string|undefined} html 元素，如果没有元素容纳 map 则返回 undefined
 */
blmol.map.getTarget = function (map) {
    return map.getTarget();
};

/**
 * 设置地图的容器，即在 html 中用来容纳 map 的元素
 *
 * @param map {ol.Map} 指定的地图
 * @param target {Element|string} 用来容纳 map 的元素
 */
blmol.map.setTarget = function (map, target) {
    map.setTarget(target);
};

/**
 * 获取地图的 view，由于 openLayer 3 使用的是 mvc 模式，所以 view 实际上指的是 mvc 中的视图，即地图显示状态的抽象
 *
 * @param map {ol.Map} 指定的地图
 * @return {ol.View} 地图的 view
 */
blmol.map.getView = function (map) {
    return map.getView();
};

/**
 * 设置地图的 view，如果两个地图使用的 view 相同的话，这两个地图将会表现出一定程度上的协同性，参见用例 operate
 * multiple maps
 *
 * @param map {ol.Map} 指定的地图
 * @param view {Element|string} map 的 view
 */
blmol.map.setView = function (map, view) {
    map.setView(view);
};

// /**
//  *
//  * @param map {ol.Map} 指定的地图
//  * @param coordinate
//  * @param project
//  */
// blmol.map.hasMarkerAtCoordinate = function(map, coordinate, project) {
//     // var pixel;
//     // if (project) {
//     //
//     // } else {
//     //     pixel = map.getPixelFromCoordinate()
//     // }
//     return map.hasFeatureAtCoordinate(coordinate);
// };