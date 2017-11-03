/**
 * marker 是一个下层命名空间，包括了用以向地图中绘制的多个模型，例如：点、线、圆、多边形等等
 * 值得一提的是，marker 只是一个抽象模型，它并不直接画在地图上，它是通过 marker 来构建 ol.Feature 然后将
 * ol.Feature 画在地图上，因此无法直接从图层中移除 marker，必须通过 layer 的 clear、removeMarkerById、
 * removeMarKerByType 等方法从 layer 中移除 marker.
 *
 * @type {{}}
 */
blmol.marker = {};

/**
 * 根据指定的参数创建出一个样式，除 fillColor 参数必须指定之外，其它参数均可选。指定颜色时可以同时指定透明度，因为
 * ol.Color 类型实际上就是一个 Array.<number>，整个数组包括 [red, green, blue, alpha] 其中三原色的取值范围
 * 在 0..255 之间，alpha 的取值范围在 0..1 之间。如果不指定 alpha 的话，默认为 1.
 *
 * @param fillColor {ol.Color|ol.ColorLike|undefined} 填充色，必须指定填充色
 * @param strikeColor {ol.Color|string|undefined} 边线的颜色，可以不指定，如不指定则使用 ol 的默认值
 * @param text {string} 图形上的文字，可以不指定，如不指定则 textColor、textSize 均无效
 * @param textColor {ol.Color|ol.ColorLike|undefined} 文字颜色，如不指定则默认为 'black'
 * @param textSize 文字的字体以及大小，如不指定则默认为 '10px sans-serif'
 * @returns {ol.style.Style} 返回的 style
 */
blmol.marker.createStyle = function (fillColor, strikeColor, text, textColor, textSize) {
    if(strikeColor != null) {
        var strikeStyle = new ol.style.Stroke({
            color: strikeColor,
            width: 1
        })
    }
    if (text != null) {
        var textStyle = new ol.style.Text({
            text: text,
            font: textSize ? textSize : '10px sans-serif',
            fill: new ol.style.Fill({
                color: textColor ? textColor : 'black'
            })
        })
    }

    return new ol.style.Style({
        fill: new ol.style.Fill({
            color: fillColor
        }),
        stroke: strikeStyle,
        text: textStyle
    });
};

blmol.marker.setStyleAlpha = function (style, alpha) {
    if (!(style instanceof ol.style.Style) || alpha < 0 || alpha > 1) {
        console.log("传入的不是 style，或者 alpha 不在 0..1 范围内！");
        return;
    }

    var fill = style.getFill();
    if(fill != null && fill.getColor() != null) {
        var tmp = ol.color.asArray(fill.getColor());
        tmp[3] = alpha;
        fill.setColor(tmp);
    } else {
        console.log("当前 style 没有填充配置，或者填充配置中不包含填充色！");
    }
};

/**
 * 将 maker 的分类设置为指定的 type，marker 可以为单个或者是 marker 列表，添加 type 属性是为了更方便的对 marker
 * 进行批量操作，比如可以将多个 marker 设置为 boat，以后可以利用 findMarkerByType、removeMarkerByType 进行
 * 统一的查找、删除
 *
 * @param marker {ol.Feature | Array.<ol.Feature>} 要设置的 marker，可以为单个或者是 marker 列表
 * @param type {string} 对 marker 设置的分类
 */
blmol.marker.setType = function (marker, type) {
    if (Array.isArray(marker)) {
        for (var i = 0; i < marker.length; i++) {
            marker[i].set("type", type);
        }
    } else if (marker instanceof ol.Feature) {
        marker.set("type", type);
    } else {
        console.log("marker of must be Array.<ol.Feature> or ol.Feature");
    }
};

/**
 * 获取指定 marker 的 type，marker 必须为单个
 *
 * @param marker {ol.Feature} 要设置的 marker，必须为单个
 * @return {string} marker 的分类
 */
blmol.marker.getType = function (marker) {
    if (marker instanceof ol.Feature) {
        return marker.get("type");
    } else {
        console.log("marker of must be ol.Feature");
    }
};

/**
 * 将指定的 marker 绘制到指定的图层，marker 可以是单个也可以是多个 marker 组成的列表
 *
 * @param layer {ol.layer.Vector} 指定的图层
 * @param markers {ol.Feature | Array.<ol.Feature>} 将要绘制的 marker 可以是单个也可以是列表
 */
blmol.marker.drawMarkers = function (layer, markers) {
    if (!(layer instanceof ol.layer.Vector)) {
        console.log("the layer of blmol.draw.drawPolygonMarkers must be ol.layer.Vector");
        return;
    }

    if (!Array.isArray(markers)) {
        layer.getSource().addFeature(markers);
    } else {
        layer.getSource().addFeatures(markers);
    }
};

