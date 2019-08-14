const Utils = require('./utils');
const RequestHandler = require('./RequestHandler');
const PopupController = require('./PopupController');
const OpenIdConfigurationResource = require('./OpenIDConfiguration');
const TokenValidator = require('./TokenValidator');
const rs = require('jsrsasign');
const errorMessages = require('./constants');

const RESPONSE_TYPE = 'code';
const SCOPE = 'openid';
const STATE_LENGTH = 20;
const NONCE_LENGTH = 20;
const CODE_VERIFIER_LENGTH = 44;

class AppID {
	constructor(
		{popup = new PopupController({window}),
			tokenValidator = new TokenValidator({}),
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
		const challengeMethod = 'S256';
		const codeVerifier = this.utils.getRandomString(CODE_VERIFIER_LENGTH);
		const codeChallenge = await this.utils.sha256(codeVerifier);
		const nonce = this.utils.getRandomString(NONCE_LENGTH);
		const state = this.utils.getRandomString(STATE_LENGTH);

		let authParams = {
			client_id: this.clientId,
			response_type: RESPONSE_TYPE,
			state: rs.stob64(state),
			code_challenge: rs.stob64(codeChallenge),
			code_challenge_method: challengeMethod,
			nonce: nonce,
			scope: SCOPE
		};

		const authUrl = this.openIdConfigResource.getAuthorizationEndpoint() + '?' + this.utils.buildParams(authParams);

		this.popup.open();
		this.popup.navigate({authUrl});
		const message = await this.popup.waitForMessage({messageType: 'authorization_response'});

		if (message.data.error.errorType) {
			throw new Error(JSON.stringify(message.data.error));
		} else if (rs.b64utos(message.data.state) !== state) {
			throw new Error(errorMessages.INVALID_STATE);
		}
		let authCode = message.data.code;

		return await this.exchangeTokens({authCode, codeVerifier, nonce});
	}

	async getUserInfo(accessToken) {
		if (typeof accessToken !== 'string') {
			throw new Error(errorMessages.INVALID_ACCESS_TOKEN);
		}

		return await this.request(this.openIdConfigResource.getUserInfoEndpoint(), {
			method: 'GET',
			headers: {
				'Authorization': 'Bearer ' + accessToken
			}
		});
	}

	async exchangeTokens({ authCode, nonce, codeVerifier}) {
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
		const publicKey = await this.openIdConfigResource.getPublicKey();

		return {
			accessToken: tokens.access_token,
			accessTokenPayload: await this.tokenValidator.decodeAndValidate(
			{token: tokens.access_token, publicKey: publicKey.keys[0], issuer: issuer, clientId: this.clientId, nonce}),
			idToken: tokens.id_token,
			idTokenPayload: await this.tokenValidator.decodeAndValidate(
			{token: tokens.id_token,publicKey: publicKey.keys[0], issuer: issuer, clientId: this.clientId, nonce})
		}
	}
}
module.exports = AppID;