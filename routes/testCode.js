/**
 * Created by ShiTianCi on 2017/6/27.
 */
// require('javascripts/route')
// getShipList();
require('util');
// var status = {'0': "在建", '1': "正服役", '2': "维护中", '3': "闲置", '4': "已拆解", '5': "未知", '6': "数据不再维护"};
// console.log(status[1]);
//


// var year = date.getUTCFullYear() - 1
// var
// // console.log(year)
//
// var endTime = Date.parse(date) / 1000;
// var oneMonth = 25920000;
// var startTime = endTime - oneMonth;
// console.log(startTime);
// //
// //
// // function getLastMonth
//
// console.log(30*24*36000);

// var name = "as";
// console.log(util.format("SELECT * FROM `T0181_ShipType` SELECT * FROM `T0181_ShipType` WHERE NAME LIKE '%s%' OR CNName LIKE '%s%'", name, name));

// function format(num) {
//     var prefix = '';
//     if(num>=0 && num <=9)
//         prefix = '0';
//     return prefix + num
//
// }
// function getNowFormatDate() {
//     var date = new Date();
//     var seperator1 = "-";
//     var seperator2 = ":";
//     var strMonth = format((date.getMonth() + 1));
//     // month =  month.length === 1 ? '0' + month: month ;
//     console.log(date.getDate());
//     var strDate = format(date.getDate());
//     var strHours = format(date.getHours());
//     var strMinutes = format(date.getMinutes());
//     var strSecond = format(date.getMinutes());
//     return date.getFullYear() + seperator1 + strMonth + seperator1 + strDate
//         + " " + strHours + seperator2 + strMinutes + seperator2 + strSecond;
// }
//
// console.log(getNowFormatDate())

var m =[];
m.push(3);
console.log(m);

function inside(point, vs) {
    // ray-casting algorithm based on
    // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
    var x = point[0], y = point[1];

    var inside = false;
    for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        var xi = vs[i][0], yi = vs[i][1];
        var xj = vs[j][0], yj = vs[j][1];
        if(x === xi && y === yi){
            inside = true;
            break;
        }
        var intersect = ((yi > y) !== (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
}

console.log(inside([0, 1], [[0,1], [0, 2]]));


function getRealTime(timeStamp) {
    var date = new Date(timeStamp * 1000);
    var Y = date.getFullYear();
    var M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1);
    var D = date.getDate() < 10 ? '0'+ date.getDate(): date.getDate();
    var h = date.getHours() < 10 ? '0'+ date.getHours() :date.getHours();
    var m = date.getMinutes() < 10 ? '0'+ date.getMinutes() : date.getMinutes();
    var s = date.getSeconds() < 10 ? '0'+ date.getSeconds()  : date.getSeconds() ;
    return Y+ '-' + M+ '-' + D+ ' ' + h + ':'+m + ':' +s
}
console.log(getRealTime(1404955272));

var stringTime = "2014-07-10 09:21:12";
var timestamp2 = Date.parse(new Date(stringTime));
timestamp2 = timestamp2 / 1000;
console.log(timestamp2);

function getDuration(period) {
    var s = period % 60;
    var m = Math.floor(period / 60);
    if(m === 0){
        return s + "s"
    }
    var h = Math.floor(m / 60);
    if(h === 0){
        return m + "m" + s + "s"
    }
    m = m % 60;
    var D = Math.floor(h / 24);
    if(D === 0){
        return h + "h" + m + "m" + s + "s"
    }
    h = h % 24;
    return D +"d" + h + "h" + m + "m" + s + "s"
}
console.log(getDuration(3600 * 48 + 3600));