class OAuthError extends Error {
	// See https://tools.ietf.org/html/rfc6749#section-4.1.2.1 for the possible error messages
	constructor({error, description}) {
		super(description || error);
		this.error = error;
		this.description = description;
	}
}
module.exports = OAuthError;