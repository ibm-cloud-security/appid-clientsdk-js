const POPUP_TIMEOUT_SECONDS = 60;
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

export async function openLoginWidget({popup, authUrl, state}) {
	popup.location.href = authUrl;
	return new Promise((resolve, reject) => {
		// const timeout = setTimeout( reject(new Error('Popup timeout'), popup), POPUP_TIMEOUT_SECONDS * 1000);

		window.addEventListener('message', message => {
			// TODO: add timeout if case Dave close popup, check window close event
			if (!message.data || message.data.type !== 'authorization_response') {
				return;
			}
			// clearTimeout(timeout);
			popup.close();
			if (message.data.error) {
				reject(new Error(message.data.error));
			} else if (atob(message.data.state) !== state) {
				reject(new Error("Invalid state"));
			} else {
				resolve(message.data.code);
			}
		});
	});
};

export async function exchangeTokens({openIdConfig, clientId, authCode, nonce, codeVerifier}) {
	let params = {
		grant_type: 'authorization_code',
		redirect_uri: `${openIdConfig.issuer}/pkce_callback`,
		code: authCode,
		code_verifier: codeVerifier
	};

	const requestParams = Object.keys(params).map((key) => {
		return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
	}).join('&');

	// TODO: check for failed status code, could be an html file, make request function and use everywhere
	const tokens = await request(openIdConfig.token_endpoint, {
		method: 'POST',
		headers: {
			'Authorization': 'Basic ' + btoa(`${clientId}:${codeVerifier}`),
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: requestParams
	});

	if (!tokens.access_token && !tokens.id_token) {
		throw new Error('Missing tokens')
	}
	return {
		accessToken: tokens.access_token,
		accessTokenPayload: await decodeAndValidate({token: tokens.access_token, openIdConfig, clientId, nonce}),
		idToken: tokens.id_token,
		idTokenPayload: await decodeAndValidate({token: tokens.id_token, openIdConfig, clientId, nonce})
	}
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

//TODO: create token validation error class to wrap
async function decodeAndValidate({token, openIdConfig, clientId, nonce}) {
	const TOKEN_ALG = 'RS256';
	const VERSION = 4;
	const publicKeys = await request(openIdConfig.jwks_uri, {
		method: 'GET'
	});
	console.log(publicKeys);

	//TODO: check for 3 parts else invalid token err
	const tokenParts = token.split('.');
	if (tokenParts.length !== 3) {
		throw new Error('Invalid token');
	}

	let decoded;
	try {
		decoded = {
			header: JSON.parse(atob(tokenParts[1])),
			payload:JSON.parse(atob(tokenParts[2]))
		};
	} catch (e) {
		console.error(e);
		// TODO: throw new TokenError
	}
	//TODO: auth0 is better
	// let isValid = KJUR.jws.JWS.verifyJWT(token, , {alg: ['HS256']});

	if (decoded.header.ver !== VERSION) {
		throw new Error('Invalid version');
	}
	if (decoded.header.alg !== TOKEN_ALG) {
		throw new Error('Invalid algorithm');
	}
	if (decoded.payload.iss !== openIdConfig.issuer) {
		throw new Error('Invalid issuer');
	}
	if (!decoded.payload.aud.includes(clientId)) {
		throw new Error('Invalid audience');
	}
	if (decoded.payload.nonce && decoded.payload.nonce !== nonce) {
		throw new Error('Invalid nonce');
	}
	const now = Math.floor(Date.now() / 1000);
	if (decoded.payload.exp < now) {
		throw new Error('Token expired');
	}
	return decoded.payload;
}

export async function request(url, options) {
	const response = await fetch(url, options);
	if (!response.ok) { // for status > 300
		throw new Error(response.statusText);
	}
	try {
		const text = await response.text();
		return JSON.parse(text);
	} catch(err) {
		console.log(err);
		throw new Error(err);
	}
}