const gulp = require('gulp');
const plumber = require('gulp-plumber');
const htmlPartial = require('./gulp-html-partial');

const baseSrcPath = './src';
const baseDistPath = './dist';

// HTML
gulp.task('html', function () {
    gulp.src([baseSrcPath + '/*.html'])
        .pipe(plumber())
        .pipe(htmlPartial({
            basePath: baseSrcPath + '/partials/'
        }))
        .pipe(gulp.dest(baseDistPath));
});

// Task for `gulp` command
gulp.task('default', ['html']);