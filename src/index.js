const Utils = require('./utils');
const RequestHandler = require('./RequestHandler');
const PopupController = require('./PopupController');
const IFrameController = require('./IFrameController');
const OpenIdConfigurationResource = require('./OpenIDConfigurationResource');
const constants = require('./constants');
const AppIDError = require('./errors/AppIDError');
const jsrsasign = require('jsrsasign');

/**
 * This class provides functions to support authentication.
 */
class AppID {
	/**
	 * This creates an instance of AppID. Once created, call init() before attempting to sign in.
	 * @example
	 * const appID = new AppID();
	 */
	constructor(
		{
			popup = new PopupController(),
			iframe = new IFrameController(),
			openIdConfigResource = new OpenIdConfigurationResource(),
			utils,
			requestHandler = new RequestHandler(),
			w = window,
			url = URL
		} = {}) {

		this.popup = popup;
		this.iframe = iframe;
		this.openIdConfigResource = openIdConfigResource;
		this.URL = url;
		this.utils = utils;
		if (!utils) {
			this.utils = new Utils({openIdConfigResource: this.openIdConfigResource, url: this.URL, popup: this.popup, jsrsasign});
		}
		this.request = requestHandler.request;
		this.window = w;
		this.initialized = false;
	}

	/**
	 * Initialize AppID. Call this function before attempting to sign in. You must wait for the promise to resolve.
	 * @param {Object} options
	 * @param {string} options.clientId - The clientId from the singlepageapp application credentials.
	 * @param {string} options.discoveryEndpoint - The discoveryEndpoint from the singlepageapp application credentials.
	 * @param {Object} [options.popup] - The popup configuration.
	 * @param {Number} options.popup.height - The popup height.
	 * @param {Number} options.popup.width - The popup width.
	 * @returns {Promise<void>}
	 * @throws {AppIDError} For missing required params.
	 * @throws {RequestError} Any errors during a HTTP request.
	 * @example
	 * await appID.init({
	 * 	clientId: '<SPA_CLIENT_ID>',
	 * 	discoveryEndpoint: '<WELL_KNOWN_ENDPOINT>'
	 * });
	 *
	 */
	async init({clientId, discoveryEndpoint, popup = {height: window.screen.height * .80, width: 400}}) {
		if (!clientId) {
			throw new AppIDError(constants.MISSING_CLIENT_ID);
		}
		try {
			new this.URL(discoveryEndpoint)
		} catch (e) {
			throw new AppIDError(constants.INVALID_DISCOVERY_ENDPOINT);
		}

		await this.openIdConfigResource.init({discoveryEndpoint, requestHandler: this.request});
		this.popup.init(popup);
		this.clientId = clientId;
		this.initialized = true;
	}

	/**
	 * @typedef {Object} Tokens
	 * @property {string} accessToken A JWT.
	 * @property {Object} accessTokenPayload The decoded JWT.
	 * @property {string} idToken A JWT.
	 * @property {Object} idTokenPayload The decoded JWT.
	 */

	/**
	 * This will open a sign in widget in a popup which will prompt the user to enter their credentials.
	 * After a successful sign in, the popup will close and tokens are returned.
	 * @returns {Promise<Tokens>} The tokens of the authenticated user.
	 * @throws {PopupError} "Popup closed" - The user closed the popup before authentication was completed.
	 * @throws {TokenError} Any token validation error.
	 * @throws {OAuthError} Any errors from the server according to the [OAuth spec]{@link https://tools.ietf.org/html/rfc6749#section-4.1.2.1}. e.g. {error: 'server_error', description: ''}
	 * @throws {RequestError} Any errors during a HTTP request.
	 * @example
	 * const {accessToken, accessTokenPayload, idToken, idTokenPayload} = await appID.signin();
	 */
	async signin() {
		this._validateInitalize();
		const endpoint = this.openIdConfigResource.getAuthorizationEndpoint();
		return this.utils.performOAuthFlowAndGetTokens({origin: this.window.origin, clientId: this.clientId, endpoint});
	}

