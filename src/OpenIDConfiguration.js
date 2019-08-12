class OpenIdConfigurationResource {
	async init({discoveryEndpoint, requestHandler}){
		this.openIdConfig = await requestHandler(discoveryEndpoint);
		this.publicKeys = requestHandler(this.getJwksEndpoint());
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

	async getPublicKey() { // TODO: add key id
		return await this.publicKeys;
	}
}
module.exports = OpenIdConfigurationResource;