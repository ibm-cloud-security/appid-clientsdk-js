const packagejson = require('../package.json');

class OpenIdConfigurationResource {
	async init({discoveryEndpoint, requestHandler}){
		this.openIdConfig = await requestHandler(discoveryEndpoint);
		const headers = { 'x-filter-type': `spa:v${packagejson.version}` };
		this.publicKeys = requestHandler(this.getJwksEndpoint(), { headers: headers });
	}

	getAuthorizationEndpoint() {
		return this.openIdConfig.authorization_endpoint;
	}

	getUserInfoEndpoint() {
		return this.openIdConfig.userinfo_endpoint;
	}

	getJwksEndpoint() {
		return this.openIdConfig.jwks_uri;
	}

	getTokenEndpoint() {
		return this.openIdConfig.token_endpoint;
	}

	getIssuer() {
		return this.openIdConfig.issuer;
	}

	async getPublicKeys() {
		return await this.publicKeys;
	}
}
module.exports = OpenIdConfigurationResource;

