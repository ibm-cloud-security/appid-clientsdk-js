const AppIDError = require('./AppIDError');
class PopupError extends AppIDError {
	constructor(description) {
		super({type: 'PopupError', description});
	}
}
module.exports = PopupError;