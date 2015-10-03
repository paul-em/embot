var driveDisabled = false;

var button1 = false; // drive
var button2 = false; // auto

var five = require("johnny-five");
var board = new five.Board();

var LEFT = 'left';
var RIGHT = 'right';
var A = 'a';
var B = 'b';
var encoder = {
    left: {
        A: false,
        B: false,
        count: 0
    },
    right: {
        A: false,
        B: false,
        count: 0
    }
};

var leftMotor, rightMotor;
var motorConfigs = five.Motor.SHIELD_CONFIGS.ADAFRUIT_V1;

board.on("ready", function () {
    leftMotor = new five.Motor(motorConfigs.M1);
    rightMotor = new five.Motor(motorConfigs.M2);


    this.pinMode(0, five.Pin.ANALOG);
    this.pinMode(1, five.Pin.ANALOG);
    this.pinMode(2, five.Pin.ANALOG);
    this.pinMode(3, five.Pin.ANALOG);

    this.analogRead(0, function (voltage) {
        encoderUpdate(LEFT, A, voltage > 500);
    });

    this.analogRead(1, function (voltage) {
        encoderUpdate(LEFT, B, voltage > 500);
    });

    this.analogRead(2, function (voltage) {
        encoderUpdate(RIGHT, B, voltage > 500);
    });

    this.analogRead(3, function (voltage) {
        encoderUpdate(RIGHT, A, voltage > 500);
    });

    this.analogRead(4, function (voltage) {
        if(voltage < 10){
            if(!button1 && !button2){
                return;
            }
            button1 = false;
            button2 = false;
        } else if(voltage < 100){
            if(button1 && !button2){
                return;
            }
            button1 = true;
            button2 = false;
        } else if(voltage < 162){
            if(!button1 && button2){
                return;
            }
            button1 = false;
            button2 = true;
        } else {
            if(button1 && button2){
                return;
            }
            button1 = true;
            button2 = true;
        }
        if(button1){
            leftMotor.forward();
        } else {
            leftMotor.stop();
        }
        if(button2){
            rightMotor.forward();
        } else {
            rightMotor.stop();
        }
        console.log('drive', button1, 'auto', button2);
    });
});


function encoderUpdate(side, output, on) {
    var prev = encoder[side][output];
    if (prev !== on) {
        encoder[side][output] = on;
        if(output === A && on){
            if(encoder[side][B]){
                encoder[side].count++;
                console.log(side + ': clockwise rotations', encoder[side].count);
            } else {
                encoder[side].count--;
                console.log(side + ': counterclockwise rotation', encoder[side].count);
            }
        }
    }
}