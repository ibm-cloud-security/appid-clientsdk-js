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
			openIdConfigResource
		} = {}) {
		this.URL = url;
		this.request = requestHandler.request;
		this.tokenValidator = tokenValidator;
		this.openIdConfigResource = openIdConfigResource;
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

	getChangePasswordInfo({userId, origin, clientId}) {
		const {codeVerifier, codeChallenge, state, nonce} = this.getPKCEFields();
		let params = {
			code_challenge: rs.stob64(codeChallenge),
			response_mode: constants.RESPONSE_MODE,
			user_id: userId,
			redirect_uri: origin,
			client_id: clientId,
			state: rs.stob64(state)
		};
		return {
			codeVerifier,
			state,
			nonce,
			changePasswordUrl: this.openIdConfigResource.getIssuer() + constants.CHANGE_PASSWORD + '?' + this.buildParams(params)
		};
	}

	getPKCEFields() {
		const codeVerifier = this.getRandomString(constants.CODE_VERIFIER_LENGTH);
		const codeChallenge = this.sha256(codeVerifier);
		const state = this.getRandomString(constants.STATE_LENGTH);
		const nonce = this.getRandomString(constants.NONCE_LENGTH)
		return {codeVerifier, codeChallenge, state, nonce};
	}

	getAuthParams(clientId, origin, prompt) {
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

		const authUrl = this.openIdConfigResource.getAuthorizationEndpoint() + '?' + this.buildParams(authParams);
		return {
			codeVerifier,
			nonce,
			state,
			authUrl
		};
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

	async exchangeTokens({clientId, authCode, nonce, codeVerifier, windowOrigin}) {
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