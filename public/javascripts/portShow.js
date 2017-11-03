/**
 * Created by ShiTianCi on 2017/6/20.
 */
//设置地图图标单击监听事件
let mapImgClick;

//设置港口信息全局列表
let AllPortBasicList = [];
//设置主要港口信息全局列表
let AllMainPortList = [];

//设置请求港口基本信息函数
function reqPortBasicInfo(){
    $.ajax({
        url:'/portInfo/',
        timeout: 500000,
        type:'get',
        success: function(data){
            // console.log(JSON.parse(data[1]));
            AllPortBasicList = JSON.parse(data[1]);
            $.ajax({
                url:'/portInfo/reqMainPortList',
                type:'get',
                success: function(data){
                    // console.log(data);
                    AllMainPortList = JSON.parse(data[1]);
                    GradeShowPort(AllPortBasicList,AllMainPortList,initLevel);
                    //针对地图拖动监听, 刷新港口显示
                    blmol.bind.addOnMapMoveEndListener(map, function(map, extent, evt){
                        let currentZoom = blmol.operation.getZoom(map);
                        //港口显示
                        GradeShowPort(AllPortBasicList,AllMainPortList,currentZoom);
                    });
                },
                error: function(err){
                    console.log(err);
                }
            });
        },
        error: function(err){
            console.log(err);
        }
    });

    //获取所有公司名称及其代码
}
// 获取所有港口
reqPortBasicInfo();

//设置请求单个港口基本信息的函数
function reqOnePortBasicInfo(id){
    let param = '{"PortID":"'+id +'"}';
    $.ajax({
        url:'/portInfo/reqOnePortBasic',
        type:'get',
        data:{param:param},
        success: function(data){
            // console.log(data);
            let sendData = data[1];
            let jsonData = JSON.parse(sendData);
            $('#portBasicInfo').attr('port_id',jsonData[0].PortID);
            $('#portBasicInfo>.portInfo_title>span').text(jsonData[0].ENName);
            $('#portBasicInfo .port_country>span').text(jsonData[0].ISO3);
            $('#portBasicInfo .port_position>span:first-child').text(jsonData[0].Longitude+' '+jsonData[0].Latitude);
            $('#portBasicInfo .port_position>span:last-child').text(jsonData[0].Timezone);
            $('#portBasicInfo .port_authority>span:last-child').text(jsonData[0].CompanyENName);
            $('#portBasicInfo .port_chart_number>span:last-child').text(jsonData[0].ChartNo);
            $('#portBasicInfo').slideDown(400);
        },
        error: function(err){
            console.log(err);
        }
    });
}

//设置请求单个港口码头列表的函数
function reqOnePortPierList(id){
    let param = '{"PortID":"'+id +'"}';
    $.ajax({
        url:'/portInfo/reqOnePortPierList',
        type:'get',
        data:{param:param},
        success: function(data){
            console.log(data);
            let sendData = data[1];
            let jsonData = JSON.parse(sendData);
            console.log(jsonData);
            $('.berthInfo_pierList').empty();
            for(let i=0;i<jsonData.length;i++){
                let pierStr = '<li pier_TerminalKey="'+jsonData[i].TerminalKey+'"><span>'+parseInt(parseInt(i)+1)+'</span> <span>'+jsonData[i].Name+'</span> ' +
                    '<span>'+jsonData[i].Longitude+','+jsonData[i].Latitude+'</span> <span><i></i></span></li>';
                $('.berthInfo_pierList').append(pierStr);
            }
            //查询第一个码头的详细信息
            reqOnePierDetailInfo(jsonData[0].TerminalKey);
            $('#pier_remarks').attr('pier_TerminalKey',jsonData[0].TerminalKey);
            $('#pier_modify').attr('pier_TerminalKey',jsonData[0].TerminalKey);
            //请求泊位信息
            reqOnePierBerthList(jsonData[0].TerminalKey);
            //绑定码头列表单击事件
            $('.berthInfo_pierList li').off('click').on('click',function(){
                let pierTerminalKey = $(this).attr('pier_TerminalKey');
                $('#pier_remarks').attr('pier_TerminalKey',pierTerminalKey);
                $('#pier_modify').attr('pier_TerminalKey',pierTerminalKey);
                $('.berthInfo_ListContent').attr('TerminalKey',pierTerminalKey);
                reqOnePierDetailInfo(pierTerminalKey);
                reqOnePierBerthList(pierTerminalKey);
            });
            //绑定删除一条码头记录操作
            $('.berthInfo_pierList i').off('click').on('click',function(event){
                let deletePierConfirmSign = deletePierConfirm();
                if(deletePierConfirmSign){
                    let pierTerminalKey = $(this).parent().parent().attr('pier_TerminalKey');
                    console.log(pierTerminalKey);
                    deleteOnePier(pierTerminalKey);
                    //重新获取码头信息
                    let portID = $('#portBasicInfo').attr('port_id');
                    // reqOnePortPierList(portID);
                    reqOnePortPierList(40101);
                }
                event.stopPropagation();
            });
        },
        error: function(err){
            console.log(err);
        }
    });
}

