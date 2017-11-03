/**
 * layer 是一个下层的命名空间，包括了与 layer 相关的多个功能函数，例如：设置图层是否可见、设置可见范围等等
 * 在创建图层时，建议为图层指定 id，否则以后无法通过 findLayerById 方法查找图层。并且在程序中多处进行了判断，不为
 * 图层指定 id 的话有可能导致部分函数无法正确执行。
 *
 * @type {{}}
 */
blmol.layer = {};

/**
 * 指定的图层或图层组当前是否可见
 *
 * @param layer {ol.layer.Base} 指定的 layer 或 layerGroup
 * @returns {boolean|*} 当前是否可见
 */
blmol.layer.isVisible = function (layer) {
    return layer.getVisible();
};

/**
 * 设置指定的图层或图层组当前是否可见
 *
 * @param layer {ol.layer.Base} 指定的 layer 或 layerGroup
 * @param show 设置后是否可见
 */
blmol.layer.setVisible = function (layer, show) {
    layer.setVisible(show);
};

/**
 * 清空指定 layer 中的所有 marker
 *
 * @param layer {ol.layer.Layer} 指定的 layer
 */
blmol.layer.clear = function (layer) {
    if (layer instanceof ol.layer.Heatmap) {
        layer.setSource(null);
    } else {
        layer.getSource().clear();
    }
};

/**
 * 从指定图层中获取指定 id 的 marker，假如存在多个 marker 的 id 相同则只返回查找到的第一个 marker
 *
 * @param layer {ol.layer.Layer} 指定的图层，图层的 source 必须是 ol.source.Vector
 * @param id {string} 要获取的 marker 的 id
 * @returns {ol.Feature|*} 返回的 marker，未找到则返回 undefined
 */
blmol.layer.findMarkerById = function (layer, id) {
    var features = layer.getSource().getFeatures();
    for (var i = 0; i < features.length; i++) {
        if (features[i].get("id") === id) {
            return features[i];
        }
    }
};

/**
 * 从指定图层中删除指定 id 的 marker，假如存在多个 marker 的 id 相同则只删除查找到的第一个 marker，未找到则不操作
 *
 * @param layer {ol.layer.Layer} 指定的图层，图层的 source 必须是 ol.source.Vector
 * @param id {string} 要删除的 marker 的 id
 */
blmol.layer.removeMarkerById = function (layer, id) {
    var features = layer.getSource().getFeatures();
    for (var i = 0; i < features.length; i++) {
        if (features[i].get("id") === id) {
            layer.getSource().removeFeature(features[i]);
        }
    }
};

/**
 * 从指定的图层中删除 marker，如果 marker 在当前图层中则删除之，如果 marker 不在当前图层则无变化
 *
 * @param layer {ol.layer.Layer} 指定的图层，图层的 source 必须是 ol.source.Vector
 * @param marker {ol.Feature} 要删除的 marker
 */
blmol.layer.removeMarker = function (layer, marker) {
    var features = layer.getSource().getFeatures();
    for (var i = 0; i < features.length; i++) {
        if (features[i] === marker) {
            layer.getSource().removeFeature(features[i]);
        }
    }
};

/**
 * 根据 type 在 layer 中查找 marker，若存在则返回 marker 列表，否则返回空列表 []
 *
 * @param layer {ol.layer.Layer} 指定的 layer
 * @param type {string} 指定的分类
 * @returns {Array.<ol.Feature>} 返回的 marker 列表
 */
blmol.layer.findMarkerByType = function (layer, type) {
    var result = [];
    var features = layer.getSource().getFeatures();
    for (var i = 0; i < features.length; i++) {
        if (features[i].get("type") === type) {
            result.push(features[i]);
        }
    }
    return result;
};

/**
 * 移除指定 layer 中的 type 分类的 marker，若无 marker 的分类是 type，则无变化
 *
 * @param layer {ol.layer.Layer} 指定的 layer
 * @param type {string} 指定的分类
 */
blmol.layer.removeMarkerByType = function (layer, type) {
    var features = layer.getSource().getFeatures();
    for (var i = 0; i < features.length; i++) {
        if (features[i].get("type") === type) {
            layer.getSource().removeFeature(features[i]);
        }
    }
};

