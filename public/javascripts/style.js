/**
 * Created by Truth on 2017/11/3.
 * 将所有ol.style放在这里
 */

// 泊位图标
const berth_style = new ol.style.Style({
        image: new ol.style.Icon({
            scale: 0.5,
            src: 'icon/berth.png',
            opacity : 1
        })
    });

// 隐形图标
const invisible_style = new ol.style.Style({
    image: new ol.style.Icon({
        src: 'icon/berth.png',
        opacity : 0
    })
});

// 锚地图标
const anchorage_style = new ol.style.Style({
    image: new ol.style.Icon({
        scale: 0.5,
        src: 'icon/anchorage.png'
    })
});

// 静止区域图标
const park_style = {
    // 锚地图标
    0: anchorage_style,
    // 泊位图标
    1: berth_style
};

// 航线起止点
const start_style = new ol.style.Style({
    image: new ol.style.Icon({
        src: 'icon/start.png'
    })
});

// 航线结束点
const end_style = new ol.style.Style({
    image: new ol.style.Icon({
        src: 'icon/stop.png'
    })
});

// 静止点的显示
const point_style = new ol.style.Style({
    image: new ol.style.Circle({
        radius: 2,
        stroke: new ol.style.Stroke({
            color: 'black'
        }),
        fill: new ol.style.Fill({
            color: 'blue'
        })
    })
});

// 航线箭头显示
function arrow_style(rotation) {
    return new ol.style.Style({
        image: new ol.style.Icon({
            anchor: [0.75, 0.5],
            src: 'icon/arrow.png',
            rotateWithView: true,
            rotation: -rotation
        })
    });
}

// 航线线条显示
const contour_style =  new ol.style.Style({
    stroke: new ol.style.Stroke({
        color: '#5957ff',
        width: 3
    })
});

//    const contour_style =  new ol.style.Style({
//        stroke: new ol.style.Stroke({
//            color: 'red',
//            lineDash: [1, 2, 3, 4, 5, 6],
//            width: 3
//        }),
//        fill: new ol.style.Fill({
//            color: 'rgba(0, 0, 255, 0.1)'
//        })
//    });

// 大锚地显示
const anch_style =  new ol.style.Style({
    stroke: new ol.style.Stroke({
        color: 'blue',
        lineDash: [1, 2, 3, 4, 5, 6],
        width: 3
    }),
    fill: new ol.style.Fill({
        color: 'rgba(0, 0, 255, 0.1)'
    }),
    text: new ol.style.Text({
        // font: '10px sans-serif' 默认这个字体，可以修改成其他的，格式和css的字体设置一样
        text: '锚地区域',
        fill: new ol.style.Fill({
            color: 'red'
        })
    })
});

// 被选择的图标
const choosed = new ol.style.Style({
    image: new ol.style.Icon({
        src: 'images/choose.png'
    })
});

// 泊位确认的按钮
const berth_yes = new ol.style.Style({
    image: new ol.style.Icon({
        src: 'images/berth_nor.png'
    })
});

// 待选与被选图标
const point_status = {
    0: new ol.style.Style({
        image: new ol.style.Icon({
            src: 'images/pointCheck.png',
            anchor: [0.5, 0.8]
        })
    }),
    1: new ol.style.Style({
        image: new ol.style.Icon({
            src: 'images/pointAdd.png',
            anchor: [0.5, 0.8]
        })
    })
};

// 停泊位置显示
const sn_style = new ol.style.Style({
    image: new ol.style.Icon({
        src: 'images/position.png',
        anchor: [0.5, 0.8]
    })
});