//设置请求单个码头详细信息的函数
function reqOnePierDetailInfo(TerminalKey){
    let param = '{"TerminalKey":"'+TerminalKey +'"}';
    $.ajax({
        url:'/portInfo/reqOnePierDetail',
        type:'get',
        data:{param:param},
        success: function(data){
            console.log(data);
            let sendData = data[1];
            let jsonData = JSON.parse(sendData);
            console.log(jsonData);
            //右上角显示
            $('.berthInfo_topRight>.berthInfo_content>div:first-child>span:last-child').text(jsonData[0].ENName);
            $('.berthInfo_topRight>.berthInfo_content>div:nth-child(2)>span:last-child').text(jsonData[0].Name);
            $('.berthInfo_topRight>.berthInfo_content>div:nth-child(3)>span:last-child').text(jsonData[0].Longitude+','+jsonData[0].Latitude);
            $('.berthInfo_topRight>.berthInfo_content>div:nth-child(4)>span:last-child').text(jsonData[0].CargoTypeName);
            $('.berthInfo_topRight>.berthInfo_content>div:nth-child(5)>span:last-child').text(jsonData[0].BerthQuantity);

            //备注显示
            $('.pier_Info_contents textarea').val(jsonData[0].Des);

            //码头信息修改弹出框内容
            $('#pier_modify>.pier_Info_content>div:nth-child(1)>input').val(jsonData[0].Name);
            $('#pier_modify>.pier_Info_content>div:nth-child(2)>input').val(jsonData[0].ENName);
            $('#pier_modify>.pier_Info_content>div:nth-child(3)>input').val(jsonData[0].companyENName);
            $('#pier_modify>.pier_Info_content>div:nth-child(4)>input').val(jsonData[0].BerthQuantity);
            $('#pier_modify>.pier_Info_content>div:nth-child(5)>input').val(jsonData[0].Longitude);
            $('#pier_modify>.pier_Info_content>div:nth-child(6)>input').val(jsonData[0].Latitude);
            $('#pier_modify>.pier_Info_content>div:nth-child(7)>input').val(jsonData[0].Salinity);
            $('#pier_modify>.pier_Info_content>div:nth-child(8)>input').val(jsonData[0].Location);
            $('#pier_modify>.pier_Info_content>div:nth-child(9)>input').val(jsonData[0].Tide);
            $('#pier_modify>.pier_Info_content .pier_Info_goods').text(jsonData[0].CargoTypeName);
            $('#pier_modify>.pier_Info_content .pier_Info_InoutType').text(jsonData[0].ImportExportType);



        },
        error: function(err){
            console.log(err);
        }
    });
}

