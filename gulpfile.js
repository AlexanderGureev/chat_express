var gulp 		= require("gulp"),
    browserSync = require("browser-sync").create(),
    less 		= require("gulp-less"),
    concat      = require("gulp-concat"),
    uglify      = require("gulp-uglifyjs"),
    cssnano     = require("gulp-cssnano"), 
    rename      = require("gulp-rename"),
    del         = require("del"),
	imagemin    = require("gulp-imagemin"),
	notify      = require("gulp-notify"),
    pngquant    = require("imagemin-pngquant"),
    autoprefixer = require("gulp-autoprefixer");


gulp.task("scripts", function () {
	return gulp.src([
			"dev_folder/js/*.js"
		])
		//.pipe(rename({suffix: ".min"}))
		//.pipe(uglify())
		.pipe(gulp.dest("public/js"));
});

gulp.task("less", function() {
	return gulp.src("dev_folder/less/*.less")
			   .pipe(less().on("error", notify.onError()))
			   .pipe(rename({suffix: ".min"}))
			   .pipe(gulp.dest("public/css"));
});

gulp.task("css", function() {

	var mainCss = gulp.src("dev_folder/less/main.less")
					  .pipe(less().on("error", notify.onError()))
			          .pipe(rename({suffix: ".min"}))
			   	      .pipe(autoprefixer(["last 15 versions"], { cascade: true }))
			   		  .pipe(cssnano())
			   		  .pipe(gulp.dest("public/css"));

	var mediaCss = gulp.src("dev_folder/less/media.less")
					   .pipe(less().on("error", notify.onError()))
			   		   .pipe(rename({suffix: ".min"}))
			   		   .pipe(autoprefixer(["last 15 versions"], { cascade: true }))
			   		   //.pipe(cssnano())
			   		   .pipe(gulp.dest("public/css"));
});


gulp.task("watch", function() {
	gulp.watch("dev_folder/less/**/*.less", ["less"]);
     gulp.watch("dev_folder/js/**/*.js", ["scripts"]);
});



gulp.task("build", ["css", "scripts"], function(){
	console.log("success build");
});

gulp.task("default", ["watch"]);