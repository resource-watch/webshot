/* eslint-disable import/no-extraneous-dependencies */
const nock = require('nock');

require('should');

describe('E2E test', () => {

    before(() => {

        // simulating gateway communications
        nock(`${process.env.CT_URL}/v1`)
            .post('/', () => true)
            .reply(200, {
                status: 200,
                detail: 'Ok'
            });
    });

    after(() => {
    });
});
