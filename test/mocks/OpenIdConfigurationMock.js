const constants = require('../mocks/constants');
class OpenIdConfigurationMock {
	getAuthorizationEndpoint() {
		return 'authEndpoint';
	}

	getUserInfoEndpoint() {
		return 'userinfoEndpoint';
	}

	getJwksEndpoint() {
		return 'publicKeysEndpoint';
	}

	getTokenEndpoint() {
		return 'tokenEndpoint';
	}

	getIssuer() {
		return 'appID';
	}

	getPublicKey() {
		return [constants.PUBLIC_KEY];
	}
}
module.exports = OpenIdConfigurationMock;