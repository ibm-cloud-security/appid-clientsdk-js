const assert = require('chai').assert;
const constants = require('../src/constants');
const Utils = require('./mocks/UtilsMock');
const AppID = require('../src/index');
const PopupControllerMock = require('./mocks/PopUpControllerMock');
const IFrameControllerMock = require('./mocks/IFrameControllerMock');
const TokenValidatorMock = require('./mocks/TokenValidatorMock');
const OpenIdConfigurationResourceMock = require('./mocks/OpenIdConfigurationMock');
const RequestHandlerMock = require('./mocks/RequestHandlerMock');
const {URL} = require('url');
const defaultInit = {clientId: '1234', discoveryEndpoint: 'http://authServer.com/', popup: {height: 400, width: 300}};
describe('AppID tests', () => {
	describe('init', () => {
		const appID = new AppID({
			popup: new PopupControllerMock({invalidState: false, error: false, invalidOrigin: false}),
			iframe: new IFrameControllerMock({invalidState: false, error: false, invalidOrigin: false}),
			openIdConfigResource: new OpenIdConfigurationResourceMock(),
			utils: new Utils(),
			requestHandler: new RequestHandlerMock(),
			w: {origin: 'http://localhost:3005'},
			url: URL
		});

		it('should return error - must call init before sign in', async () => {
			try {
				await appID.signin();
			} catch (e) {
				assert.equal(e.message, constants.FAIL_TO_INITIALIZE);
			}
		});

		it('should pass', async () => {
			await appID.init(defaultInit);
		});

		it('should return error - missing client id', async () => {
			try {
				await appID.init({discoveryEndpoint: 'http://authServer.com/', popup: {height: 400, width: 300}});
			} catch (e) {
				assert.equal(e.message, constants.MISSING_CLIENT_ID);
			}
		});

		it('should return error - invalid discovery endpoint', async () => {
			try {
				await appID.init({clientId: '1234', popup: {height: 400, width: 300}});
			} catch (e) {
				assert.equal(e.message, constants.INVALID_DISCOVERY_ENDPOINT);
			}
		});
	});

	describe('signIn', () => {
		it('should return tokens', async () => {
			const appID = new AppID({
				popup: new PopupControllerMock({invalidState: false, error: false, invalidOrigin: false}),
				iframe: new IFrameControllerMock({invalidState: false, error: false, invalidOrigin: false}),
				openIdConfigResource: new OpenIdConfigurationResourceMock(),
				utils: new Utils(),
				requestHandler: new RequestHandlerMock(),
				w: {location : {origin: 'http://localhost:3005'}},
				url: URL
			});
			await appID.init(defaultInit);
			let res = await appID.signin();
			assert.equal(res.accessToken, 'accessToken');
			assert.equal(res.idToken, 'idToken');
			assert.equal(res.accessTokenPayload, 'tokenPayload');
		});

		it('should return error - invalid state', async () => {
			const appID = new AppID({
				popup: new PopupControllerMock({invalidState: true, error: false}),
				iframe: new IFrameControllerMock({invalidState: false, error: false, invalidOrigin: false}),
				openIdConfigResource: new OpenIdConfigurationResourceMock(),
				utils: new Utils(),
				requestHandler: new RequestHandlerMock(),
				w: {location : {origin: 'localhost'}},
				url: URL
			});
			try {
				await appID.init(defaultInit);
				await appID.signin();
			} catch (e) {
				assert.equal(e.description, constants.INVALID_STATE);
			}
		});

		it('should return error - error in message', async () => {
			const appID = new AppID({
				popup: new PopupControllerMock({invalidState: false, error: true}),
				iframe: new IFrameControllerMock({invalidState: false, error: false, invalidOrigin: false}),
				openIdConfigResource: new OpenIdConfigurationResourceMock(),
				utils: new Utils(),
				requestHandler: new RequestHandlerMock(),
				w: {location : {origin: 'localhost'}},
				url: URL
			});
			try {
				await appID.init(defaultInit);
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
				popup: new PopupControllerMock({invalidState: false, error: true}),
				iframe: new IFrameControllerMock({invalidState: false, error: false, invalidOrigin: false}),
				openIdConfigResource: new OpenIdConfigurationResourceMock(),
				utils: new Utils(),
				requestHandler: new RequestHandlerMock(),
				w: {origin: 'localhost'},
				url: URL
			});
			await appID.init(defaultInit);
			let res = await appID.silentSignin();
			assert.equal(res.accessToken, 'accessToken');
			assert.equal(res.idToken, 'idToken');
			assert.equal(res.accessTokenPayload, 'tokenPayload');
		});

		it('should return error - log in time out', async () => {
			const appID = new AppID({
				popup: new PopupControllerMock({invalidState: false, error: true}),
				iframe: new IFrameControllerMock({invalidState: false, error: true, invalidOrigin: false}),
				openIdConfigResource: new OpenIdConfigurationResourceMock(),
				utils: new Utils(),
				requestHandler: new RequestHandlerMock(),
				w: {origin: 'localhost'},
				url: URL
			});
			try {
				await appID.init(defaultInit);
				await appID.silentSignin();
			} catch (e) {
				assert.equal(e.description, 'Unable to log in due to time out. Try again');
			}
		});

		it('should return error - invalid message origin', async () => {
			const appID = new AppID({
				popup: new PopupControllerMock({invalidState: false, error: true}),
				iframe: new IFrameControllerMock({invalidState: false, error: false, invalidOrigin: true}),
				openIdConfigResource: new OpenIdConfigurationResourceMock(),
				utils: new Utils(),
				requestHandler: new RequestHandlerMock(),
				w: {origin: 'https://localhost'},
				url: URL
			});
			try {
				await appID.init(defaultInit);
				await appID.silentSignin();
			} catch (e) {
				assert.equal(e.description, 'Invalid origin');
			}
		});

		it('should return error - invalid state', async () => {
			const appID = new AppID({
				popup: new PopupControllerMock({invalidState: false, error: true}),
				iframe: new IFrameControllerMock({invalidState: true, error: false, invalidOrigin: false}),
				openIdConfigResource: new OpenIdConfigurationResourceMock(),
				utils: new Utils(),
				requestHandler: new RequestHandlerMock(),
				w: {origin: 'localhost'},
				url: URL
			});
			try {
				await appID.init(defaultInit);
				await appID.silentSignin();
			} catch (e) {
				assert.equal(e.description, 'Invalid state');
			}
		});
	});

	describe('getUserInfo', () => {
		let appID;
		beforeEach(async () => {
			appID = new AppID({
				popup: new PopupControllerMock({invalidState: false, error: false}),
				iframe: new IFrameControllerMock({invalidState: false, error: false, invalidOrigin: false}),
				openIdConfigResource: new OpenIdConfigurationResourceMock(),
				utils: new Utils(),
				requestHandler: new RequestHandlerMock(),
				w: {origin: 'localhost'},
				url: URL
			});
			await appID.init(defaultInit);
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

	describe('changePassword', () => {
		let appID;

		it('should succeed', async () => {
			appID = new AppID({
				popup: new PopupControllerMock({invalidState: false, error: false}),
				iframe: new IFrameControllerMock({invalidState: false, error: false, invalidOrigin: false}),
				openIdConfigResource: new OpenIdConfigurationResourceMock(),
				utils: new Utils(),
				tokenValidator: new TokenValidatorMock({}),
				requestHandler: new RequestHandlerMock(),
				w: {origin: 'localhost'},
				url: URL
			});
			await appID.init(defaultInit);
			let res = await appID.changePassword('idtoken');
			assert.equal(res.accessToken, 'accessToken');
			assert.equal(res.idToken, 'idToken');
			assert.equal(res.accessTokenPayload, 'tokenPayload');
		});

		it('should throw missing user id error', async () => {
			try {
				await appID.changePassword();
			} catch (e) {
				assert.equal(e.message, constants.MISSING_ID_TOKEN);
			}
		});

		it('should throw Invalid id token', async () => {
			appID = new AppID({
				popup: new PopupControllerMock({invalidState: false, error: false}),
				iframe: new IFrameControllerMock({invalidState: false, error: false, invalidOrigin: false}),
				openIdConfigResource: new OpenIdConfigurationResourceMock(),
				utils: new Utils(),
				tokenValidator: new TokenValidatorMock({invalidToken: true}),
				requestHandler: new RequestHandlerMock(),
				w: {origin: 'localhost'},
				url: URL
			});
			await appID.init(defaultInit);
			try {
				await appID.changePassword('invalid');
			} catch (e) {
				assert.equal(e.message, constants.INVALID_ID_TOKEN);
			}
		});

		it('should throw not cd user error', async () => {
			appID = new AppID({
				popup: new PopupControllerMock({invalidState: false, error: false}),
				iframe: new IFrameControllerMock({invalidState: false, error: false, invalidOrigin: false}),
				openIdConfigResource: new OpenIdConfigurationResourceMock(),
				utils: new Utils(),
				tokenValidator: new TokenValidatorMock({invalidCDToken: true}),
				requestHandler: new RequestHandlerMock(),
				w: {origin: 'localhost'},
				url: URL
			});
			await appID.init(defaultInit);
			try {
				await appID.changePassword('invalididtoken');
			} catch (e) {
				assert.equal(e.message, constants.NOT_CD_USER);
			}
		});
	})

	describe('changeDetails', () => {
		let appID;

		it('should succeed', async () => {
			appID = new AppID({
				popup: new PopupControllerMock({invalidState: false, error: false}),
				iframe: new IFrameControllerMock({invalidState: false, error: false, invalidOrigin: false}),
				openIdConfigResource: new OpenIdConfigurationResourceMock(),
				utils: new Utils(),
				tokenValidator: new TokenValidatorMock({}),
				requestHandler: new RequestHandlerMock(),
				w: {origin: 'localhost'},
				url: URL
			});
			await appID.init(defaultInit);
			let res = await appID.changeDetails({accessToken: 'accessToken', idToken: 'idToken'});
			assert.equal(res.accessToken, 'accessToken');
			assert.equal(res.idToken, 'idToken');
			assert.equal(res.accessTokenPayload, 'tokenPayload');
		});

		it('should throw missing access token error if not exist', async () => {
			try {
				await appID.changeDetails({});
			} catch (e) {
				assert.equal(e.message, constants.MISSING_ACCESS_TOKEN);
			}
		});

		it('should throw missing id token error if not jwt string', async () => {
			try {
				await appID.changeDetails({accessToken: {id: 'not a jwt'}});
			} catch (e) {
				assert.equal(e.message, constants.MISSING_ID_TOKEN);
			}
		});

		it('should throw missing id token error if not exist', async () => {
			try {
				await appID.changeDetails({accessToken: 'accessToken'});
			} catch (e) {
				assert.equal(e.message, constants.MISSING_ID_TOKEN);
			}
		});

		it('should throw missing id token error if not jwt string', async () => {
			try {
				await appID.changeDetails({accessToken: 'accessToken', idToken: {id: 'not a jwt'}});
			} catch (e) {
				assert.equal(e.message, constants.MISSING_ID_TOKEN);
			}
		});
	})
});
