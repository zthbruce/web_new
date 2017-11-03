/**
 * Created by Truth on 2017/10/20.
 *
 * 将WGS-84向GCJ-02(火星坐标系)转化
 */

// var WGS84transformer = {};

a = 6378245.0; // 地球半径(km)
ee = 0.00669342162296594323;

/**
 * 判断是否在中国区域内
 * @param lat
 * @param lon
 * @returns {boolean}
 */
function isOutOfChina(lat, lon) {
    if(lon < 100.004 || lon > 125.00) return true;
    return lat < 17.004 || lat > 55.8271;
}

/**
 * 转化纬度
 * @param x
 * @param y
 * @returns {number}
 */
function transformLat(x, y) {
    var ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
    ret += (20.0 * Math.sin(6.0 * x * Math.PI) + 20.0 * Math.sin(2.0 * x * Math.PI)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(y * Math.PI) + 40.0 * Math.sin(y / 3.0 * Math.PI)) * 2.0 / 3.0;
    ret += (160.0 * Math.sin(y / 12.0 * Math.PI) + 320 * Math.sin(y * Math.PI / 30.0)) * 2.0 / 3.0;
    return ret;
}

/**
 * 转化经度
 * @param x
 * @param y
 * @returns {number}
 */
function transformLon(x, y) {
    var ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
    ret += (20.0 * Math.sin(6.0 * x * Math.PI) + 20.0 * Math.sin(2.0 * x * Math.PI)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(x * Math.PI) + 40.0 * Math.sin(x / 3.0 * Math.PI)) * 2.0 / 3.0;
    ret += (150.0 * Math.sin(x / 12.0 * Math.PI) + 300.0 * Math.sin(x / 30.0 * Math.PI)) * 2.0 / 3.0;
    return ret;
}

/**
 * 转化函数
 * @param wgLat
 * @param wgLon
 */
function WGS84transformer(wgLat, wgLon) {
    if(isOutOfChina(wgLat, wgLon))
        return [wgLat, wgLon];
    var dLat = transformLat(wgLon - 105.0, wgLat - 35.0);
    var dLon = transformLon(wgLon - 105.0, wgLat - 35.0);
    var radLat = wgLat / 180.0 * Math.PI;
    var magic = Math.sin(radLat);
    magic = 1 - ee * magic * magic;
    var sqrtMagic = Math.sqrt(magic);
    dLat = (dLat * 180.0) / ((a * (1 - ee)) / (magic * sqrtMagic) * Math.PI);
    dLon = (dLon * 180.0) / (a / sqrtMagic * Math.cos(radLat) * Math.PI);
    var mgLat = wgLat + dLat;
    var mgLon = wgLon + dLon;
    return [mgLat, mgLon];
    // return {lat: mgLat, Lon: mgLon};
}