//设置获取单个码头下泊位详细信息列表的函数
function reqOnePierBerthList(pierTerminalKey){
    let param = '{"pierTerminalKey":"'+pierTerminalKey+'"}';
    $.ajax({
        url:'/portInfo/reqOnePierBerthList',
        type:'get',
        data:{param:param},
        success: function(data){
            console.log(data);
            let sendData = data[1];
            let jsonData = JSON.parse(sendData);
            console.log(jsonData);
            $('.berthInfo_ListContent').empty();
            for(let i=0;i<jsonData.length;i++){
                let berthStr = '<li dataType="0" TerminalKey="'+jsonData[i].TerminalKey+'" seq="'+jsonData[i].Seq+'"><span>'+parseInt(parseInt(i)+parseInt(1))+'</span> <span><span>'+jsonData[i].LOA+'</span><input type="text" value="'+jsonData[i].LOA+'"></span> ' +
                    '<span><span>'+jsonData[i].Draft+'</span><input type="text" value="'+jsonData[i].Draft+'"></span> ' +
                    '<span><span>'+jsonData[i].AirDraft+'</span><input type="text" value="'+jsonData[i].AirDraft+'"></span> ' +
                    '<span><span>'+jsonData[i].Moulded_Beam+'</span><input type="text" value="'+jsonData[i].Moulded_Beam+'"></span> ' +
                    '<span><span>'+jsonData[i].Length+'</span><input type="text" value="'+jsonData[i].Length+'"></span> ' +
                    '<span><span>'+jsonData[i].Depth+'</span><input type="text" value="'+jsonData[i].Depth+'"></span> ' +
                    '<span><span>'+jsonData[i].EquipmentQuantity+'</span><input type="text" value="'+jsonData[i].EquipmentQuantity+'"></span> ' +
                    '<span><span>'+jsonData[i].LoadDischargeRate+'</span><input type="text" value="'+jsonData[i].LoadDischargeRate+'"></span> ' +
                    '<span><span>'+jsonData[i].Travel+'</span><input type="text" value="'+jsonData[i].Travel+'"></span> ' +
                    '<span><span>'+jsonData[i].Outreach+'</span><input type="text" value="'+jsonData[i].Outreach+'"></span> ' +
                    '<span><i class="berth_delete_btn"></i></span></li>';
                $('.berthInfo_ListContent').append(berthStr);
            }
            berthInfoOperating();
        },
        error: function(err){
            console.log(err);
        }
    });
}

//设置修改单个码头备注信息的函数
function modifyPierRemark(pierTerminalKey,remarks){
    let param = '{"pierTerminalKey":"'+pierTerminalKey +'","remark":"'+remarks+'"}';
    $.ajax({
        url:'/portInfo/modifyOnePierRemark',
        type:'get',
        data:{param:param},
        success: function(){
            $('#pier_remarks').css('display','none');
        },
        error: function(err){
            console.log(err);
        }
    });
}

//设置修改单个码头详细信息的函数
function modifyPierDetail(TerminalKey,Name,PortName,BelongotoCompanyName,BerthQuantity,Longitude,Latitude,Salinity,Location,Tide,CargoTypeName,ImportExportType){
    let param = '{"TerminalKey":"'+TerminalKey +'","Name":"'+Name+'","PortName":"'+PortName +'","BelongotoCompanyName":"'+BelongotoCompanyName+
        '","BerthQuantity":"'+BerthQuantity+'","Longitude":"'+Longitude+'","Latitude":"'+Latitude+'","Salinity":"'+Salinity+
        '","Location":"'+Location+'","Tide":"'+Tide+'","CargoTypeName":"'+CargoTypeName+'","ImportExportType":"'+ImportExportType+'"}';
    $.ajax({
        url:'/portInfo/modifyOnePierDetail',
        type:'get',
        data:{param:param},
        success: function(data){
            console.log(data);
            $('#pier_modify').css('display','none');
        },
        error: function(err){
            console.log(err);
        }
    });
}

//设置添加码头信息的函数
function addOnePier(TerminalKey,Name,PortName,BelongotoCompanyName,BerthQuantity,Longitude,Latitude,Salinity,Location,Tide,Type,CargoTypeName,ImportExportType,Des,PortID){
    let param = '{"TerminalKey":"'+TerminalKey +'","Name":"'+Name+'","PortName":"'+PortName +'","BelongotoCompanyName":"'+BelongotoCompanyName+
        '","BerthQuantity":"'+BerthQuantity+'","Longitude":"'+Longitude+'","Latitude":"'+Latitude+'","Salinity":"'+Salinity+
        '","Location":"'+Location+'","Tide":"'+Tide+'","Type":"'+Type+'","CargoTypeName":"'+CargoTypeName+'","ImportExportType":"'+ImportExportType+'","Des":"'+Des+'","PortID":"'+PortID+'"}';
    console.log(param);
    $.ajax({
        url:'/portInfo/addOnePier',
        type:'get',
        data:{param:param},
        success: function(data){
            console.log(data);
            reqPierListFromPort(PortID);
            $('#pier_add').slideUp(400);
            $('#pier_add .pier_Info_content input').val('');
            $('#pier_add .pier_Info_content textarea').val('');
            $('#pier_add .pierInfo_select>span:nth-child(2)').text('');
        },
        error: function(err){
            console.log(err);
        }
    });
}

