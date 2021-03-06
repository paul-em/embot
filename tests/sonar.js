var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {

    // Create a new `ping` hardware instance.
    var ping = new five.Proximity({
        controller: "HCSR04",
        pin: 7
    });

    // Properties

    // ping.in/ping.inches
    //
    // Calculated distance to object in inches
    //

    // ping.cm
    //
    // Calculated distance to object in centimeters
    //


    ping.on("change", function() {
        console.log("Object is " + this.in + " inches away");
    });
});