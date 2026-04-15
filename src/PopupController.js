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
		// old code
		// const left = (window.screen.width - w) / 2;
		// const top = (window.screen.height - h) / 2;
		// this.popup = this.window.open('', 'popup', `left=${left},top=${top},width=${w},height=${h},resizable,scrollbars=yes,status=1`);

		// For silent popups (0x0), use minimal size and position at top center
		let left, top, width, height;
		if (h === 0 && w === 0) {
			// Minimal size (1x1) positioned at top center of screen
			width = 1;
			height = 1;
			left = -10000;
			top = -10000;
			// left = (window.screen.width - w) / 2;
			// top = (window.screen.height - h) / 2;
		} else {
			// Regular popup - centered on screen
			width = w;
			height = h;
			left = (window.screen.width - w) / 2;
			top = (window.screen.height - h) / 2;
		}
		
		this.popup = this.window.open('', 'popup', `left=${left},top=${top},width=${width},height=${height},resizable,scrollbars=yes,status=1`);
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