/**
 * 创建 point Marker 的方法，需要指定点的坐标，以及可以选择是否指定 style
 *
 * @param id {string} marker 的 id，不指定 id 将导致无法使用 findMarkerById 等功能
 * @param coordinate {Array.<number>} 点的坐标，例如：[0, 0]
 * @param style  {ol.style.Style} 可选，样式，必须是 ol.style.Style 类型，此类型可以通过
 * blmol.draw.createStyle 方法创建，如果未指定或类型不符则会被忽略
 * @return {ol.Feature} 返回的 marker
 */
blmol.marker.createPoint = function (id, coordinate, style) {
    if (!Array.isArray(coordinate)) {
        console.log("the value of argument 'coordinates' must be Array.<number>");
        return null;
    }

    var marker = new ol.Feature({
        id: id,
        geometry: new ol.geom.Point(ol.proj.fromLonLat(coordinate)),
        size: 100
    });

    if (style instanceof ol.style.Style) {
        // 在地图上显示的 marker 需要满足一些条件，即必须要有可以显示的东西，对于 point 而言，必须要有 style 且
        // style 的 image 与 Geometry 不能全部为 null。一个可以在地图上显示的点的例子是：
        // var style = new ol.style.Style({
        //     image: new ol.style.Circle({
        //         radius: 10,
        //         stroke: new ol.style.Stroke({
        //             color: 'black'
        //         })
        //     }),
        // });
        // marker.setStyle(style);
        if (style.getImage() == null && style.getGeometry() == null) {
            console.log("当前 marker 为点，且点的 style 中不包括任何 image 或 几何图形，因此无法显示！");
        }
        marker.setStyle(style);
    }

    return marker;
};

/**
 * 创建 icon Marker 的方法，需要指定点的坐标，方向，icon 的路径。注意：此方法当前使用 create Point
 * 配合 style 实现，即先画一个点，再将点的 style 设置为制定的 icon，因此 blmol.marker.createIcon 获得的 marker
 * 在调用 setStyle 方法时有可能会出现 bug，因为该方法会覆盖之前的 style.
 *
 * @param id {string} marker 的 id，不指定 id 将导致无法使用 findMarkerById 等功能
 * @param coordinate {Array.<number>} icon 的坐标，例如：[0, 0]
 * @param rotation {number} icon 的弧度
 * @param src {string} icon 资源的路径，如果没有
 * @return {ol.Feature} 返回的 icon marker
 */
blmol.marker.createIcon = function (id, coordinate, rotation, src) {
    if (!Array.isArray(coordinate)) {
        console.log("the value of argument 'coordinates' must be Array.<number>");
        return null;
    }
    var feat = new ol.Feature({
        port_id: id,
        geometry: new ol.geom.Point(ol.proj.fromLonLat(coordinate)),
        size: 10
    });

    feat.setStyle(new ol.style.Style({
        image: new ol.style.Icon({
            src: src,
            rotation: rotation
        })
    }));

    return feat;
};

/**
 * 创建 Line Marker 的方法，需要指定点的坐标，以及可以选择是否指定 style
 *
 * @param id {string} marker 的 id，不指定 id 将导致无法使用 findMarkerById 等功能
 * @param coordinates {Array.<Array.<number>>} 点的坐标，类型必须是数组，例如：[0, 0]
 * @param style  {ol.style.Style} 可选，样式，必须是 ol.style.Style 类型，此类型可以通过
 * blmol.draw.createStyle 方法创建，如果未指定或类型不符则会被忽略
 */
blmol.marker.createLine = function (id, coordinates, style) {
    if (!Array.isArray(coordinates)) {
        console.log("the value of argument 'coordinates' must be Array.<Array.<number>>");
        return null;
    }

    coordinates.forEach(function (element, index, array) {
        array[index] = ol.proj.fromLonLat(element);
    });

    var marker = new ol.Feature({
        id: id,
        geometry: new ol.geom.LineString(coordinates)
    });

    if (style instanceof ol.style.Style) {
        marker.setStyle(style);
    }

    return marker;
};

/**
 * 创建 circle Marker 的方法，需要指定圆中心点的坐标，圆的半径，以及可以选择是否指定 style
 *
 * @param id {string} marker 的 id，不指定 id 将导致无法使用 findMarkerById 等功能
 * @param coordinate {Array.<number>} 园心的坐标，类型必须是数组，例如：[0, 0]
 * @param radius    圆的半径
 * @param style {ol.style.Style} 可选，圆的样式，必须是 ol.style.Style 类型，此类型可以通过
 * blmol.draw.createStyle 方法创建，如果未指定或类型不符则会被忽略
 * @return {ol.Feature} 返回的 marker
 */
