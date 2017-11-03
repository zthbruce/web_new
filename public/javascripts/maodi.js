/**
 * 地图弹出框拖动事件
 */
var anchorageIntoTitleDown = false; //港口基本信息弹出框
var anchorageInfoManageTitleDown = false;  //泊位管理弹出框
var anchorageModifyTitleDown = false;   //码头信息修改弹出框
var anchorageShowTitleDown = false;     //码头信息显示弹出框
var anchorageInfoDivLeft;
var anchorageInfoDivTop;
var anchorageDivZIndex = 0;
$('.anchorageInfo_title').mousedown(function(event){
    anchorageDivZIndex++;
    var changeDivId = $(this).parent().attr('id');
    if(changeDivId=='anchorageBasicInfo'){anchorageIntoTitleDown = true;$('#anchorageBasicInfo').css('zIndex',anchorageDivZIndex);}
    else if(changeDivId=='anchorageInfoManage'){anchorageInfoManageTitleDown = true;$('#anchorageInfoManage').css('zIndex',anchorageDivZIndex);}
    else if(changeDivId=='anchorage_modify'){anchorageModifyTitleDown = true;$('#anchorage_modify').css('zIndex',anchorageDivZIndex);}
    else if(changeDivId=='anchorage_show'){anchorageShowTitleDown = true;$('#anchorage_show').css('zIndex',anchorageDivZIndex);}
    anchorageInfoDivLeft = event.clientX - $(this).offset().left;
    anchorageInfoDivTop = event.clientY - $(this).offset().top;
});
$('.anchorageInfo_title').mouseup(function(){
    var changeDivId = $(this).parent().attr('id');
    if(changeDivId=='anchorageBasicInfo'){anchorageIntoTitleDown = false;}
    else if(changeDivId=='anchorageInfoManage'){anchorageInfoManageTitleDown = false;}
    else if(changeDivId=='anchorage_modify'){anchorageModifyTitleDown = false;}
    else if(changeDivId=='anchorage_show'){anchorageShowTitleDown = false;}
});
$(window).mousemove(function(event){
    var newLeft = event.clientX-anchorageInfoDivLeft;
    var newTop = event.clientY-anchorageInfoDivTop;
    if(newLeft<=0){newLeft = 0;}
    if(newTop<=0){newTop = 0;}
    if(anchorageIntoTitleDown){
        if(newLeft>$(document).width()-$('#anchorageBasicInfo>.anchorageInfo_title').width()){newLeft = $(document).width()-$('#anchorageBasicInfo>.anchorageInfo_title').width();}
        if(newTop>$(window).height()-$('#anchorageBasicInfo>.anchorageInfo_title').height()){newTop = $(window).height()-$('#anchorageBasicInfo>.anchorageInfo_title').height();}
        $('#anchorageBasicInfo').offset({top:newTop,left:newLeft});
    }else if(anchorageInfoManageTitleDown){
        if(newLeft>$(document).width()-$('#anchorageInfoManage>.anchorageInfo_title').width()){newLeft = $(document).width()-$('#anchorageInfoManage>.anchorageInfo_title').width();}
        if(newTop>$(window).height()-$('#anchorageInfoManage>.anchorageInfo_title').height()){newTop = $(window).height()-$('#anchorageInfoManage>.anchorageInfo_title').height();}
        $('#anchorageInfoManage').offset({top:newTop,left:newLeft});
    }else if(anchorageModifyTitleDown){
        if(newLeft>$(document).width()-$('#anchorage_modify>.anchorageInfo_title').width()){newLeft = $(document).width()-$('#anchorage_modify>.anchorageInfo_title').width();}
        if(newTop>$(window).height()-$('#anchorage_modify>.anchorageInfo_title').height()){newTop = $(window).height()-$('#anchorage_modify>.anchorageInfo_title').height();}
        $('#anchorage_modify').offset({top:newTop,left:newLeft});
    }else if(anchorageShowTitleDown){
        if(newLeft>$(document).width()-$('#anchorage_show>.anchorageInfo_title').width()){newLeft = $(document).width()-$('#anchorage_show>.anchorageInfo_title').width();}
        if(newTop>$(window).height()-$('#anchorage_show>.anchorageInfo_title').height()){newTop = $(window).height()-$('anchorage_show>.anchorageInfo_title').height();}
        $('#anchorage_show').offset({top:newTop,left:newLeft});
    }
});

//弹出框关闭按钮事件
$('.anchorageInfo_title_offbtn').click(function(){
    var closeDivId = $(this).parent().parent().attr('id');
    if(closeDivId=='anchorageBasicInfo'){$('#anchorageInfo,#anchorageInfoManage,#anchorage_modify').css('display','none');}
    else if(closeDivId=='anchorageInfoManage'){$('#anchorageInfoManage,#anchorage_modify').css('display','none');}
    else{$(this).parent().parent().css('display','none');}
});

