/**
 * Created by Fly on 2016-11-25.
 */
var mysql = require('./../db/BlmMysql');
var dateutil = require('./../util/DateUtil');
var util = require('util');
var utils = require('./../util/Utils');
var async = require('async');


function UserDao()
{
    this.getUsers = function(callback)
    {
        var sql = "SELECT t1.USER_ID, t1.PASSWORD, t1.NAME, t3.`ROLE_ID`, t3.NAME AS ROLE_NAME, t5.FUNCTION_CODE, t6.FACTORY_ID AS ROLE_FACTORY_ID, t6.AREA_ID AS ROLE_AREA_ID, SUBSTR(t6.AREA_ID, 2)+0 AS AREA_SEQ, t7.SYSTEM_ID FROM `t9801_users` AS t1 \
        LEFT JOIN `t9803_user_roles` AS t2 ON t1.`USER_ID`=t2.`USER_ID` \
        LEFT JOIN `t9804_roles` AS t3 ON t3.`ROLE_ID`=t2.`ROLE_ID` \
        LEFT JOIN t9805_role_authorities AS t5 ON t3.ROLE_ID = t5.ROLE_ID \
        LEFT JOIN t9806_roles_factory AS t6 ON t3.ROLE_ID = t6.ROLE_ID \
        LEFT JOIN t9807_roles_system AS t7 ON t3.ROLE_ID = t7.ROLE_ID and t6.FACTORY_ID = t7.FACTORY_ID \
        ORDER BY t6.FACTORY_ID asc, AREA_SEQ ASC, t7.SYSTEM_ID ASC";
        mysql.query(sql, function(err, results){
           callback(err, results);
        });
    };


    this.getUserList=function(callback)
    {
        var sql="SELECT t1.*,t2.`ROLE_ID`,t3.NAME AS ROLE_NAME,t4.NAME AS FACTORY_NAME FROM `t9801_users` AS t1" +
            " LEFT JOIN `t9803_user_roles` AS t2 ON t2.USER_ID=t1.`USER_ID`" +
            " LEFT JOIN `t9804_roles` AS t3 ON t3.`ROLE_ID`=t2.`ROLE_ID` AND t3.VALID_FLAG=1" +
            " LEFT JOIN `t0101_factory` AS t4 ON t1.`FACTORY_ID`=t4.ID" +
            " WHERE t1.`VALID_FLAG`=1 ORDER BY t1.`USER_ID`";
        mysql.query(sql, function(err, results){
            callback(err, results);
        });
    };

    this.IsExistUserByUserid=function(userid,callback)
    {
        var sql="SELECT * FROM `t9801_users` WHERE USER_ID='"+userid+"'";
        mysql.query(sql, function(err, results){
            callback(err, results);
        });
    }


    this.deleteUserRoleByUserid=function(userid,callback)
    {
        var sql="DELETE FROM `t9803_user_roles` WHERE USER_ID='"+userid+"'";
        mysql.query(sql, function(err, results){
            callback(err, results);
        });
    };

    this.insertUserRole=function(role_arr,userid,callback)
    {
        var sql="INSERT INTO `t9803_user_roles`(ROLE_ID,USER_ID) VALUES";
        for(var i=0;i<role_arr.length;++i)
        {
            if(i!=0)
            {
                sql=sql+',';
            }
            sql=sql+util.format("('%s','%s')",role_arr[i].id,userid);
        }
        mysql.query(sql, function(err, results){
            callback(err, results);
        });
    };

    this.updateUser=function(userid,uname,fid,tel,fax,mobile,email,rmk,callback)
    {
        var sql=util.format("UPDATE `t9801_users` SET FACTORY_ID='%s',NAME='%s',TEL='%s',FAX='%s'," +
            "MOBILE='%s',EMAIL='%s',REMARK='%s' WHERE USER_ID='%s'",utils.null2str(fid),uname,tel,fax,mobile,email,rmk,userid);
        mysql.query(sql, function(err, results){
            callback(err, results);
        });
    };

    this.insertUser=function(userid,uname,pwd,fid,tel,fax,mobile,email,rmk,callback)
    {
        var sql=util.format("INSERT INTO `t9801_users`(USER_ID,FACTORY_ID,`PASSWORD`,`NAME`," +
            "TEL,FAX,MOBILE,EMAIL,VALID_FLAG,REMARK,START_DT) " +
            "VALUES('%s','%s','%s','%s','%s','%s','%s','%s',1,'%s',NOW())",userid,utils.null2str(fid),pwd,uname,tel,fax,mobile,email,rmk);
        mysql.query(sql, function(err, results){
            callback(err, results);
        });
    };


    this.updatePwdByUserid=function(userid,pwd,callback)
    {
        var sql=util.format("UPDATE `t9801_users` SET `PASSWORD`='%s' WHERE USER_ID='%s'",pwd,userid);
        mysql.query(sql, function(err, results){
            callback(err, results);
        });
    };
    
    this.deleteUserByUserid=function(userid,callback)
    {
        var sql="UPDATE `t9801_users` SET VALID_FLAG=0,END_DT=NOW() WHERE USER_ID='"+userid+"'";
        mysql.query(sql, function(err, results){
            callback(err, results);
        });
    }

    this.getRoleList=function(callback)
    {
        var sql="SELECT t1.ROLE_ID, t1.NAME, t2.FUNCTION_CODE, t3.FACTORY_ID, t3.AREA_ID,t4.NAME AS AREA_NAME, t5.SYSTEM_ID, t6.NAME AS SYSTEM_NAME FROM `t9804_roles` t1 \
        LEFT JOIN t9805_role_authorities t2 ON t1.ROLE_ID = t2.ROLE_ID \
        LEFT JOIN t9806_roles_factory t3 ON t1.ROLE_ID = t3.ROLE_ID \
        LEFT JOIN `t0102_factory_area` t4 ON t3.AREA_ID = t4.`ID` AND t3.FACTORY_ID=t4.FACTORY_ID \
        LEFT JOIN t9807_roles_system t5 ON t1.ROLE_ID = t5.ROLE_ID  AND t3.FACTORY_ID = t5.FACTORY_ID \
        LEFT JOIN t0103_equipment_system t6 ON t5.SYSTEM_ID = t6.`ID` AND t5.FACTORY_ID=t6.FACTORY_ID \
        WHERE t1.VALID_FLAG=1 ORDER BY NAME ASC, FACTORY_ID ASC, AREA_ID ASC";
        mysql.query(sql, function(err, results){
            callback(err, results);
        });
    }


    this.insertRole=function(type,roleid,rolename,rmk,callback)
    {
        var sql="";
        if(type==0)
        {
            sql=util.format("INSERT INTO `t9804_roles`(ROLE_ID,NAME,VALID_FLAG,RMK) VALUES('%s','%s',1,'%s')",
            roleid,rolename,rmk);
        }else{
            sql=util.format("UPDATE `t9804_roles` SET NAME='%s',RMK='%s' WHERE ROLE_ID='%s'",
            rolename,rmk,roleid);
        }
        mysql.query(sql, function(err, results){
            callback(err, results);
        });
    }

    this.deleteRoleFactory = function(roleid,callback){
        var sql = util.format("DELETE FROM t9806_roles_factory WHERE ROLE_ID='%s'", roleid);
        mysql.query(sql, function(err, results){
            callback(err, results);
        });
    }

    this.insertRoleFactory = function(roleid, factorys, callback)
    {
        var  sql = util.format("INSERT IGNORE INTO t9806_roles_factory(ROLE_ID, FACTORY_ID, AREA_ID) VALUES ");
        //var count = 0;
        for(var i = 0; i < factorys.length; i++){
            var factory = factorys[i];
            var fid = factory.fid;
            var aids = factory.aids;
            //if (count >0) sql +=',';
            if(aids.length == 0){
                sql += util.format("('%s', '%s',''),",roleid, fid);
            }
            for (var j = 0; j < aids.length; j++){

                sql += util.format("('%s', '%s', '%s'),",roleid, fid, aids[j]);
            }

            //count++;
        }
        sql = sql.substr(0,sql.length - 1);
        mysql.query(sql, function(err, results){
            callback(err, results);
        });
    }

    this.deleteRoleFuncs = function(roleid,callback){
        var sql = util.format("DELETE FROM t9805_role_authorities WHERE ROLE_ID='%s'", roleid);
        mysql.query(sql, function(err, results){
            callback(err, results);
        });
    }

    this.insertRoleFunc = function(roleid, funcs, callback)
    {

        var  sql = util.format("INSERT IGNORE INTO t9805_role_authorities(ROLE_ID, FUNCTION_CODE) VALUES ");
        for(var i = 0; i < funcs.length; i++){
            var func = funcs[i];
            if (i > 0) sql +=",";
            sql += util.format("('%s', '%s')",roleid, func);
        }
        mysql.query(sql, function(err, results){
            callback(err, results);
        });
    }


    this.deleteRoleSys = function(roleid,callback){
        var sql = util.format("DELETE FROM t9807_roles_system WHERE ROLE_ID='%s'", roleid);
        mysql.query(sql, function(err, results){
            callback(err, results);
        });
    }

    this.insertRoleSys = function(roleid, factorys, callback)
    {
        var  sql = util.format("INSERT IGNORE INTO t9807_roles_system(ROLE_ID, FACTORY_ID, SYSTEM_ID) VALUES ");
        for(var i = 0; i < factorys.length; i++){
            var factory = factorys[i];
            var fid = factory.fid;
            var sids = factory.sids;
            for (var j = 0; j < sids.length; j++){
                sql += util.format("('%s', '%s', '%s'),",roleid, fid, sids[j]);
            }
        }
        sql = sql.substr(0,sql.length - 1);
        mysql.query(sql, function(err, results){
            callback(err, results);
        });
    }

    this.deleteRole=function(roleid,callback)
    {
        var sql="UPDATE `t9804_roles` SET VALID_FLAG=0 WHERE ROLE_ID='"+roleid+"'";
        mysql.query(sql, function(err, results){
            callback(err, results);
        });
    }

    this.getNewRoleid=function(callback)
    {
        var sql="SELECT MAX(CONVERT(ROLE_ID,SIGNED))+1 AS ID FROM `t9804_roles`";
        mysql.query(sql, function(err, results){
            callback(err, results);
        });
    }

    this.getPersonalInfo=function(userid,callback)
    {
        var sql="SELECT t1.*,t4.`NAME` AS FACTORY_NAME, t3.`ROLE_ID`, t3.NAME AS ROLE_NAME, t5.FUNCTION_CODE, t6.FACTORY_ID AS ROLE_FACTORY_ID, t6.AREA_ID AS ROLE_AREA_ID FROM `t9801_users` AS t1 \
        LEFT JOIN `t0101_factory` AS t4 ON t4.`ID`=t1.`FACTORY_ID` \
        LEFT JOIN `t9803_user_roles` AS t2 ON t1.`USER_ID`=t2.`USER_ID` \
        LEFT JOIN `t9804_roles` AS t3 ON t3.`ROLE_ID`=t2.`ROLE_ID` \
        LEFT JOIN t9805_role_authorities AS t5 ON t3.ROLE_ID = t5.ROLE_ID \
        LEFT JOIN t9806_roles_factory AS t6 ON t3.ROLE_ID = t6.ROLE_ID \
        WHERE t1.`USER_ID`='"+userid+"'" ;
        mysql.query(sql, function(err, results){
            callback(err, results);
        });
    }

    this.getAllFuncCode = function(callback)
    {
        var sql = "SELECT FUNCTION_CODE, NAME_CN FROM t0003_mod_func ORDER BY SEQ ASC";
        mysql.query(sql, function(err, results){
            callback(err, results);
        });
    };

    //通过factoryid, pname人名模糊匹配出角色id,和用户id {角色id,用户id}
    this.getUseridByFuzzyName=function(factoryid,pname,callback)
    {
        var sql=util.format("SELECT t1.`USER_ID`,t2.`ROLE_ID` FROM `t9801_users` t1,`t9803_user_roles` t2 WHERE FACTORY_ID='%s' AND NAME LIKE '%"+pname+"%' AND t2.`USER_ID`=t1.`USER_ID`",factoryid);
        mysql.query(sql,function(err,results){
           if(err){
               callback(new Array());
           } else{
               callback(results);
           }
        });
    }

    this.getUserByFactoryArea = function(fid, aid, equipid, callback)
    {
        var sfield = "";
        var data;
        async.series({
            1:function(cb){
                if(fid == 'F1' && equipid && equipid != "") {
                    var sql = util.format("SELECT * FROM `t0105_equipment` t1 WHERE t1.`ID`='%s' " +
                        "AND t1.`FACTORYID`='F1' AND t1.`SYSTEMID` IN('AA','AB','AC','AD','AE','AF','AG')", equipid);
                    mysql.query(sql,function(err,result){
                       if(err){
                           cb(err);
                       } else{
                           if(result.length!=0){
                               sfield = "内围";
                           }else{
                               sfield = "外围";
                           }
                           cb();
                       }
                    });
                }else{
                    cb();
                }
            },
            2:function(cb){
                var role_sql = "";
                if(sfield != "")
                 role_sql = " INNER JOIN `t9804_roles` t4 ON t4.NAME LIKE '%"+sfield+"%' AND t4.ROLE_ID=t2.`ROLE_ID`";

                //+role_sql
                var sql = util.format(" SELECT DISTINCT t1.USER_ID, t1.NAME FROM t9801_users t1 " +
                    " INNER JOIN t9803_user_roles t2 ON t1.USER_ID = t2.USER_ID " +
                    " INNER JOIN t9806_roles_factory t3 ON t2.ROLE_ID = t3.ROLE_ID AND t3.FACTORY_ID = '%s' " , fid);
                if(utils.isNotEmpty(aid))
                    sql += util.format("AND t3.AREA_ID = '%s'", aid);

                mysql.query(sql, function(err, results){
                    data =results;
                    cb(err);
                });
            }
        },function(err){
            callback(err,data);
        });
        /*var sql = util.format(" SELECT t1.USER_ID, t1.NAME FROM t9801_users t1 " +
            " INNER JOIN t9803_user_roles t2 ON t1.USER_ID = t2.USER_ID " +
            " INNER JOIN t9806_roles_factory t3 ON t2.ROLE_ID = t3.ROLE_ID " +
            " WHERE t1.FACTORY_ID = '%s'", fid);
        if(utils.isNotEmpty(aid))
            sql += util.format("AND t3.AREA_ID = '%s'", aid);

        mysql.query(sql, function(err, results){
            callback(err, results);
        });*/
    }

    

}

var userDao = new UserDao();
module.exports = userDao;

