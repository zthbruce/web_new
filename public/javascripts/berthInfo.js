/**
 * Created by Truth on 2017/7/6.
 */

var oldKey = '';
/**
 * 根据港口Id获取码头列表
 * 生成一个下拉列表
 * @param id
 */
function reqPierListFromPort(id, type){
    var param = '{"PortID":"'+id +'"}';
    $.ajax({
        url:'/portInfo/reqOnePortPierList',
        type:'get',
        data:{param:param},
        success: function(data) {
            console.log(data);
            $('#berth_select .addBerth_pier_list').empty();
            if(data[0] === '200') {
                var sendData = data[1];
                var jsonData = JSON.parse(sendData);
                console.log(jsonData);
                var len = jsonData.length;
                if (len > 0) {
                    var pier;
                    var pierStr = '';
                    // 默认的情况显示第一个码头
                    $('#berth_select .addBerth_pier_list').empty();
                    // 如果type未定义，则为新增加
                    if(type===undefined){
                        var defaultPier = jsonData[0];
                        reqBerthListFromPier(defaultPier.TerminalKey);
                        $('#berth_select .berth_select>span:nth-child(2)').attr('pier_id',defaultPier.TerminalKey).text(defaultPier.Name);
                        console.log(defaultPier);
                        $('#berth_add .berth_add_content>div:nth-child(2)').attr('pier_id',defaultPier.TerminalKey);
                        $('#berth_add .berth_add_content>div:nth-child(2)>input').val(defaultPier.Name);
                    }
                    for (var i = 0; i < jsonData.length; i++) {
                        pier = jsonData[i];
                        $('#berth_select .addBerth_pier_list').append('<li pier_id="'+pier.TerminalKey+'">'+pier.Name+'</li>');
                    }
                    $('#berth_select .addBerth_pier_list>li').off('click').on('click',function(){
                        var pierID = $(this).attr('pier_id');
                        $('#berth_select .berth_select>span:nth-child(2)').attr('pier_id',pierID).text($(this).text());
                        $(this).parent().slideUp(200);
                        console.log(pierID);
                        $('#berth_add .berth_add_content>div:nth-child(2)').attr('pier_id',pierID);
                        $('#berth_add .berth_add_content>div:nth-child(2)>input').val($(this).text());
                        // 从所选的码头获得泊位数据
                        reqBerthListFromPier(pierID);
                        $('#berth_select .pier_details_mousedown_list span:nth-child(2)').text('');
                        // 如果是非激活状态，更新为激活状态
                        if(!saveStatus){
                            saveStatus = true;
                            changeSaveButton(saveStatus, 1);
                        }
                    });
                }
                else{
                    // 当无数据的时候
                    $('#berth_select .berth_select>span:nth-child(2)').attr('pier_id','').text("暂无码头");
                    $('#berth_select .addBerth_pier_list').empty();
                    $('#berth_select .onePier_berthContent').empty();
                }
            }
            else{
                // 当数据库出错时
                $('#berth_select .berth_select>span:nth-child(2)').attr('pier_id','').text("暂无码头");
                $('#berth_select .addBerth_pier_list').empty();
                $('#berth_select .onePier_berthContent').empty();
                console.log("return nothing")
            }
            // 获取当选码头ID
            // var current_pier_id =  $('#berth_select .berth_select>span:nth-child(2)').attr('pier_id');
            // console.log(current_pier_id);
            // reqBerthListFromPier(current_pier_id)
        },
        error: function(err){
            console.log(err);
        }
    });
}

/**
 * 从所选择的码头列表获得泊位信息
 * 并设置单击更换事件
 * @param pierTerminalKey
 */
