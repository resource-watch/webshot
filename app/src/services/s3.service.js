const logger = require('logger');
const s3 = require('s3');
const MissingS3Credentials = require('errors/missingS3Credentials.error');

const { S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY } = process.env;

class S3Service {

    static async uploadFileToS3(filePath, fileName) {
        if (!S3_ACCESS_KEY_ID || !S3_SECRET_ACCESS_KEY) {
            logger.error('[SERVICE] S3 access credentials missing');
            throw new MissingS3Credentials();
        }

        const S3Client = s3.createClient({
            maxAsyncS3: 20, // this is the default
            s3RetryCount: 3, // this is the default
            s3RetryDelay: 1000, // this is the default
            multipartUploadThreshold: 20971520, // this is the default (20 MB)
            multipartUploadSize: 15728640, // this is the default (15 MB)
            s3Options: {
                accessKeyId: S3_ACCESS_KEY_ID,
                secretAccessKey: S3_SECRET_ACCESS_KEY,
                region: 'us-east-1'
            }
        });

        try {
            logger.info('[SERVICE] Uploading to S3');
            const key = `resourcewatch/${process.env.NODE_ENV}/thumbnails/${fileName}`;
            const params = {
                localFile: filePath,
                s3Params: {
                    Bucket: 'wri-api-backups',
                    Key: key,
                    ACL: 'public-read'
                }
            };
            const uploader = S3Client.uploadFile(params);
            await new Promise((resolve, reject) => {
                uploader.on('end', data => {
                    logger.info('[SERVICE] File uploaded to S3');
                    resolve(data);
                });
                uploader.on('error', err => {
                    logger.error('[SERVICE] Error uploading file to S3: ', err);
                    reject(err);
                });
            });
            const s3file = s3.getPublicUrlHttp(params.s3Params.Bucket, params.s3Params.Key);
            return s3file;
        } catch (err) {
            throw err;
        }
    }

}

module.exports = S3Service;
