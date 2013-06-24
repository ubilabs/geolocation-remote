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
            livereload: {
                files: [
                    '<%= folders.app %>/*.html',
                    '{.tmp,<%= folders.app %>}/styles/{,*/}*.css',
                    '{.tmp,<%= folders.app %>}/scripts/{,*/}*.js',
                    '<%= folders.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
                ],
                tasks: ['livereload']
            },
            jade: {
                files: ['app/jade/{,*/}*.jade', 'app/jade/**/{,*/}*.jade'],
                tasks: ['jade']
            }
        },
        connect: {
            options: {
                port: 9999,
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
            },
            dist: {
                options: {
                    middleware: function (connect) {
                        return [
                            mountFolder(connect, 'dist')
                        ];
                    }
                }
            }
        },
        open: {
            server: {
                path: 'http://localhost:<%= connect.options.port %>'
            }
        },
        clean: {
            dist: {
                files: [{
                    dot: true,
                    src: [
                        '.tmp',
                        '<%= folders.dist %>/*',
                        '!<%= folders.dist %>/.git*'
                    ]
                }]
            },
            server: '.tmp'
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
                cssDir: '.tmp/styles',
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

                        if (/i18n/.test(src)) {
                            return '<%= folders.tmp %>/' + src.replace(/index.i18n-(.*).jade/, '$1.html');;
                        }

                        return '<%= folders.tmp %>/' + src.replace(/\.jade$/, '.html');
                    }
                }),
                options: {
                    client: false,
                    pretty: true,
                    basedir: '<%= folders.app %>/jade',
                    data: function(dest, src) {

                        var page = src[0].replace(/app\/jade\/(.*)\/index.jade/, '$1');

                        return {
                            page: page
                        };
                    }
                }
            }
        },
        rev: {
            dist: {
                files: {
                    src: [
                        '<%= folders.dist %>/scripts/{,*/}*.js',
                        '<%= folders.dist %>/styles/{,*/}*.css',
                        '<%= folders.dist %>/images/{,*/}*.{png,jpg,jpeg,gif,webp}',
                        '<%= folders.dist %>/styles/fonts/*'
                    ]
                }
            }
        },
        useminPrepare: {
            html: '<%= folders.tmp %>/index.html',
            options: {
                dest: '<%= folders.dist %>'
            }
        },
        usemin: {
            html: ['<%= folders.dist %>/{,*/}*.html'],
            css: ['<%= folders.dist %>/styles/{,*/}*.css'],
            options: {
                dirs: ['<%= folders.dist %>']
            }
        },
        imagemin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= folders.app %>/images',
                    src: '{,*/}*.{png,jpg,jpeg}',
                    dest: '<%= folders.dist %>/images'
                }]
            }
        },
        svgmin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= folders.app %>/images',
                    src: '{,*/}*.svg',
                    dest: '<%= folders.dist %>/images'
                }]
            }
        },
        cssmin: {
            dist: {
                files: {
                    '<%= folders.dist %>/styles/main.css': [
                        '.tmp/styles/{,*/}*.css'
                    ]
                }
            }
        },
        htmlmin: {
            dist: {
                options: {
                    /*removeCommentsFromCDATA: true,
                    // https://github.com/folders/grunt-usemin/issues/44
                    //collapseWhitespace: true,
                    collapseBooleanAttributes: true,
                    removeAttributeQuotes: true,
                    removeRedundantAttributes: true,
                    useShortDoctype: true,
                    removeEmptyAttributes: true,
                    removeOptionalTags: true*/
                },
                files: [{
                    expand: true,
                    cwd: '<%= folders.tmp %>',
                    src: '{,*/}*.html',
                    dest: '<%= folders.dist %>'
                }]
            }
        },
        // Put files not handled in other tasks here
        copy: {
            dist: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '<%= folders.app %>',
                    dest: '<%= folders.dist %>',
                    src: [
                        '*.{ico,txt}',
                        '.htaccess',
                        'images/{,*/}*',
                        'styles/fonts/*',
                        'scripts/{,*/}*js',
                        'bower_components/**/*.js'
                    ]
                }, {
                    expand: true,
                    dot: true,
                    cwd: '<%= folders.tmp %>',
                    dest: '<%= folders.dist %>',
                    src: [
                        'styles/{,*/}*css',
                        '*html'
                    ]
                }]
            }
        },
        concurrent: {
            server: [
                'compass:server'
            ],
            test: [
                'compass'
            ],
            dist: [
                'compass:dist',
                'imagemin',
                'svgmin',
                'htmlmin'
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
            'connect:livereload:keepalive',
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
        'concurrent:dist',
        // 'copy:js',
        // 'copy:css',
        // 'useminPrepare',
        // 'concurrent:dist',
        // 'cssmin',
        // 'concat',
        // 'uglify',
        'copy:dist',
        // 'copy:assets',
        // 'rev',
        // 'usemin'
    ]);

    grunt.registerTask('default', [
        'jshint',
        'test',
        'build'
    ]);
};
