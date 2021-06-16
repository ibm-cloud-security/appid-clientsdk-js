const Utils = require('./utils');
const RequestHandler = require('./RequestHandler');
const PopupController = require('./PopupController');
const IFrameController = require('./IFrameController');
const OpenIdConfigurationResource = require('./OpenIDConfigurationResource')
const TokenValidator = require('./TokenValidator');
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
			tokenValidator = new TokenValidator(),
			w = window,
			url = URL
		} = {}) {

		this.popup = popup;
		this.iframe = iframe;
		this.openIdConfigResource = openIdConfigResource;
		this.URL = url;
		this.utils = utils;
		this.tokenValidator = tokenValidator;
		if (!utils) {
			this.utils = new Utils({
				openIdConfigResource: this.openIdConfigResource,
				url: this.URL,
				popup: this.popup,
				jsrsasign
			});
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
	 * @param {string} options.idp - An enabled IdP name or "appid_anon" for anonymous login. If left empty, App ID login widget will be returned with all enabled IdPs.
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
	async init({clientId, discoveryEndpoint, popup = {height: window.screen.height * .80, width: 400}, idp}) {
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
		this.idp = idp;
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
	 * @param {Object} options
	 * @param {string} options.idp - An enabled IdP name or "appid_anon" for anonymous login. If left empty, idp parameter that was set during initialization will be used
	 * @returns {Promise<Tokens>} The tokens of the authenticated user.
	 * @throws {PopupError} "Popup closed" - The user closed the popup before authentication was completed.
	 * @throws {TokenError} Any token validation error.
	 * @throws {OAuthError} Any errors from the server according to the [OAuth spec]{@link https://tools.ietf.org/html/rfc6749#section-4.1.2.1}. e.g. {error: 'server_error', description: ''}
	 * @throws {RequestError} Any errors during a HTTP request.
	 * @example
	 * const {accessToken, accessTokenPayload, idToken, idTokenPayload} = await appID.signin();
	 */
	async signin(options) {
		const { idp } = options || {};
		this._validateInitalize();
		const endpoint = this.openIdConfigResource.getAuthorizationEndpoint();
		let origin = this.window.location.origin;
		if (!origin) {
			origin = this.window.location.protocol + "//" + this.window.location.hostname + (this.window.location.port ? ':' + this.window.location.port : '');
		}
		return this.utils.performOAuthFlowAndGetTokens({
			origin,
			endpoint,
			clientId: this.clientId,
			idp: idp || this.idp,
		});
	}

	/**
	 * Silent sign in allows you to automatically obtain new tokens for a user without the user having to re-authenticate using a popup.
	 * This will attempt to authenticate the user in a hidden iframe.
	 * You will need to [enable Cloud Directory SSO]{@link https://cloud.ibm.com/docs/services/appid?topic=appid-single-page#spa-silent-login}.
	 * Sign in will be successful only if the user has previously signed in using Cloud Directory and their session is not expired.
	 * @param {Object} options
	 * @param {string} options.idp - An enabled IdP name or "appid_anon" for anonymous login. If left empty, idp parameter that was set during initialization will be used
	 * @returns {Promise<Tokens>} The tokens of the authenticated user.
	 * @throws {OAuthError} Any errors from the server according to the [OAuth spec]{@link https://tools.ietf.org/html/rfc6749#section-4.1.2.1}. e.g. {error: 'access_denied', description: 'User not signed in'}
	 * @throws {IFrameError} "Silent sign-in timed out" - The iframe will close after 5 seconds if authentication could not be completed.
	 * @throws {TokenError} Any token validation error.
	 * @throws {RequestError} Any errors during a HTTP request.
	 * @example
	 * const {accessToken, accessTokenPayload, idToken, idTokenPayload} = await appID.silentSignin();
	 */
	async silentSignin(options) {
		const { idp } = options || {};
		this._validateInitalize();
		const endpoint = this.openIdConfigResource.getAuthorizationEndpoint();
		const {codeVerifier, nonce, state, url} = this.utils.getAuthParamsAndUrl({
			clientId: this.clientId,
			origin: this.window.origin,
			prompt: constants.PROMPT,
			endpoint,
			idp: idp || this.idp,
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
	 * You must enable users to manage their account from your app in Cloud Directory settings.
	 * @param {string} idToken A JWT.
	 * @returns {Promise<Tokens>} The tokens of the authenticated user.
	 * @throws {AppIDError} "Expect id token payload object to have identities field"
	 * @throws {AppIDError} "Must be a Cloud Directory user"
	 * @throws {AppIDError} "Missing id token string"
	 * @example
	 * let tokens = await appID.changePassword(idToken);
	 */
	async changePassword(idToken) {
		this._validateInitalize();

		if (!idToken || typeof idToken !== 'string') {
			throw new AppIDError(constants.MISSING_ID_TOKEN);
		}

		let userId;
		const publicKeys = await this.openIdConfigResource.getPublicKeys();
		let decodedToken = this.tokenValidator.decodeAndValidate({
			token: idToken,
			publicKeys,
			issuer: this.openIdConfigResource.getIssuer(),
			clientId: this.clientId
		});

		if (decodedToken.identities && decodedToken.identities[0] && decodedToken.identities[0].id) {
			if (decodedToken.identities[0].provider !== 'cloud_directory') {
				throw new AppIDError(constants.NOT_CD_USER);
			}
			userId = decodedToken.identities[0].id;
		} else {
			throw new AppIDError(constants.INVALID_ID_TOKEN);
		}

		const endpoint = this.openIdConfigResource.getIssuer() + constants.CHANGE_PASSWORD;
		return await this.utils.performOAuthFlowAndGetTokens({
			userId,
			origin: this.window.origin,
			clientId: this.clientId,
			endpoint,
			idp: this.idp,
		});
	}

	/**
	 * This method will open a popup to the change details widget for Cloud Directory users.
	 * You must enable users to manage their account from your app in Cloud Directory settings.
	 * @param {Object} tokens App ID tokens
	 * @returns {Promise<Tokens>}
	 * @throws {AppIDError} "Missing id token string"
	 * @throws {AppIDError} "Missing access token string"
	 * @throws {AppIDError} "Missing tokens object"
	 * @example
	 * let tokens = {accessToken, idToken}
	 * let newTokens = await appID.changeDetails(tokens);
	 */
	async changeDetails({accessToken, idToken}) {
		this._validateInitalize();

		if (!accessToken && typeof accessToken !== 'string') {
			throw new AppIDError(constants.MISSING_ACCESS_TOKEN);
		}

		if (!idToken && typeof idToken !== 'string') {
			throw new AppIDError(constants.MISSING_ID_TOKEN);
		}

		const generateCodeUrl = this.openIdConfigResource.getIssuer() + constants.GENERATE_CODE;
		const changeDetailsCode = await this.request(generateCodeUrl, {
			headers: {
				'Authorization': 'Bearer ' + accessToken + ' ' + idToken
			}
		});
		const endpoint = this.openIdConfigResource.getIssuer() + constants.CHANGE_DETAILS;

		return this.utils.performOAuthFlowAndGetTokens({
			origin: this.window.origin,
			clientId: this.clientId,
			endpoint,
			changeDetailsCode,
			idp: this.idp,
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
