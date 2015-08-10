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

gulp.task('watch', function(){
    return gulp.watch('embot/*.*', ['default'])
});

gulp.task('watchu', function(){
    return gulp.watch('embot/*.*', ['u'])
});