//设置删除单个码头的函数
function deleteOnePier(TerminalKey){
    let param = '{"TerminalKey":"'+TerminalKey +'"}';
    $.ajax({
        url:'/portInfo/deleteOnePier',
        type:'get',
        data:{param:param},
        success: function(data){
            console.log(data);
            //重新获取码头信息
            let portID = $('#portBasicInfo').attr('port_id');
            // reqOnePortPierList(portID);
            reqOnePortPierList(40101);
        },
        error: function(err){
            console.log(err);
        }
    });
}


//设置添加单个泊位详细信息的函数
function addBerthDetail(PortID,TerminalKey,seq,berth_LoadDischargeRate,berth_EquipmentQuantity,berth_Travel,berth_Outreach,berth_LOA,berth_draft,berth_Depth,berth_Length,berth_AirDraft,berth_Moulded_Beam,cluster_id,type){
    let param = '{"PortID":"'+PortID +'","TerminalKey":"'+TerminalKey +'","seq":"'+seq+'","berth_LOA":"'+berth_LOA+'","berth_draft":"'+berth_draft+
        '","berth_AirDraft":"'+berth_AirDraft+'","berth_Moulded_Beam":"'+berth_Moulded_Beam+'","berth_Length":"'+berth_Length+'"' +
        ',"berth_Depth":"'+berth_Depth+'","berth_EquipmentQuantity":"'+berth_EquipmentQuantity+'","berth_LoadDischargeRate":"'+berth_LoadDischargeRate+'"' +
        ',"berth_Travel":"'+berth_Travel+'","berth_Outreach":"'+berth_Outreach+'","cluster_id":"'+cluster_id+'","type":"'+type+'"}';
    console.log(param);
    console.log(PortID);
    $.ajax({
        url:'/portInfo/addOneberthDetail',
        type:'get',
        data:{param:param},
        success: function(data){
            console.log(data);
            console.log("添加泊位成功");
            //重新获取泊位列表
            reqBerthListFromPier(TerminalKey);
            $('#stillArea_show').attr('type','1');
            //刷新初始区域
            reqStillAreaInfo(cluster_id,1);
        },
        error: function(err){
            console.log("添加泊位失败");
            console.log(err);
        }
    });
}

//设置修改单个泊位详细信息的函数
function modifyBerthDetail(TerminalKey,seq,berth_LOA,berth_draft,berth_AirDraft,berth_MouldedBeam,berth_Length,berth_Depth,berth_loaderNum,berth_loadingRate,berth_mobile,berth_extend){
    let param = '{"TerminalKey":"'+TerminalKey +'","seq":"'+seq+'","berth_LOA":"'+berth_LOA+'","berth_draft":"'+berth_draft+
        '","berth_AirDraft":"'+berth_AirDraft+'","berth_MouldedBeam":"'+berth_MouldedBeam+'","berth_Length":"'+berth_Length+'"' +
        ',"berth_Depth":"'+berth_Depth+'","berth_loaderNum":"'+berth_loaderNum+'","berth_loadingRate":"'+berth_loadingRate+'"' +
        ',"berth_mobile":"'+berth_mobile+'","berth_extend":"'+berth_extend+'"}';
    $.ajax({
        url:'/portInfo/modifyOneberthDetail',
        type:'get',
        data:{param:param},
        success: function(data){
            console.log(data);
            // $('#portBasicInfo>.portInfo_title>span').text(jsonData[0].ENName);
        },
        error: function(err){
            console.log(err);
        }
    });
}

//设置删除单个泊位的函数
function deleteOneBerth(TerminalKey,seq){
    let param = '{"TerminalKey":"'+TerminalKey +'","seq":"'+seq+'"}';
    $.ajax({
        url:'/portInfo/deleteOneberth',
        type:'get',
        data:{param:param},
        success: function(data){
            console.log(data);
            //重新获取泊位列表
            reqOnePierBerthList(TerminalKey);
        },
        error: function(err){
            console.log(err);
        }
    });
}


