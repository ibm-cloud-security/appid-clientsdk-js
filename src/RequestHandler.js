const fetch = require('node-fetch');
class RequestHandler {
	async request(url, options) {
		const response = await fetch(url, options);
		const text = await response.text();

		if (!response.ok || response.status > 300) {
			throw new Error(`Failed to fetch ${url}. Status code=${response.status}. Response=${text}`);
		}
		try {
			return JSON.parse(text);
		} catch(err) {
			throw new Error(`Invalid response while trying to fetch ${url}. Response=${text}`);
		}
	};
}
module.exports = RequestHandler;