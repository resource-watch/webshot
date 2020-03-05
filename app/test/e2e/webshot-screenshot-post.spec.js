const chai = require('chai');
const nock = require('nock');
const sinon = require('sinon');

const { getTestServer, closeTestAgent } = require('./utils/test-server');
const { stubPuppeteer, stubKoaSend } = require('./utils/stubs');

chai.should();

let requester;
let sinonSandbox;

nock.disableNetConnect();
nock.enableNetConnect(process.env.HOST_IP);

describe('Screenshot endpoint', () => {
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

    it('If there is no URL, returns 400 indicating url param is required', async () => {
        stubPuppeteer(sinonSandbox);
        stubKoaSend(sinonSandbox, true);

        requester = await getTestServer();

        const response = await requester.get(`/api/v1/webshot?url=&filename=newname`).send();
        response.status.should.equal(400);
        response.body.should.have.property('errors').and.be.an('array');
        response.body.errors[0].should.have.property('status').and.equal(400);
        response.body.errors[0].should.have.property('detail').and.include('url param is required');
    });

    it('If there is no filename, returns 400 indicating filename param is required', async () => {
        stubPuppeteer(sinonSandbox);
        stubKoaSend(sinonSandbox, true);

        requester = await getTestServer();

        const response = await requester.get(`/api/v1/webshot?url=http://www.example.com&filename=`).send();
        response.status.should.equal(400);
        response.body.should.have.property('errors').and.be.an('array');
        response.body.errors[0].should.have.property('status').and.equal(400);
        response.body.errors[0].should.have.property('detail').and.include('filename param is required');
    });

    it('If format is invalid, returns 400 indicating format param is invalid', async () => {
        stubPuppeteer(sinonSandbox);
        stubKoaSend(sinonSandbox, true);

        requester = await getTestServer();

        const response = await requester.get(`/api/v1/webshot?url=http://www.example.com&filename=newname&format=bmp`).send();
        response.status.should.equal(400);
        response.body.should.have.property('errors').and.be.an('array');
        response.body.errors[0].should.have.property('status').and.equal(400);
        response.body.errors[0].should.have.property('detail').and.include('format param is invalid');
    });

    it('If protocol in url is invalid, returns 400 indicating protocol param is invalid', async () => {
        stubPuppeteer(sinonSandbox);
        stubKoaSend(sinonSandbox, true);

        requester = await getTestServer();

        const response = await requester.get(`/api/v1/webshot?url=file://www.example.com&filename=newname`).send();
        response.status.should.equal(400);
        response.body.should.have.property('errors').and.be.an('array');
        response.body.errors[0].should.have.property('status').and.equal(400);
        response.body.errors[0].should.have.property('detail').and.include('The protocol in url param is not valid. Use http or https.');
    });

    it('If url query param does not exist, returns 404 HTTP error code', async () => {
        stubPuppeteer(sinonSandbox, true, true);
        stubKoaSend(sinonSandbox, true);

        requester = await getTestServer();

        const response = await requester.get(`/api/v1/webshot?url=http://www.example.com&filename=newname`).send();
        response.status.should.equal(404);
    });

    afterEach(() => {
        if (!nock.isDone()) {
            throw new Error(`Not all nock interceptors were used: ${nock.pendingMocks()}`);
        }

        sinonSandbox.restore();

        closeTestAgent();
    });
});
