class WebshotURL extends Error {

    constructor(message) {
        super();
        this.name = 'WebshotURL';
        this.status = 500;
        this.message = message || 'Error taking screenshot for widget.';
    }

}

module.exports = WebshotURL;
