import * as utils from './utils';
const authorizationEndpoint = '/authorization';
const responseType = 'code';
const redirectUri = window.location.origin;

module.exports = class AppID {
	constructor(clientID, discoveryUrl) {
		this.clientID = clientID;
		this.discoveryUrl = fetch(discoveryUrl);
	}

	// init() {
	// 	this.clientID = clientID;
	// 	this.discoveryUrl = fetch(discoveryUrl);
	// 	console.log(this.discoveryUrl);
	// }

	/**
	 * ```js
	 * await appid.signinWithPopup();
	 * ```
	 * A promise to ID token payload by default and access token. If there is an error in the callback, reject the promise with the error
	 */
	async signinWithPopup() {
		// open popup
		const popup = utils.openPopup();
		const challenge_method = 'sh256';
		const code_verifier = utils.randomString();
		const code_challenge = code_verifier;
		const authUrl = encodeURI(authorizationEndpoint +
			"?client_id=" + this.clientID +
			// "?code_challenge=" + code_challenge +
			// "?challenge_method=" + challenge_method +
			"&response_type=" + responseType +
			// "&redirect_uri=" + redirectUri +
			"&scope=" + 'openid');

		const authCode = await utils.loginWidget(popup, authUrl);
		// exchange for token
		const token = await utils.exchangeTokens(this.discoveryUrl.token_endpoint, authCode);
	}

};