class PopupController {
	constructor({window}) {
		this.window = window;
	};

	open() {
		const h = 700;
		const w = 400;
		const left = (screen.width - w) / 2;
		const top = (screen.height - h) / 2;
		this.popup = this.window.open('', 'popup', `left=${left},top=${top},width=${w},height=${h},resizable,scrollbars=yes,status=1`);
		if (!this.popup) {
			throw new Error('Unable to open popup')
		}
	};

	navigate({authUrl}) {
		this.popup.location.href = authUrl;
	};

	async waitForMessage({messageType}) {
		return new Promise((resolve, reject) => {
			const timer = setInterval(() => {
				if(this.popup.closed) {
					clearInterval(timer);
					reject(new Error('Popup closed'));
				}
			}, 1000);
			window.addEventListener('message', message => {
				if (!message.data || message.data.type !== messageType) {
					return;
				}
				this.popup.close();
				resolve(message);
			});
		});
	}
}
module.exports = PopupController;