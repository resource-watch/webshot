const puppeteer = require('puppeteer');
const s3 = require('@auth0/s3');
const EventEmitter = require('events');

const stubPuppeteer = (sinon, success = true) => {
    sinon.stub(puppeteer, 'launch').returns(new Promise((resolve) => resolve({
        newPage() {
            return {
                setViewport() { return true; },
                goto() { return true; },
                waitFor() { return true; },
                $() {
                    return {
                        screenshot() {
                            if (!success) {
                                throw new Error();
                            }
                            return true;
                        }
                    };
                }
            };
        },
        close() { return true; },
    })));
};

const stubS3 = (sinon, url, success = true) => {
    sinon.stub(s3, 'createClient').returns({
        uploadFile() {
            const eventEmitter = new EventEmitter();
            setTimeout(() => { eventEmitter.emit(success ? 'end' : 'error'); }, 500);
            return eventEmitter;
        },
    });

    sinon.stub(s3, 'getPublicUrlHttp').returns(url);
};

module.exports = { stubPuppeteer, stubS3 };