/**
 * 设置指定的图层或图层组的覆盖范围，覆盖范围必须是由两个点组成的矩形
 *
 * @param layer {ol.layer.Base} 指定的 layer 或 layerGroup
 * @param extent {Array.<number>} 覆盖范围，必须包含四个值，例如：[minX, minY, maxX, maxY]，
 * 且每个值必须源自 'EPSG:4326' 映射，即通常所说的经、纬度
 */
blmol.layer.setExtent = function (layer, extent) {
    var trans = ol.proj.transformExtent(extent, 'EPSG:4326', 'EPSG:3857');
    layer.setExtent(trans);
};

/**
 * 获取指定的图层或图层组的覆盖范围，覆盖范围必须是由两个点组成的矩形
 *
 * @param layer {ol.layer.Base} 指定的 layer 或 layerGroup
 * @return {ol.Extent} 覆盖范围，必须包含四个值，例如：[minX, minY, maxX, maxY]，
 * 且每个值必须源自 'EPSG:4326' 映射，即通常所说的经、纬度
 */
blmol.layer.getExtent = function (layer) {
    var extent = layer.getExtent();
    return ol.proj.transformExtent(extent, 'EPSG:3857', 'EPSG:4326');
};

/**
 * 获取指定的图层或图层组的可见 zoom 范围，当当前 zoom 小于最小可见 zoom 范围或大于最大可见 zoom 范围时，图层会被隐藏。因
 * 为 zoom 是通过 resolution 的进行换算得到的，因此，zoom 为浮点型。
 *
 * @param layer {ol.layer.Base} 指定的 layer 或 layerGroup
 * @returns {Array} 返回的可见 zoom 范围，例如：[1, 16]
 */
blmol.layer.getZoomRange = function (layer) {
    var range = [];

    range.push(blmol.operation.toZoom(layer.getMaxResolution()));
    range.push(blmol.operation.toZoom(layer.getMinResolution()));

    return range;
};

/**
 * 指定图层的可见 zoom 范围，当当前 zoom 小于最小可见 zoom 范围或大于最大可见 zoom 范围时，图层会被隐藏
 *
 * @param layer {ol.layer.Base} 指定的 layer 或 layerGroup
 * @param {Array} range 设置的可见 zoom 范围，类型为数组，例如：[1, 16]
 */
blmol.layer.setZoomRange = function (layer, range) {
    layer.setMaxResolution(blmol.operation.fromZoom(range[0]));
    layer.setMinResolution(blmol.operation.fromZoom(range[1]));
};

/**
 * 新构建一个没有任何图形的矢量图层，只有当地图的 zoom 在 minZoom 与 maxZoom 之间该图层才会显示，
 * 若 minZoom 与 maxZoom 没有设置则图层一直可见
 *
 * @param id {string} 图层的 id，必须指定且应为 string 类型，否则函数将返回 null
 * @param minZoom {number} 当地图的 zoom 小于此值时，图层不可见，可以不设置
 * @param maxZoom {number} 当地图的 zoom 大于此值时，图层不可见，可以不设置
 * @param features {Array.<ol.Feature>} 图层的初始 marker 集合，可以不设置
 * @param style {ol.style.Style} 图层的样式，可以不设置
 * @returns {ol.layer.Vector} 返回的矢量图层
 */
blmol.layer.createVectorLayer = function (id, minZoom, maxZoom, features, style) {
    if (typeof id != "string") {
        console.log("the id of layer must be string!");
        return null;
    }
    var min = maxZoom ? blmol.operation.fromZoom(maxZoom) : undefined;
    var max = minZoom ? blmol.operation.fromZoom(minZoom) : undefined;

    if (features == null) {
        features = [];
    }

    return new ol.layer.Vector({
        id: id,
        minResolution: min,
        maxResolution: max,
        source: new ol.source.Vector({
            features: features
        }),
        style: style
    });
};

/**
 * 根据指定的 Source 源生成 HeatMap 图层，未设置 id 的话会返回 null
 *
 * @param id {string} 图层的 id
 * @param source {ol.source.Source} 图层使用的 source 源
 * @param blur {number} 模糊度, 可以不设置
 * @param radius {number} 半径，可以不设置
 * @return {ol.layer.Heatmap} 创建出来的 HeatMap
 */
