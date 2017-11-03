/**
 * bind 是一个下层命名空间，包括了监听地图事件的功能函数，包括设置监听器、移除监听器等等
 *
 * @type {{}}
 */
blmol.bind = {};

/**
 * 对地图的单击事件添加监听器，并返回当前监听器的 key，通过 key 可以移除当前监听器。此方法只监听单击事件，双击事件
 * 不会触发此方法。并且当前方法的调用与单击事件的发生有 250ms 的延迟
 *
 * @param map {ol.Map} 当前地图
 * @param listener {function(ol.Map, Array.<number>, Array.<ol.Feature>, ol.MapBrowserEvent)}
 * 传入的监听函数，此函数包括四个参数：当前地图，点击位置的经纬度，点击位置处的 feature 列表，点击单击产生的 event
 * 事件。其中如果点击的位置无 feature 则 feature 列表返回 []
 * @returns {ol.EventsKey} 当前监听器的 key
 */
blmol.bind.addOnClickListener = function (map, listener) {
    var click = function (evt) {
        var features = [];
        map.forEachFeatureAtPixel(evt.pixel, function (feature) {
            features.push(feature);
        });
        listener(map, ol.proj.toLonLat(evt.coordinate), features, evt);
    };

    return map.on('singleclick', click);
};

/**
 * 根据指定的 key 移除监听器
 *
 * @param key {ol.EventsKey} 指定的监听器的 key，该 key 可以由 addOnClickListener 等添加监听器的方法返回
 */
blmol.bind.removeOnClickListener = function (key) {
    ol.Observable.unByKey(key);
};

/**
 * 对地图的单击事件添加监听器，并返回当前监听器的 key，通过 key 可以移除当前监听器。此方法只监听双击事件，双击事件
 * 不会触发单击事件
 *
 * @param map {ol.Map} 当前地图
 * @param listener {function(ol.Map, Array.<number>, Array.<ol.Feature>, ol.MapBrowserEvent)}
 * 传入的监听函数，此函数包括四个参数：当前地图，点击位置的经纬度，点击位置处的 feature 列表，点击产生的 event
 * 事件。其中如果点击的位置无 feature 则 feature 列表返回 []
 * @returns {ol.EventsKey} 当前监听器的 key
 */
blmol.bind.addOnDoubleClickListener = function (map, listener) {
    var click = function (evt) {
        var features = [];
        map.forEachFeatureAtPixel(evt.pixel, function (feature) {
            features.push(feature);
        });
        listener(map, ol.proj.toLonLat(evt.coordinate), features, evt);
    };

    return map.on('dblclick', click)
};

/**
 * 监听地图的移动事件，此事件发生极为频繁，地图拖动，zoom 变化等等都会引发此事件
 *
 * @param map {ol.Map} 指定的地图
 * @param listener {function(ol.Map, Array.<number>, ol.ObjectEvent)}
 * 传入的监听函数，此函数包括三个参数：当前地图，当前的地图显示范围 extent，zoom 改变引发的 event 事件。
 * @returns {ol.EventsKey} 当前监听器的 key
 */
blmol.bind.addOnMapMoveEndListener = function (map, listener) {
    var click = function (evt) {
        var extent = blmol.operation.getCurrentExtent(map);
        listener(map, extent, evt);
    };
    return map.on('moveend', click);
};

/**
 * 对地图的 zoom 缩放事件添加监听器，并返回当前监听器的 key，通过 key 可以移除当前监听器。
 *
 * @param map {ol.Map} 当前地图
 * @param listener {function(ol.Map, number, Array.<number>, ol.ObjectEvent)}
 * 传入的监听函数，此函数包括四个参数：当前地图，当前的 zoom，当前的地图显示范围 extent，zoom 改变引发的 event 事件。
 * @returns {ol.EventsKey} 当前监听器的 key
 */
blmol.bind.addOnZoomChangeListener = function (map, listener) {
    var click = function (evt) {
        var extent = blmol.operation.getCurrentExtent(map);
        listener(map, map.getView().getZoom(), extent, evt);
    };

    return map.getView().on('change:resolution', click)
};

/**
 * 对地图上鼠标的移动事件进行监听，并返回当前监听器的 key，通过 key 可以移除当前监听器。此监听函数与
 * addOnMouseOverListener 类似，不过只要当鼠标在地图移动时就会触发此方法，不论鼠标位置是否有 feature
 *
 * @param map {ol.Map} 当前地图
 * @param listener {function(ol.Map, Array.<number>, Array.<ol.Feature>, ol.MapBrowserEvent)}
 * 传入的监听函数，此函数包括四个参数：当前地图，鼠标位置的经纬度，鼠标位置处的 feature 列表，鼠标移动产生的 event
 * 事件。当鼠标处没有 feature 时返回 []
 * @returns {ol.EventsKey} 当前监听器的 key
 */
