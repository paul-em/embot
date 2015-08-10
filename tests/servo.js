var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {
    var servo = new five.Servo(10);


    servo.center();

    // Servo alternate constructor with options
    /*
     var servo = new five.Servo({
     id: "MyServo",     // User defined id
     pin: 10,           // Which pin is it attached to?
     type: "standard",  // Default: "standard". Use "continuous" for continuous rotation servos
     range: [0,180],    // Default: 0-180
     fps: 100,          // Used to calculate rate of movement between positions
     invert: false,     // Invert all specified positions
     startAt: 90,       // Immediately move to a degree
     center: true,      // overrides startAt if true and moves the servo to the center of the range
     specs: {           // Is it running at 5V or 3.3V?
     speed: five.Servo.Continuous.speeds["@5.0V"]
     }
     });
     */

    return;
    // Add servo to REPL (optional)
    this.repl.inject({
        servo: servo
    });


    // Servo API

    // min()
    //
    // set the servo to the minimum degrees
    // defaults to 0
    //
    // eg. servo.min();

    // max()
    //
    // set the servo to the maximum degrees
    // defaults to 180
    //
    // eg. servo.max();

    // center()
    //
    // centers the servo to 90°
    //
    // servo.center();

    // to( deg )
    //
    // Moves the servo to position by degrees
    //
    // servo.to( 90 );

    // step( deg )
    //
    // step all servos by deg
    //
    // eg. array.step( -20 );

    servo.sweep();



    var piezo = new five.Piezo(3);

    // Injects the piezo into the repl
    board.repl.inject({
        piezo: piezo
    });

    // Plays a song
    piezo.play({
        // song is composed by an array of pairs of notes and beats
        // The first argument is the note (null means "no note")
        // The second argument is the length of time (beat) of the note (or non-note)
        song: [
            ["C4", 1 / 4],
            ["D4", 1 / 4],
            ["F4", 1 / 4],
            ["D4", 1 / 4],
            ["A4", 1 / 4],
            [null, 1 / 4],
            ["A4", 1],
            ["G4", 1],
            [null, 1 / 2],
            ["C4", 1 / 4],
            ["D4", 1 / 4],
            ["F4", 1 / 4],
            ["D4", 1 / 4],
            ["G4", 1 / 4],
            [null, 1 / 4],
            ["G4", 1],
            ["F4", 1],
            [null, 1 / 2]
        ],
        tempo: 100
    });

    // Plays the same song with a string representation
    piezo.play({
        // song is composed by a string of notes
        // a default beat is set, and the default octave is used
        // any invalid note is read as "no note"
        song: "C D F D A - A A A A G G G G - - C D F D G - G G G G F F F F - -",
        beats: 1 / 4,
        tempo: 100
    });
});
