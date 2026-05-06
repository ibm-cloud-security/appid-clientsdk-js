const assert = require('assert');
const expect = require('chai').expect;
const nock = require('nock');
const RequestHandler = require('../src/RequestHandler');
const baseUrl = 'http://example.invalid';

describe('RequestHandler tests', () => {
	let requestHandler = new RequestHandler().request;

	beforeEach(() => {
		nock.cleanAll();
	});

	it('returns 200 response', async () => {
		const successPath = '/get';
        nock(baseUrl)
            .get(successPath)
            .reply(200, {
                url: baseUrl + successPath
            });

        const res = await requestHandler(baseUrl + successPath);
        assert.deepEqual(res.url, baseUrl + successPath);
		assert.ok(nock.isDone());
    });

	it('returns error - failed to fetch', async () => {
		const errorPath = '/status/500';
		const invalidUrl = baseUrl + errorPath;

		// Mock a 500 response
		nock(baseUrl)
			.get(errorPath)
			.reply(500, {});

		try {
			await requestHandler(invalidUrl);
			throw new Error('Test should have thrown error'); // ensures test failure if no error is thrown
		} catch (e) {
			expect(e.toString()).to.include('Failed to fetch ' + invalidUrl);
		}

		assert.ok(nock.isDone());
	});

	it('returns error - failed to fetch invalid url', async () => {
		const invalidUrl = 'notvalid';
		try {
			await requestHandler(invalidUrl);
			throw new Error('Test should have thrown error'); // ensures test failure if no error is thrown
		} catch (e) {
			assert.deepEqual(e.toString(), 'Error: Failed to fetch notvalid. TypeError: Only absolute URLs are supported')
		}
	});

	it('returns id token not generated with cloud directory idp', async () => {
		const path = '/idp-error';
		const testUrl = baseUrl + path;

		nock(baseUrl)
            .get(path)
            .reply(400, {
                error: 'invalid_grant',
                error_description: 'id token not generated with cloud directory idp'
            });

        try {
            await requestHandler(testUrl);
            throw new Error('Should have thrown an error');
        } catch (e) {
            expect(e.toString()).to.include('Error: id token not generated with cloud directory idp')
        }
		assert.ok(nock.isDone());
	});

	it('returns invalid response type', async () => {
		const path = '/empty-response';
		const testUrl = baseUrl + path;

		nock(baseUrl)
            .get(path)
            .reply(200, '');  // Empty response

        try {
            await requestHandler(testUrl);
            throw new Error('Should have thrown an error');
        } catch (e) {
            expect(e.toString()).to.include('Invalid response while trying to fetch ' + testUrl);
        }
		assert.ok(nock.isDone());
	});

	it('returns text', async () => {
		const path = '/text-response';
		const testUrl = baseUrl + path;

		nock(baseUrl)
            .get(path)
            .reply(200, 'working');

        const res = await requestHandler(testUrl);
        assert.deepEqual(res, 'working');
		assert.ok(nock.isDone());
	});
});