function reqBerthListFromPier(pierTerminalKey) {
    var param = '{"pierTerminalKey":"' + pierTerminalKey + '"}';
    $.ajax({
        url: '/portInfo/reqOnePierBerthList',
        type: 'get',
        data: {param: param},
        success: function (data) {
            if(data[0] === "200"){
                var sendData = data[1];
                var jsonData = JSON.parse(sendData);
                console.log(jsonData);
                var ele;
                var berthStr = '';
                $(".onePier_berthContent").empty();
                for(var i = 0; i< jsonData.length; i++){
                    ele = jsonData[i];
                    if(ele.StationaryAreaKey === $('#stillArea_show').attr('cluster_id')) {
                        // 加入相应的seq，作为主键获取数据
                        berthStr = '<li class = "active" StationaryAreaKey ="' + ele.StationaryAreaKey + '"><span>' + parseInt(parseInt(i) + 1) + '</span> <span>' + ele.LOA + '</span> <span>' + ele.Draft +
                            '</span> <span>' + ele.AirDraft + '</span> <span>' + ele.Moulded_Beam + '</span> <span>' +
                            ele.Length + '</span><span>' + ele.Depth + '</span> <span>' + ele.EquipmentQuantity +
                            '</span> <span>' + ele.LoadDischargeRate + '</span> <span>' + ele.Travel + '</span><span>' +
                            ele.Outreach + '</span></li>';
                        $(".onePier_berthContent").append(berthStr);
                    }
                    else{
                            // 加入相应的seq，作为主键获取数据
                            berthStr = '<li StationaryAreaKey ="' + ele.StationaryAreaKey + '"><span>' + parseInt(parseInt(i) + 1) + '</span> <span>' + ele.LOA + '</span> <span>' + ele.Draft +
                                '</span> <span>' + ele.AirDraft + '</span> <span>' + ele.Moulded_Beam + '</span> <span>' +
                                ele.Length + '</span><span>' + ele.Depth + '</span> <span>' + ele.EquipmentQuantity +
                                '</span> <span>' + ele.LoadDischargeRate + '</span> <span>' + ele.Travel + '</span><span>' +
                                ele.Outreach + '</span></li>';
                            $(".onePier_berthContent").append(berthStr);
                    }
                }
                // 泊位信息列表的单击事件
                $('.onePier_berthContent li').off('click').on('click',function(){
                    var StationaryAreaKey = $(this).attr("StationaryAreaKey");  // 获得属性值
                    if(oldKey !== StationaryAreaKey){
                        //更新cluster_id
                        if(saveStatus){
                            // confirm
                            $('.alert').html('当前信息未保存，请先保存信息').addClass('alert-warning').show().delay(1000).fadeOut();
                        }
                        // 如果已经保存状态
                        else {
                            $('#stillArea_show').attr('cluster_id', StationaryAreaKey);
                            oldKey = StationaryAreaKey;
                            console.log(StationaryAreaKey);
                            // 去掉所有选定
                            $('.onePier_berthContent li').removeClass('active');
                            // 增加选定列
                            $(this).addClass('active');
                            // 请求泊位数据
                            reqStillAreaInfo(StationaryAreaKey, 1)
                        }
                    }
                });
            }
            else{
                $(".onePier_berthContent").empty();
                console.log("return nothing")
            }
        }
    })
}

/**
 * 根据港口Id获取锚地列表
 * 显示锚地列表， 可点击
 * @param id
 */
