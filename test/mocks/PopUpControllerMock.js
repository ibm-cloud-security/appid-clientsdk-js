class PopupControllerMock {
	constructor({invalidState, error}) {
		this.invalidState = invalidState;
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
				error: {type: '', code: '', description: ''}
		 	}
		};
		if (this.invalidState) {
			message.data.state = 'invalidState';
		}
		if (this.error) {
			message.data.error.type = 'access_denied';
			message.data.error.code = undefined;
			message.data.error.description = 'Could not verify SAML assertion';
		}
		return Promise.resolve(message);
	}
}
module.exports = PopupControllerMock;