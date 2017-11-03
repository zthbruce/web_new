/**
 * Created by Truth on 2017/6/30.
 */

// 将获取的流水数据保存下来，以便进行筛选处理
// var SNData;

// function getHMS(timePeriod){
//
// }

// 求最小值
// var min = function (x, y) {return x > y ? y:x;};
function getMin(x, y) {return x > y ? y:x;}

// 求最大值
// var max = function (x, y) {return x > y ? x:y;};
function getMax(x, y) {return x > y ? x:y;}

//求和函数
// var sum = function(x,y){ return x+y;};
function getSum(x,y){ return x+y;}

//数组中每个元素求它的平方
// var square = function(x){ return x*x;};　
function getSquare(x){ return x * x;}

/**
 * 根据流水数据和属性获取数据
 * @param attr
 */
function getStatData(SNData, attr){
    var array = [];
    var attrValue;
    for (var i = 0; i < SNData.length; i++) {
        attrValue = SNData[i][attr];
        if (attrValue !== null) {
            array.push(attrValue)
        }
    }
    var len = array.length;
    if(len > 0) {
        var min = array.reduce(getMin);
        var max = array.reduce(getMax);
        var mean = (array.reduce(getSum) / len).toFixed(4);
        var sigma = Math.sqrt(array.map(function (x) {
                return x - mean
            }).map(getSquare).reduce(getSum) / len).toFixed(4);
        return {min: min, max: max, mean: mean, sigma: sigma};
    }
    return {min: null, max: null, mean: null, sigma: null};
}

/**
 * 下栏的流水信息
 * @param cluster_id_list
 * @constructor
 */
function showSNStatistic(cluster_id_list){

    $('.stillArea_statistics').off('click').on('click',function (){
        // 关闭前一个窗口
        $('#stillArea_show').css('display','none');
        $.ajax({
            async: false,
            data: {cluster_id_list: cluster_id_list},
            url: '/statistic/getSNData',
            type: 'GET',
            cache: true,
            timeout: 500000,
            success: function (data) {
                var res = data;
                if (res[0] === '200') {
                    console.log('成功获取信息');
                    var ele;
                    // var arrival;
                    // var departure;
                    // var duration;
                    var IMO;
                    var LOA;
                    var beam;
                    var draft;
                    var air_draft;
                    var DWT;
                    var type;
                    var sendData = res[1];
                    var SNData = JSON.parse(sendData);
                    var SNCount = SNData.length;
                    // 表格信息
                    $('#SNInfo').empty();
                    // 初始化
                    var SNrow = '<tr style="background:#00b7ff;font-size:7px;"> <td>停泊流水号</td> <td>IMO</td> ' +
                        '<td>抵达时间</td> <td>离开时间</td> <td>停留时长(h)</td> <td>LOA(m)</td> <td>DWT(T)</td> <td>BEAM(m)</td> ' +
                        '<td>DRAFT</td> <td>AIR DRAFT</td> <td>TYPE</td> </tr>';
                    for (var i = 0; i < SNCount; i++) {
                        ele = SNData[i];
                        // duration = (parseFloat(ele.Duration) / 3600.0).toFixed(4);
                        IMO = ele.IMO === null ? "暂无" : ele.IMO;
                        LOA = ele.LOA === null ? "暂无" : ele.LOA;
                        beam = ele.Moulded_Beam === null ? "暂无" : ele.Moulded_Beam;
                        draft = ele.Draft === null ? "暂无" : ele.Draft;
                        air_draft = ele.AirDraft === null ? "暂无" : ele.AirDraft;
                        DWT = ele.DWT === null ? "暂无" : ele.DWT;
                        type = ele.ShipType === null ? "暂无" : ele.ShipType;
                        SNrow += '<tr><td>' + ele.SN + '</td><td>' + IMO + '</td><td>' + ele.Arrival + '</td><td>'
                            + ele.Departure + '</td><td>' + ele.Duration + '</td><td>'
                            + LOA + '</td><td>' + DWT + '</td><td>' + beam + '</td><td>'
                            + draft + '</td><td>' + air_draft + '</td><td>' + type + '</td></tr>';
                    }
                    console.log('插入数据');
                    // 插入流水数据
                    $('#SNInfo').append(SNrow);
                    // 插入统计数据
                    SNStatistic(SNData);
                    // 需要显示饼状图统计
                    console.log("数据插入成功")
                }
                else if(res[0] ==='304'){
                    console.log("无流水信息");
                    $('#SNInfo').html('<div class="SNData_promptInfo">暂无流水信息</div>');
                }
            },
            error: function (data, status, e) {
                console.log("unknown error");
            }
        });
        $('.box1').css({'display':'block','zIndex':100});
    })
}

function SNStatistic(SNData){
    console.log("统计结果");
    var SNStatData = {};
    SNStatData["LOA"] = getStatData(SNData, "LOA");
    SNStatData["Moulded_Beam"] =  getStatData(SNData, "Moulded_Beam");
    SNStatData["Draft"] = getStatData(SNData, "Draft");
    SNStatData["AirDraft"] = getStatData(SNData, "AirDraft");
    SNStatData["Duration"] = getStatData(SNData, "Duration");
    SNStatData["DWT"] = getStatData(SNData, "DWT");
    var row = 1;
    var min;
    var max;
    var mean;
    var sigma;
    var ele;
    for(var key in SNStatData){
        ele = SNStatData[key];
        min = ele.min === null? "暂无": ele.min;
        max = ele.max === null? "暂无": ele.max;
        mean = ele.max === null? "暂无": ele.mean;
        sigma = ele.sigma === null? "暂无": ele.sigma;
        // 获取相应的位置
        var rowContent = document.getElementById("SNStat").rows[row];
        rowContent.cells[1].innerText = max;
        rowContent.cells[2].innerText = min;
        rowContent.cells[3].innerText = mean;
        rowContent.cells[4].innerText = sigma;
        row++;
    }
}

// /**
//  * 右上栏的统计信息
//  * @constructor
//  */
// function SNStatistic(){
//     $.ajax({
//         url: '/statistic/getSNStatistic',
//         type: 'GET',
//         cache: true,
//         timeout: 500000,
//         success: function (data) {
//             var res = data;
//             if (res[0] === '200') {
//                 console.log('成功获取信息');
//                 var SNStatData = JSON.parse(res[1]);
//                 var min;
//                 var max;
//                 var mean;
//                 var sigma;
//                 var ele;
//                 var row = 1;
//                 for(var key in SNStatData){
//                     // console.log(key);
//                     ele = SNStatData[key];
//                     min = ele.min === null? "暂无": ele.min;
//                     max = ele.max === null? "暂无": ele.max;
//                     mean = ele.max === null? "暂无": ele.mean;
//                     sigma = ele.sigma === null? "暂无": ele.sigma;
//                     var rowContent = document.getElementById("SNStat").rows[row];
//                     rowContent.cells[1].innerText = max;
//                     rowContent.cells[2].innerText = min;
//                     rowContent.cells[3].innerText = mean;
//                     rowContent.cells[4].innerText = sigma;
//                     row++;
//                     console.log("数据插入成功")
//                 }
//             }
//         }
//     })
// }

/**
 * 显示统计界面
 * @param cluster_id_list
 */
// function showStatistic(cluster_id_list){
//     // 点击统计信息按钮
//     $('.stillArea_statistics_btn').click(function () {
//         // 获得流水数据
//         SNShow(cluster_id_list);
//         // 统计流水数据
//         // SNStatistic();
//         // 流水扇形图
//         $('.box1').css({'display':'block','zIndex':100});
//     });
//
// }