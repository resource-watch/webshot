class WebshotNotFound extends Error {

    constructor(message) {
        super();
        this.name = 'WebshotNotFound';
        this.status = 404;
        this.message = message || 'URL not found.';
    }

}

module.exports = WebshotNotFound;
