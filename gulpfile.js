const gulp         = require('gulp');
const sass         = require('gulp-sass')(require('sass'));
const del          = require('del');
const rename       = require("gulp-rename");
const uglify       = require('gulp-uglify');
const concat       = require('gulp-concat');
const sourcemaps   = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer'); 
const babel        = require('gulp-babel');
const imagemin     = require('gulp-imagemin');
const newer        = require('gulp-newer');
const size         = require('gulp-size');
const browserSync  = require('browser-sync').create();

const paths = {
    styles: {
        src: 'src/styles/**/*.scss',
        dest: 'assets/css'
    },
    scripts: {
        src: 'src/js/**/*.js',
        dest: 'assets/js'
    },
    stylesLibs: {
        src: 'node_modules/swiper/swiper-bundle.css',
        dest: 'src/styles/base-styles'
    },
    scriptsLibs: {
        src: 'node_modules/swiper/swiper-bundle.min.js',
        dest: 'assets/js'
    },
    images: {
        src: 'src/images/**',
        dest: 'assets/images/'
    },
    fonts: {
        src: 'src/fonts/**',
        dest: 'assets/fonts/'
    }
}

// Clean Assets
function clean () {
    return del('assets/*', '!assets/images');
}
 
// Task Build Styles
function styles () {
    return gulp.src(paths.styles.src)
    .pipe(sourcemaps.init())
    .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(autoprefixer({
        cascade: false
    }))
    .pipe(rename({
        basename: 'main',
        suffix: '.min'
    }))
    .pipe(sourcemaps.write('./'))
    .pipe(size({
        showFiles: true
    }))
    .pipe(gulp.dest(paths.styles.dest))
    .pipe(browserSync.stream());
}

// Scripts build
function scripts() {
    return gulp.src(paths.scripts.src)
    .pipe(sourcemaps.init())
    .pipe(babel({
        presets: ['@babel/env']
    }))
    .pipe(uglify())
    .pipe(concat('main.min.js'))
    .pipe(sourcemaps.write('./'))
    .pipe(size({
        showFiles: true
    }))
    .pipe(gulp.dest(paths.scripts.dest))
    .pipe(browserSync.stream());
}

function stylesLibs () {
    return gulp.src(paths.stylesLibs.src)
    .pipe(concat('_libs.scss'))
    .pipe(gulp.dest(paths.stylesLibs.dest))
    .pipe(browserSync.stream());
} 
function scriptsLibs () {
    return gulp.src(paths.scriptsLibs.src)
    .pipe(concat('libs.min.js'))
    .pipe(gulp.dest(paths.scriptsLibs.dest))
    .pipe(browserSync.stream());
} 

// Images optimaze
function imgOptimaze() {
    return gulp.src(paths.images.src)
    .pipe(newer(paths.images.dest))
    // .pipe(imagemin({
    //     progressive: true
    // }))
    .pipe(imagemin([
        imagemin.gifsicle({interlaced: true}),
        imagemin.mozjpeg({quality: 75, progressive: true}),
        imagemin.optipng({optimizationLevel: 5}),
        imagemin.svgo({
            plugins: [
                {removeViewBox: true},
                {cleanupIDs: false}
            ]
        })
    ]))
    .pipe(size({
        showFiles: true
    }))
    .pipe(gulp.dest(paths.images.dest))
}

//  Fonts
function fonts() {
    return gulp.src(paths.fonts.src)
    .pipe(gulp.dest(paths.fonts.dest))
}

function watch() {
    browserSync.init({
        server: {
            baseDir: "./"
        }
    });
    gulp.watch("./*.html").on('change', browserSync.reload);
    gulp.watch(paths.styles.src, styles)
    gulp.watch(paths.scripts.src, scripts)
    gulp.watch(paths.images.src, imgOptimaze)
    gulp.watch(paths.fonts.src, fonts)
}

const build = gulp.series(clean, gulp.parallel(styles,scripts,stylesLibs,scriptsLibs,imgOptimaze,fonts),watch);

exports.clean       = clean
exports.styles      = styles
exports.watch       = watch
exports.scripts     = scripts
exports.imgOptimaze = imgOptimaze
exports.fonts       = fonts
exports.stylesLibs  = stylesLibs
exports.scriptsLibs  = scriptsLibs
exports.build       = build
exports.default     = build