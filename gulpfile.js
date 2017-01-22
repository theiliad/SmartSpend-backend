var gulp = require('gulp');

var gulpTypescript = require('gulp-typescript');
var gulpSourcemaps = require('gulp-sourcemaps');

var del = require('del');

var appDev = 'assets/app/';
var appProd = 'public/js/app/';
var nodeModules = 'public/node_modules';

var tsconfig = gulpTypescript.createProject('tsconfig.json');

gulp.task('nodeModules', function() {
    gulp.src('node_modules/**')
        .pipe(gulp.dest(nodeModules));
});

gulp.task('default', ['nodeModules']);
gulp.task('build', ['nodeModules']);