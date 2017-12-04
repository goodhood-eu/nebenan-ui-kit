const gulp = require('gulp');
const chalk = require('chalk');

const SOURCE_LOCATION = `${__dirname}/preview`;
const COMPILED_LOCATION = `${__dirname}/compiled`;

const pathNormalize = (path) => `${path.replace(`${__dirname}/../`, '')}`;

const benchmarkReporter = (action, time) => {
  console.log(chalk.magenta(`${action} in ${((Date.now() - time) / 1000).toFixed(2)}s`));
};

const errorReporter = (e) => {
  console.log(chalk.bold.red(`Build error!\n${e.stack || e}`));
};

const watchReporter = (e) => {
  console.log(chalk.cyan(`File ${pathNormalize(e.path)} ${e.type}, flexing 💪`));
};

const styles = () => {
  const startTime = Date.now();

  const stylusOptions = {
    errors: true,
    sourcemaps: true,
    use: [require('nib')()],
    paths: [
      `${__dirname}/node_modules`,
    ],
    'include css': true,
    urlfunc: 'embedurl',
    linenos: true,
  };

  return gulp
    .src(`${SOURCE_LOCATION}/style.styl`)
    .pipe(require('gulp-stylus')(stylusOptions))
    .on('error', errorReporter)
    .pipe(gulp.dest(COMPILED_LOCATION))
    .on('end', () => benchmarkReporter('Stylusified', startTime));
};

const templates = () => {
  const startTime = Date.now();
  const source = [
    `${SOURCE_LOCATION}/**/*.pug`,
    `!${SOURCE_LOCATION}/**/_*.pug`,
  ];

  const pugOptions = {
    pretty: true,
    compileDebug: true,
  };


  return gulp
    .src(source)
    .pipe(require('gulp-pug')(pugOptions))
    .on('error', errorReporter)
    .pipe(gulp.dest(COMPILED_LOCATION))
    .on('end', () => benchmarkReporter('Pugified', startTime));
};

const watch = () => {
  const styleFiles = [
    './**/*.styl',
  ];

  const templateFiles = [
    `${SOURCE_LOCATION}/**/*.pug`,
  ];

  gulp.watch(styleFiles).on('change', (event) => {
    watchReporter(event);
    styles();
  });

  gulp.watch(templateFiles).on('change', (event) => {
    watchReporter(event);
    templates();
  });

  return gulp.src(COMPILED_LOCATION)
    .pipe(require('gulp-webserver')({
      port: parseInt(process.env.PORT, 10) || 3000,
      livereload: true,
      directoryListing: {
        enable: true,
        path: COMPILED_LOCATION,
        options: {
          filter(filename) {
            return /\.html$/.test(filename);
          },
        },
      },
    }));
};


gulp.task('clean', (done) => require('del')([COMPILED_LOCATION], done));

gulp.task('styles', styles);
gulp.task('templates', templates);

gulp.task('compile', require('gulp-sequence')('clean', ['styles', 'templates']));

gulp.task('default', ['compile'], watch);
