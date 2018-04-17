var gulp = require('gulp');
var concat = require('gulp-concat');
var cleanCss = require('gulp-clean-css');
var image = require('gulp-image');
var uglify = require('gulp-uglify-es').default;
var watch = require('gulp-watch');
var pump = require('pump');

gulp.task('css', function () {
	return gulp.src
    ([
      'src/bootstrap/css/bootstrap.css',
      'node_modules/nprogress/nprogress.css',
      'node_modules/swipebox/src/css/swipebox.css',
      'node_modules/mapbox-gl/dist/mapbox-gl.css',
			'node_modules/cryptocoins-icons/webfont/cryptocoins.css',
			'node_modules/highlight.js/styles/monokai-sublime.css',
      'src/print.css',
      'src/custom.css'
		])
    .pipe(concat('main.min.css'))
    .pipe(cleanCss())
    .pipe(gulp.dest('assets/css'));
});

gulp.task('js', function (cb) {
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
});

gulp.task('js-particles', function (cb) {
  pump([
        gulp.src
        ([
          'src/particles.js'
        ]),
        concat('particles.min.js'),
        uglify(),
        gulp.dest('assets/js')
    ],
    cb
  );
});

gulp.task('js-pay', function (cb) {
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
});

gulp.task('js-persian', function (cb) {
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
});

gulp.task('js-bundle', function (cb) {
  pump([
        gulp.src
        ([
          'src/bootstrap/js/bootstrap.js',
          'node_modules/swipebox/src/js/jquery.swipebox.js',
          'node_modules/moment/min/moment.min.js',
          'node_modules/moment-timezone/builds/moment-timezone.min.js',
          'node_modules/simpleweather/jquery.simpleWeather.js',
          'node_modules/exlink/jquery.exLink.js'
        ]),
        concat('bundle.min.js'),
        uglify(),
        gulp.dest('assets/js')
    ],
    cb
  );
});

gulp.task('js-progress', function () {
  return gulp.src
    ([
      'node_modules/nprogress/nprogress.js'
    ])
		.pipe(concat('nprogress.min.js'))
    .pipe(uglify())
		.pipe(gulp.dest('assets/js'));
});

gulp.task('js-mapbox', function () {
  return gulp.src
    ([
      'src/mapbox.js'
    ])
		.pipe(concat('mapbox.min.js'))
    .pipe(uglify())
		.pipe(gulp.dest('assets/js'));
});

gulp.task('js-mapbox-gl', function () {
  return gulp.src
    ([
      'node_modules/mapbox-gl/dist/mapbox-gl.js'
    ])
		.pipe(concat('mapbox-gl.min.js'))
    .pipe(uglify())
		.pipe(gulp.dest('assets/js'));
});

gulp.task('js-chart', function () {
  return gulp.src
    ([
      'node_modules/chart.js/dist/Chart.bundle.js'
    ])
		.pipe(concat('chart.bundle.min.js'))
    .pipe(uglify())
		.pipe(gulp.dest('assets/js'));
});

gulp.task('files', function () {
    gulp.src('node_modules/swipebox/src/img/*')
        .pipe(gulp.dest('assets/img/'));
		gulp.src('node_modules/cryptocoins-icons/webfont/*')
        .pipe(gulp.dest('assets/fonts/'));
		gulp.src('src/highlight.min.js')
        .pipe(gulp.dest('assets/js'));
		gulp.src('src/comments.css')
        .pipe(gulp.dest('assets/css'));
});

gulp.task('watch', function() {
    gulp.watch('src/*.css', ['css'])
});

gulp.task('watch-persian', function() {
    gulp.watch('src/*.js', ['js-persian'])
});

gulp.task('default', ['css', 'js', 'js-bundle', 'js-progress', 'js-particles', 'js-mapbox', 'js-mapbox-gl', 'js-chart', 'files']);
