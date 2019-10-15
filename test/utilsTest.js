const assert = require('chai').assert;
const Utils = require('../src/utils');
const RequestHandler = require('./mocks/RequestHandlerMock');
const TokenValidator = require('./mocks/TokenValidatorMock');
const PopupController = require('./mocks/PopUpControllerMock');
const OpenIdConfigurationResource = require('./mocks/OpenIdConfigurationMock');
const constants = require('../src/constants');

const {URL} = require('url');
const utils = new Utils(
	{
		requestHandler: new RequestHandler(),
		tokenValidator: new TokenValidator(),
		openIdConfigResource: new OpenIdConfigurationResource(),
		clientId: '1234',
		url: URL,
		popup: new PopupController({invalidState: false, error: false, invalidOrigin: false})
	});

describe('Utils tests', () => {
	it('should return a param string', () => {
		let res = utils.buildParams({param1: 'test', param2: 'test', param3: 'test'});
		assert.deepEqual(res, 'param1=test&param2=test&param3=test');
	});

	it('should return PKCE fields', () => {
		let res = utils.getPKCEFields();
		assert.include(JSON.stringify(res), 'codeVerifier');
	});

	it('should return error - performOAuthFlowAndGetTokens', () => {
		try {
			let res = utils.performOAuthFlowAndGetTokens({userId: 'userId', origin: 'origin', clientId: 'clientId'});
		} catch (e) {
			assert.include(e.message, constants.INVALID_STATE);
		}
	});

	it('should return auth params with prompt', () => {
		let res = utils.getAuthParamsAndUrl({clientId: '1234', origin: 'http://origin.com', prompt: 'none', endpoint: 'auth'});
		assert.exists(res.codeVerifier, 'returned code verifier');
		assert.exists(res.nonce, 'returned nonce');
		assert.exists(res.state, 'returned state');
		assert.include(res.url, 'prompt=none');
	});

	it('should return auth params without prompt', () => {
		let res = utils.getAuthParamsAndUrl({clientId: '1234', origin: 'http://origin.com', endpoint: 'auth'});
		assert.exists(res.codeVerifier, 'returned code verifier');
		assert.exists(res.nonce, 'returned nonce');
		assert.exists(res.state, 'returned state');
		assert.notInclude(res.url, 'prompt');
	});

	it('should return auth params with user id', () => {
		let res = utils.getAuthParamsAndUrl({clientId: '1234', origin: 'http://origin.com', endpoint: 'changePassword', userId: 'hello'});
		assert.exists(res.codeVerifier, 'returned code verifier');
		assert.exists(res.nonce, 'returned nonce');
		assert.exists(res.state, 'returned state');
		assert.include(res.url, 'changePassword');
		assert.include(res.url, 'user_id');
		assert.notInclude(res.url, 'prompt');
	});

	it('should return tokens', async () => {
		let params = {
			authCode: 'code',
			nonce: 'nonce',
			codeVerifier: 'verifier',
			windowOrigin: 'origin'
		};
		let res = await utils.retrieveTokens(params);
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

		const validData = {
			data: {state: 'dmFsaWRTdGF0ZQ=='},
			origin: 'http://authserver.com'
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
				assert.equal(e.message, constants.INVALID_STATE);
			}
		});

		it('should throw error - invalid origin', function () {
			try {
				utils.verifyMessage({message: originError, state: 'validState'});
			} catch (e) {
				assert.equal(e.message, constants.INVALID_ORIGIN);
			}
		});

		it('should pass', function () {
			let res = utils.verifyMessage({message: validData, state: 'validState'});
		});
	});
});