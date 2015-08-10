var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var board = require('./board');

app.get('/', function(req, res){
    res.sendFile(path.resolve('./index.html'));
});

io.on('connection', function(socket){
    console.log('a user connected');
    socket.on('ctrl-change', function(data){
        console.log('ctrl change', data);
        board.ctrlChange(data);
    });

    socket.on('ctrl', function(data){
        console.log('ctrl change', data);
        board.ctrl(data);
    });
});


http.listen(3000, function(){
    console.log('listening on *:3000');
});