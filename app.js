var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/testIndex');

var parkArea = require('./routes/parkArea');

var point = require('./routes/point');

var portInfo = require('./routes/portInfo');

var contour = require('./routes/contour');

var statistic = require('./routes/statistic');

var voyage = require('./routes/voyage');  // 航线

var berth = require('./routes/berth'); // 泊位的接口

var anch = require('./routes/anch'); // 锚地的接口

var fleet = require('./routes/fleet'); // 船队的接口

var route = require('./routes/route'); // 航线的接口

var voyageManagement = require("./routes/voyageManagment"); //航次管理接口

var app = express();

//设置跨域访问
// app.all('*', function(req, res, next) {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
//     res.header("X-Powered-By",' 3.2.1');
//     res.header("Content-Type", "application/json;charset=utf-8");
//     next();
// });


// view engine setup
app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'ejs');
app.engine("html",require("ejs").__express); // or   app.engine("html",require("ejs").renderFile);
app.set('view engine', 'html');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
//public位置
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);


app.use('/parkArea', parkArea);

app.use('/pointShow', point);

app.use('/portInfo', portInfo);

app.use('/contourShow', contour);

app.use('/statistic', statistic);

app.use('/route', route); // 航线

app.use('/berth', berth); //泊位

app.use('/anch', anch); //锚地

app.use("/fleet", fleet); //船队

app.use("/voyage", voyage); // 航次

app.use("/voyageManagement", voyageManagement); // 航次管理

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler

// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


// it is not export
module.exports = app;
