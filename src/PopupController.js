const POPUP_TIMEOUT_SECONDS = 60;
class PopupController {
	constructor({window}) {
		this.window = window;
	};

	setState(state) {
		this.state = state;
	}

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
		return this.waitForMessage()
	};

	async waitForMessage() {
		return new Promise((resolve, reject) => {
			const timer = setInterval(function() {
				if(this.popup.closed) {
					reject(new Error('Popup closed'));
				}
			}, POPUP_TIMEOUT_SECONDS * 1000);
			window.addEventListener('message', message => {
				if (!message.data || message.data.type !== 'authorization_response') {
					return;
				}
				clearTimeout(timer);

				this.popup.close();
				if (message.data.error.errorType) {
					reject(new Error(JSON.stringify(message.data.error)));
				} else if (atob(message.data.state) !== this.state) {
					reject(new Error("Invalid state"));
				} else {
					resolve(message.data.code);
				}
			});
		});
	}
}
module.exports = PopupController;