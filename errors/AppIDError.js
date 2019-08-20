class AppIDError extends Error {
	constructor({type, description, code}) {
		super(description);
		this.type = type;
		this.description = description;
		this.code = code;
	}
}
module.exports = AppIDError;