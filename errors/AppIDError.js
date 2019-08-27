class AppIDError extends Error {
	constructor({error, description}) {
		super(error);
		this.error = error;
		this.description = description;
	}
}
module.exports = AppIDError;