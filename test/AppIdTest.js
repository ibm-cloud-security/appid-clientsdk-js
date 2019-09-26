const assert = require('chai').assert;
const constants = require('../src/constants');
const Utils = require('./mocks/UtilsMock');
const AppID = require('../src/index');
const PopupController = require('./mocks/PopUpControllerMock');
const IFrameController = require('./mocks/IFrameControllerMock');
const OpenIdConfigurationResource = require('./mocks/OpenIdConfigurationMock');
const TokenValidator = require('./mocks/TokenValidatorMock');
const RequestHandler = require('./mocks/RequestHandlerMock');
const {URL} = require('url');

describe('AppID tests', () => {
	describe('signInWithPopup', () => {
		it('should return tokens', async () => {
			const appID = new AppID({
				popup: new PopupController({invalidState: false, error: false, invalidOrigin: false}),
				iframe: new IFrameController({invalidState: false, error: false, invalidOrigin: false}),
				tokenValidator: new TokenValidator(),
				openID: new OpenIdConfigurationResource(),
				utils: new Utils(),
				requestHandler: new RequestHandler(),
				w: {origin: 'http://localhost:3005'},
				url: URL
			});
			let res = await appID.signin();
			assert.equal(res.accessToken, 'accessToken');
			assert.equal(res.idToken, 'idToken');
			assert.equal(res.accessTokenPayload, 'tokenPayload');
		});

		it('should return error - invalid state', async () => {
			const appID = new AppID({
				popup: new PopupController({invalidState: true, error: false}),
				iframe: new IFrameController({invalidState: false, error: false, invalidOrigin: false}),
				tokenValidator: new TokenValidator(),
				openID: new OpenIdConfigurationResource(),
				utils: new Utils(),
				requestHandler: new RequestHandler(),
				w: {origin: 'localhost'},
				url: URL
			});
			try {
				await appID.signin();
			} catch (e) {
				assert.equal(e.description, constants.INVALID_STATE);
			}
		});

		it('should return error - error in message', async () => {
			const appID = new AppID({
				popup: new PopupController({invalidState: false, error: true}),
				iframe: new IFrameController({invalidState: false, error: false, invalidOrigin: false}),
				tokenValidator: new TokenValidator(),
				openID: new OpenIdConfigurationResource(),
				utils: new Utils(),
				requestHandler: new RequestHandler(),
				w: {origin: 'localhost'},
				url: URL
			});
			try {
				await appID.signin();
			} catch (e) {
				assert.equal(e.error, 'access_denied');
				assert.equal(e.description, 'Could not verify SAML assertion');
			}
		});
	});

	describe('silentSignin', () => {

		it('should return tokens - happy flow', async () => {
			const appID = new AppID({
				popup: new PopupController({invalidState: false, error: true}),
				iframe: new IFrameController({invalidState: false, error: false, invalidOrigin: false}),
				tokenValidator: new TokenValidator(),
				openID: new OpenIdConfigurationResource(),
				utils: new Utils(),
				requestHandler: new RequestHandler(),
				w: {origin: 'localhost'},
				url: URL
			});
			let res = await appID.silentSignin();
			assert.equal(res.accessToken, 'accessToken');
			assert.equal(res.idToken, 'idToken');
			assert.equal(res.accessTokenPayload, 'tokenPayload');
		});

		it('should return error - log in time out', async () => {
			const appID = new AppID({
				popup: new PopupController({invalidState: false, error: true}),
				iframe: new IFrameController({invalidState: false, error: true, invalidOrigin: false}),
				tokenValidator: new TokenValidator(),
				openID: new OpenIdConfigurationResource(),
				utils: new Utils(),
				requestHandler: new RequestHandler(),
				w: {origin: 'localhost'},
				url: URL
			});
			try {
				await appID.silentSignin();
			} catch (e) {
				assert.equal(e.description, 'Unable to log in due to time out. Try again');
			}
		});

		it('should return error - invalid message origin', async () => {
			const appID = new AppID({
				popup: new PopupController({invalidState: false, error: true}),
				iframe: new IFrameController({invalidState: false, error: false, invalidOrigin: true}),
				tokenValidator: new TokenValidator(),
				openID: new OpenIdConfigurationResource(),
				utils: new Utils(),
				requestHandler: new RequestHandler(),
				w: {origin: 'https://localhost'},
				url: URL
			});
			try {
				await appID.silentSignin();
			} catch (e) {
				assert.equal(e.description, 'Invalid origin');
			}
		});

		it('should return error - invalid state', async () => {
			const appID = new AppID({
				popup: new PopupController({invalidState: false, error: true}),
				iframe: new IFrameController({invalidState: true, error: false, invalidOrigin: false}),
				tokenValidator: new TokenValidator(),
				openID: new OpenIdConfigurationResource(),
				utils: new Utils(),
				requestHandler: new RequestHandler(),
				w: {origin: 'localhost'},
				url: URL
			});
			try {
				await appID.silentSignin();
			} catch (e) {
				assert.equal(e.description, 'Invalid state');
			}
		});
	});

	describe('getUserInfo', () => {
		let appID;
		beforeEach(() => {
			appID = new AppID({
				popup: new PopupController({invalidState: false, error: false}),
				iframe: new IFrameController({invalidState: false, error: false, invalidOrigin: false}),
				tokenValidator: new TokenValidator(),
				openID: new OpenIdConfigurationResource(),
				utils: new Utils(),
				requestHandler: new RequestHandler(),
				w: {origin: 'localhost'},
				url: URL
			});
		});

		it('should return user info', async () => {
			let res = await appID.getUserInfo('accessToken');
			assert.equal(res.name, 'KittyCat');
		});

		it('should return error - invalid access token', async () => {
			try {
				let res = await appID.getUserInfo({sub: 1234, iss: 'appid'});
			} catch (e) {
				assert.equal(e.message, constants.INVALID_ACCESS_TOKEN);
			}
		});
	});
});