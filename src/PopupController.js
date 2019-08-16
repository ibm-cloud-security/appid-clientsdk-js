const PopupError = require('../errors/PopupError');

class PopupController {
	constructor({w = window} = {}) {
		this.window = w;
	};

	open() {
		const h = 700;
		const w = 400;
		const left = (screen.width - w) / 2;
		const top = (screen.height - h) / 2;
		this.popup = this.window.open('', 'popup', `left=${left},top=${top},width=${w},height=${h},resizable,scrollbars=yes,status=1`);
		if (!this.popup) {
			throw new PopupError('Unable to open popup')
		}
	};

	openIFrame(url) {
		this.iFrame = this.window.document.createElement('iframe');
		this.iFrame.src = url;
		this.iFrame.width = 0;
		this.iFrame.height = 0;

		window.document.body.appendChild(this.iFrame);
	}

	navigate({authUrl}) {
		this.popup.location.href = authUrl;
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
			window.addEventListener('message', message => {
				if (!message.data || message.data.type !== messageType) {
					return;
				}

				resolve(message);
			});
		});
	}
}
module.exports = PopupController;