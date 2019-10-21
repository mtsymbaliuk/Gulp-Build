const 	gulp = require('gulp'),
		sass = require('gulp-sass'),
		jade = require('gulp-jade'),
		del = require('del'),
		rename = require('gulp-rename'),
		concat = require('gulp-concat'),
		csso = require('gulp-csso'),
		autoprefixer = require('gulp-autoprefixer'),
		imagemin = require('gulp-imagemin'),
		uglify = require('gulp-uglify'),
		imageminMozjpeg = require('imagemin-mozjpeg'),
		browserSync = require('browser-sync').create();	
	
gulp.task('clean', async () => {
	return del(['dist']);
});
		
gulp.task('styles', () => {
	return gulp.src('app/sass/**/*.sass')
	.pipe(sass().on('error', sass.logError))
	.pipe(rename({suffix: '.min', prefix: ''}))
	.pipe(autoprefixer({
		browsers: ['last 15 versions'],
		cascade: false
	}))
	.pipe(csso(''))
	.pipe(gulp.dest('dist/css'));
});

gulp.task('compress', () =>
	gulp.src('app/img/*')
	.pipe(imagemin([imageminMozjpeg({
		quality: 85
	})]))
	.pipe(gulp.dest('dist/img/'))
);

gulp.task('scriptsConcat', () => {
	return gulp.src('app/libs/**/*.js', '!app/libs/jquery/jquery.min.js')
	.pipe(concat('plugin.min.js'))
	.pipe(uglify(''))
	.pipe(gulp.dest('dist/js'));
});

gulp.task('scriptsCommon', () => {
	return gulp.src('app/js/*.js')
	.pipe(concat('common.min.js'))
	.pipe(uglify(''))
	.pipe(gulp.dest('dist/js'));
});

gulp.task('vendorCss', () => {
	return gulp.src('app/libs/**/*.css')
	.pipe(csso('')) 
	.pipe(rename("vendor.min.css"))
	.pipe(gulp.dest('dist/css'));
}); 

gulp.task('templates', () => {
	var YOUR_LOCALS = {};
	return gulp.src('app/**/*.jade')
		.pipe(jade({
		locals: YOUR_LOCALS,
		pretty: true
	}))
	.pipe(gulp.dest('./dist/'));
});

gulp.task('copyFonts', async () => {
	let fontAwesome = gulp.src('app/libs/font-awesome/*.{ttf,woff,woff2,eot,svg}')
		.pipe(gulp.dest('dist/css/font-awesome/webfonts/'));	

	let fonts = gulp.src('app/fonts/*/**')   
		.pipe(gulp.dest('dist/fonts'));
})

gulp.task('browser-sync', () => {
	browserSync.init({
		server: {
			baseDir: "./dist"
		},
		notify: false,
		files: ['./dist/**/*.html','./dist/js/*.js','./dist/css/*.css']
	});
});

gulp.task('watch', () => {
	gulp.watch('app/sass/*.sass', gulp.series('styles'));
	gulp.watch('app/libs/**/*.js', gulp.series('scriptsConcat'));
	gulp.watch('app/js/*.js', gulp.series('scriptsCommon'));	
	gulp.watch('app/**/*.jade', gulp.series('templates'));
});

gulp.task('default', gulp.series( gulp.series('clean','templates','styles','vendorCss', 'scriptsConcat', 
			'scriptsCommon','copyFonts','compress'), gulp.parallel('watch', 'browser-sync')));