const Utils = require('./utils');
const RequestHandler = require('./RequestHandler');
const PopupController = require('./PopupController');
const OpenIdConfigurationResource = require('./OpenIDConfigurationResource');
const TokenValidator = require('./TokenValidator');
const rs = require('jsrsasign');
const constants = require('./constants');
const AppIDError = require('../errors/AppIDError');

class AppID {
	constructor(
		{
			popup = new PopupController(),
			tokenValidator = new TokenValidator(),
			openID = new OpenIdConfigurationResource(),
			utils = new Utils(),
			requestHandler = new RequestHandler()
		} = {}) {

		this.popup = popup;
		this.tokenValidator = tokenValidator;
		this.openIdConfigResource = openID;
		this.utils = utils;
		this.request = requestHandler.request;
	}

	async init({clientId, discoveryEndpoint}) {
		await this.openIdConfigResource.init({discoveryEndpoint, requestHandler: this.request});
		this.clientId = clientId;
	}

	async signinWithPopup() {
		const codeVerifier = this.utils.getRandomString(constants.CODE_VERIFIER_LENGTH);
		const codeChallenge = await this.utils.sha256(codeVerifier);
		const nonce = this.utils.getRandomString(constants.NONCE_LENGTH);
		const state = this.utils.getRandomString(constants.STATE_LENGTH);

		let authParams = {
			client_id: this.clientId,
			response_type: constants.RESPONSE_TYPE,
			state: rs.stob64(state),
			code_challenge: rs.stob64(codeChallenge),
			code_challenge_method: constants.CHALLENGE_METHOD,
			nonce: nonce,
			scope: constants.SCOPE
		};

		const authUrl = this.openIdConfigResource.getAuthorizationEndpoint() + '?' + this.utils.buildParams(authParams);

		this.popup.open();
		this.popup.navigate({authUrl});
		const message = await this.popup.waitForMessage({messageType: 'authorization_response'});
		this.popup.close();
		message.data.error.type = 'test';
		message.data.error.description = 'desc';
		if (message.data.error && message.data.error.errorType) {
			throw new AppIDError(message.data.error);
		} else if (rs.b64utos(message.data.state) !== state) {
			// same -- custom errors all around
			throw new AppIDError({description: constants.INVALID_STATE});
		}
		let authCode = message.data.code;

		return await this.exchangeTokens({authCode, codeVerifier, nonce});
	}

	// async silentLogin() {
	// 	const constants.CHALLENGE_METHOD = 'S256';
	// 	const codeVerifier = this.utils.getRandomString(constants.CODE_VERIFIER_LENGTH);
	// 	const codeChallenge = await this.utils.sha256(codeVerifier);
	// 	const nonce = this.utils.getRandomString(NONCE_LENGTH);
	// 	const state = this.utils.getRandomString(STATE_LENGTH);
	//
	// 	let authParams = {
	// 		client_id: this.clientId,
	// 		response_type: RESPONSE_TYPE,
	// 		state: rs.stob64(state),
	// 		code_challenge: rs.stob64(codeChallenge),
	// 		code_challenge_method: constants.CHALLENGE_METHOD,
	// 		nonce: nonce,
	// 		scope: SCOPE
	// 	};
	//
	// 	const authUrl = this.openIdConfigResource.getAuthorizationEndpoint() + '?' + this.utils.buildParams(authParams);
	// 	this.popup.openIFrame(authUrl);
	// }

	async getUserInfo(accessToken) {
		if (typeof accessToken !== 'string') {
			// custom error
			throw new AppIDError({description: constants.INVALID_ACCESS_TOKEN});
		}

		return await this.request(this.openIdConfigResource.getUserInfoEndpoint(), {
			headers: {
				'Authorization': 'Bearer ' + accessToken
			}
		});
	}

	async exchangeTokens({authCode, nonce, codeVerifier}) {
		let issuer = await this.openIdConfigResource.getIssuer();
		let params = {
			grant_type: 'authorization_code',
			redirect_uri: `${issuer}/pkce_callback`,
			code: authCode,
			code_verifier: codeVerifier
		};

		const requestParams = this.utils.buildParams(params);
		const tokenEndpoint = this.openIdConfigResource.getTokenEndpoint();

		const tokens = await this.request(tokenEndpoint, {
			method: 'POST',
			headers: {
				'Authorization': 'Basic ' + rs.stob64(`${this.clientId}:${codeVerifier}`),
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			body: requestParams
		});
		const publicKeys = await this.openIdConfigResource.getPublicKeys();

		const accessTokenPayload = this.tokenValidator.decodeAndValidate({
			token: tokens.access_token,
			publicKeys,
			issuer,
			clientId: this.clientId,
			nonce
		});

		const idTokenPayload = this.tokenValidator.decodeAndValidate({
			token: tokens.id_token,
			publicKeys,
			issuer,
			clientId: this.clientId,
			nonce
		});

		return {accessToken: tokens.access_token, accessTokenPayload, idToken: tokens.id_token, idTokenPayload}
	}
}
module.exports = AppID;