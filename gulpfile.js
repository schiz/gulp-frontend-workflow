// Load gulp plugins with 'require' function of nodejs
// --------------------------------------------------------

var gulp             = require('gulp'),
    watch            = require('gulp-watch'),
    merge            = require('merge-stream'),
    svgSprite        = require('gulp-svg-sprite'),
    imagemin         = require('gulp-imagemin'),
    spritesmith      = require('gulp.spritesmith'),
    jade             = require('gulp-jade'),
    stylus           = require('gulp-stylus'),
    autoprefixer     = require('gulp-autoprefixer'),
    uncss            = require('gulp-uncss'),
    cssshrink        = require('gulp-cssshrink'),
    imageminPngquant = require('imagemin-pngquant'),
    del              = require('del'),
    nib              = require('nib'),
    fontFace         = require('stylus-font-face'),
    rupture          = require('rupture'),
    poststylus       = require('poststylus'),
    lost             = require('lost'),
    rename           = require('gulp-rename'),
    rtlcss           = require('gulp-rtlcss'),
    coffee           = require('gulp-coffee'),
    gutil            = require('gulp-util'),
    sourcemaps       = require('gulp-sourcemaps'),
    uglify           = require('gulp-uglify'),
    rigger           = require('gulp-rigger'),
    plumber          = require('gulp-plumber'),
    browserSync      = require('browser-sync').create(),
    reload           = browserSync.reload,
    concat           = require('gulp-concat'),
    gzip             = require('gulp-gzip'),
    compress         = require('compression'),
    middleware       = require('connect-gzip-static')('./src/dist/'),
    buffer           = require('vinyl-buffer'),
    jadeInheritance  = require('gulp-jade-inheritance'),
    changed          = require('gulp-changed'),
    cached           = require('gulp-cached'),
    gulpif           = require('gulp-if'),
    filter           = require('gulp-filter'),
    affected         = require('gulp-jade-find-affected');

// --------------------------------------------------------


// Source Path configs
// --------------------------------------------------------

var app_fonts             = 'src/app/fonts/**/*.*',
    minified_svg          = 'src/app/img/compressed/ico/**/*.svg',
    initial_img           = 'src/app/img/initial/**/*.*',
    app_jade              = 'src/app/jade/*.jade',
    app_stylus            = 'src/app/stylus/*.styl',
    min_html_src          = 'src/dist/**/*.html',
    img_for_sprite        = 'src/app/img/compressed/*.png',
    img_for_retina_sprite = 'src/app/img/compressed/*@2x.png',
    app_coffee            = 'src/app/coffee/*.coffee',
    watch_coffee          = 'src/app/coffee/**/*.coffee',
    watch_js              = 'src/app/jslibs/**/*.js',
    watch_jade            = 'src/app/jade/**/*.jade',
    watch_stylus          = 'src/app/stylus/**/*.styl';

// --------------------------------------------------------

// Dest Path configs
// --------------------------------------------------------

var tmp_fonts                 = 'src/tmp/fonts/',
    tmp_css                   = 'src/tmp/css/',
    tmp_js                    = 'src/tmp/js/',
    compressed_img            = 'src/app/img/compressed/',
    tmp_unminified_html       = 'src/tmp/',
    tmp_compressed_sprite_img = 'src/tmp/css/sprite/',
    dist_sprite_svg           = 'src/app/stylus/partials/',
    app_compressed_sprite_img = 'src/app/stylus/partials/sprite/',
    sprite_css                = 'src/app/stylus/partials/',
    dist_minified_html        = 'src/dist/',
    dist_fonts                = 'src/dist/fonts/',
    dist_css                  = 'src/dist/css/',
    dist_js                   = 'src/dist/js/';

// --------------------------------------------------------

// // Set Functions for tasks
// // --------------------------------------------------------


var gzip_opts = {
  append: false,
  extension: 'gz',
  gzipOptions: { level: 9 }
};

function EmptyFolders() {
  return del([
    'src/app/img/compressed/*',
    'src/app/stylus/partials/sprite/*',
    'src/app/stylus/partials/*sprite.styl',
    'src/tmp/*',
    'src/dist/*'
    ]);
}

