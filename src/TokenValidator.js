export class TokenValidator {
	constructor(jwt) {
		this.jwt = jwt;
	}

	async decodeAndValidate({token, openIdConfig, clientId, nonce, request}) {
		const TOKEN_ALG = 'RS256';
		const VERSION = 4;
		const jwsUri = openIdConfig.getJwksEndpoint();

		const publicKeys = await request(jwsUri, {
			method: 'GET'
		});
		// console.log(publicKeys.keys[0]);

		const tokenParts = token.split('.');
		if (tokenParts.length !== 3) {
			throw new Error('Invalid token');
		}

		// console.log(tokenParts);
		// console.log(token);
		// const myKey = this.jwt.KEYUTIL.getKey(publicKeys.keys[0]);
		// console.log(myKey);
		// const isValid =  this.jwt.KJUR.jws.JWS.verify(token, myKey, ['RS256']);
		// if (!isValid) {
		// 	throw new Error('Invalid signature');
		// }

		let decoded;
		try {
			decoded = {
				header: JSON.parse(atob(tokenParts[0])),
				payload:JSON.parse(atob(tokenParts[1]))
			};
		} catch (e) {
			throw new Error(e);
		}

		if (decoded.header.ver !== VERSION) {
			throw new Error('Invalid version');
		}
		if (decoded.header.alg !== TOKEN_ALG) {
			throw new Error('Invalid algorithm');
		}
		if (decoded.payload.iss !== openIdConfig.getIssuer()) {
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
}