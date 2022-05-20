const gulp = require('gulp');
const chalk = require('chalk');

const sass = require('sass');
const gulpSass = require('gulp-sass')(sass);
const sourcemaps = require('gulp-sourcemaps');
const livereload = require('gulp-livereload');
const path = require('path');

const SOURCE_LOCATION = `${__dirname}/preview`;
const COMPILED_LOCATION = `${__dirname}/compiled`;

const pathNormalize = (filePath) => `${filePath.replace(`${__dirname}/../`, '')}`;

const benchmarkReporter = (action, time) => {
  console.log(chalk.magenta(`${action} in ${((Date.now() - time) / 1000).toFixed(2)}s`));
};

const errorReporter = (e) => {
  console.log(chalk.bold.red(`Build error!\n${e.stack || e}`));
};

const watchReporter = (filePath) => {
  console.log(chalk.cyan(`File ${pathNormalize(filePath)} changed, flexing 💪`));
};

const stylesForProduction = () => {
  const startTime = Date.now();

  const sassOptions = {
    includePaths: [
      `${__dirname}/node_modules`,
    ],
    functions: require('sass-functions')({ sass }),
    importer: require('node-sass-glob-importer')(),
    outputStyle: 'expanded',
    sourceComments: false,
  };

  gulpSass.compiler = sass;

  return gulp
    .src(path.join(__dirname, 'styles.scss'))
    .pipe(gulpSass(sassOptions).on('error', gulpSass.logError))
    .pipe(require('gulp-postcss')([
      require('autoprefixer')(),
      require('postcss-flexbugs-fixes'),
    ]))
    .on('error', errorReporter)
    .pipe(gulp.dest(__dirname))
    .on('end', () => benchmarkReporter('Sassified', startTime));
};

const styles = () => {
  const startTime = Date.now();

  const sassOptions = {
    includePaths: [
      `${__dirname}/node_modules`,
    ],
    functions: require('sass-functions')({ sass }),
    importer: require('node-sass-glob-importer')(),
    outputStyle: 'expanded',
    sourceComments: true,
  };

  gulpSass.compiler = sass;

  return gulp
    .src(`${SOURCE_LOCATION}/style.scss`)
    .pipe(sourcemaps.init())
    .pipe(gulpSass(sassOptions).on('error', gulpSass.logError))
    .pipe(require('gulp-postcss')([
      require('autoprefixer')(),
      require('postcss-flexbugs-fixes'),
    ]))
    .on('error', errorReporter)
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(COMPILED_LOCATION))
    .on('end', () => benchmarkReporter('Sassified', startTime))
    .pipe(livereload());
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
    .on('end', () => benchmarkReporter('Pugified', startTime))
    .pipe(livereload());
};

const watch = () => {
  const styleFiles = [
    './**/*.scss',
  ];

  const templateFiles = [
    `${SOURCE_LOCATION}/**/*.pug`,
  ];

  livereload.listen();

  gulp.watch(styleFiles).on('change', (filePath) => {
    watchReporter(filePath);
    styles();
  });

  gulp.watch(templateFiles).on('change', (filePath) => {
    watchReporter(filePath);
    templates();
  });

  gulp.src('fonts/')
    .pipe(gulp.symlink(`${COMPILED_LOCATION}/fonts`));

  return gulp.src(COMPILED_LOCATION)
    .pipe(require('gulp-webserver')({
      port: parseInt(process.env.PORT, 10) || 3000,
      livereload: false,
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

gulp.task('clean', () => require('promised-del')([COMPILED_LOCATION]));

gulp.task('styles', styles);
gulp.task('styles-prod', stylesForProduction);
gulp.task('templates', templates);

gulp.task('compile', gulp.series('clean', gulp.parallel('styles', 'templates')));
gulp.task('compile-prod', gulp.series('clean', 'styles-prod'));

gulp.task('default', gulp.series('compile', watch));
