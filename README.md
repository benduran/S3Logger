# S3Logger
A simple, naive application logging utility that can integrate / write to a file in an AWS S3 bucket. This wasn't meant to replace a full-blown Winston, Bunyon, etc logger, but a quick drop-in for people who want to dump their log files to a file in an Amazon S3 bucket somewhere.

## Installation
`npm install s3logger --save`

## Usage
NOTE: This package uses `async / await` natively. Be sure that your version of NodeJS supports this without transpiling.

### Basic
```
const {S3Logger, levels} = require('s3logger');

const logger = new S3Logger({
    /* Init options here */
});

logger.info('Hi, I am a message that will get written to both the console AND S3!');

logger.log(levels.DEBUG, 'I am using the explicit log function and specifying a log-level');

```

### Options
```
{
    logFile = 'app.log',
    noConsole = false,
    secretAccessKey,
    accessKeyId,
    region = 'us-west-1',
    bucket,
    level,
}
```

- `logFile` - `String` - Name of the log file that will be written to S3. Defaults to `app.log`.
- `noConsole` - `Boolean` - Whether or not the logger should ignore writing out to the console. Defaults to `false`.
- `secretAccessKey` - `String` - AWS IAM SecretAccessKey. It is **highly recommend** you create a dedicated IAM role to allow your cloud instances to read / write to S3. If you are developing locally, however, use `secretAccessKey`, combined with `accessKeyId` (below) to allow for testing integration with S3
- `accessKeyId` - `String` - AWS IAM Access Key ID. Used in conjunction with the `secretAccessKey`. Please see note (above) for recommendations.
- `region` - `String` - AWS region to use when reading / writing files. Defaults to `us-west-1`. Can be overwritten on the instance of S3Logger that you have initialized with `new`. See example below:

```
const logger = new require('s3logger).S3Logger({
    /* Options */
});
logger.region = 'us-east-1';
```
- `bucket` - `String` - AWS S3 bucket where log file will be read / written. Can be overwritten on the instance of S3Logger that you have initialized with `new`. See example below:

```
const logger = new require('s3logger).S3Logger({
    /* Options */
});
logger.bucket = 'MyCoolBucket';
```
- `level` - `Number` - Which type of severity will get logged. Supports a subset of standard `npm` logging variables (see below):

```
ERROR = 0
WARN = 1
INFO = 2
DEBUG = 3
```