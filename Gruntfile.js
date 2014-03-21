var component = [
 'lib/candle',
 'pzpr/CoreClass',
 'pzpr/Puzzle',
 'pzpr/BoardPiece',
 'pzpr/Board',
 'pzpr/BoardExec',
 'pzpr/LineManager',
 'pzpr/AreaManager',
 'pzpr/Graphic',
 'pzpr/MouseInput',
 'pzpr/KeyInput',
 'pzpr/URL',
 'pzpr/Encode',
 'pzpr/FileData',
 'pzpr/Answer',
 'pzpr/Operation',
 'puzzle-common/Graphic',
 'puzzle-common/KeyInput',
 'puzzle-common/MouseInput',
 'puzzle-common/Answer',
 'puzzle-common/BoardExec',
 'puzzle-common/Encode',
 'puzzle-common/FileData',
 'ui/Boot',
 'ui/UI',
 'ui/Menu',
 'ui/MenuArea',
 'ui/PopupMenu',
 'ui/ToolArea',
 'ui/KeyPopup',
 'ui/DataBase',
 'ui/Timer',
 'ui/Debug'
];

var banner_min = [
  "/*! @license pzprv3.js v<%= pkg.version %>"+
  " (c) 2009-<%= grunt.template.today('yyyy') %> <%= pkg.author %>, MIT license",
  " *   https://bitbucket.org/sabo2/pzprv3 */",
  ""
].join("\n");
var banner_full = [
  "/*!",
  " * @license",
  " * ",
  " * pzprv3.js v<%= pkg.version %>",
  " *  https://bitbucket.org/sabo2/pzprv3",
  " * ",
  " * This script includes candle.js, see below",
  " *  https://bitbucket.org/sabo2/candle",
  " * ",
  " * Copyright 2009-<%= grunt.template.today('yyyy') %> <%= pkg.author %>",
  " * ",
  " * This script is released under the MIT license. Please see below.",
  " *  http://www.opensource.org/licenses/mit-license.php",
  " * ",
  " * Date: <%= grunt.template.today('yyyy-mm-dd') %>",
  " */",
  "",
  ""
 ].join("\n")

module.exports = function(grunt){
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
      'debug-pzprv3':    { src: 'dist/js/pzpr/CoreClass.js',      overwrite: true, replacements: replacer },
      'debug-ui':        { src: 'dist/js/ui/UI.js',               overwrite: true, replacements: replacer },
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
    array.unshift("src/js/common/intro.js");
    array.push   ("src/js/common/outro.js");
    
    array.unshift("src/js/lib/candle.js");
    return array;
  }
  
  grunt.config.set("concat.combine.files.0.src", wrap(component.map(mod2file)));
  grunt.config.set("concat.combine.files.1.src", wrap(component.map(mod2file).concat(['src/js/puzzle/*.js'])));
  
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-text-replace');
  
  grunt.registerTask('replace-debug',   ['replace:debug-pzprv3', 'replace:debug-ui'])
  grunt.registerTask('replace-combine', ['replace:combine-pzprv3', 'replace:combine-pzprv3-all'])
  
  grunt.registerTask('default', ['clean',                   'copy:debug',   'replace-debug'                   ]);
  grunt.registerTask('combine', ['clean', 'concat:combine', 'copy:combine', 'replace-combine'                 ]);
  grunt.registerTask('release', ['clean', 'concat:combine', 'copy:combine', 'replace-combine','uglify:release']);
};
