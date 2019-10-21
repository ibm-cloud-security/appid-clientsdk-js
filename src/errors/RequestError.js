class RequestError extends Error {
	constructor(description, status, originError) {
		super(description);
		this.status = status;
		this.originError = originError;
	}
}
module.exports = RequestError;