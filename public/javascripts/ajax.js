/**
 * Created by Truth on 2017/6/15.
 */

var OL_Action_Root = "http://127.0.0.1:3000";
// var xmlHttp = null;
// 根据动作做相关的请求
function Req_ajax(info, type)
{
    $.ajax({
        data: {info:info, type:type},
        url: OL_Action_Root+"/req_ajax",
        dataType: 'json',
        cache: false,
        timeout: 5000,
        type:type,    // 如果要使用GET方式，则将此处改为'get'
        success: function(data){
            var res = data;
            if(res[0] === '200')
            {
                document.getElementById("status").innerHTML += "<p style='color:green; font-weight:bold;'>服务器返回信息: " + res[1] + "</p>";
            }
            else
            {
                document.getElementById("status").innerHTML += "<p style='color:#2289DB; font-weight:bold;'>获取服务器信息失败！ " + res[1] + "</p>";
            }
        },
        error: function(jqXHR, textStatus, errorThrown){
            document.getElementById("status").innerHTML += "<p style='color:#C00000; font-weight:bold;'>连接不到服务器，请检查网络！</p>";
        }
    });
}

//两个函数
Req_ajax("client post", "post");
Req_ajax("client get", "get");