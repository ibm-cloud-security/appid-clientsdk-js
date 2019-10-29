const PopupError = require('./errors/PopupError');

class PopupController {
	constructor({w = window} = {}) {
		this.window = w;
	};

	init(popupConfig){
		this.popupConfig = popupConfig;
	}

	open() {
		const h = this.popupConfig.height;
		const w = this.popupConfig.width;
		const left = (window.screen.width - w) / 2;
		const top = (window.screen.height - h) / 2;
		this.popup = this.window.open('', 'popup', `left=${left},top=${top},width=${w},height=${h},resizable,scrollbars=yes,status=1`);
		if (!this.popup) {
			throw new PopupError('Unable to open popup')
		}
	};

	navigate(url) {
		this.popup.location.href = url;
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
