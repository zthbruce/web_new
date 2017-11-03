var blmSequelize = require('./BlmSequelize');

function BlmMysql(){
    this.query=function(sql,callback){
        blmSequelize.query(sql).spread(function (results, metadata) {//这个方法 异常就挂，没看到有异常监听
            // Raw query - use spread
            callback(null,results);
            //res.send("");
        }).catch(function (e){
            callback(e,"error");
        });
    }
}
var blmMysql = new BlmMysql();
module.exports=blmMysql;