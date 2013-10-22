// Generated on<%= (new Date).toISOString().split('T')[0] %> using <%= pkg.name %> <%= pkg.version %>
'use strict';
var lrSnippet = require('grunt-contrib-livereload/lib/utils').livereloadSnippet;
var mountFolder = function (connect, dir) {
  return connect.static(require('path').resolve(dir));
};

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to match all subfolders:
// 'test/spec/**/*.js'

module.exports = function (grunt) {
  // load all grunt tasks
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  // configurable paths
  var folders = {
    app: 'app',
    dist: 'dist',
    tmp: '.tmp'
  };

  grunt.initConfig({
    folders: folders,
    watch: {
      compass: {
        files: ['<%= folders.app %>/styles/{,*/}*.{scss,sass}'],
        tasks: ['compass:server']
      },
      server: {
        options: {
          livereload: true
        },
        files: [
          '<%= folders.tmp %>/styles/{,*/}*.css',
          '<%= folders.tmp %>/{,*/}*.html',
          '<%= folders.app %>/scripts/{,*/}*.js',
          '<%= folders.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
        ],
        tasks: ['copy:server']
      },
      jade: {
        files: ['app/jade/{,*/}*.jade', 'app/jade/**/{,*/}*.jade'],
        tasks: ['jade']
      }
    },
    express: {
      pusher: {
        options: {
          port: 5000,
          server: 'app/pusher/pusher-auth.js'
        }
      }
    },
    connect: {
      options: {
        port: 8000,
        // change this to '0.0.0.0' to access the server from outside
        hostname: '0.0.0.0'
      },
      server: {
        options: {
          middleware: function (connect) {
            return [
              mountFolder(connect, '.tmp'),
              mountFolder(connect, 'app')
            ];
          }
        }
      },
      test: {
        options: {
          middleware: function (connect) {
            return [
              mountFolder(connect, '.tmp'),
              mountFolder(connect, 'test')
            ];
          }
        }
      }
    },
    open: {
      server: {
        path: 'http://localhost:<%= connect.options.port %>/remote'
      }
    },
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '<%= folders.tmp %>',
            '<%= folders.dist %>/*'
          ]
        }]
      },
      server: '<%= folders.tmp %>'
    },
    mocha: {
      all: {
        options: {
          run: true,
          urls: ['http://localhost:<%= connect.options.port %>/index.html']
        }
      }
    },
    compass: {
      options: {
        sassDir: '<%= folders.app %>/styles',
        cssDir: '.tmp/remote/styles',
        imagesDir: '<%= folders.app %>/images',
        javascriptsDir: '<%= folders.app %>/scripts',
        fontsDir: '<%= folders.app %>/styles/fonts',
        importPath: 'app/bower_components',
        relativeAssets: true
      },
      dist: {
        options: {
          noLineComments: true
        }
      },
      server: {
        options: {
          debugInfo: true
        }
      }
    },
    jade: {
      html: {
        files: grunt.file.expandMapping(['{,*/}*.jade', '!**/_*'], 'dest', {
          cwd: 'app/jade',
          rename: function (dest, src) {
            return '<%= folders.tmp %>/' + src.replace(/\.jade$/, '.html');
          }
        }),
        options: {
          client: false,
          pretty: true,
          basedir: '<%= folders.app %>/jade'
        }
      }
    },
    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= folders.app %>',
          dest: '<%= folders.dist %>/remote',
          src: [
            'images/{,*/}*',
            'assets/{,*/}*',
            'scripts/{,*/}*js',
            'pusher/{,*/}*js',
            '!scripts/client-scripts.js'
          ]
        }, {
          expand: true,
          dot: true,
          cwd: '<%= folders.tmp %>/remote',
          dest: '<%= folders.dist %>/remote',
          src: ['styles/{,*/}*css', '!styles/client.css']
        },
        {
          expand: true,
          cwd: '<%= folders.tmp %>/remote',
          dest: '<%= folders.dist %>/remote',
          src: '*.html'
        },
        {
          expand: true,
          flatten: true,
          cwd: '<%= folders.app %>/bower_components',
          src: ['jquery/jquery.js', 'lodash/lodash.js', 'fishbone.js/fishbone.js'],
          dest: '<%= folders.dist %>/remote/scripts/vendor'
        }]
      },
      server: {
        files: [{
          expand: true,
          cwd: '<%= folders.app %>',
          dest: '<%= folders.tmp %>/remote',
          src: [
            'scripts/**/*.js',
            'images/{,*/}*',
            'assets/{,*/}*',
          ]
        },
        {
          expand: true,
          flatten: true,
          cwd: '<%= folders.app %>/bower_components',
          src: ['jquery/jquery.js', 'lodash/lodash.js', 'fishbone.js/fishbone.js'],
          dest: '<%= folders.tmp %>/remote/scripts/vendor'
        }]
      }
    },
    concurrent: {
      server: [
        'compass:server',
        'copy:server'
      ],
      test: [
        'compass'
      ]
    }
  });

  grunt.registerTask('server', function (target) {
    if (target === 'dist') {
      return grunt.task.run(['build', 'open', 'connect:dist:keepalive']);
    }

    grunt.task.run([
      'clean:server',
      'compass:server',
      'jade',
      'concurrent:server',
      'connect:server',
      'express:pusher',
      'open',
      'watch'
    ]);
  });

  grunt.registerTask('test', [
    'clean:server',
    'concurrent:test',
    'connect:test',
    'mocha'
  ]);

  grunt.registerTask('build', [
    'clean:dist',
    'jade',
    'compass:dist',
    'copy:dist',
  ]);

  grunt.registerTask('default', []);
};
