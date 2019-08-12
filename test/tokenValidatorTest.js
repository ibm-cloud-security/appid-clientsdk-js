const assert = require('assert');
const TokenValidator = require('../src/TokenValidator');
const request = require('../src/RequestHandler');
const jwt = require('jsrsasign');
const constants = require('./mocks/constants');

describe("TokenValidator", () => {

	describe("decodeAndValidate", () => {
		const tokenValidator = new TokenValidator(jwt);

		it('should return decoded payload', async function () {
			let res = await tokenValidator.decodeAndValidate(
				{token: constants.ACCESS_TOKEN_V4, clientId: constants.CLIENTID, nonce: undefined, request: request});
			assert(res);
		});

		it('should return invalid token - malformed token', async function () {
			let res = await tokenValidator.decodeAndValidate(
				{token: constants.MALFORMED_ACCESS_TOKEN, clientId: constants.CLIENTID, nonce: undefined, request: request});
			assert(res, "Invalid token");
		});

		it('should return token expired - expired token', async function () {
			let res = await tokenValidator.decodeAndValidate(
				{token: constants.EXPIRED_ACCESS_TOKEN, clientId: constants.CLIENTID, nonce: undefined, request: request});
			assert(res, "Token expired");
		})
	})
});