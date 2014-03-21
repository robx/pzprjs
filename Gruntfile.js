var component = [
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
 'puzzle-common/FileData'
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
          { src: [], dest: 'dist/js/pzpr.concat.js' }
        ]
      },
      'pzpr-all': {
        files: [
          { src: [], dest: 'dist/js/pzpr-all.concat.js' }
        ]
      }
    },

    replace: {
      pzpr: {
        src: 'dist/js/pzpr.concat.js',
        overwrite: true,
        replacements: [
          { from: "<deploy-version>", to: "<%= pkg.version %>"}
        ]
      },
      'pzpr-all': {
        src: 'dist/js/pzpr-all.concat.js',
        overwrite: true,
        replacements: [
          { from: "<deploy-version>", to: "<%= pkg.version %>"}
        ]
      },
      'pzpr-debug': {
        src: 'dist/js/pzpr/CoreClass.js',
        overwrite: true,
        replacements: [
          { from: "<deploy-version>", to: "<%= pkg.version %>"}
        ]
      }
    },

    copy: {
      pzpr: {
        files : [
          { src: 'dist/js/pzpr.concat.js', dest: 'dist/js/pzpr.js' }
        ]
      },
      'pzpr-all': {
        files : [
          { src: 'dist/js/pzpr-all.concat.js', dest: 'dist/js/pzpr-all.js' }
        ]
      },
      'pzpr-debug': {
        files : [
          { expand: true, cwd: 'src/js/pzpr',          src: ['*.js'], dest: 'dist/js/pzpr' },
          { expand: true, cwd: 'src/js/puzzle-common', src: ['*.js'], dest: 'dist/js/puzzle-common' },
          { src: 'src/js/pzpr.js',     dest: 'dist/js/pzpr.js'     },
          { src: 'src/js/pzpr-all.js', dest: 'dist/js/pzpr-all.js' }
        ]
      },
      puzzle: {
        files : [
          { expand: true, cwd: 'src/js/puzzle', src: ['*.js'], dest: 'dist/js/puzzle' }
        ]
      },
      image: {
        files : [
          { expand: true, cwd: 'src/img', src: ['*'], dest: 'dist/img/' }
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
          { src: 'dist/js/pzpr.concat.js', dest: 'dist/js/pzpr.js' },
        ]
      },
      'pzpr-all': {
        files: [
          { src: 'dist/js/pzpr-all.concat.js', dest: 'dist/js/pzpr-all.js' },
        ]
      },
      puzzle: {
        files : [
          { expand: true, cwd: 'src/js/puzzle', src: ['*.js'], dest: 'dist/js/puzzle' }
        ]
      }
     }
  });
  
  function mod2file(mod){
    return "src/js/" + mod + ".js";
  }
  function wrap(array){
    array.unshift("src/js/pzpr/intro.js");
    array.push   ("src/js/pzpr/outro.js");
    
    array.unshift("src/js/lib/candle.js");
    return array;
  }
  
  var prop = "concat.pzpr.files.0.src";
  grunt.config.set(prop, wrap(component.map(mod2file)));
  
  prop = "concat.pzpr-all.files.0.src";
  grunt.config.set(prop, wrap(component.map(mod2file).concat(['src/js/puzzle/*.js'])));
  
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-text-replace');
  
  grunt.registerTask('default', ['clean', 'copy:pzpr-debug', 'replace:pzpr-debug', 'copy:puzzle', 'copy:image']);
  
  grunt.registerTask('combine-pzpr',     ['concat:pzpr', 'replace:pzpr', 'copy:pzpr'])
  grunt.registerTask('combine-pzpr-all', ['concat:pzpr-all', 'replace:pzpr-all', 'copy:pzpr-all'])
  grunt.registerTask('combine-puzzle',   ['copy:puzzle', 'copy:image'])
  
  grunt.registerTask('release-pzpr',     ['concat:pzpr', 'replace:pzpr', 'uglify:pzpr'])
  grunt.registerTask('release-pzpr-all', ['concat:pzpr-all', 'replace:pzpr-all', 'uglify:pzpr-all'])
  grunt.registerTask('release-puzzle',   ['uglify:puzzle', 'copy:image'])
  
  grunt.registerTask('combine', ['clean', 'combine-puzzle', 'combine-pzpr', 'combine-pzpr-all']);
  grunt.registerTask('release', ['clean', 'release-puzzle', 'release-pzpr', 'release-pzpr-all']);
};
