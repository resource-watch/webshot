const sinon = require('sinon');
const puppeteer = require('puppeteer');
const s3 = require('@auth0/s3');
const EventEmitter = require('events');

const stubPuppeteer = () => {
    sinon.stub(puppeteer, 'launch').returns(new Promise((resolve) => resolve({
        newPage() {
            return {
                setViewport() { return true; },
                goto() { return true; },
                waitFor() { return true; },
                $() {
                    return { screenshot() { return true; } };
                }
            };
        },
        close() { return true; },
    })));
};

const stubS3 = (url) => {
    sinon.stub(s3, 'createClient').returns({
        uploadFile() {
            const eventEmitter = new EventEmitter();
            setTimeout(() => { eventEmitter.emit('end'); }, 1000);
            return eventEmitter;
        },
    });

    sinon.stub(s3, 'getPublicUrlHttp').returns(url);
};

module.exports = { stubPuppeteer, stubS3 };
