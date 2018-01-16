var gulp = require('gulp');
var plumber = require('gulp-plumber');
var bs = require('browser-sync').create(); // create a browser sync instance.
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');

gulp.task('browser-sync', function() {
  bs.init({
    server: {
      baseDir: "./"
    }
  });
});

gulp.task('bs-reload', function () {
  bs.reload();
});

gulp.task('styles', function(){
  gulp.src(['library/scss/**/*.scss'])
    .pipe(plumber({
      errorHandler: function (error) {
        console.log(error.message);
        this.emit('end');
    }}))
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('library/css/'))
    .pipe(bs.reload({stream:true}))
});

gulp.task('default', ['browser-sync'], function(){
  gulp.watch("library/scss/*.scss", ['styles']);
  gulp.watch("library/js/*.js", ['bs-reload']);
});