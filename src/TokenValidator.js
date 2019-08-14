const errorMessages = require('./constants');
class TokenValidator {
	constructor({jwt = require('jsrsasign')} = {}) {
		this.jwt = jwt;
	}

	async decodeAndValidate({token, publicKey, issuer, clientId, nonce}) {
		const TOKEN_ALG = 'RS256';
		const VERSION = 4;
		const now = Math.floor(Date.now() / 1000);

		const tokenParts = token.split('.');
		if (tokenParts.length !== 3) {
			throw new Error(`Invalid JWT token. Got only ${tokenParts.length} parts.`);
		}

		const myKey = this.jwt.KEYUTIL.getKey(publicKey);
		const isValid =  this.jwt.KJUR.jws.JWS.verify(token, myKey, {alg:[TOKEN_ALG]});
		if (!isValid) {
			throw new Error(errorMessages.INVALID_SIGNATURE);
		}

		let decoded = this.jwt.KJUR.jws.JWS.parse(token);

		if (decoded.payloadObj.exp < now) {
			throw new Error(errorMessages.EXPIRED_TOKEN);
		}

		if (decoded.headerObj.ver !== VERSION) {
			throw new Error(errorMessages.INVALID_VERSION);
		}

		if (decoded.payloadObj.iss !== issuer) {
			throw new Error(errorMessages.INVALID_ISSUER);
		}
		if (!decoded.payloadObj.aud.includes(clientId)) {
			throw new Error(errorMessages.INVALID_AUDIENCE);
		}
		if (decoded.payloadObj.nonce && decoded.payloadObj.nonce !== nonce) {
			throw new Error(errorMessages.INVALID_NONCE);
		}

		return decoded.payloadObj;
	}
}
module.exports = TokenValidator;