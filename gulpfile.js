var gulp = require('gulp');
var sftp = require('gulp-sftp');
var credentials = require('./.credentials.json');

gulp.task('default', function(){
    return gulp.src('embot/*.*')
        .pipe(sftp(credentials.first))
});

gulp.task('u', function(){
    return gulp.src('embot/*.*')
        .pipe(sftp(credentials.second))
});

gulp.task('watch', ['default'], function(){
    return gulp.watch('embot/*.*', ['default'])
});

gulp.task('watchu',['u'], function(){
    return gulp.watch('embot/*.*', ['u'])
});