function reqAnchListFromPort(id){
    var param = '{"PortID":"'+id +'"}';
    $.ajax({
        url:'/portInfo/reqOnePortAnchList',
        type:'get',
        data:{param:param},
        success: function(data) {
            $('#anch_select .onePort_AnchContent').empty();
            var sendData = data[1];
            var jsonData = JSON.parse(sendData);
            console.log(jsonData);
            for (var i=0; i<jsonData.length; i++) {
                var ele = jsonData[i];
                // 如果当前的cluster_id在列表中，高亮显示
                // console.log(ele.StationaryAreaKey);
                // console.log($('#stillArea_show').attr('cluster_id'));
                if(ele.StationaryAreaKey === $('#stillArea_show').attr('cluster_id')){
                    // 高亮显示
                    console.log('<li class = "active" StationaryAreaKey ="' + ele.StationaryAreaKey + '"><span>' + parseInt(parseInt(i)+1)+'</span> ' +
                        '<span>'+ele.Name+'</span><span>'+ele.Purpose+'</span> <span>'+ele.Des+'</span></li>')
                    $('#anch_select .onePort_AnchContent').append('<li class = "active" StationaryAreaKey ="' + ele.StationaryAreaKey + '"><span>' + parseInt(parseInt(i)+1)+'</span> ' +
                        '<span>'+ele.Name+'</span><span>'+ele.Purpose+'</span> <span>'+ele.Des+'</span></li>');
                }
                else{
                    $('#anch_select .onePort_AnchContent').append('<li StationaryAreaKey ="' + ele.StationaryAreaKey + '"><span>' + parseInt(parseInt(i)+1)+'</span> ' +
                        '<span>'+ele.Name+'</span><span>'+ele.Purpose+'</span> <span>'+ele.Des+'</span></li>');
                }
            }
            // 锚地信息列表的显示和操作
            $('.onePort_AnchContent li').off('click').on('click',function(){
                var StationaryAreaKey = $(this).attr("StationaryAreaKey");  // 获得属性值
                if( oldKey !== StationaryAreaKey) {
                    if (saveStatus) {
                        $('.alert').html('当前信息未保存，请先保存信息').addClass('alert-warning').show().delay(1000).fadeOut();
                    }
                    // 如果已经保存状态
                    else {
                        // 改变cluster_id的属性
                        $('#stillArea_show').attr('cluster_id', StationaryAreaKey);
                        oldKey = StationaryAreaKey;
                        console.log(StationaryAreaKey);
                        // 去掉高亮行
                        $('.onePort_AnchContent li').removeClass('active');
                        // 高亮选定行
                        $(this).addClass("active");
                        // 请求锚地数据
                        // var param = '{"ClusterID":"' + StationaryAreaKey + '","ClusterType":"' + 0 + '"}';
                        // $.ajax({
                        //     url: '/portInfo/reqOneStillArea',
                        //     type: 'get',
                        //     data: {param: param},
                        //     success: function (data) {
                        //         console.log(data);
                        //         if (data[0] === '200') {
                        //             var sendData = data[1];
                        //             var jsonData = JSON.parse(sendData);
                        //             console.log(jsonData);
                        //             // 重新写上获得数据
                        //             $('#anch_select .addAnch_port_select>span:nth-child(2)').attr('port_id', jsonData[0].PortID).text(jsonData[0].ENName);
                        //             $('#anch_select .anchInfo_select_content>div:nth-child(2)>input').val(jsonData[0].Name);
                        //             $('#anch_select .anchInfo_select_content>div:nth-child(3)>textarea').val(jsonData[0].Purpose);
                        //             $('#anch_select .anchInfo_select_content>div:nth-child(4)>textarea').val(jsonData[0].Des);
                        //         }
                        //     }, error: function (err) {
                        //         console.log(err);
                        //     }
                        // })
                        // 请求锚地基本信息
                        reqStillAreaInfo(StationaryAreaKey, 0)
                    }
                }
            })
        },
        error: function(err){
            console.log(err);
        }
    });
}
//添加锚地信息的函数
function addOneAnch(PortID,AnchorageKey,Name,Purpose,Des,clusterId,type){
    var param = '{"PortID":"'+PortID+'","AnchorageKey":"'+AnchorageKey +'","Name":"'+Name+'","Purpose":"'+Purpose +'","Des":"'+Des+'","clusterId":"'+clusterId+'","type":"'+type+'"}';
    $.ajax({
        url:'/portInfo/addOneAnch',
        type:'get',
        data:{param:param},
        success: function(data){
            console.log(data);
            reqAnchListFromPort(PortID);
            $('#stillArea_show').attr('type','0');
            reqStillAreaInfo(clusterId,0);
        },
        error: function(err){
            console.log(err);
        }
    });
}

//设置修改单个锚地详细信息的函数
function modifyAnchDetailFromPort(PortID,AnchorageKey,Name,Purpose,Des){
    var param = '{"AnchorageKey":"'+AnchorageKey +'","Name":"'+Name+'","Purpose":"'+Purpose+'","Des":"'+Des+'"}';
    $.ajax({
        url:'/portInfo/modifyOneAnchDetailFromPort',
        type:'get',
        data:{param:param},
        success: function(data){
            console.log(data);
            $('#anch_select').attr('anch_id',AnchorageKey);
            reqAnchListFromPort(PortID);
        },
        error: function(err){
            console.log(err);
        }
    });
}

//添加码头部分，根据所属公司名字模糊查询公司名及其代码
function addPierSelectCompanyName(companyStr){
    var param = '{"companyStr":"'+companyStr +'"}';
    $.ajax({
        url:'/portInfo/addPierSelectCompanyName',
        type:'get',
        data:{param:param},
        success: function(data){
            console.log(data);
            if(data!='数据过多'){
                var sendData = data[1];
                var jsonData = JSON.parse(sendData);
                console.log(jsonData);
                for(var i=0;i<jsonData.length;i++){
                    var companyName = jsonData[i].CNName
                    $('#pier_add .pier_Company_list').append('<li></li>');
                }
            }
        },
        error: function(err){
            console.log(err);
        }
    });
}



