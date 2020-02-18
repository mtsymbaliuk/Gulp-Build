const 	gulp = require('gulp'),
		pug  = require('gulp-pug'),
		gulpHtmlBemValidator = require('gulp-html-bem-validator'),
		sass = require('gulp-sass'),
		rename = require('gulp-rename'),
		shorthand = require('gulp-shorthand'),
		autoprefixer = require('gulp-autoprefixer'),
		babel = require('gulp-babel'),
		del = require('del'),
		concat = require('gulp-concat'),
		csso = require('gulp-csso'),
		imagemin = require('gulp-imagemin'),
		uglify = require('gulp-uglify-es').default,
		imageminMozjpeg = require('imagemin-mozjpeg'),
		plumber = require('gulp-plumber'),
		server = require('browser-sync').create();	
	
module.exports = function clean(cb) {
	return del('dist');
};

module.exports = function pug2html() {
	return gulp.src('app/**/*.pug')
	.pipe(plumber())
	.pipe(pug({
		pretty: true
	}))
	.pipe(gulpHtmlBemValidator())
	.pipe(gulp.dest('./dist/'));
}();
		
module.exports = styles = function() {
	return gulp.src('app/sass/**/*.sass')
	.pipe(plumber())
	.pipe(sass().on('error', sass.logError))
	.pipe(rename({suffix: '.min', prefix: ''}))
	.pipe(autoprefixer({
		cascade: false
	}))
	.pipe(shorthand())
	.pipe(csso(''))
	.pipe(gulp.dest('dist/css'));
};

module.exports = vendorCss = function() {
	return gulp.src('app/libs/**/*.css')
	.pipe(csso('')) 
	.pipe(rename("vendor.min.css"))
	.pipe(gulp.dest('dist/css'));
}; 

module.exports = scripts = function() {
	return gulp.src('app/js/*.js')
	.pipe(plumber())
	.pipe(babel({
		presets: ['@babel/env']
	}))
	.pipe(concat('common.min.js'))
	.pipe(uglify(''))
	.pipe(gulp.dest('dist/js'));
};

module.exports = scriptsConcat = function() {
	return gulp.src('app/libs/**/*.js')
	.pipe(babel({
		presets: ['@babel/env']
	}))
	.pipe(concat('plugin.min.js'))
	.pipe(uglify(''))
	.pipe(gulp.dest('dist/js'));
};

module.exports = compress = function() {
	gulp.src('app/img/*')
	.pipe(imagemin([imageminMozjpeg({
		quality: 85
	})]))
	.pipe(gulp.dest('dist/img/'))
};

// module.exports = copyFonts = async function() {
// 	let fontAwesome = gulp.src('node_modules/@fortawesome/fontawesome-free/webfonts/*')
// 		.pipe(gulp.dest('dist/fonts/font-awesome/webfonts/'));	

// 	let fonts = gulp.src('app/fonts/*/**')   
// 		.pipe(gulp.dest('dist/fonts'));
// };

module.exports = serverFunc = function() {
	server.init({
		server: "dist",
		notify: false,
		files: ['./dist/**/*.html','./dist/js/*.js','./dist/css/*.css']
	})
	
	gulp.watch('app/sass/*.sass', gulp.series('styles')).on('change', server.reload);
	gulp.watch('app/js/*.js', gulp.series('scripts')).on('change', server.reload);	
	gulp.watch('app/**/*.pug', gulp.series('pug2html')).on('change', server.reload);
	gulp.watch('build/*.html').on('change', server.reload);
};

const dev = gulp.parallel( pug2html, styles, vendorCss, scriptsConcat, 
scripts, compress)

const build = gulp.series(clean, dev)

module.exports.start = gulp.series(build, serverFunc)