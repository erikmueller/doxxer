/*eslint-env node*/

module.exports = function (grunt) {
    'use strict';

    var dox = require('dox'),
        path = require('path'),
        fs = require('fs'),
        _ = require('lodash'),
        dust = require('dustjs-linkedin');

    function isModuleExports (block) {
        return block.ctx && block.ctx.name === 'exports' && block.ctx.receiver === 'module';
    }

    grunt.task.registerMultiTask('doxxer', 'Generate JSDoc-like documentation', function () {
        var data = [],
            encoding = {
                encoding: 'utf-8'
            },
            options = this.options({
                template: 'assets/template.dust'
            });

        if (!this.files.length) {
            throw new Error('No files specified, nothing to do');
        }

        // read and compile our templates and register them for the `dust` cache
        dust.loadSource(dust.compile(grunt.file.read(options.template, encoding), 'tmpl'));

        this.files.forEach(function (file) {
            dox.parseComments(grunt.file.read(file.src[0], encoding)).forEach(function (block) {
                var blockData = {};

                // ommit the module exports function
                if (!isModuleExports(block)) {
                    blockData.method = block.ctx.name;
                }

                data.push(_.extend(blockData, {
                    summary: block.description.summary,
                    params: _.filter(block.tags, function (tag) {
                        return tag.name && tag.type === 'param';
                    }),
                    returns: _.find(block.tags, {type: 'returns'}),
                    code: block.code
                }));
            });

            grunt.file.mkdir(path.dirname(file.dest));

            grunt.log.ok('writing: ' + file.dest);

            console.log(data)

            dust.stream('tmpl', {
                methods: data
            }).pipe(fs.createWriteStream(file.dest + '.html'));
        });
    });
};