function copyFonts() {
  return gulp.src(app_fonts)
    .pipe(plumber())
    .pipe(gulp.dest(tmp_fonts))
    .pipe(gulp.dest(dist_fonts))
    .pipe(reload({stream: true}));
}

// function minifyImg() {
//   return gulp.src(initial_img)
//     .pipe(plumber())
//     .pipe(changed('src/app/img/compressed/'))
//     .pipe(imagemin({
//       optimizationLevel: 1,
//       progressive: true
//     }))
//     .pipe(gulp.dest(compressed_img))
//     .on('end', function() {
//       return gulp.src('src/app/img/compressed/bkg/**/*.*')
//         .pipe(gulp.dest('src/tmp/css/bkg'))
//         .pipe(gulp.dest('src/dist/css/bkg'));
//     });
// }

// Made only for dev purposes, to lower time expense for constant image compression,
// that is nod necessarily needed for dev process. Should be commented and replaced
// with minifyImg() function with proper opts for compiling of prod version of site.
function copyIMG() {
  return gulp.src(initial_img)
    .pipe(plumber())
    .pipe(changed('src/app/img/compressed/'))
    .pipe(gulp.dest(compressed_img))
    .on('end', function() {
      return gulp.src('src/app/img/compressed/bkg/**/*.*')
        .pipe(gulp.dest('src/dist/css/bkg'));
    });
}

// Config for createSpriteSvg
SvgSpriteConfig     = {
  mode            : {
    sprite1     : {
        mode    : 'css',
        render  : {
          styl: {dest: './svg-sprite.styl'}
        },
        dest: './',
        sprite : 'sprite/svg-sprite.svg',
        bust: false, // Set to true - Add a content based hash to the name of the sprite file so that clients reliably 
        // reload the sprite when it's content changes («cache busting»). Defaults to false except for «css» and «view» sprites.
        common: 'svg-common'
    }
  }
};

// SVG template - node-modules/svg-sprite/tmpl/css/sprite.styl
function createSpriteSvg() {
  return gulp.src(minified_svg)
    .pipe(plumber())
    .pipe(svgSprite(SvgSpriteConfig))
    .pipe(imagemin({
      optimizationLevel: 1,
      progressive: true
    }))
    .pipe(gulp.dest(dist_sprite_svg))
    // ;
    .on('end', function() {
      return gulp.src('src/app/stylus/partials/sprite/svg-sprite.svg')
        .pipe(gulp.dest('src/tmp/css/sprite/'))
        // .pipe(gzip(gzip_opts))
        .pipe(gulp.dest('src/dist/css/sprite/'));
    });
}



// config for createSpriteRetina
PngSpriteOpts = {
  // set params for x2 retina sprite
  retinaSrcFilter: [img_for_retina_sprite], // IMPORTANT! : both x1 and x2 retina images should be in the same folder
  retinaImgName: 'png-sprite@2x.png',
  retinaImgPath: 'sprite/png-sprite@2x.png',
  // set params for x1 sprite
  imgName: 'png-sprite.png',
  cssName: 'png-sprite.styl',
  imgPath: 'sprite/png-sprite.png',
  cssTemplate: 'stylus.template.handlebars'
  // To optimize amount of output code in .styl default templates were changed. Initial default templates: 
  // 'node_modules/gulp.spritesmith/node_modules/spritesheet-templates/lib/'
};

function createSprite() {
  var spriteData = gulp.src(img_for_sprite)
    .pipe(plumber())
    .pipe(spritesmith(PngSpriteOpts));

  var imgStream = spriteData.img
    .pipe(buffer())
    .pipe(imageminPngquant({quality: '65-80', speed: 4})())
    // compress sprite image lossless (if applied to both x1 and x2 sprite images scales retina sprite image down to x1)
    // .pipe(imagemin({
    //   progressive: true, 
    //   use: [imagemin({optimizationLevel: 1, progressive: true})]
    // }))
    // Put compressed sprite image to dest
    // .pipe(gulp.dest(app_compressed_sprite_img))
    .pipe(gulp.dest(tmp_compressed_sprite_img))
    .pipe(gulp.dest('src/dist/css/sprite/'));

  // Put generated css file to dest 
    var cssStream = spriteData.css
      .pipe(gulp.dest(sprite_css));

    return merge(imgStream, cssStream);
  // return merge(spriteData, imgStream, cssStream);
}

