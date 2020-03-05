const chai = require('chai');
const nock = require('nock');
const sinon = require('sinon');

const { getTestServer } = require('./utils/test-server');
const { stubPuppeteer, stubS3 } = require('./utils/stubs');

chai.should();

let requester;
let sinonSandbox;

nock.disableNetConnect();
nock.enableNetConnect(process.env.HOST_IP);

describe('POST widget/:widget/thumbnail', () => {
    before(async () => {
        if (process.env.NODE_ENV !== 'test') {
            throw Error(`Running the test suite with NODE_ENV ${process.env.NODE_ENV} may result in permanent data loss. Please use NODE_ENV=test.`);
        }

        requester = await getTestServer();
    });

    beforeEach(() => { sinonSandbox = sinon.createSandbox(); });

    it('Takes a snapshot of the widget returning 200 OK with the URL for the screenshot (happy case)', async () => {
        stubPuppeteer(sinonSandbox);
        stubS3(sinonSandbox, 'http://www.example.com');

        const response = await requester.post(`/api/v1/webshot/widget/123/thumbnail`).send();
        response.status.should.equal(200);
        response.body.should.have.property('data').and.be.an('object');
        response.body.data.should.have.property('widgetThumbnail').and.equal('http://www.example.com');
    });

    it('If puppeteer fails taking the screenshot returns 400 Internal Server Error', async () => {
        stubPuppeteer(sinonSandbox, false);
        stubS3(sinonSandbox, 'http://www.example.com');

        const response = await requester.post(`/api/v1/webshot/widget/123/thumbnail`).send();
        response.status.should.equal(400);
        response.body.should.have.property('errors').and.be.an('array');
        response.body.errors[0].should.have.property('status').and.equal(400);
        response.body.errors[0].should.have.property('detail').and.include('Error taking screenshot on URL');
    });

    it('If uploading to S3 fails returns 500 Internal Server Error', async () => {
        stubPuppeteer(sinonSandbox);
        stubS3(sinonSandbox, 'http://www.example.com', false);

        const response = await requester.post(`/api/v1/webshot/widget/123/thumbnail`).send();
        response.status.should.equal(500);
        response.body.should.have.property('errors').and.be.an('array');
        response.body.errors[0].should.have.property('status').and.equal(500);
        response.body.errors[0].should.have.property('detail').and.include('Error uploading screenshot to S3');
    });

    afterEach(() => {
        if (!nock.isDone()) {
            throw new Error(`Not all nock interceptors were used: ${nock.pendingMocks()}`);
        }

        sinonSandbox.restore();
    });
});
