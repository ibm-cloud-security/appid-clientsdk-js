class PopupControllerMock {
	constructor({invalidState, error, invalidOrigin, delay = 0}) {
		this.invalidState = invalidState;
		this.invalidOrigin = invalidOrigin;
		this.error = error;
		this.delay = delay;
	}

	init() {
		return;
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

	async waitForMessage() {
		// Simulate delay if specified (useful for testing timeouts)
		if (this.delay > 0) {
			await new Promise(resolve => setTimeout(resolve, this.delay));
		}
		
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
		return message;
	}
}

module.exports = PopupControllerMock;