const assert = require('chai').assert;
const Utils = require('../src/utils');
const RequestHandler = require('./mocks/RequestHandlerMock');
const TokenValidator = require('./mocks/TokenValidatorMock');
const OpenIdConfigurationResource = require('./mocks/OpenIdConfigurationMock');
const {URL} = require('url');
const utils = new Utils(
	{
		requestHandler: new RequestHandler(),
		tokenValidator: new TokenValidator(),
		openId: new OpenIdConfigurationResource(),
		clientId: '1234',
		url: URL
	});

describe('Utils tests', () => {
	it('should return a param string', () => {
		let res = utils.buildParams({param1: 'test', param2: 'test', param3: 'test'});
		assert.deepEqual(res, 'param1=test&param2=test&param3=test');
	});

	it('should return auth params', () => {
		let res = utils.getAuthParams('1234', 'http://origin.com', 'none');
		assert.exists(res.codeVerifier, 'returned code verifier');
		assert.exists(res.nonce, 'returned nonce');
		assert.exists(res.state, 'returned state');
		assert.include(res.authUrl, 'prompt=none');
	});

	it('should return tokens', async () => {
		let params = {
			authCode: 'code',
			nonce: 'nonce',
			codeVerifier: 'verifier',
			windowOrigin: 'origin'
		};
		let res = await utils.exchangeTokens(params);
		assert.equal(res.accessTokenPayload, 'tokenPayload');
	});

	describe('verify message tests', () => {
		const error = {
			data: {error: 'error from server'}
		};

		const stateError = {
			data: {state: 'invalidState'}
		};

		const originError = {
			data: {state: 'dmFsaWRTdGF0ZQ=='},
			origin: 'http://invalidorigin'
		};

		it('should throw error', () => {
			try {
				utils.verifyMessage({message: error});
			} catch (e) {
				assert.equal(e.error, 'error from server');
			}
		});

		it('should throw error - invalid state', () => {
			try {
				utils.verifyMessage({message: stateError, state: 'validState'});
			} catch (e) {
				assert.equal(e.message, 'Invalid state');
			}
		});

		it('should throw error - invalid origin', function () {
			try {
				utils.verifyMessage({message: originError, state: 'validState', authEndpoint: 'http://validorigin'});
			} catch (e) {
				assert.equal(e.message, 'Invalid origin');
			}
		});
	});
});