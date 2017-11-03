/**
 * Created by ShiTianCi on 2017/6/19.
 */
var Sequelize = require("sequelize");
var mysql_blmdb = require("./mysql_blmdb");

var blmDbSequelize = new Sequelize(mysql_blmdb.database, mysql_blmdb.user, mysql_blmdb.password, {
    host: mysql_blmdb.host,
    dialect: 'mysql',
    dialectOptions:{
        insecureAuth:mysql_blmdb.insecureAuth
    },
    timezone:'+08:00',
    pool: {
        max: 10,
        min: 0,
        idle: 10000
    }
});

module.exports = blmDbSequelize;
