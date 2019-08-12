module.exports = async function request(url, options) {
	const response = await fetch(url, options);
	const text = await response.text();
	if (!response.ok) {
		throw new Error(`Failed to fetch ${url}. Status code=${response.statusCode}. Response=${text}`);
	}
	try {
		return JSON.parse(text);
	} catch(err) {
		throw new Error(`Invalid response while trying to fetch ${url}. Response=${text}`);
	}
};