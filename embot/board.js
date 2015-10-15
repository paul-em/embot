var driveDisabled = false;
var lang = 'en';

var button1 = false; // drive
var button2 = false; // auto

var five = require("johnny-five");
var play = require('./play');
var board = new five.Board();
var that;
var ready = false;
var manual = false;
var motorConfigs = five.Motor.SHIELD_CONFIGS.ADAFRUIT_V1;
var sendingPing = false;
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
var CENTER = 'center';
var A = 'a';
var B = 'b';
var results = [];
var pingData = [];
var unChanged = 0;

var SIDES = [LEFT, CENTER, RIGHT];

var soundTimeout = setTimeout(function () {
    play('14', lang);
}, 20 * 1000);


board.on("ready", function () {
    if (ready) {
        console.log('board threw another ready event');
        return;
    }
    that = this;
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
        if (voltage < 10) {
            if (!button1 && !button2) {
                return;
            }
            button1 = false;
            button2 = false;
        } else if (voltage < 100) {
            if (button1 && !button2) {
                return;
            }
            button1 = true;
            button2 = false;
        } else if (voltage < 162) {
            if (!button1 && button2) {
                return;
            }
            button1 = false;
            button2 = true;
        } else {
            if (button1 && button2) {
                return;
            }
            button1 = true;
            button2 = true;
        }
        play('01', lang);
        console.log('drive', button1, 'auto', button2);
    });

    autoSteer();
    function autoSteer() {
        if (manual || !button2 || !button1 || driveDisabled) {
            if (!manual) {
                go(0, 0);
            }
            setTimeout(autoSteer, 300);
            return;
        }
        // stop
        go(0, 0);

        // send pings
        sendingPing = true;
        var t = new Date().getTime();
        pingAll().then(function (data) {
            sendingPing = false;
            console.log(data, Date.now() - t);
            if (similar(pingData, data)) {
                unChanged++;
            } else {
                unChanged = 0;
            }
            console.log('unchanged', unChanged);
            if (unChanged > 5) {
                // stuck somewhere
                go(-255, -255);
            } else {
                pingData = data;
                var closest = null;
                var closestVal = null;
                var furthest = null;
                var furthestVal = null;
                data.forEach(function (dist, index) {
                    if (closestVal === null || dist < closestVal) {
                        closestVal = dist;
                        closest = index;
                    }
                    if (furthestVal === null || dist > furthestVal) {
                        furthestVal = dist;
                        furthest = index;
                    }
                });


                if (closestVal < 20) {
                    console.log("OMG REALLY CLOSE ON", SIDES[closest]);
                    if (SIDES[closest] === LEFT) {
                        go(255, -255);
                    } else if (SIDES[closest] === RIGHT) {
                        go(-255, 255);
                    } else {
                        go(-255, 0);
                        play('16', lang);
                    }
                } else {
                    console.log("GO FAR TO", SIDES[furthest]);
                    if (SIDES[furthest] === LEFT) {
                        go(100, 255);
                    } else if (SIDES[furthest] === RIGHT) {
                        go(255, 100);
                    } else {
                        go(255, 255);
                        play('30', lang);
                    }
                }
            }
            setTimeout(autoSteer, 300);

        })
    }
});

function similar(arr1, arr2) {
    return !arr1.some(function (val1, index) {
        return Math.abs(val1 - arr2[index]) > 10;
    });
}

function encoderUpdate(side, output, on) {
    var prev = encoder[side][output];
    if (prev !== on) {
        encoder[side][output] = on;
        if (output === A && on) {
            if (encoder[side][B]) {
                //console.log(side + ': clockwise rotations');
                encoder[side].count++;
            } else {
                // console.log(side + ': counterclockwise rotation');
                encoder[side].count--;
            }
        }
    }
}

function pingAll() {
    return Promise.all([
        ping(5),
        ping(2),
        ping(6)
    ]);
}

function ping(pin) {
    return new Promise(function (resolve, reject) {
        that.io.pingRead({
            pin: pin,
            value: that.io.HIGH,
            pulseOut: 5
        }, function (microseconds) {
            resolve(parseInt(microseconds / 29.1 / 2));
        });
    });
}

function go(left, right) {
    if (sendingPing) {
        setTimeout(function () {
            go(left, right);
        }, 20);
        return;
    }
    if (soundTimeout && (left !== 0 || right !== 0)) {
        clearTimeout(soundTimeout);
        soundTimeout = null;
    }
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
    } else if (!button1) {
        leftMotor.stop();
        rightMotor.stop();
    }
    action = {
        left: left,
        right: right
    }
}

exports.pingAll = function () {
    pingAll().then(function(data){
        console.log('got data', data);
        pingData = data;
    })
};

exports.lngChange = function (lng) {
    lang = lng;
};

exports.getData = function () {
    return {
        sonar: pingData
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