//锚地信息管理界面显示
$('.anchorageInfo_anchorage_btn').click(function(){
    //请求数据
    var portId = $('#portBasicInfo').attr('port_id');
    reqOnePortAnchList(40101);
    anchorageDivZIndex++;
    $('#anchorageInfoManage').css('zIndex',anchorageDivZIndex);
    $('#anchorageInfoManage').slideDown(500);
});

//码头信息修改弹出框显示事件
$('.anchorage_modify_btn').click(function(){
    anchorageDivZIndex++;
    $('#anchorage_modify').css({'zIndex':anchorageDivZIndex});
    $('#anchorage_modify').slideDown(500);
});

//码头备注修改弹出框显示事件
$('.anchorage_remarks_btn').click(function(){
    anchorageDivZIndex++;
    $('#anchorage_remarks').css({'zIndex':anchorageDivZIndex});
    $('#anchorage_remarks').slideDown(500);
});
$('.anchorageInfo_ListContent .delete').click(function(){
    $(this).parent().parent().remove();
})

//锚地静止区域分析按钮单击事件
$('.anchorage_analysis_btn').click(function(){
    var AnchorageKey = $('#anchorage_modify').attr('AnchorageKey');
    console.log(AnchorageKey);
});


var anchDataList = [];
//获取单个锚地信息
function reqOneAnchData(AnchorageKey){
    for(var i=0;i<anchDataList.length;i++){
        if(anchDataList[i].AnchorageKey==AnchorageKey){
            $('.anchorageInfo_topRight>div>div:first-child>span:last-child').text(anchDataList[i].Name);
            $('.anchorageInfo_topRight>div>div:nth-child(2)>span:last-child').text(anchDataList[i].Purpose);
            $('#anchorage_modify').attr('AnchorageKey',anchDataList[i].AnchorageKey);
            $('#anchorage_modify>.anchorage_Info_content>div:first-child>input').val(anchDataList[i].Name);
            $('#anchorage_modify>.anchorage_Info_content>div:nth-child(2)>input').val(anchDataList[i].ENName);
            $('#anchorage_modify>.anchorage_Info_content>div:nth-child(3)>input').val(anchDataList[i].Purpose);
            $('#anchorage_remarks').attr('AnchorageKey',anchDataList[i].AnchorageKey);
            $('#anchorage_remarks>.anchorage_Info_contents>textarea').val(anchDataList[i].Des);
        }
    }

}
//修改锚地备注确定按钮单击事件
$('#anchorage_remarks .anchorage_remark_submit_btn').click(function(){
    var anchorageKey = $('#anchorage_remarks').attr('AnchorageKey');
    var remarks = $('#anchorage_remarks>.anchorage_Info_contents>textarea').val();
    modifyAnchRemark(anchorageKey,remarks);
});

//修改锚地详情确定按钮单击事件
$('#anchorage_modify .anchorage_Info_submit').click(function(){
    var anchorageKey = $('#anchorage_modify').attr('AnchorageKey');
    var name = $('#anchorage_modify>.anchorage_Info_content>div:first-child>input').val();
    var PortName = $('#anchorage_modify>.anchorage_Info_content>div:nth-child(2)>input').val();
    var purpose = $('#anchorage_modify>.anchorage_Info_content>div:last-child>input').val();
    modifyAnchDetail(anchorageKey,name,PortName,purpose);
});

// //提交添加锚地按钮单击事件
// $('#anchorage_add ').click(function(){
//     addOneAnch(AnchorageKey,Name,PortName,Purpose,Des);
// });
//删除锚地信息确认框
function deleteAnchConfirm() {
    var msg = "您确定要删除这条数据吗？";
    if (confirm(msg)==true){
        return true;
    }else{
        return false;
    }
}


//设置修改、添加锚地经纬度确定函数
function addModifyAnchLongLat(){
    $('.anchorageInfo_ListContent li').off('click').on('click',function(){
        var anchorageKey = $('#anchorage_modify').attr('AnchorageKey');
        var seq = $(this).attr('seq');
        var Longitude = $(this).children('span:nth-child(3)').text();
        var Latitude = $(this).children('span:nth-child(2)').text();
        var ifAdd = $('this').attr('ifAdd');
        if(ifAdd=='0'){
            addAnchLongLat(anchorageKey,seq,Longitude,Latitude);
        }else if(ifAdd=='1'){
            modifyAnchLongLat(anchorageKey,seq,Longitude,Latitude);
        }
    });
}

