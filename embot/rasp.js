var five = require("johnny-five");
var Raspi = require('raspi-io');

var board = five.Board({
    io: new Raspi()
});

board.on("ready", function () {
    console.log('ready!!');
    var prox = new five.Proximity({
        controller: "HCSR04",
        pin: 7
    });
    prox.on('data', function(v){
        console.log(v);
    })

    /*
    var pin = new five.Pin("P1-13");

    pin.read(function(state) {
        console.log('pin', state);
    });


    var motion = new five.Motion({
        pin: "P1-13"
    });
    motion.on('calibrated', function(a){
        console.log('calibrated', a)
    });
    motion.on('motionstart', function(a){
        console.log('motionstart', a)
    });
    motion.on('motionend', function(a){
        console.log('motionend', a)
    });
    motion.on('data ', function(a){
        console.log('data ', a)
    });
    motion.on('change  ', function(a){
        console.log('change  ', a)
    });*/
});
