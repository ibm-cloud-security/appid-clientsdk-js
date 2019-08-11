export class OpenIdConfigurationResource {
	async init({discoveryEndpoint, request}){
		this.openIdConfig = await request(discoveryEndpoint);
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
}