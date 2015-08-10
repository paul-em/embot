var gulp = require('gulp');
var sftp = require('gulp-sftp');

var config = {
    host: '192.168.0.34',
    user: 'pi',
    pass: 'pd8hkjzn',
    remotePath: '/home/pi/robot/'
};
var config2 = {
    host: '192.168.1.23',
    user: 'pi',
    pass: 'pd8hkjzn',
    remotePath: '/home/pi/robot/'
};

gulp.task('default', function(){
    return gulp.src('mybot.js')
        .pipe(sftp(config))
});

gulp.task('u', function(){
    return gulp.src('mybot.js')
        .pipe(sftp(config2))
});

gulp.task('watch', function(){
    return gulp.watch('mybot.js', ['default'])
});

gulp.task('watchu', function(){
    return gulp.watch('mybot.js', ['u'])
});