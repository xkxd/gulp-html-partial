const fs = require('fs');
const partition = require('lodash.partition');
const html = require('html');
const gutil = require('gulp-util');

module.exports = (function () {
    "use strict";

    /**
     * @type {String}
     */
    const pluginName = 'gulp-html-partial';

    /**
     * Default settings
     *
     * @enum {String}
     */
    const options = {
        tagName: 'partial',
        basePath: '',
        variablePrefix: '@@'
    };

    /**
     * Matches <tagName></tagName> and <tagName />
     *
     * @param {String} html - stringified file content
     * @returns {Array.<String>}
     */
    function getTags(html) {
        const closed = html.match(new RegExp(`<${options.tagName}(.*)/${options.tagName}>`, 'g')) || [];
        const selfClosed = html.match(new RegExp(`<${options.tagName}(.*?)\/>`, 'g')) || [];

        return [].concat(closed, selfClosed);
    }

    /**
     * Extracts attributes from template tags as an array of objects
     *
     * @example of output
     * [
     *   { 
     *     key: 'src',
     *     value: 'partial.html'
     *   },
     *   { 
     *     key: 'title',
     *     value: 'Some title'
     *   }
     * ]
     *
     * @param {String} tag - tag to replace
     * @returns {Array.<Object>}
     */
    function getAttributes(tag) {
        let running = true;
        const attributes = [];
        const regexp = /(\S+)=["']?((?:.(?!["']?\s+(?:\S+)=|[>"']))+.)["']?/g;

        while (running) {
            const match = regexp.exec(tag);

            if (match) {
                attributes.push({
                    key: match[1],
                    value: match[2]
                })
            } else {
                running = false;
            }
        }

        return attributes;
    }

    /**
     * Gets file using node.js' file system based on src attribute
     *
     * @param {Array.<Object>} attributes - tag
     * @returns {String}
     */
    function getPartial(attributes) {
        const splitAttr = partition(attributes, (attribute) => attribute.key === 'src');
        const sourcePath = splitAttr[0][0] && splitAttr[0][0].value;
        let file;

        if (sourcePath && fs.existsSync(options.basePath + sourcePath)) {
            file = injectHTML(fs.readFileSync(options.basePath + sourcePath))
        } else if (!sourcePath) {
            gutil.log(`${pluginName}:`, new gutil.PluginError(pluginName, gutil.colors.red(`Some partial does not have 'src' attribute`)).message);
        } else {
            gutil.log(`${pluginName}:`, new gutil.PluginError(pluginName, gutil.colors.red(`File ${options.basePath + sourcePath} does not exist.`)).message);
        }

        return replaceAttributes(file, splitAttr[1]);
    }

    /**
     * Replaces partial content with given attributes
     *
     * @param {Object|undefined} file - through2's file object
     * @param {Array.<Object>} attributes - tag
     * @returns {String}
     */
    function replaceAttributes(file, attributes) {
        return (attributes || []).reduce((html, attrObj) =>
            html.replace(options.variablePrefix + attrObj.key, attrObj.value), file && file.toString() || '');
    }

    /**
     * @param {String} html - HTML content of modified file
     * @returns {String}
     */
    function getHTML(html) {
        const tags = getTags(html);
        const partials = tags.map((tag) => getPartial(getAttributes(tag)));

        return tags.reduce((output, tag, index) =>
            output.replace(tag, partials[index]), html);
    }

    /**
     * @param {Object} file - through2's or nodejs' file object
     * @returns {Object}
     */
    function injectHTML(file) {
        if (file.contents) {
            file.contents = new Buffer(html.prettyPrint(getHTML(file.contents.toString())));
        } else {
            file = new Buffer(html.prettyPrint(getHTML(file.toString())))
        }

        return file;
    }

    /**
     * @param {Object} config - config object
     * @returns {Buffer}
     */
    function transform(config) {
        Object.assign(options, config);

        return require('through2').obj(function (file, enc, callback) {
            if (file.isStream()) {
                this.emit('error', new gutil.PluginError(pluginName, 'Streams are not supported'));

                return callback(null, file);
            }
            
            if (file.isBuffer()) {
                file = injectHTML(file);
            }

            this.push(file);

            return callback()
        });
    }

    return transform;
})();
