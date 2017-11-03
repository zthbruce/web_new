var log4js = require('log4js');  
var ConfigLog = require('./config.js');

var config = new ConfigLog().getConfig();
log4js.configure(config);
var blmlog = log4js.getLogger("blmlog");

module.exports = blmlog;