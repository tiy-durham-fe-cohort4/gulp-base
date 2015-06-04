// Require gulp and connect. The require function looks in
// the node_modules for a 'gulp' package and a 'gulp-connect'
// package, and returns the function or object exported from
// those packages. (More on exporting later.)
var gulp = require('gulp');
var connect = require('gulp-connect');
var ghPages = require('gulp-gh-pages');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var rename = require('gulp-rename');
var del = require('del');
var concat = require('gulp-concat');
var watch = require('gulp-watch');

// Common patterns used throughout the gulp configuration
var src = {
  allHtml: './src/**/*.html',
  allJs: './src/**/*.js',
  allFont: './src/**/*.{ttf,woff,otf,eot}',
  allScss: './src/**/*.scss',
  allImg: './src/**/*.{jpg,png,svg,gif,ico}'
};

// The default task is what runs when you type 'gulp' in the terminal
gulp.task('default', ['clean'], function () {
  return gulp.start('html', 'img', 'font', 'js', 'scss', 'watch', 'reload', 'serve');
});

// Serve is a name I made up. You could call it 'dostuff' or whatever.
// The task starts a connect server on port 8000 if you go to
// http://localhost:8000, you can see what is being served.
gulp.task('serve', function () {
  connect.server({
    root: './dist', // Serve content out of the ./src folder
    port: 8000, // Serve on port 8000
    livereload: true // Allow us to reload the app in the browser at will
  });
});

// The watch task watches a directory for changes and tells the
// browser(s) connected to the server to refresh. I also made this name
// up. In fact, the only name that has intrinsic meaning to gulp is the
// 'default' task.
gulp.task('watch', function () {
  watch(src.allHtml, function () {
    gulp.start('html');
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

// The reload task tells the connect server to reload all browsers
gulp.task('reload', function () {
  watch('./dist/**/*', function () {
    gulp.src('./dist/**/*').pipe(connect.reload());
  });
});

// Deploy our src folder to gh-pages
gulp.task('deploy', function() {
  return gulp.src('./dist/**/*').pipe(ghPages());
});

// Adding the CSS task
gulp.task('scss', function () {
  return gulp.src('./src/css/main.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(rename('main.css'))
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(gulp.dest('./dist/css'));
});

// For now, we'll just move the JS files straight into dist
// but eventually, we'll minify and combine these, etc
gulp.task('js', ['js:vendor'], function () {
  return gulp.src(src.allJs)
    .pipe(gulp.dest('./dist'));
});

// Bundle vendor scripts (jQuery, Backbone, etc) into one script (vendor.js)
gulp.task('js:vendor', function () {
  return gulp.src([
    './bower_components/jquery/dist/jquery.min.js',
    './bower_components/underscore/underscore-min.js'
    ])
    .pipe(concat('vendor.js'))
    .pipe(gulp.dest('./dist/js'));
});

// Let's move our html files into dest, too... Sometime, we'll modify this
// to do minification, cache-busting, etc...
gulp.task('html', function () {
  return gulp.src(src.allHtml)
    .pipe(gulp.dest('./dist'));
});

// Move any images to the dist folder
gulp.task('img', function () {
  return gulp.src(src.allImg)
    .pipe(gulp.dest('./dist'));
});

// Move any fonts to the dist folder
gulp.task('font', function () {
  return gulp.src(src.allFont)
    .pipe(gulp.dest('./dist'));
});

// Clean the destination directory
gulp.task('clean', function (cb) {
  del('./dist', cb);
});
