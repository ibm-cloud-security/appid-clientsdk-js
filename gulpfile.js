const gulp = require('gulp');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const babel = require('gulp-babel');
// Minify .js files with concatscripts as the dependency
gulp.task('js', () => {
	return gulp.src("lib/*.js")
		.pipe(babel({
			presets: ['@babel/preset-env']
		}))
		.pipe(concat('all.js'))
		.pipe(uglify())
		.pipe(gulp.dest('dist/'));
});

gulp.task('dist', () => {
	return gulp.src("dist/*.js")
		.pipe(babel({
			presets: ['@babel/preset-env']
		}))
		.pipe(concat('all.js'))
		.pipe(uglify())
		.pipe(gulp.dest('dist/'));
});

// Minify .js files with concatscripts as the dependency
gulp.task("mini", function() {
	return gulp.src("src/AppIDClient.js")
		.pipe(babel({
			presets: ['@babel/env']
		}))
		.pipe(uglify())
		.pipe(gulp.dest('dist/js'));
});
