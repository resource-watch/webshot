class koaSend extends Error {

    constructor(message) {
        super();
        this.name = 'Koa Send';
        this.status = 400;
        this.message = message || 'Error sending screenshot.';
    }

}

module.exports = koaSend;