blmol.layer.createHeatMapLayer = function (id, source, blur, radius) {
    if (typeof id != "string") {
        console.log("the id of layer must be string!");
        return null;
    }

    return new ol.layer.Heatmap({
        id: id,
        source: source,
        blur: blur,
        radius: radius
    });
};

/**
 * 根据 GeoJson 生成 HeatMap 图层，GeoJson 中的坐标默认通过 EPSG:4326 投影系来解析
 *
 * @param id {string} 图层的 id
 * @param url {string} 图层所使用的 GeoJson 的 url
 * @param blur {number} 模糊度, 可以不设置
 * @param radius {number} 半径，可以不设置
 * @param projection {string} GeoJson 中坐标的投影系，可以不设置，默认为 EPSG:4326
 * @return {ol.layer.Heatmap} 创建出来的 Heatmap
 */
blmol.layer.createHeatMapGeoJson = function (id, url, blur, radius, projection) {
    var source = new ol.source.Vector({
        url: url,
        format: new ol.format.GeoJSON({
            defaultDataProjection: projection
        })
    });

    return blmol.layer.createHeatMapLayer(id, source, blur, radius);
};

/**
 * 根据 String 或 Object 生成 HeatMap 图层，其中 String 必须是 GeoJson 字符串的格式，Object 必须是
 * GeoJson 对象的格式。
 *
 * @param id {string} 图层的 id
 * @param json {string | Object} 图层所使用的 GeoJson 格式的 String 或 Object
 * @param blur {number} 模糊度, 可以不设置
 * @param radius {number} 半径，可以不设置
 * @param projection {string} GeoJson 中坐标的投影系，可以不设置，默认为 EPSG:4326
 * @return {ol.layer.Heatmap} 创建出来的 Heatmap
 */
blmol.layer.createHeatMapString = function (id, json, blur, radius, projection) {
    var source = new ol.source.Vector({
        loader: function (extent, number, proj) {
            if (json) {
                var format = new ol.format.GeoJSON({
                    defaultDataProjection: projection
                });
                // 此处的 featureProjection 代表的是解析后的坐标系，跟函数的参数传入的坐标系的含义不同
                source.addFeatures(format.readFeatures(json, {featureProjection: 'EPSG:3857'}));
            } else {
                console.log("undefined or null source!");
            }
        }
    });

    return blmol.layer.createHeatMapLayer(id, source, blur, radius);
};

/**
 * 根据 kml 生成 HeatMap 图层
 *
 * @param id {string} 图层的 id
 * @param url {string} 图层所使用的 kml 的 url
 * @param blur {number} 模糊度, 可以不设置
 * @param radius {number} 半径，可以不设置
 * @param hasStyleInKml {boolean} kml 中是否包含样式，可以不设置，默认为 false
 * @return {ol.layer.Heatmap} 创建出来的 Heatmap
 */
blmol.layer.createHeatMapKml = function (id, url, blur, radius, hasStyleInKml) {
    var source = new ol.source.Vector({
        url: url,
        format: new ol.format.KML({
            extractStyles: hasStyleInKml
        })
    });

    return blmol.layer.createHeatMapLayer(id, source, blur, radius);
};

/**
 * 使用指定的 Source 刷新 HeatMap 图层，该方法与 createHeatMapLayer 不同之处在于此方法不会创建出一个新的图层，它
 * 只会在指定的图层中进行刷新操作。
 *
 * @param layer {ol.layer.Heatmap} 想要刷新的 HeatMap 图层
 * @param source {ol.source.Source} 新的 source 源
 */
blmol.layer.refreshHeatMap = function (layer, source) {
    if (!(layer instanceof ol.layer.Heatmap)) {
        console.log("the layer to refresh must be ol.layer.Heatmap!");
        return;
    }

    layer.setSource(source);
};

