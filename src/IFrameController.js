const IFrameError = require('../errors/IFrameError');

class IFrameController {
	constructor({w = window} = {}) {
		this.window = w;
	};

	open(url) {
		this.iFrame = this.window.document.createElement('iframe');
		this.iFrame.src = url;
		this.iFrame.id = 'iframe';
		this.iFrame.width = 0;
		this.iFrame.height = 0;
		this.window.document.body.appendChild(this.iFrame);
	}

	close() {
		window.document.body.removeChild(this.iFrame);
	}

	async waitForMessage({messageType}) {
		return new Promise((resolve, reject) => {
			const timer = setInterval(() => {
				clearInterval(timer);
				reject(new IFrameError('Silent sign-in stalled'));
				this.close();
			}, 5 * 1000);
			window.addEventListener('message', message => {
				if (!message.data || message.data.type !== messageType) {
					return;
				}

				resolve(message);
			});
		});
	}
}
module.exports = IFrameController;