function openPopup() {
	const h = 700;
	const w = 400;
	const left = (screen.width - w) / 2;
	const top = (screen.height - h) / 2;

	return window.open('', 'popup', `left=${left},top=${top},width=${w},height=${h},resizable,scrollbars=yes,status=1`);
};

async function openLoginWidget({popup, authUrl, state}) {
	popup.location.href = authUrl;
	return new Promise((resolve, reject) => {
		window.addEventListener('message', message => {
			// TODO: add timeout if case Dave close popup, check window close event
			if (!message.data || message.data.type !== 'authorization_response') {
				return;
			}
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

async function exchangeTokens({openIdConfig, clientId, authCode, nonce, codeVerifier}) {
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
	const res = await fetch(openIdConfig.token_endpoint, {
		method: 'POST',
		headers: {
			'Authorization': 'Basic ' + btoa(`${clientId}:${codeVerifier}`),
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: requestParams
	});
	const tokens = await res.json();
	// TODO: check for tokens
	return {
		accessToken: tokens.access_token,
		accessTokenPayload: await decodeAndValidate({token: tokens.access_token, openIdConfig, clientId, nonce}),
		idToken: tokens.id_token,
		idTokenPayload: await decodeAndValidate({token: tokens.id_token, openIdConfig, clientId, nonce})
	}
}

//TODO: create token validation error class to wrap
async function decodeAndValidate({token, openIdConfig, clientId, nonce}) {
	const TOKEN_ALG = 'RS256';
	const VERSION = 4;
	const publicKeys = await fetch(openIdConfig.jwks_uri, {
		method: 'GET'
	});
	console.log(publicKeys.json());

	//TODO: check for 3 parts else invalid token err
	const [header, payload, signature] = token.split('.');
	let decoded;
	try {
		decoded = {
			header: JSON.parse(atob(header)),
			payload:JSON.parse(atob(payload))
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

function getRandomString(length) {
	let random = '';
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_~.';
	let array = window.crypto.getRandomValues(new Uint8Array(length));
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
const STATE_LENGTH = 20;
const NONCE_LENGTH = 20;
const CODE_VERIFIER_LENGTH = 43;

class AppID {
	// TODO: remove all console logs
	async init({clientId, discoveryUrl}) {
		//TODO: validate clientId as guid
		this.clientId = clientId;
		const discoveryResponse = await fetch(discoveryUrl);
		this.openIdConfig = await discoveryResponse.json();
		console.log(this.openIdConfig);
	}

	/**
	 * ```js
	 * await appid.signinWithPopup();
	 * ```
	 * A promise to ID and access token. If there is an error in the callback, reject the promise with the error
	 */
	async signinWithPopup() {
		// open popup
		const challengeMethod = 'S256';
		const codeVerifier = getRandomString(CODE_VERIFIER_LENGTH);
		const codeChallenge = await sha256(codeVerifier);
		const nonce = getRandomString(NONCE_LENGTH);
		const state = getRandomString(STATE_LENGTH);

		// TODO: better way to build this url or use back tick
		const authUrl = encodeURI(this.openIdConfig.authorization_endpoint +
			"?client_id=" + this.clientId +
			"&response_type=" + responseType +
			"&state=" + btoa(state) +
			"&code_challenge=" + btoa(codeChallenge) +
			"&code_challenge_method=" + challengeMethod +
			"&nonce=" + nonce +
			"&scope=" + 'openid'
		);
		console.log(authUrl);
		const popup = openPopup();
		let tokens;
		const authCode = await openLoginWidget({popup, authUrl, state});
		tokens = await exchangeTokens({openIdConfig: this.openIdConfig, clientId:this.clientId, authCode, codeVerifier, nonce});

		console.log(tokens);
		return tokens;
	}

	async getUserInfo(accessToken) {
		if (typeof accessToken !== 'string') {
			throw new Error('Access token must be a string');
		}
		// TODO: check for failed status code
		let res = await fetch(this.openIdConfig.userinfo_endpoint, {
			method: 'GET',
			headers: {
				'Authorization': 'Bearer ' + accessToken
			}
		});
		return res.json();
	}
}
