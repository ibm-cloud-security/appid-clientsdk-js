class PopupControllerMock {
	constructor({invalidState, error, invalidOrigin}) {
		this.invalidState = invalidState;
		this.invalidOrigin = invalidOrigin;
		this.error = error;
	}

	open() {
		return;
	};

	close() {
		return;
	};

	navigate() {
		return;
	};

	waitForMessage() {
		let message = {
			data: {
				type: 'authorization_response',
				code: 'authCode',
				state: 'dmFsaWQ=', //b64('valid')
			},
			origin: 'http://authserver.com'
		};
		if (this.invalidState) {
			message.data.state = 'invalidState';
		}
		if (this.error) {
			message.data.error = 'access_denied';
			message.data.error_description = 'Could not verify SAML assertion';
		}
		if (this.invalidOrigin) {
			message.origin = 'http://invalidOrigin.com';
		}
		return Promise.resolve(message);
	}
}

module.exports = PopupControllerMock;