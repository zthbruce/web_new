/**
 * Created by ShiTianCi on 2017/6/19.
 */
var blmDbSequelize = require('./BlmDbSuquelize');
function BlmDbMysql(){
    this.query=function(sql,callback){
        blmDbSequelize.query(sql).spread(function (results, metadata) {
            // Raw query - use spread
            callback(null,results);
            //res.send("");
        }).catch(function (e){
            callback(e,"error");
        });
    }
}
var blmDbMysql = new BlmDbMysql();
module.exports=blmDbMysql;