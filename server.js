var express = require('express');
var path = require('path');

var indexRouter = require('./routes/index');
var app = express();
const server = require('http').Server(app);
var io = require('socket.io')(server);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(function(req,res,next){
    req.io = io;
    next();
});
app.use('/', indexRouter);
server.listen(8080);

module.exports = app;