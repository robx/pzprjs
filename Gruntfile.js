/* jshint node: true, browser: false */
module.exports = function(grunt){
  var pkg = grunt.file.readJSON('package.json'), deps = pkg.devDependencies;
  for(var plugin in deps){ if(plugin.match(/^grunt\-/)){ grunt.loadNpmTasks(plugin);}}
  
  var fs = require('fs');
  var banner_min  = fs.readFileSync('./src/js/common/banner_min.js',  'utf-8');
  var banner_full = fs.readFileSync('./src/js/common/banner_full.js', 'utf-8');
  var banner_min_pzpr  = banner_min.replace("pzprv3.js", "pzpr.js");
  var banner_full_pzpr = banner_full.replace("pzprv3.js", "pzpr.js");

  grunt.initConfig({
    pkg: pkg,

    clean: ['dist/*', 'pzprv3-*.{zip,tar.gz,tar.bz2}'],

    concat: {
      release: {
        options: {
          banner: banner_full,
          process: true
        },
        files: [
          { src: require('./src/js/pzprv3.js').files,     dest: 'dist/js/pzprv3.concat.js' },
          { src: require('./src/js/pzprv3-all.js').files, dest: 'dist/js/pzprv3-all.concat.js' }
        ]
      },
      core: {
        options: {
          banner: banner_full_pzpr,
          process: true
        },
        files: [
          { src: require('./src/js/pzprv3.js').files.filter(function(filename){ return !filename.match(/^ui\//);}), dest: 'dist/lib/pzpr.concat.js' }
        ]
      }
    },

    copy: {
      options: {
        process: function(content, srcpath){ return grunt.template.process(content);},
        noProcess: ['**/*.{png,gif,ico}'],
        mode: true
      },
      debug: {
        files : [
          { expand: true, cwd: 'src/js',  src: ['**/*.js'], dest: 'dist/js'  },
          { expand: true, cwd: 'src/css', src: ['*.css'],   dest: 'dist/css' },
          { expand: true, cwd: 'src/img', src: ['*'],       dest: 'dist/img' },
          { expand: true, cwd: 'src',     src: ['*'],       dest: 'dist' },
          { src: 'LICENSE.txt',          dest: 'dist/LICENSE.txt'      },
          { src: 'src/js/pzprv3.js',     dest: 'dist/js/pzprv3.js'     },
          { src: 'src/js/pzprv3-all.js', dest: 'dist/js/pzprv3-all.js' },
          { src: 'src/js/v3index.js',    dest: 'dist/js/v3index.js'  }
        ]
      },
      release: {
        files : [
          { expand: true, cwd: 'src/css', src: ['*.css'], dest: 'dist/css' },
          { expand: true, cwd: 'src/img', src: ['*'],     dest: 'dist/img' },
          { expand: true, cwd: 'src',     src: ['*'],     dest: 'dist' },
          { src: 'LICENSE.txt',          dest: 'dist/LICENSE.txt'      }
        ]
      }
    },

    uglify: {
      release: {
        options: {
          banner: banner_min,
          report: 'min',
        },
        files: [
          { expand: true, cwd: 'src/js/variety', src: ['*.js'], dest: 'dist/js/variety' },
          { src: 'dist/js/pzprv3.concat.js',     dest: 'dist/js/pzprv3.js' },
          { src: 'dist/js/pzprv3-all.concat.js', dest: 'dist/js/pzprv3-all.js' },
          { src: 'src/js/v3index.js',            dest: 'dist/js/v3index.js' },
        ]
      },
      core: {
        options: {
          banner: banner_min_pzpr,
          report: 'min',
        },
        files: [
          { expand: true, cwd: 'src/js/variety', src: ['*.js'], dest: 'dist/lib/variety' },
          { src: 'dist/lib/pzpr.concat.js', dest: 'dist/lib/pzpr.js' }
        ]
      }
    },

    shell: {
      release: {
        options: {
          execOptions: {
            cwd: "dist",
            env: {
              FILENAME: "pzprv3-<%= pkg.version %>",
              EXCLUDE_TAR: "--exclude *.concat.js --exclude .DS_Store",
              EXCLUDE_ZIP: "-x *.concat.js -x .DS_Store"
            }
          },
        },
        command: [
          "sh -c 'tar cvzf $0 $EXCLUDE_TAR *; mv $0 ..' $FILENAME.tar.gz",
          "sh -c 'tar cvjf $0 $EXCLUDE_TAR *; mv $0 ..' $FILENAME.tar.bz2",
          "sh -c 'zip -9r $0 * $EXCLUDE_ZIP; mv $0 ..' $FILENAME.zip"
        ].join('; ')
      }
    },

    jshint: {
      options: {
        jshintrc: true
      },
      all: {
        src: [
          'Gruntfile.js',
          'src/js/*.js',
          'src/js/pzpr/*.js',
          'src/js/puzzle/*.js',
          'src/js/variety/*.js',
          'src/js/variety-common/*.js',
          'src/js/ui/*.js',
          'tests/**/*.js'
        ]
      }
    }
  });
  
  grunt.registerTask('lint', ['newer:jshint:all']);
  grunt.registerTask('default', [        'clean',                   'copy:debug'                    ]);
  grunt.registerTask('release', ['lint', 'clean', 'concat:release', 'copy:release', 'uglify:release']);
  grunt.registerTask('core',    ['lint', 'clean', 'concat:core',                    'uglify:core'   ]);
  grunt.registerTask('zipfile', ['shell:release']);
};
