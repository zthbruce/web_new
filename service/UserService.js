/**
 * Created by Fly on 2016-11-25.
 */

var userDao = require('./../dao/UserDao');
var util =  require('util');
var map = require('./../util/Map.js');
var utils = require('./../util/Utils.js');
var dtutils = require('./../util/DateUtil.js');
var moment = require('moment');
var schedule = require("node-schedule");
var log = require('./../log/blmLog');
var async=require('async');

function UserService()
{
    // 保存用户角色Map
    var userMap = new map();  // userid->roleid
    var roleUserMap = new map(); // roleid->userid
    var roleMap = new map();

    // 每分钟加载一次用户
    var rule = new schedule.RecurrenceRule();
    var times = [];
    for(var i=1; i<60; i++){
        times.push(i);
    }
    rule.minute = times;
    var j = schedule.scheduleJob(rule, function(){
        loadUser();
    });
    loadUser();

    //加载用户
    function loadUser()
    {
        async.series({
            1:function(cb){
                userDao.getUsers(function(err, data){
                    if(err)
                    {
                        log.info("[UserService loadUser] err:"+err);
                    }
                    else {
                        userMap.clear();
                        roleUserMap.clear();
                        for (var i = 0; i < data.length; i++){
                            var onedata = data[i];

                            if (!userMap.containsKey(onedata.USER_ID))
                            {
                                var oneuser = new Object();
                                oneuser.USER_ID = onedata.USER_ID;
                                oneuser.PASSWORD = onedata.PASSWORD;
                                oneuser.NAME = onedata.NAME;

                                oneuser.roles = new map();

                                oneuser.funcs = new Set();
                                oneuser.factorys = new map();

                                userMap.put(onedata.USER_ID, oneuser);
                            }
                            var oneuser = userMap.get(onedata.USER_ID);

                            //roles
                            if (utils.isNotEmpty(onedata.ROLE_ID))
                                oneuser.roles.put(onedata.ROLE_ID,onedata.ROLE_NAME);


                            //funcs
                            if (utils.isNotEmpty(onedata.FUNCTION_CODE))
                                oneuser.funcs.add(onedata.FUNCTION_CODE);

                            //factory <id->栋号>
                            if (utils.isNotEmpty(onedata.ROLE_FACTORY_ID)) {
                                if (oneuser.factorys.containsKey(onedata.ROLE_FACTORY_ID) == false){
                                    var factory = new Object();
                                    factory.areas = new Set();
                                    factory.sids = new Set();
                                    oneuser.factorys.put(onedata.ROLE_FACTORY_ID, factory);
                                }
                                if(utils.isNotEmpty(onedata.ROLE_AREA_ID))
                                    oneuser.factorys.get(onedata.ROLE_FACTORY_ID).areas.add(onedata.ROLE_AREA_ID);
                                if(utils.isNotEmpty(onedata.SYSTEM_ID))
                                    oneuser.factorys.get(onedata.ROLE_FACTORY_ID).sids.add(onedata.SYSTEM_ID);
                            }


                            if (utils.isNotEmpty(onedata.ROLE_ID)) {
                                if (!roleUserMap.containsKey(onedata.ROLE_ID)){
                                    var onerole = new Object();
                                    onerole.ROLE_ID = onedata.ROLE_ID;
                                    onerole.ROLE_NAME = onedata.ROLE_NAME;
                                    onerole.setuser = new Set();
                                    roleUserMap.put(onedata.ROLE_ID, onerole);
                                }
                                roleUserMap.get(onedata.ROLE_ID).setuser.add(oneuser.USER_ID);
                            }

                        }
                        log.info("[UserService loadUser] end, count:%d", userMap.size());
                    }

                    cb(null);
                });


            },
            2:function(cb){
                userDao.getRoleList(function(err, results){
                    if(err){
                        log.info("[UserService loadRole] err:"+err);
                    }
                    else{
                        for (var i = 0; i < results.length; i++){
                            var onedata = results[i];
                            roleMap.put(onedata.ROLE_ID, onedata.NAME);
                        }
                    }
                    log.info("[UserService loadRole] end, count:%d", roleMap.size());
                    cb(null);
                });
            }
            },function(err,results){
            log.info("[UserService loadUser] end,err:"+err);
        });
    }


    /**
     * 根据用户ID返回角色ID数组
     * @param userid
     * @returns {Array}
     */
    this.getRoleByUserID = function(userid){
        var arr = [];
        if (userMap.containsKey(userid))
        {
            var maproles = userMap.get(userid).roles;
            arr = maproles.keys;
        }
        return arr;
    };

    /**
     * 根据角色ID返回用户（USER_ID, NAME）
     * @param roleid
     * @returns {Array}
     */
    this.getUserByRoleID = function(roleid){
        var arr = [];
        if (roleUserMap.containsKey(roleid)){
            var setuserids = roleUserMap.get(roleid).setuser;
            setuserids.forEach(function(key,value,set){
               arr.push(userMap.get(key));
            });
        }
        return arr;
    }

    /***
     * 根据用户ID获得用户名
     * @param userid
     * @returns 用户名
     */
    this.getUserNameByUserID = function(userid){
        var userName = userid;
        if (userMap.containsKey(userid))
        {
            var user = userMap.get(userid);
            userName = user.NAME;
        }
        return userName;
    }

    /**
     * 根据角色ID返回角色名
     * @param roleid
     * @returns {角色名}
     */
    this.getRoleNameByRoleID = function(roleid) {
        var roleName = roleid;
        if (roleMap.containsKey(roleid)){
            roleName = roleMap.get(roleid);
        }
        return roleName;
    }

    /**
     * 根据用户ID返回用户对象
     * @param userid
     * @returns user
     */
    this.getUserByUserID = function(userid) {
        if (userMap.containsKey(userid)){
            return userMap.get(userid);
        }
        return null;
    }

    /**
     * 根据用户ID返回用户权限数组
     * @param userid
     * @returns {Array}
     */
    this.getUserFunsByUserID = function(userid){
        var arr = [];
        if (userMap.containsKey(userid)){
            var user = userMap.get(userid);
            var set = user.funcs;
            set.forEach(function(key, value,set){
                arr.push(value)
            });
        }
        return arr;
    }

    /**
     * 根据用户ID返回用户系统数组
     * @param userid
     * @param fid
     * @returns {Array}
     */
    this.getUserSysByUserID = function(userid,fid){
        var arr = [];
        if (userMap.containsKey(userid)){
            var user = userMap.get(userid);
            if (user.factorys.containsKey(fid)){
                var sids = user.factorys.get(fid).sids;
                sids.forEach(function(key, value,set){
                    arr.push(value)
                });
            }
        }
        return arr;
    }

    /**
     * 根据用户ID返回用户工厂数组
     * @param userid
     * @returns {Array}
     */
    this.getUserFactoysByUserID = function(userid){
        var arr = [];
        if (userMap.containsKey(userid)){
            var user = userMap.get(userid);
            arr = user.factorys.keys;
        }
        return arr;
    }

    /**
     * 根据用户ID和厂ID返回用户管理的栋数组
     * @param userid
     * @param fid
     * @returns {Array}
     */
    this.getUserFactoyArea = function(uid, fid){
        var arr = [];
        if (userMap.containsKey(uid)){
            var user = userMap.get(uid);
            var factorys = user.factorys;
            if (factorys.containsKey(fid)){
                var setarea = factorys.get(fid).areas;
                setarea.forEach(function(key, value,set){
                    arr.push(key);
                });
            }
        }
        return arr;
    }





    this.validateUser = function(uid, pwd, callback){

        var res = 1;
        var user = null;
        if (userMap.containsKey(uid) == false) {
            res = 100;
        }
        else {
            user = userMap.get(uid);
            if (user.PASSWORD != pwd)
                res = 100;
            else {
                res = 0;
            }
        }
        var senddata;
        if (res == 0) {
            senddata = util.format('{"seq":"", "eid":%d, "uid":"%s", "uname":"%s","timelimit":%d',
                res, user.USER_ID, user.NAME,global.config.timeLimit);

            //factorys:
            senddata +=",\"factorys\":["
            var mapfactory = user.factorys;
            mapfactory.each(function(i,key, value){
                if (i > 0) senddata +=",";
                senddata += util.format('{"fid":"%s","aids":[', key);
                var count = 0;
                var aids = value.areas;
                aids.forEach(function(k, v, set){
                    if (count > 0) senddata +=",";
                    senddata += "\""+k+"\"";
                    count ++;
                });
                senddata +="]";

                //sids:
                count = 0;
                var setsids = value.sids;
                senddata +=",\"sids\":[";
                setsids.forEach(function(key, value, set){
                    if (count > 0) senddata +=",";
                    senddata += "\""+key+"\"";
                    count ++;
                });
                senddata+="]";
                senddata +="}";
            });
            senddata +="]";

            //funcs:
            senddata +=",\"funcs\":[";
            var setfuncs = user.funcs;
            var count = 0;
            setfuncs.forEach(function(key, value, set){
                if (count > 0) senddata +=",";
                senddata += "\""+key+"\"";
                count ++;
            });
            senddata+="]";
            senddata +="}";
        }
        else {
            senddata = util.format('{"seq":"", "eid":%d, "uid":"", "uname":"","timelimit":%d}', res,global.config.timeLimit);
        }
        callback(senddata);
    }


    this.GetUserList=function(data,callback)
    {
        userDao.getUserList(function(err,results){
            if(err)
            {
                log.error("[GetUserList]"+err);
                callback(utils.eid1);
            }else{
                var res='{"seq":"","eid":0,"data":[';
                var len =results.length;
                var user_id="";
                if(len!=0) user_id=results[0].USER_ID;
                var user_name=utils.null2str(results[0].NAME);
                var factroy_id=utils.null2str(results[0].FACTORY_ID);
                var factory_name=utils.null2str(results[0].FACTORY_NAME);
                var tel=utils.null2str(results[0].TEL);
                var fax=utils.null2str(results[0].FAX);
                var mobile=utils.null2str(results[0].MOBILE);
                var email=utils.null2str(results[0].EMAIL);
                var remark=utils.null2str(results[0].REMARK);
                res=res+util.format('{"uid":"%s","uname":"%s","fid":"%s","fname":"%s",' +
                        '"tel":"%s","fax":"%s","mobile":"%s","email":"%s","rmk":"%s","roles":[',
                    user_id,user_name,factroy_id,factory_name,tel,fax,mobile,email,remark);
                for(var i=0;i<results.length;++i)
                {
                    if(user_id==results[i].USER_ID)
                    {
                        var role_id=utils.null2str(results[i].ROLE_ID);
                        var role_name=utils.null2str(results[i].ROLE_NAME);
                        if(utils.isNotEmpty(role_id))
                            res=res+util.format('{"id":"%s","name":"%s"}',role_id,role_name);
                    }else{
                        res=res+']}';
                        user_id=results[i].USER_ID;
                        user_name=utils.null2str(results[i].NAME);
                        factroy_id=utils.null2str(results[i].FACTORY_ID);
                        factory_name=utils.null2str(results[i].FACTORY_NAME);
                        tel=utils.null2str(results[i].TEL);
                        fax=utils.null2str(results[i].FAX);
                        mobile=utils.null2str(results[i].MOBILE);
                        email=utils.null2str(results[i].EMAIL);
                        remark=utils.null2str(results[i].REMARK);
                        var role_id=utils.null2str(results[i].ROLE_ID);
                        var role_name=utils.null2str(results[i].ROLE_NAME);
                        res=res+util.format('{"uid":"%s","uname":"%s","fid":"%s","fname":"%s",' +
                                '"tel":"%s","fax":"%s","mobile":"%s","email":"%s","rmk":"%s","roles":[',
                                user_id,user_name,factroy_id,factory_name,tel,fax,mobile,email,remark);
                        if(utils.isNotEmpty(role_id))
                            res=res+util.format('{"id":"%s","name":"%s"}', role_id, role_name);
                    }
                    if(i==len-1)
                    {
                        res=res+']}]}';
                    }
                }
                res=res.replace(/}{/g,'},{');
                callback(res);
                
            }
        });
    }


    this.AddOrUpdateUser=function(data,callback)
    {
        async.series({
            1:function(cb){
                if(data.optype==0) {
                    userDao.IsExistUserByUserid(data.uid, function (err, results) {
                        if (err) {
                            log.error("[AddOrUpdateUser]" + err);
                            cb(utils.eid1);
                        } else {
                            if (results.length == 0) {
                                cb();
                            }
                            else {
                                cb('{"eid":1,"error":"userid is exist"}');
                            }
                        }
                    });
                }else{
                    cb();
                }
            },
            2:function(cb){
                if(data.optype==1){
                    userDao.deleteUserRoleByUserid(data.uid,function(err,results){
                        if(err){
                            log.error("[AddOrUpdateUser]" + err);
                            cb(utils.eid1);
                        }else{
                            cb();
                        }
                    });
                }else{cb();}
            },
            3:function(cb){
                if(data.optype==0)
                {
                    userDao.insertUser(data.uid,data.uname,data.pwd,data.fid,data.tel,
                        data.fax,data.mobile,data.email,data.rmk,function(err,results){
                            if(err)
                            {
                                log.error("[AddOrUpdateUser]" + err);
                                cb(utils.eid1);
                            }else{
                                cb();
                            }
                        });
                }else{
                   userDao.updateUser(data.uid,data.uname,data.fid,data.tel,
                       data.fax,data.mobile,data.email,data.rmk,function(err,results){
                           if(err)
                           {
                               log.error("[AddOrUpdateUser]" + err);
                               cb(utils.eid1);
                           }else{
                               cb();
                           }
                       });
                }
            },
            4:function(cb){
                userDao.insertUserRole(data.roles,data.uid,function(err,reuslts){
                    if(err)
                    {
                        log.error("[AddOrUpdateUser]" + err);
                        cb(utils.eid1);
                    }else{
                        cb();
                    }
                });
            }
        },function(err){
            if(err){
                callback(err);
            }else{
                callback(utils.eid0);
            }
        });
    }

    this.UpdatePwdByUserid=function(data,callback)
    {
        userDao.updatePwdByUserid(data.uid,data.pwd,function(err,results){
            if(err)
            {
                log.error("[UpdatePwdByUserid]"+err);
                callback(utils.eid1);
            }else{
                callback(utils.eid0);
            }
        });
    }
    
    this.DeleteUserByUseid=function(data,callback)
    {
        userDao.deleteUserByUserid(data.uid,function(err,results){
            if(err)
            {
                log.error("[DeleteUserByUseid]"+err);
                callback(utils.eid1);
            }else{
                callback(utils.eid0);
            } 
        });
        
    }


    this.GetRoleList=function(callback)
    {
        userDao.getRoleList(function(err,results){
            if(err)
            {
                log.error("[GetRoleList]"+err);
                callback(utils.eid1);
            }else{
                var rolemap = new map();
                for(var i=0;i<results.length;++i)
                {
                    var roleid=results[i].ROLE_ID;
                    if (rolemap.containsKey(roleid) == false){
                        var role = {};
                        role.id = roleid;
                        role.funcs = new map();
                        role.factorys = new map();
                        rolemap.put(role.id, role);
                    }
                    // role
                    var role = rolemap.get(roleid);
                    role.name = utils.null2str(results[i].NAME);

                    // role's funcs
                    var funcid = utils.null2str(results[i].FUNCTION_CODE);
                    if(utils.isNotEmpty(funcid)){
                        role.funcs.put(funcid, funcid);
                    }

                    // role's factorys
                    var fid = utils.null2str(results[i].FACTORY_ID);
                    var aid = utils.null2str(results[i].AREA_ID);
                    var area_name = utils.null2str(results[i].AREA_NAME);
                    var sid = utils.null2str(results[i].SYSTEM_ID);
                    var system_name = utils.null2str(results[i].SYSTEM_NAME);
                    if(utils.isNotEmpty(fid) && role.factorys.containsKey(fid) == false){
                        var factory = {};
                        factory.areas = new map();
                        factory.systems = new map();
                        role.factorys.put(fid, factory);
                    }
                    if(utils.isNotEmpty(fid)) {
                        var areas = role.factorys.get(fid).areas;
                        var systems = role.factorys.get(fid).systems;
                        if (utils.isNotEmpty(aid)){
                            areas.put(aid,{id:aid,name:area_name});
                        }
                        if (utils.isNotEmpty(sid)){
                            systems.put(sid,{id:sid,name:system_name});
                        }
                    }
                }

                var res='{"seq":"","eid":0,"data":[';
                var count = 0;
                rolemap.each(function(i,key, value){
                    var funcs = JSON.stringify(value.funcs.keys);
                    var factorys = value.factorys;
                    if (count > 0) res += ",";
                    count++;
                    res=res+util.format('{"roleid":"%s","rolename":"%s", "funcs":%s, "factorys":[', value.id, value.name, funcs);
                    var fcount = 0;
                    factorys.each(function(fi,fk, fv){
                        if (fcount > 0 ) res +=",";
                        fcount++;
                        res += util.format('{"fid":"%s", "aids":%s, "sids":%s}', fk, JSON.stringify(fv.areas.values()), JSON.stringify(fv.systems.values()));
                    });
                    res +="]}"
                });
                res=res+']}';
                callback(res);
            }

        });
    }


    this.AddOrUpdateRole=function(data,callback)
    {
        var role_id="";
        async.series({
            1: function (cb)
            {
                if(data.optype==0) {
                    userDao.getNewRoleid(function (err, results) {
                        if (err) {
                            log.error("[AddOrUpdateRole]" + err);
                            cb(utils.eid1);
                        } else {
                            role_id = results[0].ID;
                            cb();
                        }
                    });
                }else{
                    cb();
                }
            },
            2:function(cb)
            {
                if(data.optype==1)
                {
                    role_id=data.roleid;
                }
                userDao.insertRole(data.optype,role_id,data.rolename,data.rmk,function(err,results){
                    if(err)
                    {
                        log.error("[AddOrUpdateRole]" + err);
                        cb(utils.eid1);
                    }else{
                        cb();
                    }
                });
            },
            3:function(cb)
            {
                userDao.deleteRoleFactory(role_id, function(err, results){
                    if(err)
                    {
                        log.error("[AddOrUpdateRole]" + err);
                        cb(utils.eid1);
                    }else{
                        cb();
                    }
                });
            },
            4:function(cb)
            {
                if(data.factorys && data.factorys.length != 0) {
                    userDao.insertRoleFactory(role_id, data.factorys, function (err, results) {
                        if (err) {
                            log.error("[AddOrUpdateRole]" + err);
                            cb(utils.eid1);
                        } else {
                            cb();
                        }
                    });
                }
                else{
                    cb();
                }
            },
            5:function(cb)
            {
                userDao.deleteRoleFuncs(role_id, function(err, results){
                    if(err)
                    {
                        log.error("[AddOrUpdateRole]" + err);
                        cb(utils.eid1);
                    }else{
                        cb();
                    }
                })
            },
            6:function(cb)
            {
                if(data.funcs && data.funcs.length != 0) {
                    userDao.insertRoleFunc(role_id, data.funcs, function (err, results) {
                        if (err) {
                            log.error("[AddOrUpdateRole]" + err);
                            cb(utils.eid1);
                        } else {
                            cb();
                        }
                    });
                }
                else{
                    cb();
                }
            },
            7:function(cb)
            {
                userDao.deleteRoleSys(role_id, function(err, results){
                    if(err)
                    {
                        log.error("[AddOrUpdateRole]" + err);
                        cb(utils.eid1);
                    }else{
                        cb();
                    }
                });
            },
            8:function(cb)
            {
                if(data.factorys && data.factorys.length != 0) {
                    userDao.insertRoleSys(role_id, data.factorys, function (err, results) {
                        if (err) {
                            log.error("[AddOrUpdateRole]" + err);
                            cb(utils.eid1);
                        } else {
                            cb();
                        }
                    });
                }
                else{
                    cb();
                }
            },
        },function(err){
            if(err)
            {
                callback(err);
            }else{
                callback('{"seq":"","eid":0,"roleid":"'+role_id+'"}');
            }
        });
    }

    this.DeleteRoleByRoleid=function(roleid,callback)
    {
        userDao.deleteRole(roleid,function(err,results){
           if(err){
               log.error("[DeleteRoleByRoleid]"+err);
               callback(utils.eid1);
           } else{
               callback(utils.eid0);
           }
        });
    }

    this.GetPersonalInfo=function(userid,callback)
    {
        userDao.getPersonalInfo(userid,function(err,results){
            if(err){
                log.error("[GetPersonalInfo]"+err);
                callback(utils.eid1);
            }else{
                var res="";
                for(var i=0;i<results.length;++i) {
                    if (i == 0) {
                        res = util.format('{"seq":"","eid":0,"uid":"%s","uname":"%s","fid":"%s","fname":"%s","tel":"%s",' +
                            '"fax":"%s","mobile":"%s","email":"%s","rmk":"%s","roles":[',
                            results[i].USER_ID, utils.null2str(results[i].NAME), utils.null2str(results[i].FACTORY_ID),
                            utils.null2str(results[i].FACTORY_NAME), utils.null2str(results[i].TEL), utils.null2str(results[i].FAX),
                            utils.null2str(results[i].MOBILE), utils.null2str(results[i].EMAIL), utils.null2str(results[i].REMARK));

                        if (userMap.containsKey(results[0].USER_ID)) {
                            var oneuser = userMap.get(results[0].USER_ID);
                            var roles = oneuser.roles;

                            roles.each(function (i, key, value) {
                                if (i > 0) res += ",";
                                res += util.format('{"id":"%s","name":"%s"}', key, value);
                            });
                            res += "]";
                            res += "}";
                        }
                        break;
                    }
                }
                callback(res);
            }
        });
    }
    
    this.UpdatePersonalInfo=function(data,callback)
    {
        userDao.updateUser(data.uid,data.uname,data.fid,data.tel,data.fax,data.mobile,data.email,data.rmk,
        function(err,results){
           if(err)
           {
               log.error("[UpdatePersonalInfo]"+err);
               callback(utils.eid1);
           }else{
               callback(utils.eid0);
           }
        });
    }

    this.UpdatePersonalPwd=function(data,callback)
    {
        async.series({
            1:function(cb){
                userDao.getPersonalInfo(userid,function(err,results){
                    if(err){
                        log.error("[UpdatePersonalPwd]"+err);
                        cb(utils.eid1);
                    }else {
                        if(results[0].PASSWORD!=data.oldpwd)
                        {
                            log.error("[UpdatePersonalPwd] old password error!");
                            cb(utils.eid100);
                        }else{
                            cb();
                        }
                    }
                });
            },
            2:function(cb){
                userDao.updatePwdByUserid(data.uid,data.newpwd,function(err,results){
                    if(err)
                    {
                        log.error("[UpdatePersonalPwd]"+err);
                        cb(utils.eid1);
                    }else{
                        cb(utils.eid0);
                    }
                });
            }
        },function(err){})
    }

    this.GetAllFuncCode = function(data, callback)
    {
        userDao.getAllFuncCode(function(err, results){
           if(err){
               callback(utils.eid1);
           }
           else {
               var senddata = util.format('{"seq":"%s", "eid":0, "funcs:":[',data.seq);
               for (var i = 0; i < results.length; i++)
               {
                   if ( i > 0 ) senddata += ",";
                   senddata += util.format('{"id":"%s", "name":"%s"}', results[i].FUNCTION_CODE, results[i].NAME_CN);
               }
               senddata +="]}";
               callback(senddata);
           }
        });
    }

    this.GetUserByFactoryArea = function(data, callback){

        userDao.getUserByFactoryArea(data.fid, data.aid,data.equipid, function(err, results){
            if(err){
                callback(utils.eid1);
            }
            else {
                var senddata = util.format('{"seq":"%s", "eid":0, "data":[',data.seq);
                for (var i = 0; i < results.length; i++)
                {
                    if ( i > 0 ) senddata += ",";
                    senddata += util.format('{"uid":"%s", "uname":"%s"}', results[i].USER_ID, results[i].NAME);
                }
                senddata +="]}";
                callback(senddata);
            }
        });
    }
    
}

var userService = new UserService();
module.exports = userService;