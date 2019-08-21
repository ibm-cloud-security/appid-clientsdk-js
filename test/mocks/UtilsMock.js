class UtilsMock {
	getRandomString() {
		return 'valid';
	};

	sha256() {
		return 'hashedValue';
	};

	buildParams() {
		return 'param1=test&param2=test';
	}
}
module.exports = UtilsMock;