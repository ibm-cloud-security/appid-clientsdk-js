class TokenValidator {
	constructor({jwt = require('jsrsasign')} = {}) { // add request
		this.jwt = jwt;
	}

	async decodeAndValidate({token, publicKey, issuer, clientId, nonce}) {
		const TOKEN_ALG = 'RS256';
		const VERSION = 4;

		const tokenParts = token.split('.');
		if (tokenParts.length !== 3) {
			console.debug(tokenParts);
			throw new Error(`Invalid JWT token got only ${tokenParts.length} parts`);
		}
		// const publicKey = function () {
		// 	for (let i = 0; i < publicKeys.length; i++) {
		// 		if (publicKeys[i].kid === token[0].kid) {
		// 			return publicKeys[i];
		// 		}
		// 	}
		// };

		const myKey = this.jwt.KEYUTIL.getKey(publicKey);
		// let temp = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImFwcElkLTViMWViNWYxLTM0YmQtNDFmZC1iNmRkLWUyNTdjMTg4YTRkZC0yMDE4LTEwLTExVDE2OjEyOjI3LjQwNSIsInZlciI6NH0.eyJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjYwMDIvb2F1dGgvdjQvNWIxZWI1ZjEtMzRiZC00MWZkLWI2ZGQtZTI1N2MxODhhNGRkIiwiZXhwIjoxNTY1NjE2MzA1LCJhdWQiOlsiMWIwZTM2NTgtZmMxZi00MDJlLTg0M2MtMTg0MDJkNGRiZTU4Il0sInN1YiI6ImMyNDNkNWQwLTkwNDAtNDdmMi1iMGE4LWVkNDlhNjNhN2ZhNSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJhbXIiOlsiY2xvdWRfZGlyZWN0b3J5Il0sImlhdCI6MTU2NTYxMjcwNSwidGVuYW50IjoiNWIxZWI1ZjEtMzRiZC00MWZkLWI2ZGQtZTI1N2MxODhhNGRkIiwic2NvcGUiOiJvcGVuaWQgYXBwaWRfZGVmYXVsdCBhcHBpZF9yZWFkcHJvZmlsZSBhcHBpZF9yZWFkdXNlcmF0dHIgYXBwaWRfd3JpdGV1c2VyYXR0ciBhcHBpZF9hdXRoZW50aWNhdGVkIn0.BRTqydqNUKnmt24urzNGuN_vA3BZ852ngRgAlR8k1W_i6-wD-aWmQqVX54jfflofP7iA67XVwT8QrAQr0CsaKH7tBB1whGsxU2CJkF8nYZwY0oECi-RP4uQ4zbvuqQ8hVvBzi3FGEsd2_c9uIEX19lrkvcjTqNCU7FHo7Nxw8JbEdbWD4zZ6lGYPFgunZJ9H0aJexk9h2VzTGaycND1I70iXD9U7scseQw_i6ACBD3ZRSVysooWJogK4SFQytxJ40cU9yka9aaMk120lI4Yi9S03SN3Bjv2AGryPF7hSFYntENcOjupZgx4lDtL9O4L44CizuWhK0EOfPYvYE2L6aw';
		const isValid =  this.jwt.KJUR.jws.JWS.verify(token, myKey, {alg:['RS256']});
		if (!isValid) {
			throw new Error('Invalid signature');
		}

		let decoded;
		try {
			decoded = {
				header: JSON.parse(atob(tokenParts[0])),
				payload:JSON.parse(atob(tokenParts[1]))
			};
		} catch (e) {
			throw new Error(e);
		}

		if (decoded.header.ver !== VERSION) {
			throw new Error('Invalid version');
		}
		if (decoded.header.alg !== TOKEN_ALG) {
			throw new Error('Invalid algorithm');
		}
		if (decoded.payload.iss !== issuer) {
			throw new Error('Invalid issuer');
		}
		if (!decoded.payload.aud.includes(clientId)) {
			throw new Error('Invalid audience');
		}
		if (decoded.payload.nonce && decoded.payload.nonce !== nonce) {
			throw new Error('Invalid nonce');
		}
		const now = Math.floor(Date.now() / 1000);
		if (decoded.payload.exp < now) {
			throw new Error('Token expired');
		}
		return decoded.payload;
	}
}
module.exports = TokenValidator;