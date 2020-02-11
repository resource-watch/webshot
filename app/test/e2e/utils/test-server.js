const chai = require('chai');
const chaiHttp = require('chai-http');
const nock = require('nock');

chai.use(chaiHttp);

exports.getTestServer = async function getTestServer() {
    nock(process.env.CT_URL)
        .post(`/api/v1/microservice`)
        .reply(200);

    const serverPromise = require('../../../src/app');
    const { server } = await serverPromise();
    return chai.request(server).keepOpen();
};
