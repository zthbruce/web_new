// /**
//  * ajax请求港口数据
//  */
// //获取地图初始层级
// let mapLnitialLevel = map.getView().getZoom();
// //设置地图层级改变监听事件
// let mapLevelChange = blmol.bind.addOnZoomChangeListener(map,function(map,aas,extent,evt){
//     console.log(aas);  //地图层级
// });

//针对放大缩小地图监听, 刷新港口显示
blmol.bind.addOnZoomChangeListener(map, function (map, zoom , extent, event) {
    // console.log(zoom);
    //港口显示
    GradeShowPort(AllPortBasicList,zoom);
});


/**
 * 设置港口分级别显示
 */
function GradeShowPort(portData,mainPortData,level){
    let portLogoBlock;
    let OnePortId;
    let OnePortLat;
    let OnePortLong;
    let OnePortENName;
    let OnePortCNName;
    let OnePortLevel;
    let features = new Array();  //形成图标集合列表,Array<ol.Features>
    let currentLongLatRange = blmol.operation.getCurrentExtent(map);
    for(let key in portData){
        OnePortId = portData[key];
        // console.log(OnePortId);
        OnePortLat = OnePortId['LatitudeNumeric'];
        OnePortLong = OnePortId['LongitudeNumeric'];
        OnePortENName = OnePortId['ENName'];
        OnePortCNName = OnePortId['CNName'];
        OnePortLevel = OnePortId['Level'];
        let newLevel = Math.floor(level/2);
        if(level==5){newLevel=3;}
        if(level>=6){newLevel=level;}
        if(OnePortLong!='null'&&OnePortLong>=currentLongLatRange[0]&&OnePortLong<=currentLongLatRange[2]
            &&OnePortLat!='null'&&OnePortLat>=currentLongLatRange[1]&&OnePortLat<=currentLongLatRange[3]
            &&OnePortLevel<=newLevel){
            let OnePortLatLong = [];
            OnePortLatLong.push(parseFloat(OnePortLong));  //插入经度
            OnePortLatLong.push(parseFloat(OnePortLat));   //插入纬度
            let src = 'images/port.png';
            // let src = ""
            //筛选港口用
            // for(let j=0;j<mainPortData.length;j++){
            //     if(mainPortData[j].PortID == key){
            //         src = 'images/port_main.png';
            //         break;
            //     }
            // }
            portLogoBlock = blmol.marker.createIcon(key, OnePortLatLong,0, src);
            features.push(portLogoBlock);
        }
    }
    blmol.layer.clear(portLayer);
    portLayer.getSource().addFeatures(features);
    // mapImgClick = blmol.bind.addOnClickListener(map,function(map,coordinate,feature,evt){
    //     if(feature.length != 0){
    //         console.log(feature);
    //         if(feature[0].get('port_id')!=undefined){
    //             console.log(feature[0].get('port_id'));
    //             let portId = feature[0].get('port_id');
    //             reqOnePortBasicInfo(portId);
    //         }else if(feature[0].get('cluster_id')!=undefined){
    //             console.log(feature[0].get('cluster_id'));
    //             console.log(feature[0].get('type'));
    //             let clusterId = feature[0].get('cluster_id');
    //             let clusterType = feature[0].get('type');
    //             $('#stillArea_show').attr('clusterId',clusterId);
    //             if(clusterType!=2){
    //                 reqStillAreaInfo(clusterId,clusterType);
    //             }
    //         }
    //     }
    // });
}

/**
 * 地图弹出框拖动事件
 */
let portIntoTitleDown = false; //港口基本信息弹出框
let berthInfoManageTitleDown = false;  //泊位管理弹出框
let pierModifyTitleDown = false;   //码头信息修改弹出框
let pierAddTitleDown = false;   //添加码头信息弹出框
let berthAddTitleDown = false;   //添加泊位信息弹出框
let StillAreaTitleDown = false;     //静止区域信息显示弹出框
let pierRemarkTitleDown = false;   //码头备注信息显示弹出框
let BerthSelectTitleDown = false;   //泊位所属选择显示弹出框
let AnchSelectTitleDown = false;   //锚地所属选择显示弹出框
let portInfoDivLeft;
let portInfoDivTop;

