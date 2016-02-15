// Include Gulp
var gulp = require('gulp');

// Include plugins
var sourcemaps = require('gulp-sourcemaps'),
	 browserSync = require('browser-sync'),
   			uglify = require('gulp-uglify'),
				rename = require('gulp-rename'),
  autoprefixer = require('gulp-autoprefixer'),
	   minifyCSS = require('gulp-minify-css'),
  		  filter = require('gulp-filter'),
  			  sass = require('gulp-sass'),
				 merge = require('merge-stream'),
			 flatten = require('gulp-flatten');

// Setup some common paths to use in the tasks
var input = {
	root    : './src',
	styles  : './src/assets/scss/',
	scripts : './src/assets/js/',
	images  : './src/assets/img/'
};
var output = {
	dist		: './dist/',
	demo		: {
		root    : './demo/',
		styles  : './demo/assets/css/',
		scripts : './demo/assets/js/',
		images  : './demo/assets/img/'
	}
};

// Process the SASS files
gulp.task('styles', function() {
	// Process the demo styles and move then into the demo folder
  var demo = gulp.src(input.styles + 'demo.scss')
    .pipe(sass({ outputStyle: 'expanded'}))
		.pipe(autoprefixer({
			browsers: ['last 4 versions'],
			cascade: false
		}))
    .pipe(gulp.dest(output.demo.styles));
	// Process our app styles and move them into distribution
  var wheatley = gulp.src(input.styles + 'wheatley.scss')
    .pipe(sass({ outputStyle: 'expanded'}))
		.pipe(autoprefixer({
			browsers: ['last 4 versions'],
			cascade: false
		}))
    .pipe(gulp.dest(output.dist))
    .pipe(minifyCSS())
    .pipe(rename({suffix: '.min'}))
    .pipe(sourcemaps.init())
    .pipe(sourcemaps.write('./maps'))
    .pipe(gulp.dest(output.dist));
	// Merge the streams and inject the styles into the browser session
  return merge(demo, wheatley)
    .pipe(filter('**/*.css'))
    .pipe(browserSync.reload({stream: true}))
});

// Process the javascript files
gulp.task('scripts', function() {
  return gulp.src(input.scripts + 'wheatley.js')
    .pipe(gulp.dest(output.dist))
    .pipe(rename({suffix: '.min'}))
		.pipe(uglify())
    .pipe(sourcemaps.init())
    .pipe(sourcemaps.write('./maps'))
    .pipe(gulp.dest(output.dist));
});

// Process the images
gulp.task('images', function() {
	gulp.src([input.images + '**/*', '!**/portal-crosshair.svg'])
    .pipe(gulp.dest(output.demo.images));
});

// Process the HTML files
gulp.task('html', function() {
  gulp.src(input.root + '**/*.html')
		.pipe(flatten())
    .pipe(gulp.dest(output.demo.root));
});

// Watch for file changes and start up browser-sync for live reloads
gulp.task('watch', ['styles'], function() {
    // Start serving files
    browserSync({
			server: './',
	    index:  'demo/index.html',
			tunnel: 'wheatleyjs'
		});
    // Watch for CSS changes and inject them into the browser
    gulp.watch(input.styles + '/**/*.scss', ['styles']);
    // Watch for any other file changes and reload the browser
    gulp.watch(input.scripts + '**/*.js', ['scripts']).on('change', browserSync.reload);
    gulp.watch(input.root + '**/*.html', ['html']).on('change', browserSync.reload);
});

// Run the tasks ('default' is required)
gulp.task('default', ['scripts','images','html']);

// Start the file server
gulp.task('serve', ['default','watch']);
