var five = require("johnny-five");
var board = new five.Board();
var dashboard = require("./dashboard");

var UP = 'up';
var DOWN = 'down';

var SERVO_MIN_DEG = 30;
var SERVO_MAX_DEG = 150;
var SERVO_STEPS = 30;
var SERVO_TIME = 200;

var map = [];
var motorConfigs = five.Motor.SHIELD_CONFIGS.ADAFRUIT_V1;
var lookingAt = 90;
var sweepDir = UP;

board.on("ready", function () {
    var servo = new five.Servo({
        pin: 10
    });
    var leftMotor = new five.Motor(motorConfigs.M1);
    var rightMotor = new five.Motor(motorConfigs.M2);
    var ping = new five.Ping(2);

  /*  var ping = new five.Proximity({
        controller: "HCSR04",
        pin: 2,
        freq: 500
    });*/
    servo.center();
    leftMotor.forward(255);
    rightMotor.forward(255);
    ping.on("change", pingData);
    sweep();
    setInterval(steer, 500);

    function steer(){
        var closest = getClosest();
        if (closest && closest.dist < 30) {
            console.log('PRETTY CLOSE! closest', closest);
            switch (closest.degree) {
                case 30:
                    leftMotor.forward(100);
                    rightMotor.reverse(255);
                    break;
                case 60:
                    leftMotor.reverse(100);
                    rightMotor.reverse(255);
                    break;
                case 90:
                    leftMotor.reverse(255);
                    rightMotor.reverse(100);
                    break;
                case 120:
                    leftMotor.reverse(255);
                    rightMotor.reverse(100);
                    break;
                case 150:
                    leftMotor.reverse(255);
                    rightMotor.forward(100);
                    break;
            }
        } else {
            var furthest = getFurthest();
            console.log('FORWARD! furthest', furthest);
            if (furthest !== null) {
                switch (furthest.degree) {
                    case 30:
                        leftMotor.forward(255);
                        rightMotor.forward(155);
                        break;
                    case 60:
                        leftMotor.forward(255);
                        rightMotor.forward(200);
                        break;
                    case 90:
                        leftMotor.forward(255);
                        rightMotor.forward(255);
                        break;
                    case 120:
                        leftMotor.forward(200);
                        rightMotor.forward(255);
                        break;
                    case 150:
                        leftMotor.forward(155);
                        rightMotor.forward(255);
                        break;
                }
            }
        }
    }

    function sweep() {
        if (lookingAt === SERVO_MIN_DEG || (sweepDir === UP && lookingAt !== SERVO_MAX_DEG)) {
            lookingAt += SERVO_STEPS;
            sweepDir = UP;
        } else {
            lookingAt -= SERVO_STEPS;
            sweepDir = DOWN;
        }
        servo.to(lookingAt);
        setTimeout(sweep, SERVO_TIME);
    }

    function getFurthest() {
        var furthest = -1;
        var furthestDist = 0;
        var t = Date.now();
        map.forEach(function (v, i) {
            if (v && v.t > t - 1000 && v.dist > furthestDist) {
                furthest = i;
                furthestDist = v.dist;
            }
        });
        if (furthest == -1) {
            return null;
        }
        return {
            degree: (furthest + 1) * SERVO_STEPS,
            dist: furthestDist
        }
    }

    function getClosest() {
        var closest = -1;
        var closestDist = 1000;
        var t = Date.now();
        map.forEach(function (v, i) {
            if (v && v.t > t - 1000 && v.dist < closestDist) {
                closest = i;
                closestDist = v.dist;
            }
        });
        if (closest == -1) {
            return null;
        }
        return {
            degree: (closest + 1) * SERVO_STEPS,
            dist: closestDist
        }
    }

    function pingData(){
        if (this.cm < 1000 && this.cm > 1) {
            map[(servo.value / SERVO_STEPS) - 1] = {
                dist: this.cm,
                t: Date.now()
            };
        }
    }


});