//设置请求单个静止区域基本信息的函数
function reqStillAreaInfo(id,type){
    let param = '{"ClusterID":"'+id+'","ClusterType":"'+type+'"}';
    console.log(type);
    // 默认是不能保存的
    saveStatus = false;
    changeSaveButton(saveStatus, type);
    $.ajax({
        url:'/portInfo/reqOneStillArea',
        type:'get',
        data:{param:param},
        success: function(data) {
            console.log(data);
            if (data[0] === '200') {
                let sendData = data[1];
                let jsonData = JSON.parse(sendData);
                console.log(jsonData);
                console.log(id);
                console.log(type);
                let stillAreaStr = '';
                $('.stillArea_contents').empty();
                if (type === 1) {
                    stillAreaStr = '<div><span>所属港口：</span><span>' + jsonData[0].ENName + '</span></div>' +
                        '<div attr="' + jsonData[0].PortID + '"><span>所属码头：</span><span>' + jsonData[0].Name + '</span></div>' +
                        '<div><span>全长：</span><span>' + jsonData[0].LOA + '</span></div>' +
                        '<div><span>吃水：</span><span>' + jsonData[0].Draft + '</span></div>' +
                        '<div><span>空高：</span><span>' + jsonData[0].AirDraft + '</span></div>' +
                        '<div><span>型宽：</span><span>' + jsonData[0].Moulded_Beam + '</span></div>' +
                        '<div><span>长度：</span><span>' + jsonData[0].Length + '</span></div>' +
                        '<div><span>水深：</span><span>' + jsonData[0].Depth + '</span></div>' +
                        '<div><span>装卸机数量：</span><span>' + jsonData[0].EquipmentQuantity + '</span></div>' +
                        '<div><span>装载率/卸载率：</span><span>' + jsonData[0].LoadDischargeRate + '</span></div>' +
                        '<div><span>移动：</span><span>' + jsonData[0].Travel + '</span></div>' +
                        '<div><span>延伸：</span><span>' + jsonData[0].Outreach + '</span></div>';

                    //按钮显示
                    $('#stillArea_show .stillArea_btn_list>.stillArea_addBerth').text('泊位修改');
                    $('#stillArea_show .stillArea_btn_list>.stillArea_addAnch').text('设为锚地');

                    // 从港口获得码头列表
                    reqPierListFromPort(jsonData[0].PortID, 1);
                    //写文本
                    $('#berth_select .port_select>span:nth-child(2)').attr('port_id', jsonData[0].PortID).text(jsonData[0].ENName);
                    $('#berth_select .berth_select>span:nth-child(2)').attr('pier_id', jsonData[0].TerminalKey).text(jsonData[0].Name);

                    // 从码头获得泊位列表
                    reqBerthListFromPier(jsonData[0].TerminalKey);

                    for (let i = 0; i < $('#berth_select .berth_detail input').length; i++) {
                        let infoStr = '';
                        if (i == 0) {infoStr = jsonData[0].LoadDischargeRate;}
                        if (i == 1) {infoStr = jsonData[0].EquipmentQuantity;}
                        if (i == 2) {infoStr = jsonData[0].Travel;}
                        if (i == 3) {infoStr = jsonData[0].Outreach;}
                        if (i == 4) {infoStr = jsonData[0].LOA;}
                        if (i == 5) {infoStr = jsonData[0].Draft;}
                        if (i == 6) {infoStr = jsonData[0].Depth;}
                        if (i == 7) {infoStr = jsonData[0].Length;}
                        if (i == 8) {infoStr = jsonData[0].AirDraft;}
                        if (i == 9) {infoStr = jsonData[0].Moulded_Beam;}
                        $('#berth_select .berth_detail input').eq(i).val(infoStr);
                    }

                    //清空锚地弹出框已有文本信息
                    $('#anch_select').attr('anch_id', '');
                    $('#anch_select .anchInfo_select_content>div:nth-child(2)>input').val('');
                    $('#anch_select .anchInfo_select_content>div>textarea').val('');
                }
                else if (type === 0) {
                    stillAreaStr = '<div><span>所属港口：</span><span>' + jsonData[0].ENName + '</span></div>' +
                        '<div><span>锚地名称：</span><span>' + jsonData[0].Name + '</span></div>' +
                        '<div><span>用途：</span><span>' + jsonData[0].Purpose + '</span></div>' +
                        '<div><span>描述：</span><span>' + jsonData[0].Des + '</span></div>';
                    //按钮显示
                    $('#stillArea_show .stillArea_btn_list>.stillArea_addBerth').text('设为泊位');
                    $('#stillArea_show .stillArea_btn_list>.stillArea_addAnch').text('锚地修改');

                    $('#anch_select').attr('anch_id', jsonData[0].AnchorageKey);
                    $('#anch_select .addAnch_port_select>span:nth-child(2)').attr('port_id', jsonData[0].PortID).text(jsonData[0].ENName);
                    $('#anch_select .anchInfo_select_content>div:nth-child(2)>input').val(jsonData[0].Name);
                    $('#anch_select .anchInfo_select_content>div:nth-child(3)>textarea').val(jsonData[0].Purpose);
                    $('#anch_select .anchInfo_select_content>div:nth-child(4)>textarea').val(jsonData[0].Des);
                    //清空泊位弹出框已有文本信息
                    // $('#berth_add .berth_add_content input').val('');
                    $('#berth_select .berth_detail input').val('');
                    // 获取该港口下的所有锚地
                    reqAnchListFromPort(jsonData[0].PortID);
                }
                $('.stillArea_contents').append(stillAreaStr);
            }
            else{
                //如果这样的情况默认为无数据返回
                $('.stillArea_contents').html('<div class="stillArea_promptInfo">暂无信息</div>');
                if (type === 1) {
                    $('#stillArea_show .stillArea_btn_list>.stillArea_addBerth').text('泊位修改');
                    $('#stillArea_show .stillArea_btn_list>.stillArea_addAnch').text('设为锚地');
                }
                else if (type === 0) {
                    //按钮显示
                    $('#stillArea_show .stillArea_btn_list>.stillArea_addBerth').text('设为泊位');
                    $('#stillArea_show .stillArea_btn_list>.stillArea_addAnch').text('锚地修改');
                }
            }
            // 可以获取统计信息
            showSNStatistic(id);
            // 修改按钮设为
        },
        error: function(err){
            console.log(err);
        }
    });
}

