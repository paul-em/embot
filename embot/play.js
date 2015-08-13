var Mpg = require('mpg123');
var player = new Mpg();

module.exports = exports = function(num){
    console.log('playSound', num);
    num = num + '';
    if(num.length === 1){
        num = '0' + num;
    }
    player.play('./sounds/' + num + '.mp3');
};