var Mpg = require('mpg123');
var player = new Mpg();

module.exports = exports = function(sound, lng){
    console.log('playSound', sound, lng);
    player.play('./sounds/' + lng + '/' + sound + '.mp3');
};