function compileJade() {
  var unminified_html = gulp.src(app_jade)
    // .pipe(plumber())
    // .pipe(changed(tmp_unminified_html, {extension: '.html'}))
    // .pipe(changed(tmp_unminified_html, {hasChanged: changed.compareSha1Digest}))
    // .pipe(changed(tmp_unminified_html, {hasChanged: changed.compareLastModifiedTime}))
    .pipe(jade({
      pretty: true
    }))
    .pipe(gulp.dest(tmp_unminified_html));

  var minified_html = gulp.src(app_jade)
    // .pipe(plumber())
    // .pipe(changed(dist_minified_html, {extension: '.html'}))
    // .pipe(changed(dist_minified_html, {hasChanged: changed.compareSha1Digest}))
    // .pipe(changed(dist_minified_html, {hasChanged: changed.compareLastModifiedTime}))
    .pipe(jade())
    // .pipe(gzip(gzip_opts))
    .pipe(gulp.dest(dist_minified_html));

  return merge(unminified_html, minified_html);
    // .pipe(reload({stream: true}));
}

// function compileJadeTemplates() {
    
// }

function compileStylus() {
  return gulp.src(app_stylus)
    .pipe(plumber())
    // Generate sourcemaps. Commented because of large weight of generated sourcemap files. 
    // Uncomment line 202 and 228 to activate. Conflicts with RTL Css, since RTL can't interprete the hash added to .css file
    // by sourcemap. In order to solve the conflict make a separate task for rtlcss (take minified .css without sourcemap)
    // .pipe(sourcemaps.init())
    .pipe(stylus({
      'include css': true,
      use: [
        nib(),
        // Set readable media-rules as block mixins in styles.styl
        rupture(),
        // Generate font-face rules for fonts (set as mixins in styles.styl)
        fontFace({limit:80000}),
        // Add a responsive grid 'lost'
        poststylus(['lost'])
      ],
      import: [
        'nib', 
        'font-face'
      ]
    }))
    // Autoprefix
    .pipe(autoprefixer()) 
    .pipe(gulp.dest(tmp_css))
    // UnCSS (if .html templates are used, add templates' directory to [])
    // .pipe(uncss({
    //   html: [min_html_src]
    // }))
    // CssShrink
    .pipe(cssshrink())
    // .pipe(sourcemaps.write('./'))
    // .pipe(gzip(gzip_opts))
    .pipe(gulp.dest(dist_css))
    // .pipe(browserSync.stream());
    .pipe(reload({stream: true}));
    // RTL Css
    // .pipe(rtlcss())
    // .pipe(rename({suffix: '-rtl'}))
    // .pipe(gulp.dest(dist_css));
    // .pipe(livereload());
}

// function compileCoffee() {
//   return gulp.src(app_coffee)
//     .pipe(plumber())
//     .pipe(rigger())
//     .pipe(sourcemaps.init())
//     .pipe(coffee({bare: true}).on('error', gutil.log))
//     .pipe(rename({suffix: '_min'}))
//     .pipe(gulp.dest(tmp_js))
//     .pipe(uglify())
//     .pipe(sourcemaps.write('./'))
//     .pipe(gulp.dest(dist_js))
//     // .pipe(reload({stream: true}))
//     .on('end', function() {
//       gulp.src('src/app/jslibs/*.js')
//       .pipe(rigger())
//       .pipe(gulp.dest('src/dist/js/'));
//     })
//     .pipe(reload({stream: true}))
//     ;
// }



function compileJS() {
  // return gulp.src('src/app/jslibs/*.js')
  return gulp.src([
    'src/app/jslibs/smooth-scroll.min.js', 
    'src/app/jslibs/jquery-2.1.4.min.js', 
    'src/app/jslibs/fabric.min.js', 
    'src/app/jslibs/app.js'
    ])
    .pipe(rigger())
    .pipe(concat('app.js', {newLine: ';'}))
    .pipe(uglify())
    // .pipe(gzip(gzip_opts))
    .pipe(gulp.dest('src/dist/js/'))
    .pipe(reload({stream: true}));
}

