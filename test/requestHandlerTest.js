const assert = require('assert');
const expect = require('chai').expect;
const RequestHandler = require('../src/RequestHandler');
const url = 'https://httpbin.org/';

describe('RequestHandler tests', async () => {
	const successUrl = url + 'get';
	let requestHandler = new RequestHandler().request;
	it('returns 200 response', async () => {
		let res = await requestHandler(successUrl);
		assert.deepEqual(res.url, url + 'get');
	});

	it('returns error - failed to fetch', async () => {
		const invalidUrl = url + 'status/500';
		try {
			let res = await requestHandler(invalidUrl);
		} catch (e) {
			expect(e.toString()).to.include('Failed to fetch ' + invalidUrl)
		}
	});

	it('returns error - failed to fetch invalid url', async () => {
		const invalidUrl = 'notvalid';
		try {
			let res = await requestHandler(invalidUrl);
		} catch (e) {
			assert.deepEqual(e.toString(),'Error: Failed to fetch notvalid. TypeError: Only absolute URLs are supported')
		}
	});

	it('returns invalid response type', async () => {
		const htmlResponse = url + 'html';
		try {
			let res = await requestHandler(htmlResponse);
		} catch (e) {
			expect(e.toString()).to.include('Invalid response while trying to fetch ' + htmlResponse)
		}
	});
});