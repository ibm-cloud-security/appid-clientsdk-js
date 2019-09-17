const PopupError = require('./errors/PopupError');

class PopupController {
	constructor({w = window} = {}) {
		this.window = w;
	};

	open({authUrl}) {
		this.popup = this.window.open(authUrl, '_blank');
		if (!this.popup) {
			throw new PopupError('Unable to open popup')
		}
	};

	close() {
		this.popup.close();
	}

	async waitForMessage({messageType}) {
		return new Promise((resolve, reject) => {
			const timer = setInterval(() => {
				if(this.popup.closed) {
					clearInterval(timer);
					reject(new PopupError('Popup closed'));
				}
			}, 1000);
			window.addEventListener('message', (message) => {
				if (!message.data || message.data.type !== messageType) {
					return;
				}

				resolve(message);
			});
		});
	}
}
module.exports = PopupController;
