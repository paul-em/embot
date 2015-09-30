var button1 = false; // drive
var button2 = false; // auto

var five = require("johnny-five");
var board = new five.Board();
var ready = false;
var manual = false;
var mapBuffer = [[], [], []];
var map = [null, null, null];
var motorConfigs = five.Motor.SHIELD_CONFIGS.ADAFRUIT_V1;
var leftMotor;
var rightMotor;
var action;
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
var LEFT = 'left';
var RIGHT = 'right';
var A = 'a';
var B = 'b';
var results = [];


board.on("ready", function () {
    if (ready) {
        console.log('board threw another ready event');
        return;
    }
    var that = this;
    board.on("info", function (event) {
        console.log("%s sent an 'info' message: %s", event.class, event.message);
    });
    board.on("warn", function (event) {
        console.log("%s sent a 'warn' message: %s", event.class, event.message);
    });
    board.on("fail", function (event) {
        console.log("%s sent a 'fail' message: %s", event.class, event.message);
    });

    ready = true;
    leftMotor = new five.Motor(motorConfigs.M1);
    rightMotor = new five.Motor(motorConfigs.M2);
    //leftMotor.forward(255);
    console.log('forward');


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
        encoderUpdate(RIGHT, A, voltage > 500);
    });

    this.analogRead(3, function (voltage) {
        encoderUpdate(RIGHT, B, voltage > 500);
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
    });

    var pingCenter = new five.Ping({
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

    setInterval(autoSteer, 300);

    function autoSteer() {
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

        if (manual || !button1) {
            return;
        }
        console.log(map);
        var closest = getClosest();
        if (closest && closest.dist < 30) {
            console.log('TOO CLOSE', closest);
            switch (closest.dir) {
                case 'left':
                    go(255, -255);
                    break;
                case 'center':
                    go(-255 * Math.random(), 255 * Math.random());
                    break;
                case 'right':
                    go(-255, 255);
                    break;
            }
        } else {
            var furthest = getFurthest();
            console.log('GO FAR', furthest);
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

function encoderUpdate(side, output, on) {
    var prev = encoder[side][output];
    if (prev !== on) {
        encoder[side][output] = on;
        if(output === A && on){
            if(encoder[side][B]){
                console.log(side + ': clockwise rotations');
                encoder[side].count++;
            } else {
                console.log(side + ': counterclockwise rotation');
                encoder[side].count--;
            }
        }
    }
}

function go(left, right) {
    if (button1 && leftMotor && rightMotor) {
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
            go(0, 255);
            break;
        case 'forwardRight':
            go(255, 0);
            break;
        case 'back':
            go(-255, -255);
            break;
        case 'backLeft':
            go(0, -255);
            break;
        case 'backRight':
            go(-255, 0);
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
    }
};