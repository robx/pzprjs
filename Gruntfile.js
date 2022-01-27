module.exports = function(grunt){
  var pkg = grunt.file.readJSON('package.json'), deps = pkg.devDependencies;
  for(var plugin in deps){ if(plugin.match(/^grunt\-/)){ grunt.loadNpmTasks(plugin);}}

  var fs = require('fs');
  var rulesEN = grunt.file.readYAML('src-ui/res/rules.en.yaml');
  var rulesJA = grunt.file.readYAML('src-ui/res/rules.ja.yaml');

  var rulesMTime = Math.max(
    fs.statSync('src-ui/res/rules.en.yaml').mtime,
    fs.statSync('src-ui/res/rules.ja.yaml').mtime
  );

  var banner_min  = fs.readFileSync('./src/common/banner_min.js',  'utf-8');
  var banner_full = fs.readFileSync('./src/common/banner_full.js', 'utf-8');

  var PRODUCTION = (grunt.cli.tasks.indexOf('release') >= 0);

  function sampleFileList() {
    var files = fs.readdirSync('test/script');
    return files.map(function(f) {
      return {
        src: ['test/script/' + f],
        dest: 'dist/js/pzpr-samples/' + f
      }
    });
  }

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
      },
      list: {
        src: 'dist/list.html',
        dest: 'dist/list.template',
      },
    },
    newer: {
      options: {
        override: function(detail, include) {
          if(detail.task === 'concat' && detail.target === 'samples') {
            include(rulesMTime > detail.time);
          } else {
            include(false);
          }
        }
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
      },
      samples: {
        options:{
          sourceMap: !PRODUCTION,
          process: function(src, filepath) {
            var pid = filepath.split('/').pop().split('.')[0];

            var ruleResult = [
              rulesEN[pid] || '',
              rulesJA[pid] || ''
            ];

            return "ui.debug.addRules('" + pid + "', " + JSON.stringify(ruleResult) + ");\n" + src;
          }
        },
        files: sampleFileList()
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
          { expand: true, cwd: 'dist/js/pzpr-samples', src: ['*.js'], dest: 'dist/js/pzpr-samples' }
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
  grunt.registerTask('vercel', ['build', 'move']);
  grunt.registerTask('build',        ['build:pzpr', 'build:variety', 'build:samples', 'build:ui']);
  grunt.registerTask('build:pzpr',   ['newer:concat:pzpr', 'newer:uglify:pzpr']);
  grunt.registerTask('build:ui',     ['newer:copy:ui', 'newer:concat:ui', 'newer:uglify:ui']);
  grunt.registerTask('build:variety',['newer:uglify:variety']);
  grunt.registerTask('build:samples',['newer:concat:samples', 'newer:uglify:samples']);
};
