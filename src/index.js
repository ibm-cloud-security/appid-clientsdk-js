const {buildParams, getRandomString, sha256} = require('./utils');
const request = require('./RequestHandler');
const PopupController = require('./PopupController');
const OpenIdConfigurationResource = require('./OpenIDConfiguration');
const TokenValidator = require('./TokenValidator');

const RESPONSE_TYPE = 'code';
const SCOPE = 'openid';
const STATE_LENGTH = 20;
const NONCE_LENGTH = 20;
const CODE_VERIFIER_LENGTH = 43;

class AppID {
	constructor(
		{popup=new PopupController({window}),
			tokenValidator=new TokenValidator({}),
			openID=new OpenIdConfigurationResource()
		} = {}) {

		this.popup = popup;
		this.tokenValidator = tokenValidator;
		this.openIdConfigResource = openID;
	}

	async init({clientId, discoveryEndpoint}) {
		await this.openIdConfigResource.init({discoveryEndpoint, requestHandler: request});
		this.clientId = clientId;
	}

	/**
	 * ```js
	 * await appid.signinWithPopup();
	 * ```
	 * A promise to ID and access token. If there is an error in the callback, reject the promise with the error
	 */
	async signinWithPopup() {
		const challengeMethod = 'S256';
		const codeVerifier = getRandomString(CODE_VERIFIER_LENGTH);
		const codeChallenge = await sha256(codeVerifier);
		const nonce = getRandomString(NONCE_LENGTH);
		const state = getRandomString(STATE_LENGTH);
		this.popup.setState(state);
		const authUrl = encodeURI(this.openIdConfigResource.getAuthorizationEndpoint() +
			"?client_id=" + this.clientId +
			"&response_type=" + RESPONSE_TYPE +
			"&state=" + btoa(state) +
			"&code_challenge=" + btoa(codeChallenge) +
			"&code_challenge_method=" + challengeMethod +
			"&nonce=" + nonce +
			"&scope=" + SCOPE
		);

		this.popup.open();
		let tokens;
		const authCode = await this.popup.navigate({authUrl, state});
		console.log('authCode', authCode);
		tokens = await this.exchangeTokens({authCode, codeVerifier, nonce});
		console.log(tokens);
		return tokens;
	}

	async getUserInfo(accessToken) {
		if (typeof accessToken !== 'string') {
			throw new Error('Access token must be a string');
		}

		return await request(this.openIdConfigResource.getUserInfoEndpoint(), {
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

		const requestParams = buildParams(params);

		const tokenEndpoint = this.openIdConfigResource.getTokenEndpoint();
		console.log('exchange tokens', tokenEndpoint);
		const tokens = await request(tokenEndpoint, {
			method: 'POST',
			headers: {
				'Authorization': 'Basic ' + btoa(`${this.clientId}:${codeVerifier}`),
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