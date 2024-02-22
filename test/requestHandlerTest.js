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
			assert.deepEqual(e.toString(), 'Error: Failed to fetch notvalid. TypeError: Only absolute URLs are supported')
		}
	});

	it('returns id token not generated with cloud directory idp', async () => {
		const htmlResponse = 'https://run.mocky.io/v3/0a008e78-7fd9-48da-b97f-0605b6681a77';
		try {
			let res = await requestHandler(htmlResponse);
		} catch (e) {
			expect(e.toString()).to.include('Error: id token not generated with cloud directory idp')
		}
	});

	it('returns invalid response type', async () => {
		const htmlResponse = 'https://run.mocky.io/v3/8208632b-ab12-4ddd-b31b-05fc8169df04';
		try {
			let res = await requestHandler(htmlResponse);
		} catch (e) {
			expect(e.toString()).to.include('Invalid response while trying to fetch ' + htmlResponse)
		}
	});

	it('returns text', async () => {
		const htmlResponse = 'https://run.mocky.io/v3/ccad6260-346f-4721-b2d4-e13519a6f72e';
		let res = await requestHandler(htmlResponse);
		assert.deepEqual(res, 'working');
	});
});