blmol.layer.refreshHeatMapFromString = function (layer, json) {
    if (!(layer instanceof ol.layer.Heatmap)) {
        console.log("the layer to refresh must be ol.layer.Heatmap!");
        return;
    }

    var source = new ol.source.Vector({
        loader: function (extent, number, proj) {
            if (json) {
                var format = new ol.format.GeoJSON({
                    defaultDataProjection: projection
                });
                // 此处的 featureProjection 代表的是解析后的坐标系，跟函数的参数传入的坐标系的含义不同
                source.addFeatures(format.readFeatures(json, {featureProjection: 'EPSG:3857'}));
            } else {
                console.log("undefined or null source!");
            }
        }
    });

    layer.setSource(source);
};

/**
 * 使用指定的 url 刷新 HeatMap 图层，该方法与 createHeatMapLayer 不同之处在于此方法不会创建出一个新的图层，它
 * 只会在指定的图层中进行刷新操作。
 *
 * @param layer {ol.layer.Heatmap} 想要刷新的 HeatMap 图层
 * @param url {string} 新的 json 的 url
 * @param projection {string} GeoJson 的投影系，可以不设置，默认为 EPSG:4326
 */
blmol.layer.refreshHeatMapGeoJson = function (layer, url, projection) {
    if (!(layer instanceof ol.layer.Heatmap)) {
        console.log("the layer to refresh must be ol.layer.Heatmap!");
        return;
    }

    var source = new ol.source.Vector({
        url: url,
        format: new ol.format.GeoJSON({
            defaultDataProjection: projection
        })
    });

    layer.setSource(source);
};

/**
 * 设置 heatmap 图层的模糊度 blur，数值以 px 计算
 *
 * @param layer {ol.layer.Heatmap} heatmap 图层，非 heatmap 会直接返回 undefined
 * @param blur {number} 图层的模糊度
 */
blmol.layer.setHeatMapBlur = function (layer, blur) {
    if (!(layer instanceof ol.layer.Heatmap)) {
        console.log("the layer to refresh must be ol.layer.Heatmap!");
        return;
    }

    layer.setBlur(blur);
};

/**
 * 获取 heatmap 图层的模糊度 blur，数值以 px 计算
 *
 * @param layer {ol.layer.Heatmap} heatmap 图层，非 heatmap 会直接返回 undefined
 * @return {number} 图层的模糊度
 */
blmol.layer.getHeatMapBlur = function (layer) {
    if (!(layer instanceof ol.layer.Heatmap)) {
        console.log("the layer to refresh must be ol.layer.Heatmap!");
        return;
    }

    return layer.getBlur();
};

/**
 * 设置 heatmap 图层的半径，数值以 px 计算
 *
 * @param layer {ol.layer.Heatmap} heatmap 图层，非 heatmap 会直接返回 undefined
 * @param radius {number} 图层的半径
 */
blmol.layer.setHeatMapRadius = function (layer, radius) {
    if (!(layer instanceof ol.layer.Heatmap)) {
        console.log("the layer to refresh must be ol.layer.Heatmap!");
        return;
    }

    layer.setRadius(radius);
};

/**
 * 获取 heatmap 图层的半径，数值以 px 计算
 *
 * @param layer {ol.layer.Heatmap} heatmap 图层，非 heatmap 会直接返回 undefined
 * @return {number} 图层的半径
 */
blmol.layer.getHeatMapRadius = function (layer) {
    if (!(layer instanceof ol.layer.Heatmap)) {
        console.log("the layer to refresh must be ol.layer.Heatmap!");
        return;
    }

    return layer.getRadius();
};

blmol.layer.createArcLayer = function (id, data, url, parse, style) {
    if (typeof id != "string") {
        console.log("the id of layer must be string!");
        return null;
    }

    var source = new ol.source.Vector({
        wrapX: false,
        loader: function () {
            var toArcs = function (arcs) {
                for (var i = 0; i < arcs.length; i++) {
                    var node = arcs[i];
                    var feature = blmol.marker.createArc(undefined, node[0], node[1]);
                    if (feature != null) {
                        source.addFeature(feature);
                    }
                }
            };

            if (data == null) {
                fetch(url).then(function (response) {
                    return response.json();
                }).then(function (json) {
                    if (parse != null) {
                        data = parse(json);
                        toArcs(data);
                    }
                });
            } else {
                toArcs(data);
            }
        }
    });

    return new ol.layer.Vector({
        id: id,
        source: source,
        style: style
    });
};

