'use strict';
var path = require('path');
var fs = require('fs');
var zlib = require('zlib');

const Transport = require('winston-transport');

module.exports = class WinstonHuuMinhTransport extends Transport {
    constructor(opts) {
        super(opts);
        if(this.writable) {
            this.stream;
            const dirname = opts.dirname || "./logs";
            const filename = opts.filename || "huuminh.log";

            if(!fs.existsSync(dirname)) {
                fs.mkdirSync(filename);
            }
            const logpath = path.join(dirname, filename);
            if(fs.existsSync(logpath)) {
                var stats = fs.statSync(logpath);
                const maxsize = opts.maxsize || 5 * Math.pow(1024, 2); // If maxsize not set. Default 5 MB
                const filesize = parseInt(stats.size, 10);

                if(filesize > maxsize) {
                    if(this.stream) fs.closeSync(this.stream);
                    var date = new Date();
                    var gzip = zlib.createGzip();
                    var old = fs.createReadStream(logpath);
                    var backup_filename = function (filename, count) {
                        var bkfilename = filename.replace(/\s/g, "_");
                        if(typeof count !== "undefined") {
                            bkfilename = `${path.basename(bkfilename)}_${count}_${path.extname(bkfilename)}`;
                        } else count = 1;

                        if(fs.existsSync(path.join(dirname, bkfilename+".gz"))) {
                            return backup_filename(filename, count+1);
                        }
                        return path.join(dirname, bkfilename+".gz");
                    };

                    var newFile = backup_filename(date.toDateString() + '__' + filename);
                    var out = fs.createWriteStream(newFile);
                    old.pipe(gzip).pipe(out).on('finish', function () {
                        fs.unlinkSync(logpath);
                    });
                }
            }

            this.stream = fs.createWriteStream(logpath, { flags: 'a' });

            if (this.stream) {
                this.stream.on('error', function (err) {
                    winston.error(err.message);
                });
            }
        }
    }

    log(data, callback) {
        if(this.stream) {
            var date = new Date();
            var prefix = '['+date.toDateString() + ' ' + date.toTimeString().substr(0, 8) + '][' + process.pid + ']';
            var message = "";
            if (data instanceof Error) {
                message = prefix+"["+data.level+"] Message: "+data.message+"\nError Details: "+data.stack;
            } else {
                message = prefix+"["+data.level+"] "+data.message;
            }
            this.stream.write(message+"\n", "utf8");
        }
        callback();
    }
};


