module.exports = function(grunt){
  var pkg = grunt.file.readJSON('package.json'), deps = pkg.devDependencies;
  for(var plugin in deps){ if(plugin.match(/^grunt\-/)){ grunt.loadNpmTasks(plugin);}}
  
  var fs = require('fs');
  var banner_min  = fs.readFileSync('./src/common/banner_min.js',  'utf-8');
  var banner_full = fs.readFileSync('./src/common/banner_full.js', 'utf-8');

  var PRODUCTION = (grunt.cli.tasks.indexOf('release') >= 0);

  grunt.initConfig({
    pkg: pkg,

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
      },
      samples:{
        options: (PRODUCTION ? {} : {
          sourceMap : function(filename){ return filename+'.map';}
        }),
        files: [
          { expand: true, cwd: 'test/script', src: ['*.js'], dest: 'dist/pzpr-samples' }
        ]
      }
    }
  });
  
  grunt.registerTask('default', ['build']);
  grunt.registerTask('release', ['build']);
  grunt.registerTask('build',        ['build:pzpr', 'build:variety', 'build:samples']);
  grunt.registerTask('build:pzpr',   ['newer:concat:pzpr', 'newer:uglify:pzpr']);
  grunt.registerTask('build:variety',['newer:uglify:variety']);
  grunt.registerTask('build:samples',['newer:uglify:samples']);
};
