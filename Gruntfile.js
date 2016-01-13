/* jshint node: true, browser: false, es3:false */
module.exports = function(grunt){
  var pkg = grunt.file.readJSON('package.json'), deps = pkg.devDependencies;
  for(var plugin in deps){ if(plugin.match(/^grunt\-/)){ grunt.loadNpmTasks(plugin);}}
  
  var fs = require('fs');
  var banner_min  = fs.readFileSync('./src/common/banner_min.js',  'utf-8');
  var banner_full = fs.readFileSync('./src/common/banner_full.js', 'utf-8');

  var PRODUCTION = (grunt.cli.tasks.indexOf('release') >= 0);

  grunt.initConfig({
    pkg: pkg,

    clean: {
      all: ['dist/*', 'pzprv3-*.{zip,tar.gz,tar.bz2}']
    },

    copy: {
      license: {
        files : [
          { src: 'LICENSE.txt', dest: 'dist/LICENSE.txt'}
        ]
      }
    },

    concat: {
      options: {
        banner: banner_full,
        process: true,
	  },
      pzpr: {
        options: {
          sourceMap: !PRODUCTION
        },
        files: [
          { src: require('./src/pzpr.js').files, dest: 'dist/pzpr.concat.js' }
        ]
      },
      variety: {
        options: {
          sourceMap: !PRODUCTION
        },
        files: [
          { src: ['dist/pzpr-variety/*.js'], dest: 'dist/pzpr-variety-all.js' }
        ]
      }
    },

    uglify: {
      options: {
        banner: banner_min,
        report: 'min'
      },
      pzpr:{
        options: (PRODUCTION ? {} : {
          sourceMap : 'dist/pzpr.js.map',
          sourceMapIn : 'dist/pzpr.concat.js.map',
          sourceMapIncludeSources : true
        }),
        files: [
          { src: 'dist/pzpr.concat.js', dest: 'dist/pzpr.js'}
        ]
      },
      variety:{
        options: (PRODUCTION ? {} : {
          sourceMap : function(filename){ return filename+'.map';}
        }),
        files: [
          { expand: true, cwd: 'src/variety', src: ['*.js'], dest: 'dist/pzpr-variety' }
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
          'tests/**/*.js',
          'test/**/*.js'
        ]
      },
      source:{
        src: [
          'src/*.js',
          'src/pzpr/*.js',
          'src/puzzle/*.js',
          'src/variety/*.js',
          'src/variety-common/*.js'
        ]
      }
    }
  });
  
  grunt.registerTask('default', ['lint:source',                              'build']);
  grunt.registerTask('release', ['lint:source', 'clean:all', 'copy:license', 'build']);
  grunt.registerTask('lint',        ['newer:jshint:all']);
  grunt.registerTask('lint:source', ['newer:jshint:source']);
  grunt.registerTask('build',        ['build:pzpr', 'build:variety']);
  grunt.registerTask('build:pzpr',   ['newer:concat:pzpr', 'newer:uglify:pzpr']);
  grunt.registerTask('build:variety',['newer:uglify:variety', 'newer:concat:variety']);
};
