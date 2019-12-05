class MissingS3Credentials extends Error {

    constructor() {
        super();
        this.name = 'MissingS3Credentials';
        this.status = 500;
        this.message = 'Missing S3 Credentials';
    }

}

module.exports = MissingS3Credentials;
