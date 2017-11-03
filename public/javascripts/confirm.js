/**
 * Created by Truth on 2017/7/18.
 */

//弹出对话框:传了cancel是confirm,不传就是alert弹框
function Confirm(obj) {
    let _obj = obj || {};
    //视图层
    let div = '<div id="_bj" style="">' +
        '<div id="Kuang" style="">' +
        '<h3 id="Tishi">提    示</h3>' +
        '<span id="_content"></span>' +
        '<div id="_cancel" class="XuanZhe" style="left:0;">取 消</div>' +
        '<div id="_determine"class="XuanZhe"style="right:0;borderleft:0.5px solid gainsboro;">确  定</div>' +
        '</div>' +
        '</div>';
    $("body").append(div);

    //css样式层
    // 背景
    $("#_bj").css({
        position:"fixed",
        top:0,left:0,
        textAlign:"center",
        width:"100vw",
        height:"100vh",
        zIndex: 998,
        background:"rgba(0,0,0,.3)",
    });
    // $("#tishi").css({
    //     position:"absolute",
    //     textAlign:"center",
    //     top:"50%",left:"50%",
    //     transform:"translate(-50%,-50%)",
    //     width:"400px",
    //     height:"200px",
    //     background:"#f8f8f8",
    //     borderRadius:"20px",
    //     fontSize:"50px"
    // });

    // $("#Kuang").css({
    //     position:"absolute",
    //     textAlign:"center",
    //     top:"50%",left:"50%",
    //     transform:"translate(-50%,-50%)",
    //     width:"900px",
    //     height:"450px",
    //     background:"#f8f8f8",
    //     borderRadius:"20px",
    //     fontSize:"50px"
    // });

    //传入一个选项是alert框，两个是confirm框
    if(_obj.cancel!=""&&_obj.cancel!=null){
        $(".XuanZhe").css({
            position:"absolute",
            textAlign:"center",
            width:"50%",
            color:"#287ae8",
            borderTop:"0.5px solid gainsboro",
            bottom:"-30px",
            lineHeight:"150px"
        });
        $("#_cancel").html(_obj.cancel);
        //交互层
        $("#_cancel").click(function() {
            $("#_bj").remove();
            _obj.callback && _obj.callback(false);
        });
        $("#_determine").click(function() {
            $("#_bj").remove();
            _obj.callback && _obj.callback(true);
        });
    }else{
        $(".XuanZhe").css({
            position:"absolute",
            textAlign:"center",
            width:"100%",
            color:"#287ae8",
            borderTop:"0.5px solid gainsboro",
            borderLeft:"none",
            left:0,
            bottom: "-30px",
            lineHeight:"150px"
        });
        $("#_cancel").hide();
        $("#_determine").click(function() {
            $("#_bj").remove();
            _obj.callback && _obj.callback();
        });
    }
    $("#_determine").html(_obj.determine);
    $("#_content").html(_obj.content || "确定吗");
}