//设置删除锚地经纬度函数
function deleteAnchLongLat(){
    $('.anchorageInfo_ListContent>li>span:last-child>i').off('click').on('click',function(){
        var anchorageKey = $('#anchorage_modify').attr('AnchorageKey');
        var seq = $(this).parent().parent().attr('seq');
        // deleteOneAnchLongLat(anchorageKey,seq);
    });
}

//添加锚地经纬度按钮单击事件
$('.anchorageInfo_add_btn').click(function(){
    var ShowMaxSeq = parseInt($('.anchorageInfo_ListContent li:last-child>span:first-child').text())+1;
    var MaxSeq = parseInt($('.anchorageInfo_ListContent li:last-child').attr('seq')) + 1;
    var anchLongLatStr = '<li seq="'+MaxSeq+'"><span>'+ShowMaxSeq+'</span> <span></span> <span></span> <span><i class="delete">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</i></span> </li>';
    $('.anchorageInfo_ListContent').append(anchLongLatStr);
    // addModifyAnchLongLat();
});
$('.anchorage_analysis_btn').click(function(){
    // anchorageDivZIndex++;
    $('.box1').css({'display':'block','zIndex':100});
});

$('.box1 a').click(function(){
    $('.box1').css('display','none');
});

$('#btnmaodi').click(function(){
    $('#anchorage_input').css('display','block');
})

$('#btnbowei').click(function(){
    $('.pier_input').css('display','block');
})

$('#inputTittle a').click(function(){
    $('#anchorage_input').css('display','none');
});

$('.inputTittle1 a').click(function(){
    $('.pier_input').css('display','none');
});

$('.anchorage_add_tittle a').click(function(){
    $('#anchorage_add').css('display','none');
});

$('.anchorageInfo_topLeft span:nth-child(4)').click(function(){
    $('#anchorage_add').css({'display':'block','z-index':'101'});
})

window.onload=function(){  
        var oDiv=document.getElementById('anchorage_input')
        var distX=0;  
        var distY=0;  
        oDiv.onmousedown=function(ev){  
            var oEvent=ev||event;  
            distX=oEvent.clientX-oDiv.offsetLeft;   //获取边界到鼠标的距离  
            distY=oEvent.clientY-oDiv.offsetTop;  
            document.onmousemove=function(ev){  
                var oEvent=ev||event;  
                var x=oEvent.clientX-distX;  
                var y=oEvent.clientY-distY;  
                if(x<0){  
                    x=0;  
                }  
                if(y<0){  
                    y=0;  
                }  
                if(x>(document.documentElement.clientWidth-oDiv.offsetWidth))  
                {  
                    x=document.documentElement.clientWidth-oDiv.offsetWidth;  
                }  
                oDiv.style.left=x+'px';    //根据鼠标位置相对定位，得到left，top值  
                oDiv.style.top=y+'px';  
            }  
            document.onmouseup=function(){  
                document.onmousemove=null;  
                document.onmouseup=null;  
            }}  
    }  


//     window.onload = function() {
//         var content = document.getElementById("pier_input");
//         startDrag(content);
//     }
//     var params = {
//     left: 0,
//     top: 0,
//     currentX: 0,
//     currentY: 0,
//     flag: false
// };
// var getCss = function(o, key) {
//     return o.currentStyle ? o.currentStyle[key] : document.defaultView.getComputedStyle(o, false)[key];
// };
// var startDrag = function(target, callback) {
//     if (getCss(target, "left") !== "auto") {
//         params.left = getCss(target, "left");
//     }
//     if (getCss(target, "top") !== "auto") {
//         params.top = getCss(target, "top");
//     }
    
//     target.onmousedown = function(event) {
//         params.flag = true;
//         if (event.preventDefault) {
//             event.preventDefault();
//         }else {
//             event.returnValue = false;
//         }
//         var e = event;
//         params.currentX = e.clientX;
//         params.currentY = e.clientY;
//     };
//     target.onmouseup = function() {
//         params.flag = false;
//         if (getCss(target, "left") !== "auto") {
//             params.left = getCss(target, "left");
//         }
//         if (getCss(target, "top") !== "auto") {
//             params.top = getCss(target, "top");
//         }
//     };
//     target.onmousemove = function(event) {
//         var e = event ? event : window.event;
//         if (params.flag) {
//             var nowX = e.clientX,
//                 nowY = e.clientY;
//             var disX = nowX - params.currentX,
//                 disY = nowY - params.currentY;
//             target.style.left = parseInt(params.left) + disX + "px";
//             target.style.top = parseInt(params.top) + disY + "px";
//         }
//     }
// };