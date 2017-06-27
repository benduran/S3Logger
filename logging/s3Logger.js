
const
    AWS = require('aws-sdk'),
    moment = require('moment');

const levels = require('./levels');

const {S3} = AWS;

/**
 * @class S3Logger
 * @description Logs messages to both the console AND to a file in S3.
 * Allows you to set log priorities so that writes to and from S3 don't happen all the time
 */
class S3Logger {
    /**
     * @constructs S3Logger
     */
    constructor(options = {}) {
        const {
            logFile = 'app.log',
            noConsole = false,
            region = 'us-west-1',
            secretAccessKey,
            accessKeyId,
            bucket,
            level,
        } = options;
        if (secretAccessKey && accessKeyId) {
            AWS.config.update({
                secretAccessKey,
                accessKeyId,
            });
        }
        this.noConsole = noConsole || false;
        this.bucket = bucket;
        this.level = level || levels.DEBUG;
        this.region = region;
        this.logFile = logFile;
        this._s3 = new S3({
            region,
        });
    }
    _readLogFile() {
        return new Promise((resolve, reject) => {
            this._s3.getObject({
                Bucket: this.bucket,
                Key: this.logFile,
                ResponseContentType: 'text',
            }, (error, obj) => {
                if (error) {
                    if (error.code === 'NoSuchKey') {
                        return resolve('');
                    }
                    return reject(error);
                }
                // File should be returned as text. Let's do a toString(), just in case
                return resolve(obj.Body.toString('utf8'));
            });
        });
    }
    _writeLogFile(contents) {
        return new Promise((resolve, reject) => {
            this._s3.putObject({
                Body: contents,
                Bucket: this.bucket,
                Key: this.logFile,
                ContentType: 'text',
            }, (error) => {
                if (error) {
                    return reject(error);
                }
                return resolve();
            });
        });
    }
    async _appendToLogFile(toAppend) {
        const currentContents = await this._readLogFile();
        await this._writeLogFile(`${currentContents}${toAppend}`);
    }
    _formatLog(level, msg) {
        return `${moment.utc().format('M/D/YYYY HH:mm:ss:SS')} - ${levels.getString(level)} - ${msg}\n`;
    }
    async log(level, msg) {
        if (level <= this.level) {
            const formatted = this._formatLog(level, msg);
            let consoleFnc = null;
            switch (level) {
                case levels.ERROR:
                    consoleFnc = console.error;
                    break;
                case levels.WARN:
                    consoleFnc = console.warn;
                    break;
                case levels.INFO:
                    consoleFnc = console.info;
                    break;
                case levels.DEBUG:
                default:
                    consoleFnc = console.log;
                    break;
            }
            if (!this.noConsole) {
                consoleFnc(formatted);
            }
            await this._appendToLogFile(formatted);
        }
    }
    async error(exception) {
        await this.log(levels.ERROR, exception instanceof Error ? `${exception.message} at ${exception.stack}` : exception);
    }
    async warn(msg) {
        await this.log(levels.WARN, msg);
    }
    async info(msg) {
        await this.log(levels.INFO, msg);
    }
    async debug(msg) {
        await this.log(levels.DEBUG, msg);
    }
}

module.exports = S3Logger;
