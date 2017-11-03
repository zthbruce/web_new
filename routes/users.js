var express = require('express');
var log = require("../log/blmLog");
// var base64 = require('js-base64').Base64;
var userService = require("./../service/UserService");
var utils = require("../util/Utils.js");

/* GET home page. */
router.get('/', function(req, res, next) {
  log.info("index page");
  res.render('index', { title: 'Express' });
});

router.post('/',function(req,res,next){
  var data=req.body;
  var cmd= data.cmd;
  try{
    var reqParam=JSON.parse(data.param);
    log.info("[user req] cmd:"+ cmd +",param:"+data.param);

    if(cmd==0x01)
    {
      userService.GetUserList(reqParam, function(senddata){
        log.info("[user resp] cmd:"+ cmd +",response:"+senddata);
        res.send(senddata);
      });
    }else if(cmd==0x02)
    {
      userService.AddOrUpdateUser(reqParam, function(senddata){
        log.info("[user resp] cmd:"+ cmd +",response:"+senddata);
        res.send(senddata);
      });
    }else if(cmd==0x03)
    {
      userService.UpdatePwdByUserid(reqParam, function(senddata){
        log.info("[user resp] cmd:"+ cmd +",response:"+senddata);
        res.send(senddata);
      });
    }else if(cmd==0x04)
    {
      userService.DeleteUserByUseid(reqParam, function(senddata){
        log.info("[user resp] cmd:"+ cmd +",response:"+senddata);
        res.send(senddata);
      });
    }else if(cmd==0x05)
    {
      userService.GetRoleList(function(senddata){
        log.info("[user resp] cmd:"+ cmd +",response:"+senddata);
        res.send(senddata);
      });
    }else if(cmd==0x06)
    {
      userService.AddOrUpdateRole(reqParam, function(senddata){
        log.info("[user resp] cmd:"+ cmd +",response:"+senddata);
        res.send(senddata);
      });
    }else if(cmd==0x07)
    {
      userService.DeleteRoleByRoleid(reqParam.roleid, function(senddata){
        log.info("[user resp] cmd:"+ cmd +",response:"+senddata);
        res.send(senddata);
      });
    }else if(cmd==0x08)
    {
      userService.GetPersonalInfo(reqParam.uid, function(senddata){
        log.info("[user resp] cmd:"+ cmd +",response:"+senddata);
        res.send(senddata);
      });
    }else if(cmd==0x09)
    {
      userService.UpdatePersonalInfo(reqParam, function(senddata){
        log.info("[user resp] cmd:"+ cmd +",response:"+senddata);
        res.send(senddata);
      });
    }else if(cmd==0x0a)
    {
      userService.UpdatePersonalPwd(reqParam, function(senddata){
        log.info("[user resp] cmd:"+ cmd +",response:"+senddata);
        res.send(senddata);
      });
    }else if(cmd==0x0b) //获取所有的功能代码
    {
      userService.GetAllFuncCode(reqParam, function(senddata){
        log.info("[user resp] cmd:"+ cmd +",response:"+senddata);
        res.send(senddata);
      });
    }else if(cmd==0x0c) //获取拥有设备权限的用户,维修时用
    {
      userService.GetUsersByEquip(reqParam, function(senddata){
        log.info("[user resp] cmd:"+ cmd +",response:"+senddata);
        res.send(senddata);
      });
    }
    else if(cmd==0x0d) //获取拥有设备权限的角色，建立工作卡时用
    {
      userService.GetRolesByEquip(reqParam, function(senddata){
        log.info("[user resp] cmd:"+ cmd +",response:"+senddata);
        res.send(senddata);
      });
    }
    else
    {
      log.info("[user resp] cmd:"+ cmd +" not found");
      res.send('{"eid":1,"error":"no this Interface"}');
    }

  }catch (e){
    log.error("[user]: "+ e);
    res.send('{"eid":1}');
  }
});

module.exports = router;