/**
 * 创建一个将指定点用弧线连接起来的图层，可以直接传入数据，也可以传入，数据的 url，当指定了 data 后，函数会忽略指
 * 定的 url
 *
 * @param id {string} 创建的图层 id
 * @param data {Array.<Array.<ol.Coordinate>>} 传入的坐标对数组，如果设置了这个值，则会忽略 url
 * @param url {string} json 的 url 链接，如果设置了 data 则此项值会被忽略
 * @param parse {function} 对 json 数据进行解析，解析的结果应该同 data 的格式相同
 * @param style {ol.style.Style} 图层中所有弧线的 style，不指定的话则使用默认样式
 * @return {ol.layer.Vector} 返回的图层
 */
blmol.layer.createArcLayer = function (id, data, url, parse, style) {
    if (typeof id != "string") {
        console.log("the id of layer must be string!");
        return null;
    }

    var layer = new ol.layer.Vector({
        id: id,
        style: style
    });

    blmol.layer.refreshArcLayer(layer, data, url, parse);
    return layer;
};


/**
 * 给定一个图层，将图层中的 marker 刷新为将指定点用弧线连接起来的图形，可以直接传入数据，也可以传入，数据的 url，
 * 当指定了 data 后，函数会忽略指定的 url
 *
 * @param layer {ol.layer.Vector} 要刷新的图层
 * @param data {Array.<Array.<ol.Coordinate>>} 传入的坐标对数组，如果设置了这个值，则会忽略 url
 * @param url {string} json 的 url 链接，如果设置了 data 则此项值会被忽略
 * @param parse {function} 对 json 数据进行解析，解析的结果应该同 data 的格式相同
 * @param style {ol.style.Style} 图层中所有弧线的 style，不指定的话则使用默认样式
 */
blmol.layer.refreshArcLayer = function (layer, data, url, parse, style) {
    if (!(layer instanceof ol.layer.Vector)) {
        console.log("the layer must be ol.layer.Vector!");
        return;
    }

    var source = new ol.source.Vector({
        loader: function (extent, number, proj) {
            var toArcs = function (arcs) {
                var node;
                var feature;
                var tmp = [];
                for (var i = 0; i < arcs.length; i++) {
                    node = arcs[i];
                    feature = blmol.marker.createArc(undefined, node[0], node[1]);
                    if (feature != null) {
                        tmp.push(feature);
                    }
                }
                source.addFeatures(tmp);
            };

            if (data != null) {
                toArcs(data);
            } else if (data == null && url != null) {
                var xhr = new XMLHttpRequest();
                xhr.open('GET', url, true);
                xhr.onload = function(event) {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        var source = JSON.parse(xhr.responseText);
                        if (source) {
                            if (parse != null) {
                                data = parse(source);
                                toArcs(data);
                            }
                        }
                    }
                }.bind(this);
                xhr.send();
            } else {
                console.log("Error, the data and url is empty!");
            }
        }
    });

    layer.setSource(source);

    if (style != null) {
        layer.setStyle(style);
    }
};

blmol.layer.addToArcLayer = function (layer, arcs, style) {
    if (!(layer instanceof ol.layer.Vector)) {
        console.log("the layer must be ol.layer.Vector!");
        return;
    }

    var node;
    var feature;
    var tmp = [];
    for (var i = 0; i < arcs.length; i++) {
        node = arcs[i];
        feature = blmol.marker.createArc(undefined, node[0], node[1]);

        if (feature != null) {
            tmp.push(feature);
            // feature.set("type", type)
            if (style != null) {
                feature.setStyle(style);
            }
        }
    }

    layer.getSource().addFeatures(tmp);
}

/**
 * 创建 Ais 瓷砖图层，可以在创建时设定 Ais 服务器的地址以及指定最大最小 Zoom 等级
 *
 * @param id {string} 图层的 id，必须指定且应为 string 类型，否则函数将返回 null
 * @param ip    ais 服务器的 ip，未指定则默认为 www.ais.msa.gov.cn
 * @param minZoom 当前图层最小可见的 zoom 级别，必须处于 [0, 18] 之间
 * @param maxZoom 当前图层最大可见的 zoom 级别，必须处于 [0, 18] 之间
 * @returns {ol.layer.Tile} 创建出的 ais 图层
 */
