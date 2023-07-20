const puppeteer = require('puppeteer');
const s3 = require('@auth0/s3');
const EventEmitter = require('events');
const config = require('config');
const { mockCloudWatchLogRequest, mockValidateRequest } = require('rw-api-microservice-node/dist/test-mocks');

const stubPuppeteer = (sinon, url, success = true, notFound = false) => {
    const gotoStub = sinon.stub();
    if (notFound) {
        gotoStub.withArgs(url, { waitUntil: ['networkidle2', 'domcontentloaded'] }).throws(new Error('not found'));
    } else {
        gotoStub.withArgs(url, { waitUntil: ['networkidle2', 'domcontentloaded'] }).resolves(true);
    }
    gotoStub.throws('stub called with invalid arguments');

    // eslint-disable-next-line no-promise-executor-return
    sinon.stub(puppeteer, 'launch').returns(new Promise((resolve) => resolve({
        newPage() {
            return {
                setViewport() {
                    return true;
                },
                goto: gotoStub,
                waitFor() {
                    return true;
                },
                emulateMedia() {
                    return true;
                },
                $() {
                    return {
                        screenshot() {
                            if (!success) {
                                throw new Error();
                            }
                            return true;
                        }
                    };
                },
                screenshot() {
                    if (!success) {
                        throw new Error();
                    }
                    return true;
                },
                pdf() {
                    if (!success) {
                        throw new Error();
                    }
                    return true;
                }
            };
        },
        close() {
            return true;
        },
    })));
};

const stubS3 = (sinon, url, success = true) => {
    sinon.stub(s3, 'createClient').returns({
        uploadFile() {
            const eventEmitter = new EventEmitter();
            setTimeout(() => {
                eventEmitter.emit(success ? 'end' : 'error');
            }, 500);
            return eventEmitter;
        },
    });

    sinon.stub(s3, 'getPublicUrl').returns(url);
};

const stubKoaSend = (sinon, success = true) => {
    // First we need to remove the doStuff module
    if (require.cache[require.resolve('routes/api/v1/webshot.router')]) {
        delete require.cache[require.resolve('routes/api/v1/webshot.router')];
    }

    // Second we need rewrite the cached sum module to be as follows:
    require.cache[require.resolve('koa-send')] = {
        exports: async function send(ctx, path) {
            if (!success) {
                throw new Error();
            }

            const fileFormat = path.split('.').pop();
            ctx.set('Content-Length', 100);
            ctx.type = `application/${fileFormat}`;
            ctx.body = 'BODY EXAMPLE';

            return `/path/to/${fileFormat}`;
        }
    };

    // Third we need to require the doStuff module again
    require('routes/api/v1/webshot.router');
};

const APPLICATION = {
    data: {
        type: 'applications',
        id: '649c4b204967792f3a4e52c9',
        attributes: {
            name: 'grouchy-armpit',
            organization: null,
            user: null,
            apiKeyValue: 'a1a9e4c3-bdff-4b6b-b5ff-7a60a0454e13',
            createdAt: '2023-06-28T15:00:48.149Z',
            updatedAt: '2023-06-28T15:00:48.149Z'
        }
    }
};

const mockValidateRequestWithApiKey = ({
    apiKey = 'api-key-test',
    application = APPLICATION
}) => {
    mockValidateRequest({
        gatewayUrl: process.env.GATEWAY_URL,
        microserviceToken: process.env.MICROSERVICE_TOKEN,
        application,
        apiKey
    });
    mockCloudWatchLogRequest({
        application,
        awsRegion: process.env.AWS_REGION,
        logGroupName: process.env.CLOUDWATCH_LOG_GROUP_NAME,
        logStreamName: config.get('service.name')
    });
};

module.exports = {
    stubPuppeteer, stubS3, stubKoaSend, mockValidateRequestWithApiKey
};
