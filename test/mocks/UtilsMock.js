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

	getAuthParams() {
		return 'authParams';
	}

	verifyMessage() {
		return;
	}

	getChangePasswordInfo() {
		return {
			codeVerifier: 'codeVerifier',
			state: 'state',
			nonce: 'nonce',
			changePasswordUrl: 'url'
		}
	}

	getPKCEFields() {
		return;
	}

	exchangeTokens() {
		return {
			accessToken: 'accessToken',
			accessTokenPayload: 'tokenPayload',
			idToken: 'idToken',
			idTokenPayload: 'tokenPayload'
		};
	}
}

module.exports = UtilsMock;