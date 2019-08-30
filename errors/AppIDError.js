class AppIDError extends Error {
	constructor({error, description}) {
		super(description || error);
		this.error = error;
		this.description = description;
	}
}
module.exports = AppIDError;