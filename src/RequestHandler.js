const fetch = require('node-fetch');
const RequestError = require('./errors/RequestError');
class RequestHandler {
	async request(url, options) {
		let response, text;
		try {
			response = await fetch(url, options);
			text = await response.text();
		} catch (e) {
			throw new RequestError(`Failed to fetch ${url}. ${e}`, null, e);
		}

		if (!response.ok || response.status > 300) {
			throw new RequestError(`Failed to fetch ${url}. Response=${text}`, response.status);
		}
		try {
			return JSON.parse(text);
		} catch(err) {
			throw new RequestError(`Invalid response while trying to fetch ${url}. Response=${text}`, response.status, err);
		}
	};
}
module.exports = RequestHandler;
