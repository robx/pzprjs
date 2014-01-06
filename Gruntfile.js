var component = [
 'CoreClass',
 'Puzzle',
 'BoardPiece',
 'Board',
 'BoardExec',
 'LineManager',
 'AreaManager',
 'Graphic',
 'MouseInput',
 'KeyInput',
 'URL',
 'Encode',
 'FileData',
 'Answer',
 'Operation'
];

var banner_min = [
  "/*! @license pzpr.js v<%= pkg.version %>"+
  " (c) 2009-<%= grunt.template.today('yyyy') %> <%= pkg.author %>, MIT license",
  " *   https://bitbucket.org/sabo2/pzprv3 */",
  ""
].join("\n");
var banner_full = [
  "/*!",
  " * @license",
  " * ",
  " * pzpr.js v<%= pkg.version %>",
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
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    concat: {
      options: {
        banner: banner_full
      },
      pzpr: {
        files: [
          { src: [], dest: 'dist/pzpr.concat.js' }
        ]
      }
    },

    replace: {
      pzpr: {
        src: 'dist/pzpr.concat.js',
        overwrite: true,
        replacements: [
          { from: "<deploy-version>", to: "<%= pkg.version %>"}
        ]
      },
      'pzpr-debug': {
        src: 'dist/pzpr/CoreClass.js',
        overwrite: true,
        replacements: [
          { from: "<deploy-version>", to: "<%= pkg.version %>"}
        ]
      }
    },

    copy: {
      pzpr: {
        files : [
          { src: 'dist/pzpr.concat.js', dest: 'dist/pzpr.js' }
        ]
      },
      'pzpr-debug': {
        files : [
          { expand: true, cwd: 'src/pzpr', src: ['*.js'], dest: 'dist/pzpr' },
          { src: 'tests/pzpr.debug.js', dest: 'dist/pzpr.js' }
        ]
      },
      puzzle: {
        files : [
          { expand: true, cwd: 'src/puzzle', src: ['*.js'], dest: 'dist/puzzle' }
        ]
      }
    },

    clean: ['dist/*'],

    uglify: {
      options: {
        banner: banner_min,
        report: 'min',
      },
      pzpr: {
        files: [
          { src: 'dist/pzpr.concat.js', dest: 'dist/pzpr.js' }
        ]
      },
      puzzle: {
        files : [
          { expand: true, cwd: 'src/puzzle', src: ['*.js'], dest: 'dist/puzzle' }
        ]
      }
     }
  });
  
  function mod2file(mod){
    return "src/pzpr/" + mod + ".js";
  }
  function wrap(array){
    array.unshift("src/pzpr/intro.js");
    array.push   ("src/pzpr/outro.js");
    
    array.unshift("src/vendor/candle.js");
    return array;
  }
  
  var prop = "concat.pzpr.files.0.src";
  grunt.config.set(prop, wrap(component.map(mod2file)));
  
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-text-replace');
  
  grunt.registerTask('default', ['clean', 'copy:pzpr-debug', 'replace:pzpr-debug', 'copy:puzzle']);
  grunt.registerTask('combine', ['clean', 'concat', 'replace:pzpr', 'copy:pzpr', 'copy:puzzle']);
  grunt.registerTask('release', ['clean', 'concat', 'replace:pzpr', 'uglify']);
};
