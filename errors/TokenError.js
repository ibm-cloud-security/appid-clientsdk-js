const AppIDError = require('./AppIDError');
class TokenError extends AppIDError {
	constructor(description, status) {
		super({type: 'TokenError', description, status: status || 401});
	}
}
module.exports = TokenError;