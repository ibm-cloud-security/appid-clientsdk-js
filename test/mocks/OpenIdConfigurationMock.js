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
		return 'publicKeys';
	}
}
module.exports = OpenIdConfigurationMock;