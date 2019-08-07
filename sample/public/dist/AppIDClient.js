const openPopup = () => {
	const h = 100;
	const w = 400;
	const left = 'left=' + (screen.width - w) / 2;
	const top = 'top=' + (screen.height - h) / 4;

	return window.open('', 'popup', left + top +
		',top=' + h + ',width=' + w + ',height=700,resizable,scrollbars=yes,status=1');
};

async function loginWidget(popup, url) {
	popup.location.href = url;
	return new Promise((resolve, reject) => {
		window.addEventListener('message', message => {
			if (!message.data || message.data.type !== 'authorization_response') {
				return;
			}
			popup.close();
			if (message.data.error) {
				return reject(message.data);
			}
			resolve(message.data.code);
		});
	});
};

async function exchangeTokens(discovery, clientID, authCode) {
	let params = {
		grant_type: 'authorization_code',
		redirect_uri: `${discovery.issuer}/pkce_callback`,
		client_id: clientID,
		code: authCode,
		code_verifier: codeVerifier
	};

	const requestParams = Object.keys(params).map((key) => {
		return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
	}).join('&');

	return await fetch(discovery.token_endpoint, {
		method: 'POST',
		headers: {
			'Authorization': 'Basic ' + btoa(`${clientID}:${codeVerifier}`),
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: requestParams
	});
	// const tokens = await tokensRes.json();
	// console.log(tokens);
	// const isValid = validateTokens(tokens.access_token);
	// const isValid = validateTokens(tokens.id_token);
}

// function validateTokens(tokens) {
// 	const [header, payload, signature] = tokens.split('.');
// 	console.log(payload);
// 	console.log(signature);
// }

const randomString = () => {
	let random = '';
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_~.';
	let array = window.crypto.getRandomValues(new Uint8Array(43));
	array.forEach(v => (random += characters[v % characters.length]));
	return random;
};

async function sha256(message) {
// encode as UTF-8
	const msgBuffer = new TextEncoder('utf-8').encode(message);

// hash the message
	const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);

// convert ArrayBuffer to Array
	const hashArray = Array.from(new Uint8Array(hashBuffer));

// convert bytes to hex string
	return hashArray.map(b => ('00' + b.toString(16)).slice(-2)).join('');
}

const responseType = 'code';
let codeVerifier;

class AppID {
	async init({clientID, discoveryUrl}) {
		this.clientID = clientID;
		const discoveryResponse = await fetch(discoveryUrl);
		this.discoveryObj = await discoveryResponse.json();
		console.log(this.discoveryObj);
	}

	/**
	 * ```js
	 * await appid.signinWithPopup();
	 * ```
	 * A promise to ID and access token. If there is an error in the callback, reject the promise with the error
	 */
	async signinWithPopup() {
		// open popup
		const challenge_method = 'S256';
		const code_verifier = randomString();
		const code_challenge = await sha256(code_verifier);
		console.log('verifier: ' + code_verifier);
		console.log('hashed: ' + code_challenge);
		console.log('encoded: ' + btoa(code_challenge));

		codeVerifier = code_verifier;
		// todo: validate state, nonce
		const authUrl = encodeURI(this.discoveryObj.authorization_endpoint +
			"?client_id=" + this.clientID +
			"&response_type=" + responseType +
			"&state=" + btoa(randomString()) +
			"&code_challenge=" + btoa(code_challenge) +
			"&code_challenge_method=" + challenge_method +
			"&scope=" + 'openid'
		);
		console.log(authUrl);
		const popup = openPopup();
		const res = await loginWidget(popup, authUrl);
		const tokens = await exchangeTokens(this.discoveryObj, this.clientID, res);
		return tokens.json();
	}
};