$('.portInfo_title').mousedown(function(event){
    let changeDivId = $(this).parent().attr('id');
    if(changeDivId=='portBasicInfo'){portIntoTitleDown = true;}
    else if(changeDivId=='berthInfoManage'){berthInfoManageTitleDown = true;}
    else if(changeDivId=='pier_modify'){pierModifyTitleDown = true;}
    else if(changeDivId=='pier_add'){pierAddTitleDown = true;}
    else if(changeDivId=='stillArea_show'){StillAreaTitleDown = true;}
    else if(changeDivId=='pier_remarks'){pierRemarkTitleDown = true;}
    else if(changeDivId=='berth_add'){berthAddTitleDown = true;}
    else if(changeDivId=='berth_select'){BerthSelectTitleDown = true;}
    else if(changeDivId=='anch_select'){AnchSelectTitleDown = true;}
    portInfoDivLeft = event.clientX - $(this).offset().left;
    portInfoDivTop = event.clientY - $(this).offset().top;
    $(this).css('cursor','all-scroll');
});
let portDivZIndex = 0;
$('#portBasicInfo,#berthInfoManage,#pier_modify,#pier_add,#pier_show,#pier_remarks').mousedown(function(){
    portDivZIndex++;
    $(this).css('zIndex',portDivZIndex);
});

$('.portInfo_title').mouseup(function(){
    let changeDivId = $(this).parent().attr('id');
    if(changeDivId=='portBasicInfo'){portIntoTitleDown = false;}
    else if(changeDivId=='berthInfoManage'){berthInfoManageTitleDown = false;}
    else if(changeDivId=='pier_modify'){pierModifyTitleDown = false;}
    else if(changeDivId=='pier_add'){pierAddTitleDown = false;}
    else if(changeDivId=='stillArea_show'){StillAreaTitleDown = false;}
    else if(changeDivId=='pier_remarks'){pierRemarkTitleDown = false;}
    else if(changeDivId=='berth_add'){berthAddTitleDown = false;}
    else if(changeDivId=='berth_select'){BerthSelectTitleDown = false;}
    else if(changeDivId=='anch_select'){AnchSelectTitleDown = false;}
    $(this).css('cursor','auto');
});

$(window).mousemove(function(event){
    let newLeft = event.clientX-portInfoDivLeft;
    let newTop = event.clientY-portInfoDivTop;
    if(newLeft<=0){newLeft = 0;}
    if(newTop<=0){newTop = 0;}
    if(portIntoTitleDown){
        if(newLeft>$(document).width()-$('#portBasicInfo>.portInfo_title').width()){newLeft = $(document).width()-$('#portBasicInfo>.portInfo_title').width();}
        if(newTop>$(window).height()-$('#portBasicInfo>.portInfo_title').height()){newTop = $(window).height()-$('#portBasicInfo>.portInfo_title').height();}
        $('#portBasicInfo').offset({top:newTop,left:newLeft});
    }else if(berthInfoManageTitleDown){
        if(newLeft>$(document).width()-$('#berthInfoManage>.portInfo_title').width()){newLeft = $(document).width()-$('#berthInfoManage>.portInfo_title').width();}
        if(newTop>$(window).height()-$('#berthInfoManage>.portInfo_title').height()){newTop = $(window).height()-$('#berthInfoManage>.portInfo_title').height();}
        $('#berthInfoManage').offset({top:newTop,left:newLeft});
    }else if(pierModifyTitleDown){
        if(newLeft>$(document).width()-$('#pier_modify>.portInfo_title').width()){newLeft = $(document).width()-$('#pier_modify>.portInfo_title').width();}
        if(newTop>$(window).height()-$('#pier_modify>.portInfo_title').height()){newTop = $(window).height()-$('#pier_modify>.portInfo_title').height();}
        $('#pier_modify').offset({top:newTop,left:newLeft});
    }else if(pierAddTitleDown){
        if(newLeft>$(document).width()-$('#pier_add>.portInfo_title').width()){newLeft = $(document).width()-$('#pier_add>.portInfo_title').width();}
        if(newTop>$(window).height()-$('#pier_add>.portInfo_title').height()){newTop = $(window).height()-$('#pier_add>.portInfo_title').height();}
        $('#pier_add').offset({top:newTop,left:newLeft});
    }else if(StillAreaTitleDown){
        if(newLeft>$(document).width()-$('#stillArea_show>.portInfo_title').width()){newLeft = $(document).width()-$('#stillArea_show>.portInfo_title').width();}
        if(newTop>$(window).height()-$('#stillArea_show>.portInfo_title').height()){newTop = $(window).height()-$('#stillArea_show>.portInfo_title').height();}
        $('#stillArea_show').offset({top:newTop,left:newLeft});
    }else if(pierRemarkTitleDown){
        if(newLeft>$(document).width()-$('#pier_remarks>.portInfo_title').width()){newLeft = $(document).width()-$('#pier_remarks>.portInfo_title').width();}
        if(newTop>$(window).height()-$('#pier_remarks>.portInfo_title').height()){newTop = $(window).height()-$('#pier_remarks>.portInfo_title').height();}
        $('#pier_remarks').offset({top:newTop,left:newLeft});
    }else if(berthAddTitleDown){
        if(newLeft>$(document).width()-$('#berth_add>.portInfo_title').width()){newLeft = $(document).width()-$('#berth_add>.portInfo_title').width();}
        if(newTop>$(window).height()-$('#berth_add>.portInfo_title').height()){newTop = $(window).height()-$('#berth_add>.portInfo_title').height();}
        $('#berth_add').offset({top:newTop,left:newLeft});
    }else if(BerthSelectTitleDown){
        if(newLeft>$(document).width()-$('#berth_select>.portInfo_title').width()){newLeft = $(document).width()-$('#berth_select>.portInfo_title').width();}
        if(newTop>$(window).height()-$('#berth_select>.portInfo_title').height()){newTop = $(window).height()-$('#berth_select>.portInfo_title').height();}
        $('#berth_select').offset({top:newTop,left:newLeft});
    }else if(AnchSelectTitleDown){
        if(newLeft>$(document).width()-$('#anch_select>.portInfo_title').width()){newLeft = $(document).width()-$('#anch_select>.portInfo_title').width();}
        if(newTop>$(window).height()-$('#anch_select>.portInfo_title').height()){newTop = $(window).height()-$('#anch_select>.portInfo_title').height();}
        $('#anch_select').offset({top:newTop,left:newLeft});
    }
});
/**
 * 地图弹出框显示关闭事件
 */

