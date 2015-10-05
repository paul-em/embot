var five = require("johnny-five");

var board = new five.Board();

board.on("ready", function () {
    var motion = new five.Motion({
        pin: 7
    });

    motion.on('change', function(){
        console.log(arguments);
    })
});