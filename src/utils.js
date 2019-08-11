export function openPopup() {
	const h = 700;
	const w = 400;
	const left = (screen.width - w) / 2;
	const top = (screen.height - h) / 2;
	const popup = window.open('', 'popup', `left=${left},top=${top},width=${w},height=${h},resizable,scrollbars=yes,status=1`);
	if (!popup) {
		throw new Error('Unable to open popup')
	}
	return popup;
};

export function buildParams(params) {
	return Object.keys(params).map(function (key) {
		return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
	}).join('&');
}

export function getRandomString(length) {
	let random = '';
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_~.';
	let array = window.crypto.getRandomValues(new Uint8Array(length));
	array.forEach(v => (random += characters[v % characters.length]));
	return random;
};

export async function sha256(message) {
// encode as UTF-8
	const msgBuffer = new TextEncoder('utf-8').encode(message);

// hash the message
	const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);

// convert ArrayBuffer to Array
	const hashArray = Array.from(new Uint8Array(hashBuffer));

// convert bytes to hex string
	return hashArray.map(b => ('00' + b.toString(16)).slice(-2)).join('');
}