let pierInfoListArr = [];

//弹出框关闭按钮事件
$('.portInfo_title_offbtn').click(function(){
    // if (saveStatus){
    //     $('.alert').html('当前信息未保存，请先保存信息').addClass('alert-warning').show().delay(1000).fadeOut();
    // } else{
    let closeDivId = $(this).parent().parent().attr('id');
    if(closeDivId=='portBasicInfo'){$('#portBasicInfo,#berthInfoManage,#pier_modify,#pier_remarks').css('display','none');portDivZIndex = 0;}
    else if(closeDivId=='berthInfoManage'){$('#berthInfoManage,#pier_modify,#pier_remarks').css('display','none');}
    else if(closeDivId=='pier_modify'){$('.pier_info_cancel_btn').trigger('click');$(this).parent().parent().css('display','none');}
    else{$(this).parent().parent().css('display','none');}

});

//泊位信息管理弹出框显示事件
$('.portInfo_berth_btn').click(function(){
    //请求数据
    let portId = $('#portBasicInfo').attr('port_id');
    reqOnePortPierList(40101);
    //弹出框显示
    portDivZIndex++;
    $('#berthInfoManage').css('zIndex',portDivZIndex);
    $('#berthInfoManage').slideDown(500);
});

//码头信息修改弹出框显示事件
$('.pier_modify_btn').click(function(){
    pierInfoListArr = [];
    for(let i=0;i<$('.pier_Info_content input').length;i++){
        pierInfoListArr.push($('.pier_Info_content input').eq(i).val());
    }
    pierInfoListArr.push($('.pier_Info_goods').text());
    pierInfoListArr.push($('.pier_Info_InoutType').text());
    console.log(pierInfoListArr);
    portDivZIndex++;
    $('#pier_modify').css({'display':'block','zIndex':portDivZIndex});
});
//码头备注修改弹出框显示事件
$('.pier_remarks_btn').click(function(){
    portDivZIndex++;
    $('#pier_remarks').css({'display':'block','zIndex':portDivZIndex});
});

//泊位静止区域分析按钮单击事件
$('.pier_analysis_btn').click(function(){
    let TerminalKey = $('#pier_modify').attr('pier_TerminalKey');
    console.log(TerminalKey);
});

//删除码头信息确认框
function deletePierConfirm() {
    let msg = "您确定要删除这条数据吗？";
    if (confirm(msg)==true){
        return true;
    }else{
        return false;
    }
}

/**
 * 地图弹出框按钮操作
 */

//泊位管理弹出框泊位列表修改事件
function berthInfoOperating(){
    //双击显示修改
    $('.berthInfo_ListContent li').off('dblclick').on('dblclick',function(){
        $(this).children('span').children('input').css('display','inline-block');
        $(this).children('span:last-child').children('i').removeClass('berth_delete_btn');
        $(this).children('span:last-child').children('i').addClass('berth_modify_submit_btn');
        berthModifySubmit();
    });
    berthDeleteData();
}

