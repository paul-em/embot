var five = require("johnny-five");
var board = new five.Board();
var state = false;
var c = 0;
board.on("ready", function () {
    console.log('ready');
    var led = new five.Led(13);

    setInterval(function () {
        c++;
        state = !state;
        console.log('switching state to ' + state);
        state ? led.on() : led.off();
        if(c > 10){
            process.exit(0);
        }
    }, 200);
});
console.log('\nstarting...');