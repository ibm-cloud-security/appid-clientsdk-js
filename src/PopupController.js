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
		
		// For silent popups (0x0), use minimal size; otherwise use configured size
		const width = (h === 0 && w === 0) ? 1 : w;
		const height = (h === 0 && w === 0) ? 1 : h;
		
		// Center popup on screen
		const left = (this.window.screen.width - width) / 2;
		const top = (this.window.screen.height - height) / 2;
		
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
