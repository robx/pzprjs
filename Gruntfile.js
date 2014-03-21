
module.exports = function(grunt){
  var fs = require('fs');
  var banner_min  = fs.readFileSync('./src/js/common/banner_min.js',  'utf-8');
  var banner_full = fs.readFileSync('./src/js/common/banner_full.js', 'utf-8');

  var component_core = require('./src/js/pzprv3.js').component;
  var component_all  = require('./src/js/pzprv3-all.js').component;

  var replacer = [{ from: "<deploy-version>", to: "<%= pkg.version %>"}];
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    clean: ['dist/*'],

    concat: {
      options: {
        banner: banner_full
      },
      combine: {
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
      combine: {
        files : [
          { expand: true, cwd: 'src/js/puzzle',  src: ['*.js'], dest: 'dist/js/puzzle' },
          { expand: true, cwd: 'src/css', src: ['*.css'], dest: 'dist/css' },
          { expand: true, cwd: 'src/img', src: ['*'],     dest: 'dist/img' },
          { expand: true, cwd: 'src',     src: ['*'],     dest: 'dist' },
          { src: 'dist/js/pzprv3.concat.js',     dest: 'dist/js/pzprv3.js'     },
          { src: 'dist/js/pzprv3-all.concat.js', dest: 'dist/js/pzprv3-all.js' },
          { src: 'src/js/v3index.js',            dest: 'dist/js/v3index.js'  }
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

    replace: {
      'debug-pzprv3':      { src: 'dist/js/pzpr/CoreClass.js',    overwrite: true, replacements: replacer },
      'combine-pzprv3':    { src: 'dist/js/pzprv3.concat.js',     overwrite: true, replacements: replacer },
      'combine-pzprv3-all':{ src: 'dist/js/pzprv3-all.concat.js', overwrite: true, replacements: replacer }
    },

    uglify: {
      options: {
        banner: banner_min,
        report: 'min',
      },
      release: {
        files: [
          { expand: true, cwd: 'src/js/puzzle', src: ['*.js'], dest: 'dist/js/puzzle' },
          { src: 'dist/js/pzprv3.concat.js',     dest: 'dist/js/pzprv3.js' },
          { src: 'dist/js/pzprv3-all.concat.js', dest: 'dist/js/pzprv3-all.js' },
          { src: 'src/js/v3index.js',            dest: 'dist/js/v3index.js' },
        ]
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
  grunt.config.set("concat.combine.files.0.src", wrap(component_core).map(mod2file));
  grunt.config.set("concat.combine.files.1.src", wrap(component_all ).map(mod2file));
  
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-text-replace');
  
  grunt.registerTask('replace-debug',   ['replace:debug-pzprv3'])
  grunt.registerTask('replace-combine', ['replace:combine-pzprv3', 'replace:combine-pzprv3-all'])
  
  grunt.registerTask('default', ['clean',                   'copy:debug',   'replace-debug'                   ]);
  grunt.registerTask('combine', ['clean', 'concat:combine', 'copy:combine', 'replace-combine'                 ]);
  grunt.registerTask('release', ['clean', 'concat:combine', 'copy:combine', 'replace-combine','uglify:release']);
};
