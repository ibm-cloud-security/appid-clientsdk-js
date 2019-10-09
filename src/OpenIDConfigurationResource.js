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

	getProfilesEndpoint() {
		return this.openIdConfig.profiles_endpoint;
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