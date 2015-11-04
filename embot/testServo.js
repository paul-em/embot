var five = require("johnny-five");
var board = new five.Board();
board.on("ready", function () {
    var servo = new five.Servo(9);

    servo.sweep();
});