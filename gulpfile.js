/* jshint camelcase:false */
var gulp = require('gulp-help')(require('gulp'));
var babel = require('gulp-babel');
var merge = require('merge-stream');
var pkg = require('./package.json');
var path = require('path');
var plug = require('gulp-load-plugins')();

var del = require('del');
var runSequence = require('run-sequence');
var fs = require('fs');

var env = plug.util.env;
var log = plug.util.log;
var inject = require("gulp-inject");

gulp.task('build', false, ['clean'], function (cb) {
    runSequence(['css'], ['js', 'inject', 'buildNotify'], cb);
});

gulp.task('build:noclean', false, [], function (cb) {
    runSequence(['css'], ['js', 'inject', 'buildNotify'], cb);
});

gulp.task('buildNotify', false, ['inject'], function () {
    return gulp.src('').pipe(plug.notify({
            onLast: true,
            message: 'Code compiled and copied to output folder!'
        }));
});

gulp.task('clean', false, function () {
    var root = pkg.paths.dist;
    var paths = [root + '/index.html', root + '/js/*', root + '/css/*'];
    log('Cleaning: ' + plug.util.colors.red(paths));
    return del.sync(paths, { force: true }, function (err) {
        if (err) {
            log(err);
        }
    });
});

gulp.task('js', false, [], function () {
    log('Bundling, minifying, and copying the app\'s JavaScript');
    var source = [].concat(pkg.paths.js);

    return gulp.src(source)
        .pipe(plug.sourcemaps.init())
        .pipe(babel())
        .pipe(plug.concat('all.min.js'))
        .pipe(plug.sourcemaps.write())
        .pipe(gulp.dest(pkg.paths.dist + '/js'));
    
});

gulp.task('vendorjs', false, function () {
    log('Bundling, minifying, and copying the Vendor JavaScript');
    var source = [].concat(pkg.paths.vendorjs);
    return gulp.src(source)
        .pipe(plug.concat('vendor.min.js'))
        //.pipe(plug.uglify()) //Uncomment if you want to squash your vendor files, but it can be a hassle during dev.
        .pipe(gulp.dest(pkg.paths.dist + '/js'));
});

gulp.task('css', false, [], function () {
    log('Bundling, minifying, and copying the app\'s CSS');
    return gulp.src(pkg.paths.css)
        .pipe(plug.concat('all.min.css'))
        .pipe(gulp.dest(pkg.paths.dist + '/css'));
    
});

gulp.task('vendorcss', false, [], function () {
    log('Compressing, bundling, copying vendor CSS');
    return gulp.src(pkg.paths.vendorcss)
        .pipe(plug.concat('vendor.min.css'))
        .pipe(plug.minifyCss({}))
        .pipe(gulp.dest(pkg.paths.dist + '/css'));
});

gulp.task('inject', false, ['js', 'vendorjs', 'css', 'vendorcss'], function (cb) {
    log('Injecting into index.html');
    var root = pkg.paths.dist;
    var minified = root + '/**/*.min.*';
    var index = pkg.paths.client + '/index.html';
    var indexFilter = plug.filter(['index.html']);
    
    return gulp
        .src([].concat(minified, index))
        .pipe(indexFilter)
        .pipe(inject('/css/vendor.min.css', 'vendor'))
        .pipe(inject('/css/all.min.css'))
        .pipe(inject('/js/vendor.min.js', 'vendor'))
        .pipe(inject('/js/all.min.js'))
        .pipe(gulp.dest(root))

    function inject(path, name) {
        log('path: ' + path);
        log('name: ' + name);
        var glob = root + path;
        var options = {
            ignorePath: '/dist',
            read: false,
            addRootSlash: true
        };
        if (name) { options.name = name; }
        return plug.inject(gulp.src(glob), options);
    }
});

gulp.task('watch', false, [], function () {
    log('Watching HTML files');
    gulp.watch("./client/**/*.html").on('change', logWatch);
    gulp.watch("./client/**/*.html", ['build:noclean']);

    log('Watching CSS files');
    gulp.watch("./client/css/*.css").on('change', logWatch);
    gulp.watch("./client/css/*.css", ['build:noclean']);

    log('Watching JS files');
    gulp.watch('./client/**/*.js').on('change', logWatch);
    gulp.watch('./client/**/*.js', ['build:noclean']);

    function logWatch(event) {
        var eventMessage = 'File ' + event.path + ' was ' + event.type + ', running tasks...';
        return gulp.src('').pipe(plug.notify({
            onLast: true,
            message: eventMessage
        }));
    }
});