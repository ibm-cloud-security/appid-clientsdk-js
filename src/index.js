import {buildParams, getRandomString, sha256} from './utils';
import {request} from "./RequestHandler";
import {PopupController} from './PopupController';
import {OpenIdConfigurationResource} from "./OpenIDConfiguration";
import {TokenValidator} from "./TokenValidator";
import jwt from 'jose-jwe-jws';

const responseType = 'code';
const STATE_LENGTH = 20;
const NONCE_LENGTH = 20;
const CODE_VERIFIER_LENGTH = 43;

export class AppID {
	constructor({pop=new PopupController({window})} = {}) {
		this.popup = pop;
		this.tokenValidator = new TokenValidator(jwt);
	}

	async init({clientId, discoveryEndpoint}) {
		this.openIdConfig = new OpenIdConfigurationResource();
		await this.openIdConfig.init({discoveryEndpoint, request});
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
		const authUrl = encodeURI(this.openIdConfig.getAuthorizationEndpoint() +
			"?client_id=" + this.clientId +
			"&response_type=" + responseType +
			"&state=" + btoa(state) +
			"&code_challenge=" + btoa(codeChallenge) +
			"&code_challenge_method=" + challengeMethod +
			"&nonce=" + nonce +
			"&scope=" + 'openid'
		);

		this.popup.open();
		let tokens;
		const authCode = await this.popup.navigate({authUrl, state});
		tokens = await this.exchangeTokens({authCode, codeVerifier, nonce});
		return tokens;
	}

	async getUserInfo(accessToken) {
		if (typeof accessToken !== 'string') {
			throw new Error('Access token must be a string');
		}

		return await request(this.openIdConfig.getUserInfoEndpoint(), {
			method: 'GET',
			headers: {
				'Authorization': 'Bearer ' + accessToken
			}
		});
	}

	async exchangeTokens({ authCode, nonce, codeVerifier}) {
		let issuer = await this.openIdConfig.getIssuer();
		let params = {
			grant_type: 'authorization_code',
			redirect_uri: `${issuer}/pkce_callback`,
			code: authCode,
			code_verifier: codeVerifier
		};

		const requestParams = buildParams(params);

		const tokenEndpoint = this.openIdConfig.getTokenEndpoint();

		const tokens = await request(tokenEndpoint, {
			method: 'POST',
			headers: {
				'Authorization': 'Basic ' + btoa(`${this.clientId}:${codeVerifier}`),
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			body: requestParams
		});

		return {
			accessToken: tokens.access_token,
			accessTokenPayload: await this.tokenValidator.decodeAndValidate(
			{token: tokens.access_token, openIdConfig: this.openIdConfig, clientId: this.clientId, nonce, request}),
			idToken: tokens.id_token,
			idTokenPayload: await this.tokenValidator.decodeAndValidate(
			{token: tokens.id_token, openIdConfig: this.openIdConfig, clientId: this.clientId, nonce, request})
		}
	}
}