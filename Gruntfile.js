
module.exports = function(grunt){
  var pkg = grunt.file.readJSON('package.json'), deps = pkg.devDependencies;
  for(var plugin in deps){ if(plugin.match(/^grunt\-/)){ grunt.loadNpmTasks(plugin);}}
  
  var fs = require('fs');
  var banner_min  = fs.readFileSync('./src/js/common/banner_min.js',  'utf-8');
  var banner_full = fs.readFileSync('./src/js/common/banner_full.js', 'utf-8');

  var component_core = require('./src/js/pzprv3.js').component;
  var component_all  = require('./src/js/pzprv3-all.js').component;

  grunt.initConfig({
    pkg: pkg,

    clean: ['dist/*', 'pzprv3-*.zip', 'pzprv3-*.tar.gz'],

    concat: {
      options: {
        banner: banner_full,
        process: true
      },
      release: {
        files: [
          { src: [], dest: 'dist/js/pzprv3.concat.js' },
          { src: [], dest: 'dist/js/pzprv3-all.concat.js' }
        ]
      }
    },

    copy: {
      debug: {
        files : [
          { expand: true, cwd: 'src/js',  src: ['**/*.js'], dest: 'dist/js'  },
          { expand: true, cwd: 'src/css', src: ['*.css'],   dest: 'dist/css' },
          { expand: true, cwd: 'src/img', src: ['*'],       dest: 'dist/img' },
          { expand: true, cwd: 'src',     src: ['*'],       dest: 'dist' },
          { src: 'src/js/pzprv3.js',     dest: 'dist/js/pzprv3.js'     },
          { src: 'src/js/pzprv3-all.js', dest: 'dist/js/pzprv3-all.js' },
          { src: 'src/js/v3index.js',    dest: 'dist/js/v3index.js'  }
        ]
      },
      release: {
        files : [
          { expand: true, cwd: 'src/css', src: ['*.css'], dest: 'dist/css' },
          { expand: true, cwd: 'src/img', src: ['*'],     dest: 'dist/img' },
          { expand: true, cwd: 'src',     src: ['*'],     dest: 'dist' }
        ]
      }
    },

    uglify: {
      options: {
        banner: banner_min,
        report: 'min',
      },
      release: {
        files: [
          { expand: true, cwd: 'src/js/variety', src: ['*.js'], dest: 'dist/js/variety' },
          { src: 'dist/js/pzprv3.concat.js',     dest: 'dist/js/pzprv3.js' },
          { src: 'dist/js/pzprv3-all.concat.js', dest: 'dist/js/pzprv3-all.js' },
          { src: 'src/js/v3index.js',            dest: 'dist/js/v3index.js' },
        ]
      }
    },

    shell: {
      release: {
        command: [
          "tar cvzf pzprv3-<%= pkg.version %>.tar.gz --exclude *.concat.js dist/*",
          "zip -9r pzprv3-<%= pkg.version %>.zip dist/* -x *.concat.js"
        ].join('; ')
      }
    }
  });
  
  function mod2file(mod){
    return "src/js/" + mod + ".js";
  }
  function wrap(array){
    array.unshift("common/intro");
    array.push   ("common/outro");
    return array;
  }
  grunt.config.set("concat.release.files.0.src", wrap(component_core).map(mod2file));
  grunt.config.set("concat.release.files.1.src", wrap(component_all ).map(mod2file));
  
  grunt.registerTask('default', ['clean',                   'copy:debug'                    ]);
  grunt.registerTask('release', ['clean', 'concat:release', 'copy:release', 'uglify:release']);
  grunt.registerTask('zipfile', ['shell:release']);
};
