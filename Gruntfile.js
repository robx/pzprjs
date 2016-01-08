/* jshint node: true, browser: false, es3:false */
module.exports = function(grunt){
  var pkg = grunt.file.readJSON('package.json'), deps = pkg.devDependencies;
  for(var plugin in deps){ if(plugin.match(/^grunt\-/)){ grunt.loadNpmTasks(plugin);}}
  
  var fs = require('fs');
  var banner_min  = fs.readFileSync('./src/common/banner_min.js',  'utf-8');
  var banner_full = fs.readFileSync('./src/common/banner_full.js', 'utf-8');

  grunt.initConfig({
    pkg: pkg,

    clean: ['dist/*', 'pzprv3-*.{zip,tar.gz,tar.bz2}'],

    concat: {
      pzpr: {
        options: {
          banner: banner_full,
          process: true
        },
        files: [
          { src: require('./src/pzpr.js').files, dest: 'dist/pzpr.concat.js' }
        ]
      },
      "variety-all": {
        options: {
          banner: banner_full,
          process: true
        },
        files: [
          { src: ['dist/variety/*.js'], dest: 'dist/variety-all.js' }
        ]
      }
    },

    copy: {
      debug: {
        files : [
          { expand: true, cwd: 'src', src: ['**/*.js'], dest: 'dist' },
          { src: 'src/pzpr.js',        dest: 'dist/pzpr.js'        },
          { src: 'src/variety-all.js', dest: 'dist/variety-all.js' }
        ]
      },
      license: {
        files : [
          { src: 'LICENSE.txt', dest: 'dist/LICENSE.txt'}
        ]
      }
    },

    uglify: {
      options: {
        banner: banner_min,
        report: 'min',
      },
      pzpr:{
        files: [
          { src: 'dist/pzpr.concat.js', dest: 'dist/pzpr.js'}
        ]
      },
      variety:{
        files: [
          { expand: true, cwd: 'src/variety', src: ['*.js'], dest: 'dist/variety' }
        ]
      }
    },

    jshint: {
      options: {
        jshintrc: true
      },
      all: {
        src: [
          'Gruntfile.js',
          'src/*.js',
          'src/pzpr/*.js',
          'src/puzzle/*.js',
          'src/variety/*.js',
          'src/variety-common/*.js',
          'tests/**/*.js'
        ]
      },
      pzpr:{
        src: [
          'src/*.js',
          'src/pzpr/*.js',
          'src/puzzle/*.js',
          'src/variety-common/*.js'
        ]
      },
      variety:{
        src: [
          'src/variety/*.js',
          'tests/**/*.js'
        ]
      }
    }
  });
  
  grunt.registerTask('lint', ['newer:jshint:all']);
  grunt.registerTask('default', ['clean', 'copy:debug']);
  grunt.registerTask('release:pzpr',    ['newer:jshint:pzpr',    'concat:pzpr',          'uglify:pzpr']);
  grunt.registerTask('release:variety', ['newer:jshint:variety', 'newer:uglify:variety', 'concat:variety-all']);
  grunt.registerTask('release', ['lint', 'clean', 'copy:license', 'release:pzpr', 'release:variety']);
};
