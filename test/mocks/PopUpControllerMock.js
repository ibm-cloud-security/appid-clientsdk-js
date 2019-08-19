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
				error: {errorType: '', errorCode: '', errorDescription: ''}
		 	}
		};
		if (this.invalidState) {
			message.data.state = 'invalidState';
		}
		if (this.error) {
			message.data.error.errorType = 'Invalid client type';
			message.data.error.errorCode = 400;
			message.data.error.errorDescription = 'Application is not a browser app';
		}
		return Promise.resolve(message);
	}
}
module.exports = PopupControllerMock;