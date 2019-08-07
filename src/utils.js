
export const openPopup = () => {
	const window = window.open('www.google.com', 'popup', 'left=100,top=100,width=400,height=600,resizable,scrollbars=yes,status=1');
	return window;
};

export const loginWidget = (popup, url) =>  {
	popup.location.href = url;
	return new Promise((resolve, reject) => {
		window.addEventListener('message', e => {
			if (!e.data || e.data.type !== 'authorization_response') {
				return;
			}
			popup.close();
			if (e.data.response.error) {
				return reject(e.data.response);
			}
			resolve(e.data.response);
		});
	});
};

export const exchangeTokens = async (endpoint, authCode) =>  {
	let tokens = await fetch(endpoint, {
		method: 'POST',
		body: JSON.stringify({
			grant_type: 'authorization_code',
			redirect_uri: window.location.origin,
			...options
		}),
		headers: {
			'Content-type': 'application/json'
		}
	});
	// TODO: validate tokens
	return tokens;
};

export const randomString = () =>  {
	let random = '';
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_~.';
	let array = window.crypto.getRandomValues(new Uint8Array(43));
	array.forEach( v => (random += characters[v % characters.length]));
	return random;
};
