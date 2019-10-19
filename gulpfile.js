const 	gulp = require('gulp'),
		sass = require('gulp-sass'),
		jade = require('gulp-jade'),
		del = require('del'),
		rename = require('gulp-rename'),
		concat = require('gulp-concat'),
		concatCss = require('gulp-concat-css'),
		csso = require('gulp-csso'),
		autoprefixer = require('gulp-autoprefixer'),
		imagemin = require('gulp-imagemin'),
		uglify = require('gulp-uglify'),
		imageminMozjpeg = require('imagemin-mozjpeg'),
		browserSync = require('browser-sync').create();
	
gulp.task('clean', function(done) {
	return del(['dist']);
	done();
});
		
gulp.task('styles', function (done) {
	gulp.src('app/sass/*.sass')
	.pipe(sass({
		includePaths: require('node-bourbon').includePaths
	}).on('error', sass.logError))
	.pipe(rename({suffix: '.min', prefix : ''}))
	.pipe(autoprefixer({
		browsers: ['last 15 versions'],
		cascade: false
	}))
	.pipe(csso(''))
	.pipe(gulp.dest('dist/css'));
	done();
});

gulp.task('compress', () =>
	gulp.src('app/img/*')
	.pipe(imagemin([imageminMozjpeg({
		quality: 85
	})]))
	.pipe(gulp.dest('dist/img/'))
);

gulp.task('copyJquery', function (done) {
	return gulp.src('app/libs/jquery/jquery.min.js')
	.pipe(gulp.dest('dist/js'));
	done();
});

gulp.task('copyfontAwesome', function(done) {
	gulp.src('app/libs/font-awesome/*.{ttf,woff,woff2,eot,svg}')
	.pipe(gulp.dest('dist/css/font-awesome/webfonts/'));
	done();
});

gulp.task('scriptsConcat', function() {
	return gulp.src('app/libs/**/*.js', '!app/libs/jquery/jquery.min.js')
	.pipe(concat('plugin.min.js'))
	.pipe(uglify(''))
	.pipe(gulp.dest('dist/js'));
});

gulp.task('scriptsCommon', function() {
	return gulp.src('app/js/*.js')
	.pipe(uglify(''))
	.pipe(concat('common.min.js'))
	.pipe(gulp.dest('dist/js'));
});

gulp.task('vendorCss', function (done) {
	return gulp.src('app/libs/**/*.css')
	.pipe(concatCss("vendor.css"))   
	.pipe(csso('')) 
	.pipe(rename("vendor.min.css"))
	.pipe(gulp.dest('dist/css'));
	done();
}); 

gulp.task('templates', function(done) {
	var YOUR_LOCALS = {};
	gulp.src('app/**/*.jade')
		.pipe(jade({
		locals: YOUR_LOCALS,
		pretty: true
	}))
	.pipe(gulp.dest('./dist/'));
	done();
});

gulp.task('fontsdist', function(done) {
	return gulp.src('app/fonts/*/**')   
	.pipe(gulp.dest('dist/fonts'));
	done();
});

gulp.task('browser-sync', function() {
	browserSync.init({
		server: {
			baseDir: "./dist"
		},
		notify: false,
		files: ['./dist/**/*.html','./dist/js/*.js','./dist/css/*.css']
	});
});

gulp.task('watch', function () {
	gulp.watch('app/sass/*.sass', gulp.series('styles'));
	gulp.watch('app/libs/**/*.js', gulp.series('scriptsConcat'));
	gulp.watch('app/js/*.js', gulp.series('scriptsCommon'));	
	gulp.watch('app/**/*.jade', gulp.series('templates'));
});

gulp.task('default', gulp.series( gulp.series(	
									'clean',
									'styles',							
									'scriptsConcat',
									'scriptsCommon',
									'copyJquery',
									'copyfontAwesome',
									'vendorCss',							
									'templates',
									'compress',
									'fontsdist'), 
		gulp.parallel('watch', 'browser-sync')));