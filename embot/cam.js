var exec = require('child_process').exec;

exports.start = function () {
    exec('./../mmal/startmotion', function (error, stdout, stderr) {
        console.log('starting camera', error, stdout, stderr);
    });
};

exports.stop = function () {
    exec('./../mmal/stopmotion', function (error, stdout, stderr) {
        console.log('stopping camera', error, stdout, stderr);
    });
};