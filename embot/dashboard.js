var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var board = require('./board');
var play = require('./play');
var fs = require('fs');

var rawlngList = fs.readdirSync(path.join(__dirname, '/sounds'));
var lngList = [];
rawlngList.forEach(function (file) {
    if (fs.statSync(path.join(__dirname, '/sounds/' + file)).isDirectory()) {
        lngList.push(file);
    }
});

var soundList = JSON.parse(fs.readFileSync(path.join(__dirname, '/sounds/list.json'), 'utf8'));

app.use(express.static(path.join(__dirname, '/dashboard')));
/*
app.get('/', function (req, res) {
    res.sendFile(path.resolve('./index.html'));
});*/

io.on('connection', function (socket) {
    console.log('a user connected');
    var dataInterval;
    socket.on('steer', function (data) {
        board.steer(data);
    });

    socket.on('playSound', function (data) {
        play(data.sound, data.lng);
    });

    socket.on('disconnect', function () {
        console.log('a user disconnected');
        clearInterval(dataInterval);
    });

    socket.on('lngChange', function(){
        board.lngChange(data);
    });

    socket.emit('soundList', soundList);
    socket.emit('lngList', lngList);

    dataInterval = setInterval(function () {
        socket.emit('data', board.getData());
    }, 500);
});


http.listen(3000, function () {
    console.log('listening on *:3000');
});