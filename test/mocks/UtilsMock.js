class UtilsMock {
	constructor({popup, silentPopup} = {}) {
		this.popup = popup;
		this.silentPopup = silentPopup;
	}

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

	async performOAuthFlowAndGetTokens({useSilentPopup = false} = {}) {
		// Use the appropriate popup controller
		const popupController = useSilentPopup ? this.silentPopup : this.popup;
		
		if (popupController) {
			popupController.open();
			popupController.navigate();
			await popupController.waitForMessage();
			popupController.close();
		}
		
		return this.retrieveTokens();
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