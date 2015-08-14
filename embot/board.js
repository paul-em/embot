var five = require("johnny-five");
var board = new five.Board();

var drive = true;


var map = [null, null, null];
var motorConfigs = five.Motor.SHIELD_CONFIGS.ADAFRUIT_V1;
var manual = false;
var leftMotor;
var rightMotor;
var action;

board.on("ready", function () {

    leftMotor = new five.Motor(motorConfigs.M1);
    rightMotor = new five.Motor(motorConfigs.M2);

    var pingCenter = new five.Ping({
        pin: 2
    });
    var pingRight = new five.Ping({
        pin: 5
    });
    var pingLeft = new five.Ping({
        pin: 6
    });
    pingCenter.on('data', pingCenterData);
    pingRight.on('data', pingRightData);
    pingLeft.on('data', pingLeftData);



    function autoSteer() {
        if (manual) {
            return;
        }
        if (Math.random() < 0.1) {
            // do random walk back to avoid getting stuck
            // go(-100, -255);
            // return;
        }
        var closest = getClosest();
        if (closest && closest.dist < 30) {
            console.log('TOO CLOSE', closest);
            switch (closest.degree) {
                case 30:
                    go(255, 100);
                    break;
                case 60:
                    go(255, 0);
                    break;
                case 90:
                    go(-255 * Math.random(), -255 * Math.random());
                    break;
                case 120:
                    go(0, 255);
                    break;
                case 150:
                    go(100, 255);
                    break;
            }
        } else {
            var furthest = getFurthest();
            console.log('GO FAR', furthest);
            if (furthest !== null) {
                switch (furthest.degree) {
                    case 30:
                        go(255, 155);
                        break;
                    case 60:
                        go(255, 200);
                        break;
                    case 90:
                        go(255, 255);
                        break;
                    case 120:
                        go(200, 255);
                        break;
                    case 150:
                        go(155, 255);
                        break;
                }
            }
        }
        console.log(action);
    }


    function getFurthest() {
        var furthest = -1;
        var furthestDist = 0;
        for (var i in map) {
            if (map[i] && map[i] > furthestDist) {
                furthest = i;
                furthestDist = map[i];
            }
        }
        if (furthest == -1) {
            return null;
        }
        return {
            degree: parseInt(furthest),
            dist: furthestDist
        }
    }

    function getClosest() {
        var closest = -1;
        var closestDist = 1000;
        for (var i in map) {
            if (map[i] && map[i] < closestDist) {
                closest = i;
                closestDist = map[i];
            }
        }
        if (closest == -1) {
            return null;
        }
        return {
            degree: parseInt(closest),
            dist: closestDist
        }
    }


    function pingCenterData() {
        map[1] = normalizePingData(this.cm);
    }
    function pingRightData() {
        map[2] = normalizePingData(this.cm);
    }
    function pingLeftData() {
        map[0] = normalizePingData(this.cm);
    }

    function normalizePingData(raw){
        var dist = raw;
        if (dist > 200) {
            dist = 200;
        }
        return Math.round(dist);
    }
});

function go(left, right) {
    if (drive && leftMotor && rightMotor) {
        if (left < 0) {
            leftMotor.reverse(Math.abs(left));
        } else {
            leftMotor.forward(left);
        }
        if (right < 0) {
            rightMotor.reverse(Math.abs(right));
        } else {
            rightMotor.forward(right);
        }
    }
    action = {
        left: left,
        right: right
    }
}

exports.getData = function () {
    return {
        sonar: map
    };
};


exports.steer = function (action) {
    console.log('steer ' + action);
    switch (action) {
        case 'forward':
            go(255, 255);
            break;
        case 'forwardLeft':
            go(150, 255);
            break;
        case 'forwardRight':
            go(255, 150);
            break;
        case 'back':
            go(-255, -255);
            break;
        case 'backLeft':
            go(-150, -255);
            break;
        case 'backRight':
            go(-255, -150);
            break;
        case 'left':
            go(-255, 255);
            break;
        case 'right':
            go(255, -255);
            break;
        case 'stop':
            go(0, 0);
            break;
    }
};