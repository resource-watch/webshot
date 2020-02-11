const chai = require('chai');
const nock = require('nock');
const sinon = require('sinon');

const { getTestServer } = require('./utils/test-server');
const { stubPuppeteer, stubKoaSend } = require('./utils/stubs');

chai.should();

let requester;
let sinonSandbox;

nock.disableNetConnect();
nock.enableNetConnect(process.env.HOST_IP);

describe('GET /', () => {
    before(async () => {
        if (process.env.NODE_ENV !== 'test') {
            throw Error(`Running the test suite with NODE_ENV ${process.env.NODE_ENV} may result in permanent data loss. Please use NODE_ENV=test.`);
        }
    });

    beforeEach(() => { sinonSandbox = sinon.createSandbox(); });

    describe('happy case', () => {
        it('Takes a screenshot of the widget returning 200 OK with the URL for the pdf', async () => {
            stubPuppeteer(sinonSandbox);
            stubKoaSend(sinonSandbox, true);

            requester = await getTestServer();

            const response = await requester.get(`/api/v1/webshot?url=http://www.example.com&filename=newname`).send();
            response.status.should.equal(200);
            response.type.should.equal('application/pdf');
        });

        it('Takes a screenshot of the widget returning 200 OK with the URL for the png', async () => {
            stubPuppeteer(sinonSandbox);
            stubKoaSend(sinonSandbox, true);

            requester = await getTestServer();

            const response = await requester.get(`/api/v1/webshot?url=http://www.example.com&filename=newname&format=png`).send();
            response.status.should.equal(200);
            response.type.should.equal('application/png');
        });
    });

    it('If puppeteer fails taking the screenshot returns 500 Internal Server Error', async () => {
        stubPuppeteer(sinonSandbox, false);
        stubKoaSend(sinonSandbox, true);

        requester = await getTestServer();

        const response = await requester.get(`/api/v1/webshot?url=http://www.example.com&filename=newname`).send();
        response.status.should.equal(500);
        response.body.should.have.property('errors').and.be.an('array');
        response.body.errors[0].should.have.property('status').and.equal(500);
    });

    it('If send fails returns 500 Internal Server Error', async () => {
        stubPuppeteer(sinonSandbox, false);
        stubKoaSend(sinonSandbox, false);

        requester = await getTestServer();

        const response = await requester.get(`/api/v1/webshot?url=http://www.example.com&filename=newname`).send();
        response.status.should.equal(500);
        response.body.should.have.property('errors').and.be.an('array');
        response.body.errors[0].should.have.property('status').and.equal(500);
    });

    afterEach(() => {
        if (!nock.isDone()) {
            throw new Error(`Not all nock interceptors were used: ${nock.pendingMocks()}`);
        }

        requester.close();
        sinonSandbox.restore();
    });
});
