const assert = require('chai').assert;
const TokenValidator = require('../src/TokenValidator');
const rs = require('jsrsasign');
const constants = require('../src/constants');

const nonce = '616161',
	clientId = 'clientId',
	validAlg = constants.TOKEN_ALG,
	validIssuer = 'validIssuer';
let notExpired = Math.floor(Date.now() / 1000) + 3000;
const validPayload = {
	iss: validIssuer,
	aud: [clientId],
	nonce: nonce,
	exp: notExpired
};

let keyPair = rs.KEYUTIL.generateKeypair("RSA", 1024);
let privateKey = rs.KEYUTIL.getJWKFromKey(keyPair.prvKeyObj);
let publicKey = rs.KEYUTIL.getJWKFromKey(keyPair.pubKeyObj);
publicKey.kid = rs.KJUR.jws.JWS.getJWKthumbprint(publicKey);
const publicKeys = {keys: [publicKey]};
const header = {typ: 'JWT', ver: 4, kid: publicKey.kid};

function generateToken({header, payload, exp, algorithm}) {
	let alg = algorithm || validAlg;
	header.alg = alg;
	let sHeader = JSON.stringify(header);
	let sPayload = JSON.stringify(payload);
	return rs.KJUR.jws.JWS.sign(alg, sHeader, sPayload, privateKey);
}

describe("TokenValidator", () => {
	describe("decodeAndValidate", () => {
		const tokenValidator = new TokenValidator({});

		it('should return decoded payload', async function () {
			let token = generateToken({header, payload: validPayload});
			let res = await tokenValidator.decodeAndValidate(
				{token, publicKeys, issuer: validIssuer, clientId, nonce});
			assert.equal(res.toString(), validPayload);
		});

		it('should return decoded payload - without nonce', async function () {
			let token = generateToken({header, payload: validPayload});
			let res = await tokenValidator.decodeAndValidate(
				{token, publicKeys, issuer: validIssuer, clientId});
			assert.equal(res.toString(), validPayload);
		});

		it('should return invalid token - malformed token', async function () {
			try {
				let res = await tokenValidator.decodeAndValidate(
					{token: constants.MALFORMED_ACCESS_TOKEN, publicKeys, clientId, nonce});
			} catch (e) {
				assert.equal(e, "Error: Invalid JWT token. Got only 2 parts.");
			}
		});

		it('should return error - cannot find public key', async function () {
			try {
				let res = await tokenValidator.decodeAndValidate(
					{token: constants.INVALID_SIGNATURE_TOKEN, publicKeys, clientId, nonce});
			} catch (e) {
				assert.equal(e, "Error: " + constants.MISSING_PUBLIC_KEY);
			}
		});

		it('should return error - invalid token', async function () {
			try {
				let res = await tokenValidator.decodeAndValidate(
					{token: 'asdasd.asdasd.asdasd', publicKeys, clientId, nonce});
			} catch (e) {
				assert.equal(e, "Error: " + constants.INVALID_TOKEN);
			}
		});

		it('should return error - expired token', async function () {
			let expired = Math.floor(Date.now() / 1000) - 3000;
			validPayload.exp = notExpired - 5000;
			let token = generateToken({header, payload: validPayload, exp: expired});
			try {
				let res = await tokenValidator.decodeAndValidate(
					{token, publicKeys, clientId, nonce, issuer: validIssuer});
			} catch (e) {
				assert.equal(e, "Error: " + constants.EXPIRED_TOKEN);
				validPayload.exp = notExpired + 5000;
			}
		});

		it('should return error - invalid audience', async function () {
			let badPayload = {...validPayload};
			badPayload.aud = ['invalid'];
			let token = generateToken({header, payload: badPayload});
			try {
				let res = await tokenValidator.decodeAndValidate(
					{token, publicKeys, clientId, nonce, issuer: validIssuer});
			} catch (e) {
				assert.equal(e, "Error: " + constants.INVALID_AUDIENCE);
			}
		});

		it('should return error - invalid version', async function () {
			let badHeader = {...header};
			badHeader.ver = 3;
			let token = generateToken({header: badHeader, payload: validPayload});
			try {
				let res = await tokenValidator.decodeAndValidate(
					{token, publicKeys, clientId, nonce, issuer: validIssuer});
			} catch (e) {
				assert.equal(e, "Error: " + constants.INVALID_VERSION);
			}
		});

		it('should return error - invalid nonce', async function () {
			let badPayload = {...validPayload};
			badPayload.nonce = 'invalid';
			let token = generateToken({header, payload: badPayload});
			try {
				let res = await tokenValidator.decodeAndValidate(
					{token, publicKeys, clientId, nonce, issuer: validIssuer});
			} catch (e) {
				assert.equal(e, "Error: " + constants.INVALID_NONCE);
			}
		});

		it('should return error - invalid issuer', async function () {
			let badPayload = {...validPayload};
			badPayload.iss = 'invalid';
			let token = generateToken({header, payload: badPayload});
			try {
				let res = await tokenValidator.decodeAndValidate(
					{token, publicKeys, clientId, nonce, issuer: validIssuer});
			} catch (e) {
				assert.equal(e, "Error: " + constants.INVALID_ISSUER);
			}
		});

		it('should return error - invalid signature', async function () {
			let token = generateToken({header, payload: validPayload, algorithm: 'RS384'});
			try {
				let res = await tokenValidator.decodeAndValidate(
					{token, publicKeys, clientId, nonce, issuer: validIssuer});
			} catch (e) {
				assert.equal(e, "Error: " + constants.INVALID_ALGORITHM);
			}
		});
	})
});