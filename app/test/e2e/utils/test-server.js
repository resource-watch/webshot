const chai = require('chai');
const chaiHttp = require('chai-http');
const nock = require('nock');

let requester;

chai.use(chaiHttp);

exports.getTestServer = async function getTestServer() {
    if (requester) {
        return requester;
    }

    nock(process.env.CT_URL)
        .post(`/api/v1/microservice`)
        .reply(200);

    const serverPromise = require('../../../src/app');
    const { server } = await serverPromise();
    requester = chai.request(server).keepOpen();
    return requester;
};

exports.closeTestAgent = function closeTestAgent() {
    if (!requester) {
        return;
    }
    requester.close();
    requester = null;
};
