const Utils = require('./utils');
const RequestHandler = require('./RequestHandler');
const PopupController = require('./PopupController');
const IFrameController = require('./IFrameController');
const OpenIdConfigurationResource = require('./OpenIDConfigurationResource');
const TokenValidator = require('./TokenValidator');
const constants = require('./constants');
const AppIDError = require('./errors/AppIDError');

/**
 * todo:
 * README - detailed desc for each function and errors, params, npm install
 * Function comments in index.js
 * Move helper functions to different file
 * Update tests
 * Add popup obj to init - default {height: screen.height * .85, width: 400}
 *
 */
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

	/**
	 * Initialize AppID
	 * @param clientId - The clientId from the singlepageapp application credentials.
	 * @param discoveryEndpoint - The discoveryEndpoint from the singlepageapp application credentials.
	 * @param popup - (optional) The popup configuration.
	 * @returns {Promise<void>}
	 * @throws AppIDError - For missing required params.
	 * @throws RequestError - Any errors during a HTTP request.
	 */
	async init({clientId, discoveryEndpoint, popup = {height: screen.height * .80, width: 400}}) {
		if (!clientId) {
			throw new AppIDError(constants.MISSING_CLIENT_ID);
		}
		if (!discoveryEndpoint) {
			throw new AppIDError(constants.MISSING_DISCOVERY_ENDPOINT);
		}
		await this.openIdConfigResource.init({discoveryEndpoint, requestHandler: this.request});
		this.clientId = clientId;
		this.popupConfig = popup;
		this.utils = new Utils({openId: this.openIdConfigResource, clientId: this.clientId});
	}

	/**
	 * This will open a login widget in a popup which will prompt the user to enter their credentials.
	 * After a successful login, the popup will close and tokens are returned.
	 * @returns {Promise<*|tokens|*>} - The tokens of the authenticated user or an error.
	 * e.g. {accessToken: 'eyg...', accessTokenPayload: { iss: 'https...' }, idToken: 'eyg...', idTokenPayload: { email: 'example@gmail.com' }}
	 * @throws AppIDError "Popup closed" - The user closed the popup before authentication was completed.
	 * @throws TokenError - Any token validation error.
	 * @throws OAuthError - Any errors from the server. e.g. {error: 'server_error', description: ''}
	 * @throws RequestError - Any errors during a HTTP request.
	 */
	async signin() {
		const {codeVerifier, nonce, state, authUrl} = this.utils.getAuthParams(this.clientId, this.window.origin);

		this.popup.open(this.popupConfig);
		this.popup.navigate({authUrl});
		const message = await this.popup.waitForMessage({messageType: 'authorization_response'});
		this.popup.close();

		this.utils.verifyMessage({message, state});

		let authCode = message.data.code;

		return await this.utils.exchangeTokens({
			authCode,
			codeVerifier,
			nonce,
			windowOrigin: this.window.origin
		});
	}

	/**
	 * Silent sign in will attempt to authenticate the user in a hidden iframe.
	 * Sign in will be successful only if there is a Cloud Directory SSO token in the browser.
	 * You will need to enable SSO on the App ID dashboard.
	 * Possible errors include:
	 * User not signed in - there is no Cloud Directory SSO token
	 * @returns {Promise<object>} - The tokens of the authenticated user.
	 * e.g. {accessToken: 'eyg...', accessTokenPayload: { iss: 'https...' }, idToken: 'eyg...', idTokenPayload: { email: 'example@gmail.com' }}
	 * @throws OAuthError - Any errors from the server. e.g. {error: 'access_denied', description: 'User not signed in'}
	 * @throws AppIDError "Silent sign-in timed out" - The iframe will close after 5 seconds if authentication could not be completed.
	 * @throws TokenError - Any token validation error.
	 * @throws RequestError - Any errors during a HTTP request.
	 */
	async silentSignin() {
		const {codeVerifier, nonce, state, authUrl} = this.utils.getAuthParams(this.clientId, this.window.origin, constants.PROMPT);

		this.iframe.open(authUrl);

		let message;
		try {
			message = await this.iframe.waitForMessage({messageType: 'authorization_response'});
		} finally {
			this.iframe.remove();
		}
		this.utils.verifyMessage({message, state});
		let authCode = message.data.code;

		return await this.utils.exchangeTokens({
			clientId: this.clientId,
			authCode,
			codeVerifier,
			nonce,
			openId: this.openIdConfigResource,
			windowOrigin: this.window.origin
		});
	}

	/**
	 * This method will made a GET request to the user info endpoint using the access token of the authenticated user.
	 * @param accessToken - The App ID access token of the user
	 * @returns {Promise<object>} - The user information for the authenticated user. e.g. {sub: '', email: ''}
	 * @throws AppIDError "Access token must be a string" - Invalid access token.
	 * @throws RequestError - Any errors during a HTTP request.
	 */
	async getUserInfo(accessToken) {
		if (typeof accessToken !== 'string') {
			throw new AppIDError(constants.INVALID_ACCESS_TOKEN);
		}

		return await this.request(this.openIdConfigResource.getUserInfoEndpoint(), {
			headers: {
				'Authorization': 'Bearer ' + accessToken
			}
		});
	}
}

module.exports = AppID;
