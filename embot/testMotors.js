var five = require("johnny-five");
var board = new five.Board();
var motorConfigs = five.Motor.SHIELD_CONFIGS.ADAFRUIT_V1;
board.on("ready", function () {

    var leftMotor = new five.Motor(motorConfigs.M1);
    var rightMotor = new five.Motor(motorConfigs.M2);

    console.log('forward');
    leftMotor.forward(255);
    rightMotor.forward(255);

    board.wait(2000, function(){
        console.log('reverse');
        leftMotor.reverse(255);
        rightMotor.reverse(255);
        board.wait(2000, function(){
            console.log('stop'); 
            leftMotor.stop();
            rightMotor.stop();
        });
    })
});