const IFrameError = require('./errors/IFrameError');

class IFrameController {
	constructor({w = window} = {}) {
		this.window = w;
	}

	open(url) {
		this.iFrame = this.window.document.createElement('iframe');
		this.iFrame.src = url;
		this.iFrame.width = 0;
		this.iFrame.height = 0;
		this.window.document.body.appendChild(this.iFrame);
	}

	remove() {
		window.document.body.removeChild(this.iFrame);
	}

	async waitForMessage({messageType}) {
		return new Promise((resolve, reject) => {
			const timer = setInterval(() => {
				reject(new IFrameError('Silent sign-in timed out'));
			}, 5 * 1000);
			window.addEventListener('message', (message) => {
				if (!message.data || message.data.type !== messageType) {
					return;
				}
				clearInterval(timer);
				resolve(message);
			});
		});
	}
}
module.exports = IFrameController;