function berthModifySubmit(){
    //绑定修改提交事件
    $('.berth_modify_submit_btn').off('click').on('click',function(){
        let berthModifyData = [];
        let seq = parseInt($(this).parent().parent().attr('seq'));
        console.log(seq);
        if(seq<10){seq='00'+seq;}
        else if(seq<100){seq='0'+seq;}
        berthModifyData.push(seq);
        for(let i=1;i<11;i++){
            let inputData = $(this).parent().parent().children('span').eq(i).children('input').val();
            berthModifyData.push(inputData);
            $(this).parent().parent().children('span').eq(i).children('span').text(inputData);
        }
        console.log(berthModifyData);
        //添加或修改
        let dataType = $(this).parent().parent().attr('dataType');
        console.log(dataType);
        let pierTerminalKey = $(this).parent().parent().attr('TerminalKey');
        if(dataType=='0'){
            modifyBerthDetail(pierTerminalKey,berthModifyData[0],berthModifyData[1],berthModifyData[2],
                berthModifyData[3],berthModifyData[4],berthModifyData[5],berthModifyData[6],
                berthModifyData[7],berthModifyData[8],berthModifyData[9],berthModifyData[10]);
        }else if(dataType=='1'){
            addBerthDetail(pierTerminalKey,berthModifyData[0],berthModifyData[1],berthModifyData[2],
                berthModifyData[3],berthModifyData[4],berthModifyData[5],berthModifyData[6],
                berthModifyData[7],berthModifyData[8],berthModifyData[9],berthModifyData[10]);
        }
        $(this).parent().parent().children('span').children('input').css('display','none');
        $(this).removeClass('berth_modify_submit_btn');
        $(this).addClass('berth_delete_btn');
        berthDeleteData();
    });
}

function berthDeleteData(){
    //绑定删除泊位数据事件
    $('.berth_delete_btn').off('click').on('click',function(){
        let pierTerminalKey = $(this).parent().parent().attr('TerminalKey');
        let seq = $(this).parent().parent().attr('seq');
        console.log(seq);
        deleteOneBerth(pierTerminalKey,seq);
    });
}
berthInfoOperating();

//添加一条泊位数据
// $('.add_berth_logo_btn').click(function(){
//     let maxBerthDataNum = $('.berthInfo_ListContent').children('li:last-child').children('span:first-child').text();
//     console.log(maxBerthDataNum);
//     let pierTerminalKey = $('.berthInfo_ListContent>li:first-child').attr('TerminalKey');
//     let maxSeq = parseInt($('.berthInfo_ListContent>li:last-child').attr('seq'))+parseInt(1);
//     if(maxSeq<10){maxSeq='00'+maxSeq;}
//     else if(maxSeq<100){maxSeq='0'+maxSeq;}
//     console.log(maxSeq);
//     let berthDataStr = '<li dataType="1" TerminalKey="'+pierTerminalKey+'" seq="'+maxSeq+'"><span>'+parseInt(parseInt(maxBerthDataNum)+parseInt(1))+'</span> ' +
//         '<span><span></span><input type="text" value=""></span> <span><span></span><input type="text" value=""></span> ' +
//         '<span><span></span><input type="text" value=""></span> <span><span></span><input type="text" value=""></span> ' +
//         '<span><span></span><input type="text" value=""></span> <span><span></span><input type="text" value=""></span> ' +
//         '<span><span></span><input type="text" value=""></span> <span><span></span><input type="text" value=""></span> ' +
//         '<span><span></span><input type="text" value=""></span> <span><span></span><input type="text" value=""></span> ' +
//         '<span><i class="berth_modify_submit_btn"></i></span></li>';
//     $('.berthInfo_ListContent').append(berthDataStr);
//     $('.berthInfo_ListContent').children('li:last-child').children('span').children('input').css('display','inline-block');
//     berthInfoOperating();
//     berthModifySubmit();
//     $('.berthInfo_ListContent').scrollTop($('.berthInfo_ListContent').height());
// });


//码头信息修改弹出框提交按钮单击事件
$('.pier_info_submit_btn').click(function(){

    //获取数据并验证正确性
    pierInfoListArr = [];
    pierInfoListArr.push($('#pier_modify').attr('pier_TerminalKey'));
    for(let i=0;i<$('#pier_modify>.pier_Info_content input').length;i++){
        pierInfoListArr.push($('#pier_modify>.pier_Info_content input').eq(i).val());
    }
    pierInfoListArr.push($('#pier_modify .pier_Info_goods').text());
    pierInfoListArr.push($('#pier_modify .pier_Info_InoutType').text());
    console.log(pierInfoListArr);
    modifyPierDetail(pierInfoListArr[0],pierInfoListArr[1],pierInfoListArr[2],pierInfoListArr[3],
        pierInfoListArr[4],pierInfoListArr[5],pierInfoListArr[6],pierInfoListArr[7],
        pierInfoListArr[8],pierInfoListArr[9],pierInfoListArr[10],pierInfoListArr[11]);

});

//码头信息修改弹出框取消按钮单击事件
$('.pier_info_cancel_btn').click(function(){
    console.log(pierInfoListArr);
    for(let i=0;i<$('.pier_Info_content input').length;i++){
        $('.pier_Info_content input').eq(i).val(pierInfoListArr[i]);
    }
    $('.pier_Info_goods').text(pierInfoListArr[9]);
    $('.pier_Info_InoutType').text(pierInfoListArr[10]);
});

