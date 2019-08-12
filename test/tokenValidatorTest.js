const assert = require('assert');
const TokenValidator = require('../src/TokenValidator');
const constants = require('./mocks/constants');
const jwt = require('jsrsasign');
const errorMessages = require('../src/constants');

const nonce = '616161',
	clientId = 'clientId',
	alg = 'RS256',
	validIssuer = 'validIssuer';
const header = {alg, typ: 'JWT', ver: 4};
let notExpired = Math.floor(Date.now() / 1000) + 3000;
const validPayload = {
	iss: validIssuer,
	aud: [clientId],
	nonce: nonce
};
function generateToken({header, payload, exp}) {
	payload.exp = exp || notExpired;
	let sHeader = JSON.stringify(header);
	let sPayload = JSON.stringify(payload);
	let prvKey = jwt.KEYUTIL.getKey(constants.PRIVATE_KEY, 'appid');
	return jwt.KJUR.jws.JWS.sign(alg, sHeader, sPayload, prvKey);
}

describe("TokenValidator", () => {

	describe("decodeAndValidate", () => {
		const tokenValidator = new TokenValidator({});

		it('should return decoded payload', async function () {
			let token = generateToken({header, payload: validPayload});

			let res = await tokenValidator.decodeAndValidate(
				{token: token, publicKey: constants.PUBLIC_KEY, issuer: validIssuer, clientId, nonce});
			assert.ok(res);
		});

		it('should return invalid token - malformed token', async function () {
			try {
				let res = await tokenValidator.decodeAndValidate(
					{token: constants.MALFORMED_ACCESS_TOKEN, publicKey: constants.PUBLIC_KEY, clientId, nonce});
			} catch (e) {
				assert.equal(e, "Error: Invalid JWT token. Got only 2 parts.");
			}
		});

		it('should return error - expired token', async function () {
			let expired = Math.floor(Date.now() / 1000) - 3000;
			let token = generateToken({header, payload: validPayload, exp: expired});
			try {
				let res = await tokenValidator.decodeAndValidate(
					{token: token, publicKey: constants.PUBLIC_KEY, clientId, nonce, issuer: validIssuer});
			} catch (e) {
				assert.equal(e, "Error: " + errorMessages.EXPIRED_TOKEN);
			}
		});

		it('should return error - invalid audience', async function () {
			let badPayload = {...validPayload};
			badPayload.aud = ['invalid'];
			let token = generateToken({header, payload: badPayload});
			try {
				let res = await tokenValidator.decodeAndValidate(
					{token: token, publicKey: constants.PUBLIC_KEY, clientId, nonce, issuer: validIssuer});
			} catch (e) {
				assert.equal(e, "Error: " + errorMessages.INVALID_AUDIENCE);
			}
		});

		it('should return error - invalid version', async function () {
			let badHeader = {ver: 3};
			let token = generateToken({header: badHeader, payload: validPayload});
			try {
				let res = await tokenValidator.decodeAndValidate(
					{token: token, publicKey: constants.PUBLIC_KEY, clientId, nonce, issuer: validIssuer});
			} catch (e) {
				assert.equal(e, "Error: " + errorMessages.INVALID_VERSION);
			}
		});

		it('should return error - invalid nonce', async function () {
			let badPayload = {...validPayload};
			badPayload.nonce = 'invalid';
			let token = generateToken({header, payload: badPayload});
			try {
				let res = await tokenValidator.decodeAndValidate(
					{token: token, publicKey: constants.PUBLIC_KEY, clientId, nonce, issuer: validIssuer});
			} catch (e) {
				assert.equal(e, "Error: " + errorMessages.INVALID_NONCE);
			}
		});

		it('should return error - invalid issuer', async function () {
			let badPayload = {...validPayload};
			badPayload.iss = 'invalid';
			let token = generateToken({header, payload: badPayload});
			try {
				let res = await tokenValidator.decodeAndValidate(
					{token: token, publicKey: constants.PUBLIC_KEY, clientId, nonce, issuer: validIssuer});
			} catch (e) {
				assert.equal(e, "Error: " + errorMessages.INVALID_ISSUER);
			}
		});

		it('should return error - invalid signature', async function () {
			let token = generateToken({header, payload: validPayload});
			try {
				let res = await tokenValidator.decodeAndValidate(
					{token: token, publicKey: constants.INVALID_PUBLIC_KEY, clientId, nonce, issuer: validIssuer});
			} catch (e) {
				assert.equal(e, "Error: " + errorMessages.INVALID_SIGNATURE);
			}
		});
	})
});