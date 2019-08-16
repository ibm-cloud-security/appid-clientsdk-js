class AppIDError extends Error {
	constructor({type, status, description}) {
		super(description);
		this.type = type || 'AppIDError';
		this.status = status || 400;
		this.description = description;
	}
}
module.exports = AppIDError;