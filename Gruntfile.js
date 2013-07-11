// Generated on<%= (new Date).toISOString().split('T')[0] %> using <%= pkg.name %> <%= pkg.version %>
'use strict';
var lrSnippet = require('grunt-contrib-livereload/lib/utils').livereloadSnippet;
var mountFolder = function (connect, dir) {
    return connect.static(require('path').resolve(dir));
};

var io = require('socket.io').listen(8888);

io.sockets.on('connection', function (socket) {
  socket.join('room');

  socket.on('update:navigator', function (data) {
    io.sockets.in('room').emit('update:navigator', data);
  });

  socket.on('update:remote', function (data) {
    io.sockets.in('room').emit('update:remote', data);
  });

});

console.log('Sockets: listening on port 8888');

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
            livereload: {
                files: [
                    '.tmp/styles/{,*/}*.css',
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
        connect: {
            options: {
                port: 8000,
                // change this to '0.0.0.0' to access the server from outside
                hostname: 'localhost'
            },
            livereload: {
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
            dist: {},
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
                        '!scripts/client-scripts.js'
                    ]
                }, {
                    expand: true,
                    dot: true,
                    cwd: '<%= folders.tmp %>/remote',
                    dest: '<%= folders.dist %>/remote',
                    src: 'styles/{,*/}*css'
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
                    src: ['jquery/jquery.js', 'lodash/lodash.js'],
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
                    src: ['jquery/jquery.js', 'lodash/lodash.js'],
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
            'livereload-start',
            'connect:livereload',
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
