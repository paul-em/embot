var Mpg = require('mpg123');
var player = new Mpg();
var path = require('path');

module.exports = exports = function(sound, lng){
    console.log('playSound', sound, lng);
    player.play(path.join(__dirname, '/sounds/' + lng + '/' + sound + '.mp3'));
};