//码头备注弹出框确定按钮单击事件
$('.pier_remark_submit_btn').click(function(){
    let pierRemark = $('#pierRemark').val();
    console.log(pierRemark);
    let pierTerminalKey = $('#pier_remarks').attr('pier_TerminalKey');
    console.log(pierTerminalKey);
    modifyPierRemark(pierTerminalKey,pierRemark);
    $('#pier_remarks').css('display','none');
});

//码头信息弹出框货物选项列表事件
$('.pierInfo_select>span:nth-child(2)').click(function(){
    $(this).next('ul').slideDown(200);
    $(this).css({'border':'1px solid #00B7FF','boxShadow':'0px 0px 1px 1px #00B7FF'});
});
$('.pierInfo_select_list>li').click(function(){
    $(this).parent().prev().text($(this).text()).css({'border':'1px solid #989898','boxShadow':'0px 0px 0px 0px transparent'});
    $(this).parent().slideUp(200);
});
$('.pierInfo_select').mouseleave(function(){
    $(this).children('span:nth-child(2)').css({'border':'1px solid #989898','boxShadow':'0px 0px 0px 0px transparent'});
    $(this).children('ul').slideUp(200);
});
// $('.pier_Info_content>.pier_company>input').keyup(function(){
//     let companyStr = $(this).val();
//     // console.log(companyStr.length);
//     if(companyStr.length>4){
//         console.log(companyStr);
//         addPierSelectCompanyName(companyStr);
//     }
//     // $(this).next('ul').slideDown(200);
//     // $(this).css({'border':'1px solid #00B7FF','boxShadow':'0px 0px 1px 1px #00B7FF'});
// });
// $('.pierInfo_select_list>li').click(function(){
//     $(this).parent().prev().text($(this).text()).css({'border':'1px solid #989898','boxShadow':'0px 0px 0px 0px transparent'});
//     $(this).parent().slideUp(200);
// });
// $('.pierInfo_select').mouseleave(function(){
//     $(this).children('span:nth-child(2)').css({'border':'1px solid #989898','boxShadow':'0px 0px 0px 0px transparent'});
//     $(this).children('ul').slideUp(200);
// });



$('.pier_analysis_btn').click(function(){
    // anchorageDivZIndex++;
    // 将扇形图统计那一块显示
    // SNShow(["1_1"]);
    // SNStatistic();
    // showStatistic(["1_1"]);
    $('.box1').css({'display':'block','zIndex':100});
});


/**
 * 静止区域按钮事件
 */



$(function(){
   $('.inquire_Details inquire_pier_details').click(function(){
    $('.box_berth').css('display','inline-block');
}); 
})



/**
 * 添加泊位部分，泊位归属选择弹出框
 */
//所属港口、码头列表显示事件
$('.addBerth_select>span:nth-child(2),.addAnch_port_select>span:nth-child(2)').click(function(){
    $(this).next('ul').slideDown(300);
});
$('.addBerth_select,.addAnch_port_select').mouseleave(function(){
    $(this).children('ul').slideUp(300);
});

//添加码头按钮单击事件
$('.add_pier_btn').click(function(){
    portDivZIndex++;
    $('#pier_add').css('zIndex',portDivZIndex);
    $('#pier_add').slideDown(400);
    let OwnedPort = $('.port_select>span:nth-child(2)').text();
    let OwnedPortID = $('.port_select>span:nth-child(2)').attr('port_id');
    $('#pier_add>.pier_Info_content>div:nth-child(2)>input').val(OwnedPort);
    $('#pier_add>.pier_Info_content>div:nth-child(2)').attr('portID',OwnedPortID);
});
// //编辑泊位信息按钮单击事件
// $('.berthInfo_PopupBox_btn').click(function(){
//     portDivZIndex++;
//     $('#berth_add').css('zIndex',portDivZIndex);
//     $('#berth_add').slideDown(400);
//     $('#berth_add .berth_add_content>div:first-child>input').val($('#berth_select .port_select>span:nth-child(2)').text());
//     $('#berth_add .berth_add_content>div:first-child').attr('port_id',$('#berth_select .port_select>span:nth-child(2)').attr('port_id'));
//     $('#berth_add .berth_add_content>div:nth-child(2)>input').val($('#berth_select .berth_select>span:nth-child(2)').text());
//     console.log($('#berth_select .berth_select>span:nth-child(2)').attr('pier_id'));
//     $('#berth_add .berth_add_content>div:nth-child(2)').attr('pier_id',$('#berth_select .berth_select>span:nth-child(2)').attr('pier_id'));
// });

