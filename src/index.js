const Utils = require('./utils');
const RequestHandler = require('./RequestHandler');
const PopupController = require('./PopupController');
const IFrameController = require('./IFrameController');
const OpenIdConfigurationResource = require('./OpenIDConfigurationResource');
const TokenValidator = require('./TokenValidator');
const rs = require('jsrsasign');
const constants = require('./constants');
const AppIDError = require('./errors/AppIDError');

class AppID {
	constructor(
		{
			popup = new PopupController(),
			iframe = new IFrameController(),
			tokenValidator = new TokenValidator(),
			openID = new OpenIdConfigurationResource(),
			utils = new Utils(),
			requestHandler = new RequestHandler(),
			w = window,
			url = URL
		} = {}) {

		this.popup = popup;
		this.iframe = iframe;
		this.tokenValidator = tokenValidator;
		this.openIdConfigResource = openID;
		this.utils = utils;
		this.request = requestHandler.request;
		this.window = w;
		this.URL = url;
	}

	async init({clientId, discoveryEndpoint}) {
		await this.openIdConfigResource.init({discoveryEndpoint, requestHandler: this.request});
		this.clientId = clientId;
	}

	async signinWithPopup() {
		const {codeVerifier, nonce, state, authUrl} = this.getAuthParams();

		this.popup.open({authUrl});
		const message = await this.popup.waitForMessage({messageType: 'authorization_response'});
		this.popup.close();

		this.verifyMessage({message, state});

		let authCode = message.data.code;

		return await this.exchangeTokens({authCode, codeVerifier, nonce});
	}

	async getUserInfo(accessToken) {
		if (typeof accessToken !== 'string') {
			throw new AppIDError({description: constants.INVALID_ACCESS_TOKEN});
		}

		return await this.request(this.openIdConfigResource.getUserInfoEndpoint(), {
			headers: {
				'Authorization': 'Bearer ' + accessToken
			}
		});
	}

	getAuthParams({prompt} = {}) {
		const codeVerifier = this.utils.getRandomString(constants.CODE_VERIFIER_LENGTH);
		const codeChallenge = this.utils.sha256(codeVerifier);
		const nonce = this.utils.getRandomString(constants.NONCE_LENGTH);
		const state = this.utils.getRandomString(constants.STATE_LENGTH);

		let authParams = {
			client_id: this.clientId,
			response_type: constants.RESPONSE_TYPE,
			state: rs.stob64(state),
			code_challenge: rs.stob64(codeChallenge),
			code_challenge_method: constants.CHALLENGE_METHOD,
			redirect_uri: this.window.origin,
			response_mode: constants.RESPONSE_MODE,
			nonce,
			scope: constants.SCOPE,
			prompt
		};

		const authUrl = this.openIdConfigResource.getAuthorizationEndpoint() + '?' + this.utils.buildParams(authParams);
		return {
			codeVerifier,
			nonce,
			state,
			authUrl
		};
	}

	verifyMessage({message, state}) {
		if (message.data.error || message.data.error_description) {
			throw new AppIDError({description: message.data.error_description, error: message.data.error});
		}

		if (rs.b64utos(message.data.state) !== state) {
			throw new AppIDError({description: constants.INVALID_STATE});
		}
		let messageOrigin = message.origin;
		let oauthOrigin = new this.URL(this.openIdConfigResource.getAuthorizationEndpoint()).origin;
		debugger; if (messageOrigin !== oauthOrigin) {
			throw new AppIDError({description: constants.INVALID_ORIGIN});
		}
	}

	async silentSignin() {
		const {codeVerifier, nonce, state, authUrl} = this.getAuthParams({prompt: constants.PROMPT});

		this.iframe.open(authUrl);

		let message;
		try {
			message = await this.iframe.waitForMessage({messageType: 'authorization_response'});
		} finally {
			this.iframe.remove();
		}

		this.verifyMessage({message, state});

		let authCode = message.data.code;
		return await this.exchangeTokens({authCode, codeVerifier, nonce});
	}

	async exchangeTokens({authCode, nonce, codeVerifier}) {
		let issuer = await this.openIdConfigResource.getIssuer();
		let params = {
			grant_type: 'authorization_code',
			redirect_uri: this.window.origin,
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
