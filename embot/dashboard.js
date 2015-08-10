var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
    res.sendFile('./index.html');
});

io.on('connection', function(socket){
    console.log('a user connected');
    socket.on('ctrl-change', function(data){
        console.log('ctrl change', data);
    });
});


http.listen(3000, function(){
    console.log('listening on *:3000');
});