blmol.layer.createAisTile = function (id, ip, minZoom, maxZoom) {
    if (typeof id != "string") {
        console.log("the id of layer must be string!");
        return null;
    }

    ip = ip ? ip : "www.ais.msa.gov.cn";
    minZoom = minZoom ? minZoom : 0;
    maxZoom = maxZoom ? maxZoom : 18;

    return new ol.layer.Tile({
        id: id,
        source: new ol.source.XYZ({
            maxZoom: maxZoom,
            minZoom: minZoom,
            tileUrlFunction: function (coordinate) {
                var z = coordinate[0];
                var x = coordinate[1];

                /**
                 * y 轴的变换，需要经过：y = Math.pow(2, z) - (-y - 1) - 1
                 * 参见：http://stackoverflow.com/questions/32467608/ol3-v3-1-1-to-v3-8-2-broke-ol-source-xyz-from-pouchdb
                 */
                var y = Math.pow(2, z) + coordinate[2];
                return "http://" + ip + "/geoserver/gwc/service/tms/1.0.0/blm:ais@EPSG:900913@png/"
                    + z + "/" + x + "/" + y + ".png";
            }
        })
    });
};

/**
 * 根据传入的类型创建不同的 blm 海图，且以指定 id 作为图层 id
 *
 * @param id {string} 图层的 id，必须指定且应为 string 类型，否则函数将返回 null
 * @param type 类型，basicsearoad 代表基本海图，advsea 代表高级海图，advsearoad 代表混合海图
 * @param ip 图层服务器的 ip，未设置则为 www.ais.msa.gov.cn
 * @param minZoom 图层最小的可见 zoom，未设置则为 3
 * @param maxZoom 图层最大的可见 zoom，未设置则为 16
 * @returns {ol.layer.Tile} 创建出的图层
 */
blmol.layer.createSeaTile = function (id, type, ip, minZoom, maxZoom) {
    if (typeof id !== "string") {
        console.log("the id of layer must be string!");
        return null;
    }

    ip = ip ? ip : "www.ais.msa.gov.cn";
    minZoom = minZoom ? minZoom : 0;
    maxZoom = maxZoom ? maxZoom : 18;

    return new ol.layer.Tile({
        id: id,
        source: new ol.source.XYZ({
            maxZoom: maxZoom,
            minZoom: minZoom,
            url: "http://" + ip + "/MapService?service=wmts&request=gettile&tilematrixset=" + type +
            "&tilematrix={z}&tilerow={y}&tilecol={x}&format=image/png&layer=default&style" +
            "=default&version=1.0.0"
        })
    });
};

/**
 * 创建基本海图图层，参见 blmol.advance.createSeaTile
 */
blmol.layer.createBaseSeaTile = function (id, ip, minZoom, maxZoom) {
    return blmol.layer.createSeaTile(id, "basicsearoad", ip, minZoom, maxZoom);
};

/**
 * 创建高级海图图层，参见 blmol.advance.createSeaTile
 */
blmol.layer.createAdvanceSeaTile = function (id, ip, minZoom, maxZoom) {
    return blmol.layer.createSeaTile(id, "advsea", ip, minZoom, maxZoom);
};

/**
 * 创建混合海图图层，参见 blmol.advance.createSeaTile
 */
blmol.layer.createHybridSeaTile = function (id, ip, minZoom, maxZoom) {
    return blmol.layer.createSeaTile(id, "advsearoad", ip, minZoom, maxZoom);
};

/**
 * 创建百度地图的瓦片图层。因为百度地图在国家加密之后又做了一层自己的加密，所以使用针对国家加密的代码进行纠偏时依旧会有
 * 很大的偏移，此时需要使用百度地图自带的 api 进行纠偏。由于本方法只是使用百度地图的瓦片作为底图，并不包含百度的任何
 * js 文件，因此需要使用者自己引入百度地图的 api。因此不建议使用这个百度瓦片图。
 *
 * @param id {string} 图层的 id，必须指定且应为 string 类型，否则函数将返回 null
 * @param minZoom 当前图层最小可见的 zoom 级别，必须处于 [0, 18] 之间
 * @param maxZoom 当前图层最大可见的 zoom 级别，必须处于 [0, 18] 之间
 * @returns {ol.layer.Tile} 返回的瓦片图层
 */