// // --------------------------------------------------------



// Set Gulp tasks
// --------------------------------------------------------

// Empty folders of the project
gulp.task('EmptyFolders', function () {
  return EmptyFolders();
});

// Copy fonts (from app to tmp and dist)
gulp.task('copyFonts', ['EmptyFolders'], function() {
  return copyFonts();
});

// Commented for dev process. Uncomment when compiling prod version of site.
// Compress jpg & png
// gulp.task('minifyImg', ['EmptyFolders'], function() {
gulp.task('copyIMG', ['EmptyFolders'], function() {
  return copyIMG();
  // return minifyImg();
});

// gulp.task('setWatch', function() {
//     global.isWatching = true;
// });

// Compile Jade (unminified and minified htmls)
gulp.task('compileJade', ['EmptyFolders'], function() {
  return compileJade();
  // return compileJadeOnWatch();
});

// Commented for dev process. Uncomment when compiling prod version of site.
// Create sprite from minified svg
// gulp.task('createSpriteSvg', ['minifyImg'], function() {
gulp.task('createSpriteSvg', ['copyIMG'], function() {
  return createSpriteSvg();
});

// Commented for dev process. Uncomment when compiling prod version of site.
// Create sprite (x1 and x2 retina) from .png pics
// gulp.task('createSprite', ['minifyImg'], function() {
gulp.task('createSprite', ['copyIMG'], function() {
  return createSprite();
});

// Compile .styl (autoprefixer included)
// gulp.task('compileStylus', ['createSprite', 'compileJade'], function() {
gulp.task('compileStylus', ['createSprite'], function() {
  return compileStylus();
});

// Replace compileJS task and function with this if coffeescript is used
// Compile .coffee (include partials via rigger)
// gulp.task('compileCoffee', ['EmptyFolders'], function() {
//   return compileCoffee();
// });

// Compile .js (include partials via rigger)
gulp.task('compileJS', ['EmptyFolders'], function() {
  return compileJS();
});

// --------------------------------------------------------



// Build project
// --------------------------------------------------------
gulp.task('build', [
  'EmptyFolders',
  'copyFonts',
  // Commented for dev process. Uncomment when compiling prod version of site.
  // 'minifyImg',
  'copyIMG',
  'createSpriteSvg',
  'createSprite',
  // 'setWatch',
  'compileJade',
  'compileStylus',
  'compileJS',
]);
// --------------------------------------------------------

// // Config for devServer (browsersync ?)
var serverConfig = {
  server: {
    baseDir: "src/dist/",
    // ,
    // middleware: [compress()]
    middleware: function (req, res, next) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      next();
    }
  },
  files: ['src/dist/*.html', 'src/dist/css/*.css', 'src/dist/css/sprite/*.svg', 'src/dist/js/*.js'],
  tunnel: false,
  host: 'localhost',
  port: 3000,
  logPrefix: "Vaan_logprefix",
  open: false
};

gulp.task('webserver', ['build'], function () {
  // browserSync(serverConfig,
  //   function (err, bs) {
  //     bs.addMiddleware("*", middleware, {
  //       override: true
  //     });
  //   }
  // );
  
  browserSync.init(
    serverConfig
    // Commented for non-gzip build. Uncomment when using gzip
    // ,
    // function (err, bs) {
    //   bs.addMiddleware("*", middleware, {
    //     override: true
    //   });
    // }
  );
});

// Watch changes & livereload
// --------------------------------------------------------

gulp.task('watch', ['webserver'], function() {

  watch(app_fonts, function() {
    return copyFonts();
  });
  
  watch(initial_img, function() {
    // Commented for dev process. Uncomment for prod process
    // return minifyImg();
    return copyIMG();
  });

  watch(minified_svg, function() {
    return createSpriteSvg();
  });

  // Compile only those .jade files, that are affected by change of their included files
  watch('src/app/jade/**/*.jade')
    .pipe(affected())
    .pipe(jade())
    .pipe(gulp.dest(dist_minified_html));


  watch(watch_stylus, function() {
    return compileStylus();
  });
  
  watch(watch_js, function() {
    return compileJS();
  });

});
// --------------------------------------------------------
