var gulp = require('gulp');
var concat = require('gulp-concat');
var cleanCss = require('gulp-clean-css');
var image = require('gulp-image');
var uglify = require('gulp-uglify-es').default;
var watch = require('gulp-watch');
var imageResize = require('gulp-image-resize');
var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');
var pump = require('pump');

const { series } = require('gulp');
const { src, dest } = require('gulp');

function css() {
	return gulp.src
    ([
      'src/bootstrap/css/bootstrap.css',
      'node_modules/nprogress/nprogress.css',
      'node_modules/swipebox/src/css/swipebox.css',
      'node_modules/mapbox-gl/dist/mapbox-gl.css',
			'node_modules/cryptocoins-icons/webfont/cryptocoins.css',
			'node_modules/highlight.js/styles/dark.css',
      'src/print.css',
      'src/custom.css'
		])
    .pipe(concat('main.min.css'))
    .pipe(cleanCss())
    .pipe(gulp.dest('assets/css'));
}

function js(cb) {
  pump([
        gulp.src
        ([
          'node_modules/jquery/dist/jquery.js',
          'node_modules/slideout/dist/slideout.js'
        ]),
        concat('main.min.js'),
        uglify(),
        gulp.dest('assets/js')
    ],
    cb
  );
}

function jsPay(cb) {
  pump([
        gulp.src
        ([
					'node_modules/vue/dist/vue.min.js',
          'node_modules/axios/dist/axios.js',
          'node_modules/accounting/accounting.js'
        ]),
        concat('pay.min.js'),
        uglify(),
        gulp.dest('assets/js')
    ],
    cb
  );
}

function jsPersian(cb) {
  pump([
        gulp.src
        ([
					'node_modules/vue/dist/vue.js',
					'src/persian.js'
        ]),
        concat('persian.min.js'),
        uglify(),
        gulp.dest('assets/js')
    ],
    cb
  );
}

function jsBundle(cb) {
  pump([
        gulp.src
        ([
          'src/bootstrap/js/bootstrap.js',
          'node_modules/swipebox/src/js/jquery.swipebox.js',
          'node_modules/moment/min/moment.min.js',
          'node_modules/moment-timezone/builds/moment-timezone.min.js',
          'node_modules/exlink/jquery.exLink.js',
        ]),
        concat('bundle.min.js'),
        uglify(),
        gulp.dest('assets/js')
    ],
    cb
  );
}

function jsProgress() {
  return gulp.src
    ([
      'node_modules/nprogress/nprogress.js'
    ])
		.pipe(concat('nprogress.min.js'))
    .pipe(uglify())
		.pipe(gulp.dest('assets/js'));
}

function jsMapbox() {
  return gulp.src
    ([
      'src/mapbox.js'
    ])
		.pipe(concat('mapbox.min.js'))
    .pipe(uglify())
		.pipe(gulp.dest('assets/js'));
}

function jsMapboxGl() {
  return gulp.src
    ([
      'node_modules/mapbox-gl/dist/mapbox-gl.js'
    ])
		.pipe(concat('mapbox-gl.min.js'))
    .pipe(uglify())
		.pipe(gulp.dest('assets/js'));
}

function jsChart() {
  return gulp.src
    ([
      'node_modules/chart.js/dist/Chart.bundle.js'
    ])
		.pipe(concat('chart.bundle.min.js'))
    .pipe(uglify())
		.pipe(gulp.dest('assets/js'));
}

function filesSwipebox() {
    return gulp.src('node_modules/swipebox/src/img/*')
        .pipe(gulp.dest('assets/img/'));
}

function filesWebfont() {
    return gulp.src('node_modules/cryptocoins-icons/webfont/*')
        .pipe(gulp.dest('assets/fonts/'));
}

function filesHighlight() {
    return gulp.src('src/highlight.min.js')
        .pipe(gulp.dest('assets/js'));
}

function filesComments() {
    return gulp.src('src/comments.css')
        .pipe(gulp.dest('assets/css'));
}

function thumbnail() {
  return gulp.src('assets/images/projects/*.{jpg,png}')
    .pipe(imageResize({
      width : 640,
      height : 360,
      crop : true
    }))
    .pipe(imagemin({
      progressive: true,
      use: [pngquant()]
    }))
    .pipe(gulp.dest('assets/images/projects/preview'));
}

function watch() {
    gulp.watch('src/*.css', ['css'])
}

function watchPersian() {
    gulp.watch('src/*.js', ['js-persian'])
}

exports.default = series(css, js, jsBundle, jsProgress, jsMapbox, jsMapboxGl, jsChart, filesSwipebox, filesWebfont, filesHighlight, filesComments, thumbnail)
