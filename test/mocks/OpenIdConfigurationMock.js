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

	getPublicKeys() {
		return constants.PUBLIC_KEYS;
	}
}
module.exports = OpenIdConfigurationMock;