class OpenIdConfigurationMock {
	init() {
		return;
	}

	getAuthorizationEndpoint() {
		return 'http://authServer.com/';
	}

	getUserInfoEndpoint() {
		return this.getAuthorizationEndpoint() + 'userinfoEndpoint';
	}

	getJwksEndpoint() {
		return this.getAuthorizationEndpoint() +'publicKeysEndpoint';
	}

	getTokenEndpoint() {
		return this.getAuthorizationEndpoint() + 'tokenEndpoint';
	}

	getIssuer() {
		return 'appID';
	}

	getPublicKeys() {
		return 'publicKeys';
	}
}
module.exports = OpenIdConfigurationMock;