import pkg from 'gulp';
import del from 'gulp-clean';
import cache from 'gulp-cache';
import browserSync from 'browser-sync';
import rigger from 'gulp-rigger';
import autoprefixer from 'gulp-autoprefixer';
import dartSass from 'sass';
import gulpSass from 'gulp-sass';
import purge from 'gulp-css-purge';
import concat from 'gulp-concat';
import minifyCss from 'gulp-clean-css';
import jsValidate from 'gulp-jsvalidate';
import babel from 'gulp-babel';
import uglify from 'gulp-uglify';
import imagemin from 'gulp-imagemin';

const { src, dest, watch, series, parallel } = pkg, { create } = browserSync,
sass = gulpSass(dartSass);

function clean() {
    return src(['app/build/css/*', 'app/build/js/*', 'app/build/*.html'], { read: false })
        .pipe(del());
}

function clearCache() {
    return cache.clearAll();
}

function fonts() {
    return src('app/src/assets/fonts/**/*.{eot,svg,ttf,woff,woff2}')
        .pipe(dest('app/build/assets/fonts/'));
}

function images() {
    return src('app/src/assets/img/**/*')
        .pipe(imagemin())
        .pipe(dest('app/build/assets/img'));
}

function html() {
    return src('app/src/*.html')
        .pipe(rigger())
        .pipe(dest('app/build'))
        .pipe(browserSync.stream());
}

function css() {
    return src('app/src/scss/style.scss')
        .pipe(autoprefixer({
            cascade: false
        }))
        .pipe(sass().on('error', sass.logError))
        .pipe(purge())
        .pipe(concat('main.css'))
        .pipe(minifyCss())
        .pipe(dest('app/build/css'))
        .pipe(browserSync.stream());
}

function javascript() {
    return src('app/src/js/**/*.js')
        .pipe(jsValidate())
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(concat('main.js'))
        .pipe(uglify())
        .pipe(dest('app/build/js'))
        .pipe(browserSync.stream());
}

const build = function() {
    browserSync.init({
        server: { baseDir: "app/build" }
    });
    watch(['app/src/html/*.html', 'app/src/scss/**/*.scss', 'app/src/js/**/*.js'],
            series(
                clean,
                // clearCache,
                fonts,
                images,
                parallel(html, css, javascript)))
        .on('change', timeForBrowserSync);
};

const timeForBrowserSync = function() {
    setTimeout(browserSync.reload, 3000);
};

export { build as default };