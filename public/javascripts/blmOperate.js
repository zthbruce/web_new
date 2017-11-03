/**
 * operation 是一个下层命名空间，包括了操作地图的多个功能函数，例如：设置地图中心，设置缩放等级，放大缩小地图，
 * 旋转地图等等
 *
 * @type {{}}
 */
blmol.operation = {};

/**
 * 获取指定的地图的当前经纬度
 *
 * @param map {ol.Map} 指定的地图
 * @returns {ol.Coordinate} 返回的经纬度，例如 [0, 0]，中心点必须源自 'EPSG:4326' 映射，即通常所说的经、纬度
 */
blmol.operation.getCenter = function (map) {
    return ol.proj.toLonLat(map.getView().getCenter());
};

/**
 * 设置当前地图的中心
 *
 * @param map {ol.Map} 指定的地图
 * @param center 中心点代表经纬度，类型为 Array.<number>，例如 [0，0]，中心点必须源自 'EPSG:4326' 映射，
 * 即通常所说的经、纬度
 */
blmol.operation.setCenter = function (map, center) {
    map.getView().setCenter(ol.proj.fromLonLat(center));
};

/**
 * 获取当前地图的显示范围，返回一个经纬度数组，数组的顺序是 [minX, minY, maxX, maxY]，由于这是一个经纬度数组，所
 * 以 [minX, minY] 组成的坐标是左下角，[maxX, maxY] 组成的坐标是右上角。另外由于当地图缩放到比较小时，一个屏幕上
 * 会出现地图重复的拼满屏幕，此时地图中会有多个五大洲，为了将这些重复的区域区分开，其坐标会加上 360 * n 其中 n 表示
 * 当前区域与原始区域间有多少个重复的区域且向左为负，向右为正。因此调用此方法时会出现诸如：-1400，890 等不处于
 * -180 到 180 度之间的坐标，因此需要对这些坐标取余。
 *
 * @param map {ol.Map} 指定的地图
 * @return {Array.<number>} 当前地图的显示范围，即左下角与右上角的坐标。
 */
blmol.operation.getCurrentExtent = function (map) {
    return ol.proj.transformExtent(map.getView().calculateExtent(map.getSize()),
        'EPSG:3857', 'EPSG:4326');
};

/**
 * 设置当前地图的 zoom 等级
 *
 * @param map {ol.Map} 指定的地图
 * @param zoom {number} zoom 等级
 */
blmol.operation.setZoom = function (map, zoom) {
    var view = map.getView();
    view.setZoom(zoom);
};

/**
 * 获取当前地图的 zoom 等级
 *
 * @param map {ol.Map} 指定的地图
 * @return {number} 当前地图的 zoom 等级
 */
blmol.operation.getZoom = function (map) {
    return map.getView().getZoom();
};

/**
 * 当前 map 的 zoom 等级缩小一级
 *
 * @param map {ol.Map} 指定的地图
 */
blmol.operation.zoomIn = function (map) {
    var zoom = map.getView().getZoom();
    map.getView().setZoom(zoom - 1);
};

/**
 * 当前 map 的 zoom 等级放大一级
 *
 * @param map {ol.Map} 指定的地图
 */
blmol.operation.zoomOut = function (map) {
    var zoom = map.getView().getZoom();
    map.getView().setZoom(zoom + 1);
};

/**
 * 获取当前的 map 的地图的旋转弧度
 *
 * @param map {ol.Map} 指定的地图
 * @return {number} 旋转的弧度
 */
blmol.operation.getRotation = function (map) {
    return map.getView().getRotation();
};

/**
 * 设置当前的 map 的地图的旋转弧度
 *
 * @param map {ol.Map} 指定的地图
 * @param rotation {number} 旋转的弧度
 */
blmol.operation.setRotation = function (map, rotation) {
    return map.getView().setRotation(rotation);
};

/**
 * 将 resolution 转换为 zoom 的工具函数，因为 openLayer 的默认 zoom 范围在 [0, 28] 之间，因此需要对上下限进行
 * 额外的处理
 *
 * @param resolution {number} 传入的分辨率
 * @returns {number} 转换后得到的 zoom 值
 */
blmol.operation.toZoom = function (resolution) {
    if (resolution == 0) {
        return 28;
    } else if (isFinite(resolution)){
        return  Math.log2(156543.03392804097 / resolution);
    } else {
        return 0;
    }
};

/**
 * 将 zoom 转换为 resolution 的工具函数，因为 openLayer 的默认 zoom 范围在 [0, 28] 之间，因此需要对上下限进行
 * 额外的处理
 *
 * @param zoom {number} 传入的 zoom 值
 * @returns {number} 转换后的分辨率
 */
blmol.operation.fromZoom = function (zoom) {
    if (zoom <= 0) {
        return Number.POSITIVE_INFINITY;
    } else if (zoom >= 28) {
        return 0;
    } else {
        return 156543.03392804097 / Math.pow(2, zoom);
    }
};

/**
 * 将 'EPSG:3857' 的投影坐标转换为 'EPSG:4326' 的投影系坐标
 *
 * @param coordinate {ol.Coordinate} 'EPSG:3857' 的投影坐标
 * @returns {ol.Coordinate} 'EPSG:4326' 的投影系坐标
 */
blmol.operation.toLonLat = function (coordinate) {
    return ol.proj.toLonLat(coordinate);
};

/**
 * 将 'EPSG:4326' 的投影坐标转换为 'EPSG:3857' 的投影系坐标
 *
 * @param coordinate {ol.Coordinate} 'EPSG:4326' 的投影系坐标
 * @returns {ol.Coordinate} 'EPSG:3857' 的投影坐标
 */
blmol.operation.fromLonLat = function (coordinate) {
    return ol.proj.fromLonLat(coordinate);
};

/**
 * 对坐标进行旋转变换，参照点为原点，旋转角度为弧度。计算旋转弧度时，以 x 轴正方向为 0 弧度，并且逆时针旋转方向为正，
 * 顺时针方向旋转为负，比如说，一个点处于 3 点钟方向，经 π / 2 弧度旋转后处于 12 点钟方向。
 *
 * @param coordinate {ol.Coordinate} 坐标
 * @param angle {number} 要旋转的弧度
 * @returns {ol.Coordinate} 旋转后的坐标
 */
blmol.operation.rotationLonLat = function (coordinate, angle) {
    if (typeof angle == "undefined" || angle == 0) {
        return coordinate;
    }

    var x1 = Math.cos(angle) * coordinate[0] - Math.sin(angle) * coordinate[1];
    var y1 = Math.cos(angle) * coordinate[1] + Math.sin(angle) * coordinate[0];
    return [x1, y1]
};