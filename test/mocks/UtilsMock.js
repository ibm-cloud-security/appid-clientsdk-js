class UtilsMock {
	getRandomString() {
		return 'valid';
	};

	sha256() {
		return 'hashedValue';
	};

	buildParams() {
		return 'param1=test&param2=test';
	}

	getAuthParamsAndUrl() {
		return {
			codeVerifier: 'codeVerifier',
			nonce: 'nonce',
			state: 'state',
			url: 'url'
		};
	}

	verifyMessage() {
		return;
	}

	performOAuthFlowAndGetTokens() {
		return this.retrieveTokens()
	}

	getPKCEFields() {
		return;
	}

	retrieveTokens() {
		return {
			accessToken: 'accessToken',
			accessTokenPayload: 'tokenPayload',
			idToken: 'idToken',
			idTokenPayload: 'tokenPayload'
		};
	}
}

module.exports = UtilsMock;