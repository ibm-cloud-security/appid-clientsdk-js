const AppIDError = require('./AppIDError');
class RequestError extends AppIDError {
	constructor(description, status) {
		super({type: 'RequestError', description, status});
	}
}
module.exports = RequestError;