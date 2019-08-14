const assert = require('chai').assert;
const expect = require('chai').expect;
const constants = require('../src/constants');
const Utils = require('./mocks/UtilsMock');
const AppID = require('../src/index');
const PopupController = require('./mocks/PopUpControllerMock');
const OpenIdConfigurationResource = require('./mocks/OpenIdConfigurationMock');
const TokenValidator = require('./mocks/TokenValidatorMock');
const RequestHandler = require('./mocks/RequestHandlerMock');

describe('AppID tests', () => {
	describe('signInWithPopup', () => {
		it('should return tokens', async () => {
			const appID = new AppID({
				popup: new PopupController({invalidState: false, error: false}),
				tokenValidator: new TokenValidator(),
				openID: new OpenIdConfigurationResource(),
				utils: new Utils(),
				requestHandler: new RequestHandler()
			});
			let res = await appID.signinWithPopup();
			assert.equal(res.accessToken, 'accessToken');
			assert.equal(res.idToken, 'idToken');
			assert.equal(res.accessTokenPayload, 'tokenPayload');
		});

		it('should return error - invalid state', async () => {
			const appID = new AppID({
				popup: new PopupController({invalidState: true, error: false}),
				tokenValidator: new TokenValidator(),
				openID: new OpenIdConfigurationResource(),
				utils: new Utils(),
				requestHandler: new RequestHandler()
			});
			try {
				await appID.signinWithPopup();
			} catch (e) {
				assert.equal(e, 'Error: ' + constants.INVALID_STATE);
			}
		});

		it('should return error - error in message', async () => {
			const appID = new AppID({
				popup: new PopupController({invalidState: false, error: true}),
				tokenValidator: new TokenValidator(),
				openID: new OpenIdConfigurationResource(),
				utils: new Utils(),
				requestHandler: new RequestHandler()
			});
			try {
				await appID.signinWithPopup();
			} catch (e) {
				expect(e.toString()).to.include('Invalid client type');
			}
		});
	});

	describe('getUserInfo', () => {
		const appID = new AppID({
			popup: new PopupController({invalidState: false, error: false}),
			tokenValidator: new TokenValidator(),
			openID: new OpenIdConfigurationResource(),
			utils: new Utils(),
			requestHandler: new RequestHandler()
		});

		it('should return user info', async () => {
			let res = await appID.getUserInfo('accessToken');
			assert.equal(res.name, 'KittyCat');
		});

		it('should return error - invalid access token', async () => {
			try{
				let res = await appID.getUserInfo({sub: 1234, iss: 'appid'});
			} catch (e) {
				assert.equal(e, 'Error: ' + constants.INVALID_ACCESS_TOKEN);
			}
		});
	});
});