/**
 * Created by Fly on 2016-02-22.
 */
var Sequelize = require("sequelize");
var mysql_conf = require("./mysql_conf");

//sqlite
//var sequelize = new Sequelize('bmcd', null, null, {
//    dialect: 'sqlite',
//    storage: 'bmcd.db'
//});

var blmSequelize = new Sequelize(mysql_conf.database, mysql_conf.user, mysql_conf.password, {
    host: mysql_conf.host,
    dialect: 'mysql',
    dialectOptions:{
        insecureAuth:mysql_conf.insecureAuth
    },
    timezone:'+08:00',
    pool: {
        max: 10,
        min: 0,
        idle: 10000
    }
});

module.exports = blmSequelize;
