const constants = require('./constants');
const TokenError = require('./errors/TokenError');

class TokenValidator {
	constructor({jwt = require('jsrsasign')} = {}) {
		this.jwt = jwt;
	}

	decodeAndValidate({token, publicKeys, issuer, clientId, nonce}) {
		const now = Math.floor(Date.now() / 1000);

		const tokenParts = token.split('.');
		if (tokenParts.length !== 3) {
			throw new TokenError(`Invalid JWT token. Got only ${tokenParts.length} parts.`);
		}

		const decoded = this.jwt.KJUR.jws.JWS.parse(token);
		if (!decoded.headerObj) {
			throw new TokenError(constants.INVALID_TOKEN);
		}
		const kid = decoded.headerObj.kid;
		const publicKey = this.getPublicKey(publicKeys.keys, kid);

		const myKey = this.jwt.KEYUTIL.getKey(publicKey);
		const isValid = this.jwt.KJUR.jws.JWS.verify(token, myKey, {alg: [constants.TOKEN_ALG]});
		if (!isValid) {
			throw new TokenError(constants.INVALID_SIGNATURE);
		}

		if (decoded.payloadObj.exp < now) {
			throw new TokenError(constants.EXPIRED_TOKEN);
		}

		if (decoded.headerObj.ver !== constants.VERSION) {
			throw new TokenError(constants.INVALID_VERSION);
		}

		if (decoded.headerObj.alg !== constants.TOKEN_ALG) {
			throw new TokenError(constants.INVALID_ALGORITHM);
		}

		if (decoded.payloadObj.iss !== issuer) {
			throw new TokenError(constants.INVALID_ISSUER);
		}

		if (!decoded.payloadObj.aud.includes(clientId)) {
			throw new TokenError(constants.INVALID_AUDIENCE);
		}

		if ((nonce && !decoded.payloadObj.nonce) || (decoded.payloadObj.nonce !== nonce)) {
			throw new TokenError(constants.INVALID_NONCE);
		}

		return decoded.payloadObj;
	}

	getPublicKey(keys, kid) {
		let publicKey;
		for (let i = 0; i < keys.length; i++) {
			if (keys[i].kid === kid) {
				publicKey = keys[i];
			}
		}

		if (!publicKey) {
			throw new TokenError(constants.MISSING_PUBLIC_KEY);
		}
		return publicKey;
	}
}

module.exports = TokenValidator;
