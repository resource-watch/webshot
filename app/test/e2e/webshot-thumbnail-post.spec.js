const chai = require('chai');
const nock = require('nock');

const { getTestServer } = require('./utils/test-server');
const { stubPuppeteer, stubS3 } = require('./utils/stubs');

chai.should();

let requester;

nock.disableNetConnect();
nock.enableNetConnect(process.env.HOST_IP);

describe('POST widget/:widget/thumbnail', () => {
    before(async () => {
        if (process.env.NODE_ENV !== 'test') {
            throw Error(`Running the test suite with NODE_ENV ${process.env.NODE_ENV} may result in permanent data loss. Please use NODE_ENV=test.`);
        }

        requester = await getTestServer();
    });

    it('Takes a snapshot of the widget returning 200 OK with the URL for the screenshot (happy case)', async () => {
        stubPuppeteer();
        stubS3('http://www.example.com');

        const response = await requester.post(`/api/v1/webshot/widget/123/thumbnail`).send();
        response.status.should.equal(200);
        response.body.should.have.property('data').and.be.an('object');
        response.body.data.should.have.property('widgetThumbnail').and.equal('http://www.example.com');
    });

    afterEach(() => {
        if (!nock.isDone()) {
            throw new Error(`Not all nock interceptors were used: ${nock.pendingMocks()}`);
        }
    });
});
