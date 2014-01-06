var component = [
 'Boot',
 'UI',
 'Menu',
 'MenuArea',
 'PopupMenu',
 'ToolArea',
 'KeyPopup',
 'DataBase',
 'Timer',
 'Debug'
];

var banner_min = [
  "/*! @license ui.js v<%= pkg.version %>"+
  " (c) 2009-<%= grunt.template.today('yyyy') %> <%= pkg.author %>, MIT license",
  " *   https://bitbucket.org/sabo2/pzpr-ui */",
  ""
].join("\n");
var banner_full = [
  "/*!",
  " * @license",
  " * ",
  " * ui.js v<%= pkg.version %>",
  " *  https://bitbucket.org/sabo2/pzpr-ui",
  " * ",
  " * This script use pzpr.js, see below",
  " *  https://bitbucket.org/sabo2/pzprv3",
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
      combine: {
        files: [
          { src: [], dest: 'dist/js/ui.concat.js' }
        ]
      },
      release: {
        files: [
          { src: [], dest: 'dist/js/ui.concat.js' }
        ]
      }
    },

    copy: {
      pzpr: {
        files : [
          { src: 'dist/js/ui.concat.js', dest: 'dist/js/ui.js' }
        ]
      },
      debug: {
        files : [
          { expand: true, cwd: 'src/vendor', src: ['**/*'],  dest: 'dist/vendor' },
          { expand: true, cwd: 'src/js/ui',  src: ['*.js'],  dest: 'dist/js/ui' },
          { expand: true, cwd: 'src/css', src: ['*.css'], dest: 'dist/css' },
          { expand: true, cwd: 'src/img', src: ['*'],     dest: 'dist/img' },
          { expand: true, cwd: 'src',     src: ['*'],     dest: 'dist' },
          { src: 'src/js/v3index.js', dest: 'dist/js/v3index.js' },
          { src: 'src/js/ui.js',      dest: 'dist/js/ui.js' }
        ]
      },
      combine: {
        files : [
          { expand: true, cwd: 'src/vendor', src: ['**/*'],  dest: 'dist/vendor' },
          { expand: true, cwd: 'src/css', src: ['*.css'], dest: 'dist/css' },
          { expand: true, cwd: 'src/img', src: ['*'],     dest: 'dist/img' },
          { expand: true, cwd: 'src',     src: ['*'],     dest: 'dist' },
          { src: 'src/js/v3index.js',    dest: 'dist/js/v3index.js' },
          { src: 'dist/js/ui.concat.js', dest: 'dist/js/ui.js' }
        ]
      },
      release: {
        files : [
          { expand: true, cwd: 'src/vendor', src: ['**/*'],  dest: 'dist/vendor' },
          { expand: true, cwd: 'src/css', src: ['*.css'], dest: 'dist/css' },
          { expand: true, cwd: 'src/img', src: ['*'],     dest: 'dist/img' },
          { expand: true, cwd: 'src',     src: ['*'],     dest: 'dist' }
        ]
      }
    },

    clean: ['dist/*'],

    uglify: {
      options: {
        banner: banner_min,
        report: 'min',
      },
      release: {
        files: [
          { src: 'src/js/v3index.js',    dest: 'dist/js/v3index.js' },
          { src: 'dist/js/ui.concat.js', dest: 'dist/js/ui.js' }
        ]
      }
     }
  });
  
  function mod2file(mod){
    return "src/js/ui/" + mod + ".js";
  }
  function wrap(array){
    array.unshift("src/js/intro.js");
    array.push   ("src/js/outro.js");
    return array;
  }
  
  grunt.config.set("concat.combine.files.0.src", wrap(component.map(mod2file)));
  grunt.config.set("concat.release.files.0.src", wrap(component.map(mod2file)));
  
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  
  grunt.registerTask('default', ['clean',                   'copy:debug'                    ]);
  grunt.registerTask('combine', ['clean', 'concat:combine', 'copy:combine'                  ]);
  grunt.registerTask('release', ['clean', 'concat:release', 'copy:release', 'uglify:release']);
};