blmol.bind.addOnMouseMoveListener = function (map, listener) {
    var click = function (evt) {
        if (evt.dragging) return;

        var pixel = map.getEventPixel(evt.originalEvent);
        var hit = map.hasFeatureAtPixel(pixel);

        if (hit) {
            var features = [];
            map.forEachFeatureAtPixel(pixel, function (feature) {
                features.push(feature);
            });
            listener(map, ol.proj.toLonLat(evt.coordinate), features, evt);
        } else {
            listener(map, ol.proj.toLonLat(evt.coordinate), [], evt);
        }
    };

    return map.on('pointermove', click)
};

/**
 * 对地图上鼠标在 feature 上的移入移出事件进行监听，并返回当前监听器的 key，通过 key 可以移除当前监听器。当移入
 * feature 时调用 enterListener，移出 feature 时调用 exitListener。
 *
 * @param map {ol.Map} 当前地图
 * @param enterListener {function(ol.Map, Array.<number>, Array.<ol.Feature>, ol.MapBrowserEvent)}
 * 移入的监听函数，此函数包括四个参数：当前地图，鼠标位置的经纬度，鼠标移入的 feature 列表，鼠标移动产生的 event
 * 事件
 * @param exitListener {function(ol.Map, Array.<number>, Array.<ol.Feature>, ol.MapBrowserEvent)}
 * 移出的监听函数，此函数包括四个参数：当前地图，鼠标位置的经纬度，鼠标移出的 feature 列表，鼠标移动产生的 event
 * 事件
 * @returns {ol.EventsKey} 当前监听器的 key
 */
blmol.bind.addOnMouseOverListener = function (map, enterListener, exitListener) {
    var click = function (evt) {
        if (evt.dragging) {
            return;
        }
        var pixel = map.getEventPixel(evt.originalEvent);
        var feature = map.forEachFeatureAtPixel(pixel, function (feature) {
            return feature;
        });
        var last = blmol.bind.lastOnMouseOver;
        if (last !== feature) {
            if (last) {
                exitListener(map, ol.proj.toLonLat(evt.coordinate), last, evt);
            }

            if (feature) {
                enterListener(map, ol.proj.toLonLat(evt.coordinate), feature, evt);
            }

            blmol.bind.lastOnMouseOver = feature;
        }
    };
    
    return map.on('pointermove', click);
};
blmol.bind.lastOnMouseOver = null;

/**
 * 对与地图交互过程中的绘制事件的开始状态进行监听，并返回当前监听器的 key，通过 key 可以移除当前监听器。如果传入的
 * 第一个参数不是 ol.interaction.Draw 类型，则不会返回 key
 *
 * @param drawer {ol.interaction.Draw} 当前地图的绘图交互
 * @param listener {function(ol.interaction.Draw, ol.Feature, ol.interaction.Draw.Event)}
 * 传入的监听函数，此函数包括三个参数：当前地图的绘图交互，当前交互绘制的 marker，原始的绘制事件。
 * @returns {ol.EventsKey | undefined} 当前监听器的 key
 */
blmol.bind.addDrawStartListener = function (drawer, listener) {
    if (drawer instanceof ol.interaction.Draw) {
        var click = function (evt) {
            listener(drawer, evt.feature, evt);
        };

        return drawer.on('drawstart', click)
    } else {
        console.log("the arg of blmol.bind.addDrawStartListener must instance of ol.interaction.Draw");
    }
};

/**
 * 对与地图交互过程中的绘制事件的完成状态进行监听，并返回当前监听器的 key，通过 key 可以移除当前监听器。如果传入的
 * 第一个参数不是 ol.interaction.Draw 类型，则不会返回 key
 *
 * @param drawer {ol.interaction.Draw} 当前地图的绘图交互
 * @param listener {function(ol.interaction.Draw, ol.Feature, ol.interaction.Draw.Event)}
 * 传入的监听函数，此函数包括三个参数：当前地图的绘图交互，当前交互绘制的 marker，原始的绘制事件。
 * @returns {ol.EventsKey | undefined} 当前监听器的 key
 */
blmol.bind.addDrawEndListener = function (drawer, listener) {
    if (drawer instanceof ol.interaction.Draw) {
        var click = function (evt) {
            listener(drawer, evt.feature, evt);
        };

        return drawer.on('drawend', click)
    } else {
        console.log("the arg of blmol.bind.addDrawEndListener must instance of ol.interaction.Draw");
    }
};