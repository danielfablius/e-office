var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

//database setup
var config = require('./config'); // get our config file
var mongo = require('mongodb');
var monk = require('monk');
// var mongoose = require('mongoose');
// var db = mongoose.connect(config.database);
var db = monk('localhost:27017/eoffice');

//routing (controller model like) 
var routes = require('./routes/index');
var users = require('./routes/users');
var agenda = require('./routes/agenda');
var jabatan = require('./routes/jabatan');
var disposisi = require('./routes/disposisi');
var suratmasuk = require('./routes/suratmasuk');
var pengguna = require('./routes/pengguna');
var app = express();

// view engine setup
//enabling CORS and All Method
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE");
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "x-access-token");
  next();
});
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/static', express.static('public'));
app.use('/uploads', express.static('../uploads'));
//make db accesible
app.use(function(req,res,next){
  req.db = db;
  next();
});

app.use('/', routes);
app.use('/users', users);
app.use('/agenda', agenda);
app.use('/jabatan', jabatan);
app.use('/disposisi', disposisi);
app.use('/suratmasuk', suratmasuk);
app.use('/pengguna', pengguna);

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


module.exports = app;