blmol.layer.createBaiduTile = function (id, minZoom, maxZoom) {
    if (typeof id != "string") {
        console.log("the id of layer must be string!");
        return null;
    }

    minZoom = minZoom ? minZoom : 0;
    maxZoom = maxZoom ? maxZoom : 18;

    var resolutions = [];
    for (var i = 0; i < 19; i++) {
        resolutions[i] = Math.pow(2, 18 - i);
    }

    return new ol.layer.Tile({
        id: id,
        source: new ol.source.XYZ({
            maxZoom: maxZoom,
            minZoom: minZoom,
            tileGrid: new ol.tilegrid.TileGrid({
                origin: [0, 0],
                resolutions: resolutions
            }),
            tileUrlFunction: function (tileCoord) {
                if (!tileCoord) {
                    return "";
                }
                var z = tileCoord[0];
                var x = tileCoord[1];
                var y = tileCoord[2];

                if (x < 0) {
                    x = "M" + (-x);
                }
                if (y < 0) {
                    y = "M" + (-y);
                }

                return "http://online3.map.bdimg.com/onlinelabel/?qt=tile&x=" + x + "&y=" + y +
                    "&z=" + z + "&styles=pl&udt=20151021&scaler=1&p=1";
            }
        })
    });
};

/**
 * 创建天地图的瓦片图层。因为天地图的地图与地图上的标注分开了，因此该方法会创建两个图层，这两个图层会组成图层组。可
 * 以像操作一个图层一样操作图层组内的所有图层。比如设置图层组不可见则图层组内部所有的图层均会不可见。不过能够对图层组
 * 进行的操作有限，只有设置可见性、设置覆盖范围、设置 zoom 等少数几个方法。尤其需要注意的是不能对图层组添加 marker.
 *
 * @param id {string} 图层组的 id，必须指定且应为 string 类型，否则函数将返回 null
 * @param minZoom 当前图层组最小可见的 zoom 级别，必须处于 [0, 18] 之间
 * @param maxZoom 当前图层组最大可见的 zoom 级别，必须处于 [0, 18] 之间
 * @returns {ol.layer.Tile} 返回的瓦片图层组
 */
blmol.layer.createTianDiTile = function (id, minZoom, maxZoom) {
    if (typeof id != "string") {
        console.log("the id of layer must be string!");
        return null;
    }

    minZoom = minZoom ? minZoom : 0;
    maxZoom = maxZoom ? maxZoom : 18;

    var resolutions = [];
    for (var i = 0; i < 19; i++) {
        resolutions[i] = Math.pow(2, 18 - i);
    }

    var road = new ol.layer.Tile({
        id: id,
        tileGrid: new ol.tilegrid.TileGrid({
            origin: [0, 0],
            resolutions: resolutions
        }),
        source: new ol.source.XYZ({
            url: "http://t4.tianditu.com/DataServer?T=vec_w&x={x}&y={y}&l={z}"
        })
    });

    var annotation = new ol.layer.Tile({
        id: id,
        tileGrid: new ol.tilegrid.TileGrid({
            origin: [0, 0],
            resolutions: resolutions
        }),
        source: new ol.source.XYZ({
            url: 'http://t3.tianditu.com/DataServer?T=cva_w&x={x}&y={y}&l={z}'
        })
    });

    return new ol.layer.Group({
        id: id,
        minResolution: blmol.operation.fromZoom(maxZoom),
        maxResolution: blmol.operation.fromZoom(minZoom),
        layers: [road, annotation]
    });
};

blmol.layer.createBasicTile = function (id) {
    if (typeof id !== "string") {
        console.log("the id of layer must be string!");
        return null;
    }
    return new ol.layer.Tile({
        id: id,
        source: new ol.source.OSM()
    })
};
/**
 * 创建谷歌地图, 利用瓦片图的方式
 * @param id
 * @returns {*}
 */
