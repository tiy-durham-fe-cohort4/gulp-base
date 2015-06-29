// Import all packages needed for the build
var gulp = require('gulp');
var ghPages = require('gulp-gh-pages');
var browserify = require('browserify');
var rename = require('gulp-rename');
var bulkify = require('bulkify');
var concat = require('gulp-concat');
var shell = require('gulp-shell');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var hashify = require('gulp-hashify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var tap = require('gulp-tap');
var del = require('del');
var watch = require('gulp-watch');
var sourcemaps = require('gulp-sourcemaps');

// Common patterns used throughout the gulp configuration
var src = {
  allHtml: './src/**/*.html',
  allViews: './src/views/**/*.html',
  allJs: './src/**/*.js',
  allFont: './src/**/*.{ttf,woff,otf,eot}',
  allScss: './src/**/*.scss',
  allImg: './src/**/*.{jpg,png,svg,gif,ico}'
};

// The default task is what runs when you type 'gulp' in the terminal
gulp.task('default', ['clean'], function () {
  return gulp.start('html', 'img', 'font', 'js:views', 'js:vendor', 'js', 'scss', 'watch', 'reload', 'serve');
});

// We will use Python to serve our static assets
gulp.task('serve', shell.task(['python3 manage.py runserver']));

// The watch task watches a directory for changes and tells the
// browser(s) connected to the server to refresh. I also made this name
// up. In fact, the only name that has intrinsic meaning to gulp is the
// 'default' task.
gulp.task('watch', function () {
  watch(src.allHtml, function () {
    gulp.start('html', 'js:views');
  });

  watch(src.allJs, function () {
    gulp.start('js');
  });

  watch(src.allScss, function () {
    gulp.start('scss');
  });
  
  watch(src.allImg, function () {
    gulp.start('img');
  });
  
  watch(src.allFont, function () {
    gulp.start('font');
  });
});

// Deploy our src folder to gh-pages
gulp.task('deploy', function() {
  return gulp.src('./static/**/*').pipe(ghPages());
});

// Adding the CSS task
gulp.task('scss', function () {
  return gulp.src('./src/css/main.scss')
    .on('error', swallowError)
    .pipe(sass().on('error', sass.logError))
    .pipe(rename('main.css'))
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(gulp.dest('./static/css'));
});

// Build our JavaScript files using browserify
gulp.task('js', function () {
  var stream;
  
  try {
    stream = browserify('./src/js/init.js', { debug: true })
    .transform('bulkify')
    .transform({ global: true }, 'uglifyify')
    .external('views')
    .external('jquery')
    .external('underscore')
    .external('backbone')
    .external('parsleyjs')
    .bundle();
  } catch (ex) {
    console.error(ex);
    return;
  }
  
  return stream
     .on('error', swallowError)
    .pipe(source('app.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('./static/js'));
});

// Bundle vendor scripts (jQuery, Backbone, etc) into one script (vendor.js)
gulp.task('js:vendor', function () {
  return browserify({ debug: true })
    .transform({ global: true }, 'uglifyify')
    .require('jquery')
    .require('underscore')
    .require('backbone')
    .require('parsleyjs')
    .bundle()
    .pipe(source('vendor.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('./static/js'));
});

// Turn all views into a JavaScript object
gulp.task('js:views', function () {
  return gulp.src(src.allViews)
    .pipe(hashify('bundled-views.js'))
    .pipe(tap(function(file) {
      return browserify()
        .require(file, { expose: 'views' })
        .bundle()
        .pipe(source('views.js'))
        .pipe(buffer())
        .pipe(gulp.dest('./static/js'));
    }));
});

// Let's move our html files into dest, too... Sometime, we'll modify this
// to do minification, cache-busting, etc...
gulp.task('html', function () {
  return gulp.src([src.allHtml, '!' + src.allViews])
    .pipe(gulp.dest('./static'));
});

// Move any images to the dist folder
gulp.task('img', function () {
  return gulp.src(src.allImg)
    .pipe(gulp.dest('./static'));
});

// Move any fonts to the dist folder
gulp.task('font', function () {
  return gulp.src(src.allFont)
    .pipe(gulp.dest('./static'));
});

// Clean the destination directory
gulp.task('clean', function (cb) {
  del('./static', cb);
});

// Prevent gulp from crashing and leaving a running Node process behind
function swallowError (error) {
  console.log(error.toString());
  this.emit('end');
}