//修改码头详情按钮单击事件
$('.inquire_pier_details').click(function(){
    portDivZIndex++;
    $('#pier_add').css('zIndex',portDivZIndex);
    $('#pier_add').slideDown(400);
    let OwnedPort = $('.port_select>span:nth-child(2)').text();
    let OwnedPortID = $('.port_select>span:nth-child(2)').attr('port_id');
    $('#pier_add>.pier_Info_content>div:nth-child(2)>input').val(OwnedPort);
    $('#pier_add>.pier_Info_content>div:nth-child(2)').attr('portID',OwnedPortID);
    //查询码头详情
    let TerminalKey = $('.berth_select>span:nth-child(2)').attr('pier_id');
    console.log(TerminalKey);
    if(TerminalKey!=''){berthreqPierDetail(TerminalKey);}
});
/**
 * 添加码头
 */
//添加码头重置按钮单击事件
$('.pier_info_reset_btn').click(function(){
    $('.pier_Info_content>div>input').val('');
    $('.pier_Info_content>div:nth-child(2)>input').val($('#berth_select .port_select>span:nth-child(2)').text());
    $('#pier_add .pier_Info_goods').text($('#pier_add .pier_Info_goods_list>li:first-child').text());
    $('#pier_add .pier_Info_InoutType').text($('#pier_add .pier_Info_InoutType_list>li:first-child').text());
});
//添加码头信息弹出框提交按钮单击事件
$('.pier_info_add_submit_btn').click(function(){
    //获取数据并验证正确性
    let NewPierInfoListArr = [];
    NewPierInfoListArr.push(generateNewPierKey());
    for(let i=0;i<$('#pier_add>.pier_Info_content>div>input').length;i++){
        NewPierInfoListArr.push($('#pier_add>.pier_Info_content>div>input').eq(i).val());
    }
    // for(let i=0;i<$('#pier_add .pierInfo_select').length;i++){
    //     NewPierInfoListArr.push($('#pier_add .pierInfo_select').eq(i).children('span:nth-child(2)').text());
    // }
    NewPierInfoListArr.push($('#pier_add>.pier_Info_content textarea').val());
    let PortID = $('#berth_select .port_select>span:nth-child(2)').attr('port_id');
    let LatLongArr = ObtainLatLongStr();
    console.log(LatLongArr);
    NewPierInfoListArr[5] = LatLongArr[0];
    NewPierInfoListArr[6] = LatLongArr[1];
    console.log(NewPierInfoListArr);

    // addOnePier(NewPierInfoListArr[0],NewPierInfoListArr[1],NewPierInfoListArr[2],NewPierInfoListArr[3],
    //     NewPierInfoListArr[4],NewPierInfoListArr[5],NewPierInfoListArr[6],NewPierInfoListArr[7],
    //     NewPierInfoListArr[8],NewPierInfoListArr[9],NewPierInfoListArr[10],NewPierInfoListArr[11],NewPierInfoListArr[12],NewPierInfoListArr[13],PortID);

});
// generateNewPierKey();
//生成新建码头key值的函数
function generateNewPierKey(){
    //新建码头key值
    let nowdate = new Date();
    let nowday = nowdate.toLocaleDateString();
    // console.log(date);
    // console.log(nowdate);
    let nowDayArr = nowday.split('/');
    nowDayArr[1] = nowDayArr[1].length<2 ? '0'+nowDayArr[1]:nowDayArr[1];
    nowDayArr[2] = nowDayArr[2].length<2 ? '0'+nowDayArr[2]:nowDayArr[2];
    let nowDayStr = nowDayArr.join('');
    let nowdate_hours=nowdate.getHours();
    let nowdate_minutes=nowdate.getMinutes();
    let nowdate_seconds=nowdate.getSeconds();
    nowdate_hours = nowdate_hours<10?'0'+nowdate_hours:nowdate_hours;
    nowdate_minutes = nowdate_minutes<10?'0'+nowdate_minutes:nowdate_minutes;
    nowdate_seconds = nowdate_seconds<10?'0'+nowdate_seconds:nowdate_seconds;
    nowDayStr = nowDayStr + nowdate_hours + nowdate_minutes + nowdate_seconds;
    console.log(nowDayStr);
    return nowDayStr;
}

/**
 * 添加泊位
 */
//添加泊位重置按钮单击事件
$('#berth_add .berth_add_reset').click(function(){
    $('#berth_add .berth_add_content>div:gt(1)>input').val('');
});

