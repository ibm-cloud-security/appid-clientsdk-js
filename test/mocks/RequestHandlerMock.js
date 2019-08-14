class RequestHandlerMock {
	async request(url) {
		switch (url) {
			case 'tokenEndpoint':
				return {access_token: 'accessToken', id_token: 'idToken'};
			case 'userinfoEndpoint':
				return {name: 'KittyCat'};
			default:
		}
	};
}
module.exports = RequestHandlerMock;