const rs = require('jsrsasign');
const AppIDError = require('./errors/AppIDError');
const OAuthError = require('./errors/OAuthError');
const RequestHandler = require('./RequestHandler');
const TokenValidator = require('./TokenValidator');
const constants = require('./constants');

class Utils {
	constructor(
		{
			requestHandler = new RequestHandler(),
			tokenValidator = new TokenValidator(),
			url = URL,
			openIdConfigResource,
			popup
		} = {}) {
		this.URL = url;
		this.request = requestHandler.request;
		this.tokenValidator = tokenValidator;
		this.openIdConfigResource = openIdConfigResource;
		this.popup = popup;
	};

	buildParams(params) {
		return Object.keys(params).map(function (key) {
			return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
		}).join('&');
	};

	getRandomString(length) {
		return rs.KJUR.crypto.Util.getRandomHexOfNbytes(length / 2);
	};

	sha256(message) {
		return rs.KJUR.crypto.Util.sha256(message);
	}

	getPKCEFields() {
		const codeVerifier = this.getRandomString(constants.CODE_VERIFIER_LENGTH);
		const codeChallenge = this.sha256(codeVerifier);
		const state = this.getRandomString(constants.STATE_LENGTH);
		const nonce = this.getRandomString(constants.NONCE_LENGTH);
		return {codeVerifier, codeChallenge, state, nonce};
	}

	getAuthParamsAndUrl({clientId, origin, prompt, endpoint, userId}) {
		const {codeVerifier, codeChallenge, state, nonce} = this.getPKCEFields();
		let authParams = {
			client_id: clientId,
			response_type: constants.RESPONSE_TYPE,
			state: rs.stob64(state),
			code_challenge: rs.stob64(codeChallenge),
			code_challenge_method: constants.CHALLENGE_METHOD,
			redirect_uri: origin,
			response_mode: constants.RESPONSE_MODE,
			nonce,
			scope: constants.SCOPE
		};

		if (prompt) {
			authParams.prompt = prompt;
		}

		if (userId) {
			authParams.user_id = userId;
		}

		const url = endpoint + '?' + this.buildParams(authParams);
		return {
			codeVerifier,
			nonce,
			state,
			url
		};
	}

	async performOAuthFlowAndGetTokens({userId, origin, clientId, endpoint}) {
		const {codeVerifier, state, nonce, url} = this.getAuthParamsAndUrl({userId, origin, clientId, endpoint});

		this.popup.open();
		this.popup.navigate(url);
		const message = await this.popup.waitForMessage({messageType: 'authorization_response'});
		this.popup.close();
		this.verifyMessage({message, state});
		let authCode = message.data.code;

		return await this.retrieveTokens({
			clientId,
			authCode,
			codeVerifier,
			nonce,
			windowOrigin: origin
		});
	}

	verifyMessage({message, state}) {
		if (message.data.error || message.data.error_description) {
			throw new OAuthError({description: message.data.error_description, error: message.data.error});
		}

		if (rs.b64utos(message.data.state) !== state) {
			throw new AppIDError(constants.INVALID_STATE);
		}

		if (message.origin !== new this.URL(this.openIdConfigResource.getAuthorizationEndpoint()).origin) {
			throw new AppIDError(constants.INVALID_ORIGIN);
		}
	}

	async retrieveTokens({clientId, authCode, nonce, codeVerifier, windowOrigin}) {
		let issuer = this.openIdConfigResource.getIssuer();
		let params = {
			grant_type: 'authorization_code',
			redirect_uri: windowOrigin,
			code: authCode,
			code_verifier: codeVerifier
		};

		const requestParams = this.buildParams(params);
		const tokenEndpoint = this.openIdConfigResource.getTokenEndpoint();

		const tokens = await this.request(tokenEndpoint, {
			method: 'POST',
			headers: {
				'Authorization': 'Basic ' + rs.stob64(`${clientId}:${codeVerifier}`),
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			body: requestParams
		});
		const publicKeys = await this.openIdConfigResource.getPublicKeys();

		const accessTokenPayload = this.tokenValidator.decodeAndValidate({
			token: tokens.access_token,
			publicKeys,
			issuer,
			clientId,
			nonce
		});

		const idTokenPayload = this.tokenValidator.decodeAndValidate({
			token: tokens.id_token,
			publicKeys,
			issuer,
			clientId,
			nonce
		});

		return {accessToken: tokens.access_token, accessTokenPayload, idToken: tokens.id_token, idTokenPayload};
	}
}

module.exports = Utils;