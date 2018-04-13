'use strict';

var fs = require('fs');
var File = module.exports;

File.exists = function (path, callback) {
    fs.stat(path, function (err) {
        if (err) {
            if (err.code === 'ENOENT') {
                return callback(null, false);
            }
        }
        callback(err, true);
    });
};

File.existsSync = function (path) {
    try {
        fs.statSync(path);
    } catch (err) {
        if (err.code === 'ENOENT') {
            return false;
        }
        throw err;
    }

    return true;
};