//泊位编辑，修改码头详情的函数
function berthreqPierDetail(TerminalKey){
    let param = '{"TerminalKey":"'+TerminalKey +'"}';
    $.ajax({
        url:'/portInfo/reqOnePierDetail',
        type:'get',
        data:{param:param},
        success: function(data){
            console.log(data);
            let sendData = data[1];
            let jsonData = JSON.parse(sendData);
            console.log(jsonData);
        },
        error: function(err){
            console.log(err);
        }
    });
}


function BoxBerth(PortID){
    let param = '{"PortID":"'+PortID +'"}';
    $.ajax({
        url:'/portInfo/reqOneBoxBerth',
        type:'get',
        data:{param:param},
        success: function(data){
            console.log(data);
            let sendData = data[1];
            let jsonData = JSON.parse(sendData);
            console.log(jsonData);
            //悬浮框信息显示
            $('.box_berth_span').empty();
            let boxberthStr = '<li><span>英文名：</span><span>'+jsonData[0].ENName+'</span></li>' +
                '<li><span>&nbsp;&nbsp;IOS3：</span><span>'+jsonData[0].IOS3+'</span></li>' +
                '<li><span>&nbsp;&nbsp;&nbsp;经度：</span><span>'+jsonData[0].LongitudeNumeric+'</span></li>'+
                '<li><span>&nbsp;&nbsp;&nbsp;纬度：</span><span>'+jsonData[0].LatitudeNumeric+'</span></li>'+
                '<li><span>&nbsp;&nbsp;&nbsp;时区：</span><span>'+jsonData[0].Timezone+'</span></li>'+
                '<li><span>海图号：</span><span>'+jsonData[0].ChartNo+'</span></li>';
            $('.box_berth_span').append(boxberthStr);
        },
        error: function(err){
            console.log(err);
        }
    });
}


// /**
//  * 根据当前保存状态设置保存按钮
//  * 如果可保存状态，则设为可添加
//  */
// function changeSaveButton(saveStatus, type) {
//     if(type == 1) {
//         if (saveStatus) {
//             $('.berthInfo_PopupBox_btn').removeAttr("style");
//             $('.berthInfo_PopupBox_btn').removeAttr("disabled")
//         }
//         else {
//             $('.berthInfo_PopupBox_btn').attr("style", "background:#ccc");
//             $('.berthInfo_PopupBox_btn').attr("disabled", "disabled")
//         }
//     }
//     else{
//         if(saveStatus){
//             $('.addAnch_btn').removeAttr("style");
//             $('.addAnch_btn').removeAttr("disabled")
//         }
//         else{
//             $('.addAnch_btn').attr("style", "background:#ccc");
//             $('.addAnch_btn').attr("disabled", "disabled")
//         }
//     }
// }