	/**
	 * Silent sign in will attempt to authenticate the user in a hidden iframe.
	 * You will need to enable Cloud Directory SSO.
	 * Sign in will be successful only if the user has previously signed in using Cloud Directory and their session is not expired.
	 * @returns {Promise<Tokens>} The tokens of the authenticated user.
	 * @throws {OAuthError} Any errors from the server according to the [OAuth spec]{@link https://tools.ietf.org/html/rfc6749#section-4.1.2.1}. e.g. {error: 'access_denied', description: 'User not signed in'}
	 * @throws {IFrameError} "Silent sign-in timed out" - The iframe will close after 5 seconds if authentication could not be completed.
	 * @throws {TokenError} Any token validation error.
	 * @throws {RequestError} Any errors during a HTTP request.
	 * @example
	 * const {accessToken, accessTokenPayload, idToken, idTokenPayload} = await appID.silentSignin();
	 */
	async silentSignin() {
		this._validateInitalize();
		const endpoint = this.openIdConfigResource.getAuthorizationEndpoint();
		const {codeVerifier, nonce, state, url} = this.utils.getAuthParamsAndUrl({
			clientId: this.clientId,
			origin: this.window.origin,
			prompt: constants.PROMPT,
			endpoint
		});

		this.iframe.open(url);

		let message;
		try {
			message = await this.iframe.waitForMessage({messageType: 'authorization_response'});
		} finally {
			this.iframe.remove();
		}
		this.utils.verifyMessage({message, state});
		let authCode = message.data.code;

		return await this.utils.retrieveTokens({
			clientId: this.clientId,
			authCode,
			codeVerifier,
			nonce,
			openId: this.openIdConfigResource,
			windowOrigin: this.window.origin
		});
	}

	/**
	 * This method will make a GET request to the [user info endpoint]{@link https://us-south.appid.cloud.ibm.com/swagger-ui/#/Authorization%2520Server%2520-%2520Authorization%2520Server%2520V4/oauth-server.userInfo} using the access token of the authenticated user.
	 * @param {string} accessToken The App ID access token of the user.
	 * @returns {Promise} The user information for the authenticated user. Example: {sub: '', email: ''}
	 * @throws {AppIDError} "Access token must be a string" Invalid access token.
	 * @throws {RequestError} Any errors during a HTTP request.
	 */
	async getUserInfo(accessToken) {
		this._validateInitalize();
		if (typeof accessToken !== 'string') {
			throw new AppIDError(constants.INVALID_ACCESS_TOKEN);
		}

		return await this.request(this.openIdConfigResource.getUserInfoEndpoint(), {
			headers: {
				'Authorization': 'Bearer ' + accessToken
			}
		});
	}

	/**
	 * This method will open a popup to the change password widget for Cloud Directory users.
	 * @param {string} idTokenPayload The id token payload.
	 * @returns {Promise<Tokens>} The tokens of the authenticated user.
	 * @throws {AppIDError} "Expect id token payload object to have identities field"
	 * @throws {AppIDError} "Must be a Cloud Directory user"
	 * @throws {AppIDError} "Missing id token payload"
	 * @example
	 * let tokens = await appID.changePassword(idTokenPayload);
	 */
	async changePassword(idTokenPayload) {
		this._validateInitalize();
		let userId;

		if (!idTokenPayload){
			throw new AppIDError(constants.MISSING_ID_TOKEN_PAYLOAD);
		}
		if (typeof idTokenPayload === 'string') {
			throw new AppIDError(constants.INVALID_ID_TOKEN_PAYLOAD);
		}
		if(idTokenPayload.identities && idTokenPayload.identities[0] && idTokenPayload.identities[0].id) {
			if (idTokenPayload.identities[0].provider !== 'cloud_directory') {
				throw new AppIDError(constants.NOT_CD_USER);
			}
			userId = idTokenPayload.identities[0].id;
		} else {
			throw new AppIDError(constants.INVALID_ID_TOKEN_PAYLOAD);
		}

		const endpoint = this.openIdConfigResource.getIssuer() + constants.CHANGE_PASSWORD;
		return this.utils.performOAuthFlowAndGetTokens({
			userId,
			origin: this.window.origin,
			clientId: this.clientId,
			endpoint
		});
	}

	/**
	 *
	 * @private
	 */
	_validateInitalize() {
		if (!this.initialized) {
			throw new AppIDError(constants.FAIL_TO_INITIALIZE);
		}
	}
}

module.exports = AppID;
