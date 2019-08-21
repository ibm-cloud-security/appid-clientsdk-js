const rs = require('jsrsasign');
class Utils {
	buildParams(params) {
		return Object.keys(params).map(function (key) {
			return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
		}).join('&');
	};

	getRandomString(length) {
		return rs.KJUR.crypto.Util.getRandomHexOfNbytes(length / 2);
	};

	sha256(message) {
		return rs.KJUR.crypto.Util.sha256(message);
	}
}
module.exports = Utils;