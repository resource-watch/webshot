const chai = require('chai');
const chaiHttp = require('chai-http');

let requester;

chai.use(chaiHttp);

exports.getTestServer = async function getTestServer() {
    if (requester) {
        return requester;
    }

    const serverPromise = require('../../../src/app');
    return chai.request(serverPromise).keepOpen();
};
