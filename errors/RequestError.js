class RequestError extends Error {
	constructor(description, status) {
		super(description);
		this.status = status;
	}
}
module.exports = RequestError;