blmol.marker.createCircle = function (id, coordinate, radius, style) {
    if (!Array.isArray(coordinate)) {
        console.log("the value of argument 'coordinate' must be Array.<number>");
        return null;
    }

    var marker = new ol.Feature({
        id: id,
        geometry: new ol.geom.Circle(ol.proj.fromLonLat(coordinate), radius)
    });

    if (style instanceof ol.style.Style) {
        marker.setStyle(style);
    }

    return marker;
};

/**
 * 创建 polygon Marker 的方法，需要指定起始坐标，长度，高度，以及可以选择是否指定 style
 *
 * @param id {string} marker 的 id，不指定 id 将导致无法使用 findMarkerById 等功能
 * @param coordinate {Array.<number>} 多边形的起始点坐标，例如：[0, 0]
 * @param length   矩形的长度
 * @param height    矩形的高度
 * @param style {ol.style.Style} 可选，图形的样式，必须是 ol.style.Style 类型，此类型可以通过
 * blmol.draw.createStyle 方法创建，如果未指定或类型不符则会被忽略
 * @return {ol.Feature} 返回的 marker
 */
blmol.marker.createPolygon = function (id, coordinate, length, height, style) {
    if (!Array.isArray(coordinate)) {
        console.log("the value of argument 'coordinate' must be Array.<number>");
        return null;
    }

    var points = new ol.Collection([coordinate, [coordinate[0] + length, coordinate[1]],
        [coordinate[0] + length, coordinate[1] + height], [coordinate[0], coordinate[1] + height],
        [coordinate[0], coordinate[1]]]);

    points.forEach(function (element, index, array) {
        array[index] = ol.proj.fromLonLat(element);
    });

    var marker = new ol.Feature({
        id: id,
        geometry: new ol.geom.Polygon([points.getArray()])
    });

    if (style instanceof ol.style.Style) {
        marker.setStyle(style);
    }

    return marker;
};

/**
 * 创建矩形 Marker 的方法，需要指定起始坐标，长度，高度，以及可以选择是否指定 style。起始点坐标在左上角，长度使用
 * x 轴正方向即向右，高度使用 y 轴正方向即向下
 *
 * @param id {string} marker 的 id，不指定 id 将导致无法使用 findMarkerById 等功能
 * @param coordinate {Array.<number>} 多边形的起始点坐标，例如：[0, 0]
 * @param length {number} 矩形的长度
 * @param height {number} 矩形的高度
 * @param style {ol.style.Style} 可选，图形的样式，必须是 ol.style.Style 类型，此类型可以通过
 * blmol.draw.createStyle 方法创建，如果未指定或类型不符则会被忽略
 * @return {ol.Feature} 返回的 marker
 */
blmol.marker.createRectangle = function (id, coordinate, length, height, style) {
    if (!Array.isArray(coordinate)) {
        console.log("the value of argument 'coordinate' must be Array.<number>");
        return null;
    }

    var points = new ol.Collection([coordinate, [coordinate[0] + length, coordinate[1]],
        [coordinate[0] + length, coordinate[1] - height], [coordinate[0], coordinate[1] - height],
        [coordinate[0], coordinate[1]]]);

    points.forEach(function (element, index, array) {
        array[index] = ol.proj.fromLonLat(element);
    });

    var marker = new ol.Feature({
        id: id,
        geometry: new ol.geom.Polygon([points.getArray()])
    });

    if (style instanceof ol.style.Style) {
        marker.setStyle(style);
    }

    return marker;
};

/**
 * 创建弧线 marker 的函数，需要指定弧线的起始点和结束点，以及可选是否指定 style。
 *
 * @param id {string} marker 的 id，如果没有指定 id 则无法使用与 id 有关的函数
 * @param from {Array.<number>} 起始点的经纬度坐标
 * @param to {Array.<number>} 结束点的经纬度坐标
 * @param style {ol.style.Style} 可选，图形的样式，必须是 ol.style.Style 类型，此类型可以通过
 * blmol.draw.createStyle 方法创建，如果未指定或类型不符则会被忽略
 * @return {ol.Feature} 返回的 marker
 */
blmol.marker.createArc = function (id, from, to, style) {
    var arcGenerator = new arc.GreatCircle(
        {x: from[0], y: from[1]},
        {x: to[0], y: to[1]});

    var arcLine = arcGenerator.Arc(100, {offset: 10});
    if (arcLine.geometries.length === 1) {
        var line = new ol.geom.LineString(arcLine.geometries[0].coords);
        line.transform(ol.proj.get('EPSG:4326'), ol.proj.get('EPSG:3857'));

        var marker = new ol.Feature({
            id: id,
            geometry: line
        });
    }

    if (style instanceof ol.style.Style) {
        marker.setStyle(style);
    }

    return marker;
};