class TokenValidatorMock {
	constructor({invalidCDToken, invalidToken} = {}) {
		this.invalidCDToken = invalidCDToken;
		this.invalidToken = invalidToken;
	}
	decodeAndValidate()  {
		if (this.invalidCDToken) {
			return {identities: [{provider: 'not_cd', id: '123'}]};
		}
		if (this.invalidToken) {
			return {iss: 'appid'}
		}
		return {iss: 'appid', identities: [{provider: 'cloud_directory', id: '123'}]};
	}
}
module.exports = TokenValidatorMock;