blmol.layer.createGoogleTile = function (id) {
    if (typeof id !== "string") {
        console.log("the id of layer must be string!");
        return null;
    }
    return new ol.layer.Tile({
        id: id,
        source: new ol.source.XYZ({
            url: 'http://mt{0-3}.google.cn/vt/lyrs=m&hl=zh-CN&gl=cn&x={x}&y={y}&z={z}'
            // url: 'http://mt{0-3}.google.cn/vt/v=w2.114&hl=zh-CN&gl=cn&x={x}&y={y}&z={z}&s='
        })
    })
};

blmol.layer.createHotTile = function (id, minZoom, maxZoom) {
    if (typeof id !== "string") {
        console.log("the id of layer must be string!");
        return null;
    }

    minZoom = minZoom ? minZoom : 1;
    maxZoom = maxZoom ? maxZoom : 19;

    return new ol.layer.Tile({
        id: id,
        source: new ol.source.XYZ({
            minZoom: minZoom,
            maxZoom: maxZoom,
            url: 'http://tile-{a-c}.openstreetmap.fr/hot/{z}/{x}/{y}.png'
        })
    });
};

blmol.layer.createESeaTile = function (id, minZoom, maxZoom) {
    if (typeof id !== "string") {
        console.log("the id of layer must be string!");
        return null;
    }

    minZoom = minZoom ? minZoom : 1;
    maxZoom = maxZoom ? maxZoom : 20;

    return new ol.layer.Tile({
        id: id,
        source: new ol.source.XYZ({
            minZoom: minZoom,
            maxZoom: maxZoom,
            url: 'http://chart1.boloomo.com/Chinese/full/{z}/{x}/{y}.png'
        })
    });
};

/**
 *
 * @param id
 * @param minZoom
 * @param maxZoom
 * @returns {*}
 */
blmol.layer.createGGSatelliteTile = function (id, minZoom, maxZoom) {
    if (typeof id !== "string") {
        console.log("the id of layer must be string!");
        return null;
    }

    minZoom = minZoom ? minZoom : 1;
    maxZoom = maxZoom ? maxZoom : 20;

    return new ol.layer.Tile({
        id: id,
        source: new ol.source.XYZ({
            key: 'AIzaSyCabPHEt8IGUv-1ZyCBwH9IfrojCSz6rPQ',
            minZoom: minZoom,
            maxZoom: maxZoom,
            url: 'http://mt{1-3}.google.cn/vt/lyrs=s&hl=zh-CN&gl=cn&x={x}&y={y}&z={z}'
        })
    });
};





/**
 * 创建Bing卫星图
 * @param id
 * @returns {*}
 */
blmol.layer.createBingTile = function (id) {
    if (typeof id != "string") {
        console.log("the id of layer must be string!");
        return null;
    }
    return new ol.layer.Tile({
        visible: false,
        preload: Infinity,
        source: new ol.source.BingMaps({
            key: 'AlgUBNr4fq6o1EMDkOxHGVQygFUOD41O2wP22GQ4wmOO8EIApL9OOlUAirsWRvUA',
            imagerySet: 'AerialWithLabels',
            maxZoom: 28
        })
    })
};




/**
 * 创建天地图的卫星瓦片图层。由于天地图的卫星数据只包含国内的部分区域，因此放大时会出现没有瓦片图的提示
 *
 * @param id {string} 图层组的 id，必须指定且应为 string 类型，否则函数将返回 null
 * @param minZoom 当前图层组最小可见的 zoom 级别，必须处于 [0, 18] 之间
 * @param maxZoom 当前图层组最大可见的 zoom 级别，必须处于 [0, 18] 之间
 * @returns {ol.layer.Tile} 返回的瓦片图层组
 */
blmol.layer.createTianDiSatelliteTile = function (id, minZoom, maxZoom) {
    if (typeof id != "string") {
        console.log("the id of layer must be string!");
        return null;
    }

    minZoom = minZoom ? minZoom : 1;
    maxZoom = maxZoom ? maxZoom : 18;

    return new ol.layer.Tile({
        id: id,
        source: new ol.source.XYZ({
            minZoom: minZoom,
            maxZoom: maxZoom,
            url: 'http://t3.tianditu.com/DataServer?T=img_w&x={x}&y={y}&l={z}'
        })
    });
};

