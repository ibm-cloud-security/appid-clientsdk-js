import {exchangeTokens, sha256, getRandomString, openLoginWidget, openPopup, request} from './utils';
const responseType = 'code';
const STATE_LENGTH = 20;
const NONCE_LENGTH = 20;
const CODE_VERIFIER_LENGTH = 43;

export class AppID {
	// TODO: remove all console logs
	async init({clientId, discoveryUrl}) {
		//TODO: validate clientId as guid
		this.clientId = clientId;
		this.openIdConfig = await request(discoveryUrl);
		console.log(this.openIdConfig);
	}

	/**
	 * ```js
	 * await appid.signinWithPopup();
	 * ```
	 * A promise to ID and access token. If there is an error in the callback, reject the promise with the error
	 */
	async signinWithPopup() {
		// open popup
		const challengeMethod = 'S256';
		const codeVerifier = getRandomString(CODE_VERIFIER_LENGTH);
		const codeChallenge = await sha256(codeVerifier);
		const nonce = getRandomString(NONCE_LENGTH);
		const state = getRandomString(STATE_LENGTH);

		// TODO: better way to build this url or use back tick
		const authUrl = encodeURI(this.openIdConfig.authorization_endpoint +
			"?client_id=" + this.clientId +
			"&response_type=" + responseType +
			"&state=" + btoa(state) +
			"&code_challenge=" + btoa(codeChallenge) +
			"&code_challenge_method=" + challengeMethod +
			"&nonce=" + nonce +
			"&scope=" + 'openid'
		);
		console.log(authUrl);
		const popup = openPopup();
		let tokens;
		const authCode = await openLoginWidget({popup, authUrl, state});
		tokens = await exchangeTokens({openIdConfig: this.openIdConfig, clientId:this.clientId, authCode, codeVerifier, nonce});

		console.log(tokens);
		return tokens;
	}

	async getUserInfo(accessToken) {
		if (typeof accessToken !== 'string') {
			throw new Error('Access token must be a string');
		}
		// TODO: check for failed status code
		return await request(this.openIdConfig.userinfo_endpoint, {
			method: 'GET',
			headers: {
				'Authorization': 'Bearer ' + accessToken
			}
		});
	}
}
