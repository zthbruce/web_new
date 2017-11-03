/**
 * draw 是一个下层命名空间，包括了在地图上绘制的多个功能函数
 *
 * @type {{}}
 */
blmol.draw = {};

blmol.draw.removeDraw = function (map, draw) {
    if (draw instanceof ol.interaction.Draw) {
        map.removeInteraction(draw);
    }
};

blmol.draw.addDraw = function (map, draw) {
    if (draw instanceof ol.interaction.Draw) {
        map.addInteraction(draw);
    }
};

blmol.draw.pointDraw = function (map, source, style, wrapX) {
    return blmol.draw.customDraw(this.Mode.POINT, source, style, wrapX);
};

blmol.draw.lineDraw = function (map, source, style, wrapX) {
    return blmol.draw.customDraw(this.Mode.LINE, source, style, wrapX);
};

blmol.draw.rectangleDraw = function (map, source, style, wrapX) {
    return blmol.draw.customDraw(this.Mode.RECTANGLE, source, style, wrapX);
};

blmol.draw.polygonDraw = function (map, source, style, wrapX){
    return blmol.draw.customDraw(this.Mode.POLYGON, source, style, wrapX);
};

blmol.draw.circleDraw = function (map, source, style, wrapX){
    return blmol.draw.customDraw(this.Mode.CIRCLE, source, style, wrapX);
};

blmol.draw.ellipseDraw = function (map, source, style, wrapX) {
    return blmol.draw.customDraw(this.Mode.ELLIPSE, source, style, wrapX);
};

blmol.draw.customDraw = function (mode, source, style, wrapX) {
    var geomFun;
    var type = mode;
    // 画椭圆
    if (mode === this.Mode.ELLIPSE) {
        geomFun = function (coordinates, opt_geometry) {
            var center = coordinates[0];
            var coord = coordinates[1];

            var centerPx = this.getMap().getPixelFromCoordinate(center);
            var coordPx = this.getMap().getPixelFromCoordinate(coord);
            var dmax = Math.max(100, Math.abs(centerPx[0] - coordPx[0]),
                Math.abs(centerPx[1] - coordPx[1]));
            dmax = Math.round(dmax / 0.1);

            var tmp = ol.interaction.Draw.createRegularPolygon(dmax, 0);
            var geom = tmp(coordinates, opt_geometry);

            // Scale polygon to fit extent
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
        type = this.Mode.CIRCLE;
    } else if (mode == this.Mode.RECTANGLE) {
        geomFun = ol.interaction.Draw.createRegularPolygon(4, 0);
        type = this.Mode.CIRCLE;
    }

    return new ol.interaction.Draw({
        source: source,
        type: type,
        geometryFunction: geomFun,
        style: style,
        wrapX: wrapX
    });
};

blmol.draw.Mode = {
    POINT: 'Point',
    LINE: 'LineString',
    POLYGON: 'Polygon',
    CIRCLE: 'Circle',
    ELLIPSE: 'Ellipse',
    RECTANGLE: 'Rectangle'
};