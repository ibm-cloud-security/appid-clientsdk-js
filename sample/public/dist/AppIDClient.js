const openPopup = () => {
	const h = 100;
	const w = 400;
	const left = 'left=' + (screen.width - w) / 2;
	const top = 'top=' + (screen.height - h) / 4;

	return window.open('', 'popup', left + top +
		',top=' + h + ',width=' + w + ',height=700,resizable,scrollbars=yes,status=1');
};

async function loginWidget(popup, url, state) {
	popup.location.href = url;
	return new Promise((resolve, reject) => {
		window.addEventListener('message', message => {
			if (!message.data || message.data.type !== 'authorization_response') {
				return;
			}
			console.log(message.data);
			if (atob(message.data.state) !== state) {
				reject("invalid state");
			}
			popup.close();
			if (message.data.error) {
				reject(message.data.error);
			}
			resolve(message.data.code);
		});
	});
};

async function exchangeTokens(discovery, clientID, authCode, nonce) {
	let params = {
		grant_type: 'authorization_code',
		redirect_uri: `${discovery.issuer}/pkce_callback`,
		code: authCode,
		code_verifier: codeVerifier
	};

	const requestParams = Object.keys(params).map((key) => {
		return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
	}).join('&');

	const res = await fetch(discovery.token_endpoint, {
		method: 'POST',
		headers: {
			'Authorization': 'Basic ' + btoa(`${clientID}:${codeVerifier}`),
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: requestParams
	});
	const tokens = await res.json();
	return {
		accessToken: tokens.access_token,
		accessTokenPayload: decodeAndValidate(tokens.access_token, discovery, clientID, nonce),
		idToken: tokens.id_token,
		idTokenPayload: decodeAndValidate(tokens.id_token, discovery, clientID, nonce)
	}
}

function decodeAndValidate(token, discovery, clientID, nonce) {
	const [header, payload, signature] = token.split('.');
	const decoded = {
		header: JSON.parse(atob(header)),
		payload:JSON.parse(atob(payload))
	};
	console.log(decoded);
	if (decoded.header.ver !== 4) {
		throw new Error('Invalid version');
	}
	if (decoded.header.alg !== 'RS256') {
		throw new Error('Invalid algorithm');
	}
	if (decoded.payload.iss !== discovery.issuer) {
		throw new Error('Invalid issuer');
	}
	if (!decoded.payload.aud.includes(clientID)) {
		throw new Error('Invalid audience');
	}
	if (decoded.payload.nonce && decoded.payload.nonce !== nonce) {
		throw new Error('Invalid nonce');
	}
	const now = Math.floor(Date.now() / 1000);
	if (decoded.payload.exp < now) {
		throw new Error('token expired');
	}

	// const publicKeys = await fetch(discovery.jwks_uri, {
	// 	method: 'GET'
	// });
	// console.log(publicKeys);
	return decoded.payload;
}

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
		const nonce = randomString();
		const state = randomString();
		codeVerifier = code_verifier;

		const authUrl = encodeURI(this.discoveryObj.authorization_endpoint +
			"?client_id=" + this.clientID +
			"&response_type=" + responseType +
			"&state=" + btoa(state) +
			"&code_challenge=" + btoa(code_challenge) +
			"&code_challenge_method=" + challenge_method +
			"&nonce=" + nonce +
			"&scope=" + 'openid'
		);
		console.log(authUrl);
		const popup = openPopup();
		let tokens;
		const authCode = await loginWidget(popup, authUrl, state);
		tokens = await exchangeTokens(this.discoveryObj, this.clientID, authCode, nonce);

		console.log(tokens);
		return tokens;
	}

	async getUserInfo(accessToken) {
		if (typeof accessToken !== "string") {
			throw new Error('Access token must be a string');
		}
		let res = await fetch(this.discoveryObj.userinfo_endpoint, {
			method: 'GET',
			headers: {
				'Authorization': 'Bearer ' + accessToken
			}
		});
		return res.json();
		// console.log(res.json());
	}
}
