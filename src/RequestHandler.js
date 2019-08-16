const fetch = require('node-fetch');
const RequestError = require('../errors/RequestError');
class RequestHandler {
	async request(url, options) {
		const response = await fetch(url, options);
		const text = await response.text();

		if (!response.ok || response.status > 300) {
			throw new RequestError(`Failed to fetch ${url}. Response=${text}`, response.status);
		}
		try {
			return JSON.parse(text);
		} catch(err) {
			throw new RequestError(`Invalid response while trying to fetch ${url}. Response=${text}`, response.status);
		}
	};
}
module.exports = RequestHandler;