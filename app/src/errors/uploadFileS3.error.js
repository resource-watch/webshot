class UploadFileS3 extends Error {

    constructor(message) {
        super();
        this.name = 'UploadFileS3';
        this.status = 500;
        this.message = message || 'Error uploading file to S3.';
    }

}

module.exports = UploadFileS3;
