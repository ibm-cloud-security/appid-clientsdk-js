class IFrameControllerMock {
	constructor({invalidState, error, invalidOrigin}) {
		this.invalidState = invalidState;
		this.error = error;
		this.invalidOrigin = invalidOrigin;
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
				state: 'dmFsaWQ=' //b64('valid')
		 	},
			origin: 'http://authServer.com/'
		};
		if (this.invalidState) {
			message.data.state = 'invalidState';
		}
		if (this.error) {
			message.data.error = 'GENERAL_ERROR';
			message.data.description = 'Unable to log in due to time out. Try again';
		}
		if (this.invalidOrigin) {
			message.origin = 'http://invalidOrigin.com'
		}
		return Promise.resolve(message);
	}
}
module.exports = IFrameControllerMock;