// //保存泊位信息按钮单击事件
// $('#berth_add .berth_add_submit').click(function(){
//     let dataIsEffective = true;
//     let berthArr = [];
//     berthArr.push($('#berth_add .berth_add_content>div:first-child').attr('port_id'));
//     berthArr.push($('#berth_add .berth_add_content>div:nth-child(2)').attr('pier_id'));
//     let maxSeq = '001';
//     if($('#berth_select .onePier_berthContent>li').length>0){
//         maxSeq = parseInt($('#berth_select .onePier_berthContent>li:last-child').attr('seq'));
//         maxSeq++;
//         if(maxSeq<10){maxSeq = '00'+maxSeq}
//         else if(maxSeq<100){maxSeq = '0'+maxSeq}
//     }
//     for(let i=2;i<$('#berth_add .berth_add_content input').length;i++){
//         if(i<8&&isNaN($('#berth_add .berth_add_content input').eq(i).val())){
//             dataIsEffective=false;
//             $('#berth_add .berth_add_content input').eq(i).css({'border-color':'#f00','box-shadow':'0px 0px 1px 1px #f00'});
//         }
//         berthArr.push($('#berth_add .berth_add_content>div').eq(i).children('input').val());
//     }
//     let clusterId = $('#stillArea_show').attr('cluster_id');
//     let type = $('#stillArea_show').attr('type');
//     // console.log(maxSeq);
//     // console.log(berthArr);
//     // console.log(clusterId);
//     if(dataIsEffective){
//         addBerthDetail(berthArr[0],berthArr[1],maxSeq,berthArr[2],berthArr[3],berthArr[4],berthArr[5],berthArr[6],berthArr[7],berthArr[8],berthArr[9],berthArr[10],berthArr[11],clusterId,type);
//         // 更新停泊区域信息
//         updateParkAreaType(clusterId, 1)    // 1表示泊位
//         $('#berth_add').slideUp(400);
//     }
// });

//保存泊位信息按钮单击事件
$('#berth_select .berthInfo_PopupBox_btn').click(function(){
    let dataIsEffective = true;
    let berthArr = [];
    berthArr.push($('#berth_select .port_select>span:nth-child(2)').attr('port_id'));
    berthArr.push($('#berth_select .berth_select>span:nth-child(2)').attr('pier_id'));
    let maxSeq = '001';
    if($('#berth_select .onePier_berthContent>li').length>0){
        maxSeq = parseInt($('#berth_select .onePier_berthContent>li:last-child').attr('seq'));
        maxSeq++;
        if(maxSeq<10){maxSeq = '00'+maxSeq}
        else if(maxSeq<100){maxSeq = '0'+maxSeq}
    }
    for(let i=0;i<$('#berth_select .berth_detail input').length;i++){
        if(i>3&&isNaN($('#berth_select .berth_detail input').eq(i).val())){
            dataIsEffective=false;
            $('#berth_select .berth_detail input').eq(i).css({'border-color':'#f00','box-shadow':'0px 0px 1px 1px #f00'});
        }
        berthArr.push($('#berth_select .berth_detail input').eq(i).val());
    }
    let clusterId = $('#stillArea_show').attr('cluster_id');
    let type = $('#stillArea_show').attr('type');
    console.log(maxSeq);
    console.log(berthArr);
    console.log(clusterId);
    if(dataIsEffective){
        // addBerthDetail(PortID,TerminalKey,seq,berth_LoadDischargeRate,berth_EquipmentQuantity,berth_Travel,berth_Outreach,berth_LOA,berth_draft,berth_Depth,berth_Length,berth_AirDraft,berth_Moulded_Beam,cluster_id,type)
        addBerthDetail(berthArr[0],berthArr[1],maxSeq,berthArr[2],berthArr[3],berthArr[4],berthArr[5],berthArr[6],berthArr[7],berthArr[8],berthArr[9],berthArr[10],berthArr[11],clusterId,type);
        // 更新停泊区域信息
        updateParkAreaType(clusterId, 1);   // 1表示泊位
        $('.alert').html('保存泊位信息成功').addClass('alert-success').show().delay(2000).fadeOut();
        // $('.confirm').html('保存泊位信息成功').addClass('confirm-success').show().delay(2000).fadeOut();
        saveStatus = !saveStatus;   // 改变状态
        changeSaveButton(saveStatus, 1);
        $('#berth_add').slideUp(400);
    }
    else{
        $('.alert').html('输入信息有误, 请重新输入').addClass('alert-warning').show().delay(2000).fadeOut();
    }
});

$('.inquire_port_details').mousemove(function(){
    $('.box_berth').css('display','inline-block');
    let portID = $('#berth_select .port_select>span:nth-child(2)').attr('port_id');
    if(portID!=''){BoxBerth(portID);}
    });
$('.inquire_port_details').mouseout(function() {
       $('.box_berth').css('display','none'); 
});

//
//添加泊位全长的等字段有效性验证
$('.berthAdd_inputNum>input').keyup(function(){
    console.log(isNaN($(this).val()));
    // console.log(isNaN($(this).val()));
    if(isNaN($(this).val())){
        $(this).css({'border-color':'#f00','box-shadow':'0px 0px 1px 1px #f00'});
    }else{
        if($(this).val().length>0){$(this).css({'border-color':'#0f0','box-shadow':'0px 0px 1px 1px #0f0'});}
        else{$(this).css({'border-color':'#00B7FF','box-shadow':'0px 0px 1px 1px #00B7FF'});}
    }
});
$('.berthAdd_inputNum>input').focusout(function(){
    $(this).css({'border-color':'#989898','box-shadow':'0px 0px 0px 0px transparent'});
});
$('.berthAdd_inputNum>input').focusin(function(){
    if(isNaN($(this).val())){
        $(this).css({'border-color':'#f00','box-shadow':'0px 0px 1px 1px #f00'});
    }else{
        if($(this).val().length>0){
            $(this).css({'border-color':'#0f0','box-shadow':'0px 0px 1px 1px #0f0'});
        }else{$(this).css({'border-color':'#00B7FF','box-shadow':'0px 0px 1px 1px #00B7FF'});}
    }
});

