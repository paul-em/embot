var five = require("johnny-five");
var board = new five.Board();

var drive = true;

var mapBuffer = [[], [], []];
var map = [null, null, null];
var motorConfigs = five.Motor.SHIELD_CONFIGS.ADAFRUIT_V1;
var manual = false;
var leftMotor;
var rightMotor;
var action;

board.on("ready", function () {

    leftMotor = new five.Motor(motorConfigs.M1);
    rightMotor = new five.Motor(motorConfigs.M2);

    /*
    var pingCenter = new five.Proximity({
        controller: "HCSR04",
        pin: 2,
        freq: 100
    });
    var pingRight = new five.Ping({
        controller: "HCSR04",
        pin: 5,
        freq: 100
    });
    var pingLeft = new five.Ping({
        controller: "HCSR04",
        pin: 6,
        freq: 100
    });
    pingCenter.on('data', pingCenterData);
    pingRight.on('data', pingRightData);
    pingLeft.on('data', pingLeftData);
*/
    setInterval(autoSteer, 500);

    function autoSteer() {
        if (manual) {
            return;
        }
        mapBuffer.forEach(function (buffer, dir) {
            if (buffer.length === 0) {
                map[dir] = null;
                return;
            }
            var c = 0;
            var total = 0;
            var lowest = 1000;
            var highest = 0;
            buffer.forEach(function (val) {
                var v = normalizePingData(val);
                if (v < lowest) {
                    lowest = v;
                }
                if (v > highest) {
                    highest = v;
                }
                total += v;
                c++;
            });
            map[dir] = Math.round((total - lowest - highest) / (c - 2));
        });
        mapBuffer = [[], [], []];


        var closest = getClosest();
        if (closest && closest.dist < 30) {
            //console.log('TOO CLOSE', closest);
            switch (closest.dir) {
                case 'left':
                    go(255, 100);
                    break;
                case 'center':
                    go(-255 * Math.random(), -255 * Math.random());
                    break;
                case 'right':
                    go(100, 255);
                    break;
            }
        } else {
            var furthest = getFurthest();
            //console.log('GO FAR', furthest);
            if (furthest !== null) {
                switch (furthest.dir) {
                    case 'left':
                        go(255, 155);
                        break;
                    case 'center':
                        go(255, 255);
                        break;
                    case 'right':
                        go(155, 255);
                        break;
                }
            }
        }
    }


    function getFurthest() {
        var furthest = -1;
        var furthestDist = 0;
        map.forEach(function (item, index) {
            if (item && item > furthestDist) {
                furthest = index;
                furthestDist = item;
            }
        });
        if (furthest == -1) {
            return null;
        }
        return {
            dir: getDir(furthest),
            dist: furthestDist
        }
    }

    function getClosest() {
        var closest = -1;
        var closestDist = 1000;
        map.forEach(function (item, index) {
            if (item && item < closestDist) {
                closestDist = item;
                closest = index;
            }
        });
        if (closest == -1) {
            return null;
        }

        return {
            dir: getDir(closest),
            dist: closestDist
        }
    }

    function getDir(index) {
        switch (index) {
            case 0:
                return 'left';
            case 1:
                return 'center';
            case 2:
                return 'right';
        }
        return null;
    }

    function pingCenterData() {
        mapBuffer[1].push(this.cm);
    }

    function pingRightData() {
        mapBuffer[2].push(this.cm);
    }

    function pingLeftData() {
        mapBuffer[0].push(this.cm);
    }

    function normalizePingData(raw) {
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

var timeout;
exports.steer = function (action) {
    manual = true;
    clearTimeout(timeout);
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
            timeout = setTimeout(function () {
                manual = false;
            }, 2000);
            break;
    }
};