var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function () {
    var led = new five.Led(13);
    var pin = new five.Pin(7);
    setInterval(function () {
        pin.read(function (err, val) {
            console.log(err, val);
            if (val) {
                led.on();
            } else {
                led.off();
            }
        });
    }, 1000);
    setTimeout(function () {
        process.exit(0);
    }, 10000);
});