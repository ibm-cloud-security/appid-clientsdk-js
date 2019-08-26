class RequestHandlerMock {
	async request(url) {
		switch (url) {
			case 'http://authServer.com/tokenEndpoint':
				return {access_token: 'accessToken', id_token: 'idToken'};
			case 'http://authServer.com/userinfoEndpoint':
				return {name: 'KittyCat'};
			default:
		}
	};
}
module.exports = RequestHandlerMock;