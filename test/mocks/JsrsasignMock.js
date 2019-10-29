class JsrsasignMock {
	constructor(testSadFlow = false) {
		this.KJUR = new KJUR();
		this.testSadFlow = testSadFlow;
	}

	stob64() {
		return 'message';
	}

	b64utos() {
		if (this.testSadFlow) {
			return 'invalid'
		}
		return 'message';
	}
}

class KJUR {
	constructor() {
		this.crypto = new crypto();
	}
}

class crypto {
	constructor() {
		this.Util = new Util();
	}
}

class Util {
	getRandomHexOfNbytes() {
		return 'message';
	}

	sha256() {
		return 'message';
	}
}
module.exports = JsrsasignMock;