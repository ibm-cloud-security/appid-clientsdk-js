class AppIDError extends Error {
	constructor({type, description}) {
		super(description);
		this.type = type;
		this.description = description;
	}
}
module.exports = AppIDError;