/**
 * 添加锚地
 */

//添加锚地弹出框重置按钮单击事件
$('.addAnch_reset').click(function(){
    $('#anch_select .anchInfo_select_content input,#anch_select .anchInfo_select_content textarea').val('');
});
//添加锚地弹出框保存按钮单击事件
$('.addAnch_confirm').click(function(){
    let AnchArr = [];
    AnchArr.push($('#anch_select .addAnch_port_select>span:nth-child(2)').attr('port_id'));
    AnchArr.push($('#anch_select .anchInfo_select_content input').val());
    AnchArr.push($('#anch_select .anchInfo_select_content>div:nth-child(3)>textarea').val());
    AnchArr.push($('#anch_select .anchInfo_select_content>div:nth-child(4)>textarea').val());
    AnchArr.push($('#stillArea_show').attr('cluster_id'));
    let type = $('#stillArea_show').attr('type');
    let AnchKey = generateNewPierKey();
    addOneAnch(AnchArr[0],AnchKey,AnchArr[1],AnchArr[2],AnchArr[3],AnchArr[4],type);
    // 锚地信息保存成功
    // $('.confirm').html('保存泊位信息成功').addClass('confirm-success').show().delay(2000).fadeOut();
    $('.alert').html('保存锚地信息成功').addClass('alert-success').show().delay(2000).fadeOut();
    saveStatus = !saveStatus;   // 改变状态
    changeSaveButton(saveStatus, 0);
    // 更新停泊区域信息
    updateParkAreaType(AnchArr[4], 0)   // 0 表示锚地
});


//经度切换东西经按钮单击事件
$('.EastLong_or_WestLong').click(function(){
    if($(this).hasClass('EastLong')){
        $(this).removeClass('EastLong');
        $(this).addClass('WestLong');
    }else if($(this).hasClass('WestLong')){
        $(this).removeClass('WestLong');
        $(this).addClass('EastLong');
    }
});
//纬度切换南北纬按钮单击事件
$('.SouthLat_or_NorthLat').click(function(){
    if($(this).hasClass('SouthLat')){
        $(this).removeClass('SouthLat');
        $(this).addClass('NorthLat');
    }else if($(this).hasClass('NorthLat')){
        $(this).removeClass('NorthLat');
        $(this).addClass('SouthLat');
    }
});
//经纬度输入限制
$('.pier_LatLong_enter>input').focus(function(){
    $(this).select();
    $(this).parent('div').prev('input').css({'border':'1px solid #00B7FF','box-shadow':'0px 0px 1px 1px #00B7FF'});
});
$('.pier_LatLong_enter>input').focusout(function(){
    $(this).parent('div').prev('input').css({'border':'1px solid #989898','box-shadow':'0px 0px 0px 0px transparent'});
});
$('.pier_LatLong_enter>input').keyup(function(){
    if($(this).index()<2 && $(this).val().length==2){
        $(this).next('input').focus();
    }
});
//设置input自动获取焦点
$('.pier_Info_content .LatLong_input').click(function(){
    console.log(123);
    $(this).next('div').children('input:first-child').focus();
    $(this).css({'border':'1px solid #00B7FF','box-shadow':'0px 0px 1px 1px #00B7FF'});
});
//设置获取经纬度字符串函数
function ObtainLatLongStr(){
    let LatLongArr = [];
    for(let i=0; i<$('.pier_LatLong_enter input').length; i++){
        LatLongArr.push($('.pier_LatLong_enter input').eq(i).val());
    }
    let LongStr = LatLongArr[0] + '°' + LatLongArr[1] + '.' + LatLongArr[2];
    let LatStr = LatLongArr[3] + '°' + LatLongArr[4] + '.' + LatLongArr[5];
    if($('.EastLong_or_WestLong').hasClass('EastLong')){LongStr = LongStr + 'E';}
    else if($('.EastLong_or_WestLong').hasClass('WestLong')){LongStr = LongStr + 'W';}
    if($('.SouthLat_or_NorthLat').hasClass('SouthLat')){LatStr = LatStr + 'S';}
    else if($('.SouthLat_or_NorthLat').hasClass('NorthLat')){LatStr = LatStr + 'N';}
    console.log(LongStr);
    console.log(LatStr);
    return [LongStr,LatStr];
}