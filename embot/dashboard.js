var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var board = require('./board');
var play = require('./play');

app.get('/', function(req, res){
    res.sendFile(path.resolve('./index.html'));
});

io.on('connection', function(socket){
    console.log('a user connected');
    var dataInterval;
    socket.on('steer', function(data){
        board.steer(data);
    });

    socket.on('playSound', function(num){
        play(num);
    });

    socket.on('disconnect', function(){
        console.log('a user disconnected');
    });

    dataInterval = setInterval(function(){
        socket.emit('data', board.getData());
    }, 500);
});


http.listen(3000, function(){
    console.log('listening on *:3000');
});