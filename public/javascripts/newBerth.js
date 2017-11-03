/**
 * Created by ShiTianCi on 2017/7/27.
 */

/**
 * 地图弹出框拖动事件
 */
var newBerthDown = false; //泊位管理弹出框
var newAnchDown = false; //泊位管理弹出框
var newBerthStatDown = false; //泊位信息统计弹出框
var DivLeft;
var DivTop;

$('.newBerthAnch_title').mousedown(function(event){
    var changeDivId = $(this).parent().attr('id');
    if(changeDivId=='newBerth'){newBerthDown = true;}
    if(changeDivId=='newAnch'){newAnchDown = true;}
    if(changeDivId=='newBerthStatistics'){newBerthStatDown = true;}
    DivLeft = event.clientX - $(this).offset().left;
    DivTop = event.clientY - $(this).offset().top;
});
var portDivZIndex = 0;
$('#newBerth,#newAnch,#newBerthStatistics').click(function(){
    portDivZIndex++;
    $(this).css('zIndex',portDivZIndex);
});

$('.newBerthAnch_title').mouseup(function(){
    var changeDivId = $(this).parent().attr('id');
    if(changeDivId=='newBerth'){newBerthDown = false;}
    if(changeDivId=='newAnch'){newAnchDown = false;}
    if(changeDivId=='newBerthStatistics'){newBerthStatDown = false;}
});

$(window).mousemove(function(event){
    var newLeft = event.clientX-DivLeft;
    var newTop = event.clientY-DivTop;
    if(newLeft<=0){newLeft = 0;}
    if(newTop<=0){newTop = 0;}
    if(newBerthDown){
        if(newLeft>$(document).width()-$('#newBerth>.newBerthAnch_title').width()){newLeft = $(document).width()-$('#newBerth>.newBerthAnch_title').width();}
        if(newTop>$(window).height()-$('#newBerth>.newBerthAnch_title').height()){newTop = $(window).height()-$('#newBerth>.newBerthAnch_title').height();}
        $('#newBerth').offset({top:newTop,left:newLeft});
    }else if(newAnchDown){
        if(newLeft>$(document).width()-$('#newAnch>.newBerthAnch_title').width()){newLeft = $(document).width()-$('#newAnch>.newBerthAnch_title').width();}
        if(newTop>$(window).height()-$('#newAnch>.newBerthAnch_title').height()){newTop = $(window).height()-$('#newAnch>.newBerthAnch_title').height();}
        $('#newAnch').offset({top:newTop,left:newLeft});
    }else if(newBerthStatDown){
        if(newLeft>$(document).width()-$('#newBerthStatistics>.newBerthAnch_title').width()){newLeft = $(document).width()-$('#newBerthStatistics>.newBerthAnch_title').width();}
        if(newTop>$(window).height()-$('#newBerthStatistics>.newBerthAnch_title').height()){newTop = $(window).height()-$('#newBerthStatistics>.newBerthAnch_title').height();}
        $('#newBerthStatistics').offset({top:newTop,left:newLeft});
    }
});

/**
 * 泊位管理
 */
//弹出框下拉列表显示隐藏
$('.span_select>span:nth-child(2),.input_select>input').click(function(){
    $(this).next('ul').slideDown(200);
});
$('.span_select,.input_select').mouseleave(function(){
    $(this).children('ul').slideUp(200);
});
$('.span_select>ul>li,.input_select>ul>li').click(function(){
    var val = $(this).text();
    $(this).parent().prev('span').text(val);
    $(this).parent().prev('input').val(val);
    $(this).parent().slideUp(200);
});

//需要字符匹配的input下拉列表操作
$('.input_select>input').keyup(function(){
    var nowVal = $(this).val();
    console.log(nowVal);
});


/**
 * 锚地管理
 */

//锚地目的港列表显示
$('.add_oneIntentPort_btn').click(function(){
    $(this).next().slideDown(200);
});
$('.anchInfo_intentPort').mouseleave(function(){
    $(this).children('.anch_IntentPort').children('ul').slideUp(200);
});