/*eslint-env node*/

/**
 *  doxxer
 *  https://github.com/erikmueller/doxxer
 *
 *  Copyright (c) 2014 Erik Mueller
 *  Licensed under the MIT license.
 *
 */

module.exports = function (grunt) {
    'use strict';
    // load all npm grunt tasks
    grunt.task.loadTasks('tasks');

    // Project configuration.
    grunt.initConfig({
        doxxer: {
            all: {
                files: [{
                    expand: true,
                    cwd: 'examples/src',
                    src: ['**/*.js'],
                    dest: 'out'
                }]
            }
        }
    });

    // By default, lint and run all tests.
    grunt.registerTask('default', ['doxxer']);
};
