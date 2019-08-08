
// const assert = require('assert');
// const AppIDClient = require('../sample/public/dist/AppIDClient');
// const discoveryObj = {
// 	issuer: "http://localhost:6002/oauth/v4/5b1eb5f1-34bd-41fd-b6dd-e257c188a4dd",
// 	authorization_endpoint: "http://localhost:6002/oauth/v4/5b1eb5f1-34bd-41fd-b6dd-e257c188a4dd/authorization",
// 	token_endpoint: "http://localhost:6002/oauth/v4/5b1eb5f1-34bd-41fd-b6dd-e257c188a4dd/token",
// 	jwks_uri: "http://localhost:6002/oauth/v4/5b1eb5f1-34bd-41fd-b6dd-e257c188a4dd/publickeys"
// };

describe("AppIDClient", () => {
	describe("helpers", () => {
		it("random string is the length of 43", () => {
			chai.expect(randomString()).to.have.lengthOf(43);
		});

		it("sha256", () => {
			const plain = randomString();
			let hashed = sha256(plain);
			chai.expect(string).to.have.lengthOf(43);
		})
	});

	describe("SDK", () => {
		it("fail to init - invalid client id", async () => {
			const res = await new AppID().init({clientID: 'invalid', discoveryUrl: ''});
			chai.expect(res).to.have.lengthOf(43);
		})
	})
});