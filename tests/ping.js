var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function () {

    // Create a new `ping` hardware instance.
    var ping = new five.Ping(7);
    var piezo = new five.Piezo(3);

    // Properties

    // ping.in/ping.inches
    //
    // Calculated distance to object in inches
    //

    // ping.cm
    //
    // Calculated distance to object in centimeters
    //


    ping.on("change", function () {
        console.log("Object is " + this.cm + " cm away");
        if (this.cm < 10) {
            piezo.frequency(262, 200);
        } else {
            piezo.off();
        }
    });

    setTimeout(function () {
        piezo.off();
        process.exit(0);
    }, 10000);
});