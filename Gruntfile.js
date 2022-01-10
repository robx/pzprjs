module.exports = function(grunt){
  var pkg = grunt.file.readJSON('package.json'), deps = pkg.devDependencies;
  for(var plugin in deps){ if(plugin.match(/^grunt\-/)){ grunt.loadNpmTasks(plugin);}}
  
  var fs = require('fs');
  var banner_min  = fs.readFileSync('./src/common/banner_min.js',  'utf-8');
  var banner_full = fs.readFileSync('./src/common/banner_full.js', 'utf-8');

  var PRODUCTION = (grunt.cli.tasks.indexOf('release') >= 0);

  grunt.initConfig({
    pkg: pkg,

    git: grunt.file.readJSON("git.json"),

    copy: {
      ui: {
        options: {
          process: function(content, srcpath){ return grunt.template.process(content);},
          noProcess: ['**/*.{png,gif,ico}'],
          mode: true
        },
        files : [
          { expand: true, cwd: 'src-ui/css', src: ['*.css'], dest: 'dist/css' },
          { expand: true, cwd: 'src-ui/img', src: ['*.png'], dest: 'dist/img' },
          { expand: true, cwd: 'src-ui',     src: ['*'],     dest: 'dist'     }
        ]
      }
    },
    move: {
      p: {
        src: 'dist/p.html',
        dest: 'dist/p.template',
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
          { src: require('./src/pzpr.js').files, dest: 'dist/js/pzpr.concat.js' }
        ]
      },
      ui: {
        options:{
          sourceMap: !PRODUCTION
        },
        files: [
          { src: require('./src-ui/js/pzpr-ui.js').files, dest: 'dist/js/pzpr-ui.concat.js' }
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
          sourceMap : 'dist/js/pzpr.js.map',
          sourceMapIn : 'dist/js/pzpr.concat.js.map',
          sourceMapIncludeSources : true
        }),
        files: [
          { src: 'dist/js/pzpr.concat.js', dest: 'dist/js/pzpr.js'}
        ]
      },
      variety:{
        options: (PRODUCTION ? {} : {
          sourceMap : function(filename){ return filename+'.map';}
        }),
        files: [
          { expand: true, cwd: 'src/variety', src: ['*.js'], dest: 'dist/js/pzpr-variety' }
        ]
      },
      samples:{
        options: (PRODUCTION ? {} : {
          sourceMap : function(filename){ return filename+'.map';}
        }),
        files: [
          { expand: true, cwd: 'test/script', src: ['*.js'], dest: 'dist/js/pzpr-samples' }
        ]
      },
      ui: {
        options: (PRODUCTION ? {} : {
          sourceMap : 'dist/js/pzpr-ui.js.map',
          sourceMapIn : 'dist/js/pzpr-ui.concat.js.map',
          sourceMapIncludeSources : true
        }),
        files: [
          { src: 'dist/js/pzpr-ui.concat.js', dest: 'dist/js/pzpr-ui.js' },
          { src: 'src-ui/js/list.js',         dest: 'dist/js/list.js' }
        ]
      }
    }
  });
  
  grunt.registerTask('default', ['build']);
  grunt.registerTask('release', ['build']);
  grunt.registerTask('vercel', ['build', 'move:p']);
  grunt.registerTask('build',        ['build:pzpr', 'build:variety', 'build:samples', 'build:ui']);
  grunt.registerTask('build:pzpr',   ['newer:concat:pzpr', 'newer:uglify:pzpr']);
  grunt.registerTask('build:ui',     ['newer:copy:ui', 'newer:concat:ui', 'newer:uglify:ui']);
  grunt.registerTask('build:variety',['newer:uglify:variety']);
  grunt.registerTask('build:samples',['newer:uglify:samples']);
};
