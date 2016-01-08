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
      all: {
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
      release:{
        options: {
          banner: banner_min,
          report: 'min',
        },
        files: [
          { expand: true, cwd: 'src/variety', src: ['*.js'], dest: 'dist/variety' },
          { src: 'dist/pzpr.concat.js', dest: 'dist/pzpr.js'}
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
      }
    }
  });
  
  grunt.registerTask('lint', ['newer:jshint:all']);
  grunt.registerTask('default', [        'clean',               'copy:debug',                                         ]);
  grunt.registerTask('release', ['lint', 'clean', 'concat:all', 'copy:license', 'uglify:release', 'concat:variety-all']);
};
