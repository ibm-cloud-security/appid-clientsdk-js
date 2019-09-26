[![Codacy Badge](https://api.codacy.com/project/badge/Grade/a30e7499a5234d3494508b7050975beb)](https://www.codacy.com/app/kajabfab/appid-clientsdk-js?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=ibm-cloud-security/appid-clientsdk-js&amp;utm_campaign=Badge_Grade)

# appid-clientsdk-js
Client-side javascript SDK for the IBM Cloud App ID service.

### Table of Contents

-   [Installation][1]
-   [Getting Started][2]
-   [API Reference][3]
    -   [init][4]
    -   [signin][5]
    -   [silentSignin][6]
    -   [getUserInfo][7]
## Installation
Using npm
```javascript
npm install ibmcloud-appid-js
```

From the CDN:
```html
<script src="""></script>
```

Or, use the minified files in this repo:
```html
<script type='text/javascript' src="dist/appid.js"></script>
```

## Getting Started
A simple sample application can be found in the `sample` folder in this repo.

You will need an [IBM Cloud App ID](https://www.ibm.com/cloud/app-id) instance with a `singlepageapp` application created.
Use the `clientId` and `discoveryEndpoint` from the application credentials to initialize the `AppID` instance.
```javascript
const appID = new AppID();
await appID.init({
    clientId: '<SPA_CLIENT_ID>',
    discoveryEndpoint: '<WELL_KNOWN_ENDPOINT>'
});
``` 
Using the signin() in your app to start authentication:
```javascript
document.getElementById('login').addEventListener('click', async () => {
    try {
        const tokens = await appID.signin();
    } catch (e) {
        ...
    }
});
```

## API Reference
## init
Initialize AppID

### Parameters
-   `options` **[Object][8]** 
    -   `options.clientId` **[string][9]** The clientId from the singlepageapp application credentials.
    -   `options.discoveryEndpoint` **[string][9]** The discoveryEndpoint from the singlepageapp application credentials.
    -   `options.popup` **[Object][8]** The popup configuration. (optional, default `{height:screen.height*.80,width:400}`)
        -   `options.popup.height` **[Number][11]** The popup height.
        -   `options.popup.width` **[Number][11]** The popup width.

### Example

```javascript
await appID.init({
	clientId: '<SPA_CLIENT_ID>',
	discoveryEndpoint: '<WELL_KNOWN_ENDPOINT>'
});
```

-   Throws **AppIDError** For missing required params.
-   Throws **RequestError** Any errors during a HTTP request.

Returns **[Promise][10]** 

## signin

This will open a login widget in a popup which will prompt the user to enter their credentials.
After a successful login, the popup will close and tokens are returned.

### Example

```javascript
const {accessToken, accessTokenPayload, idToken, idTokenPayload} = await appID.signin();
```

-   Throws **AppIDError** AppIDError "Popup closed" - The user closed the popup before authentication was completed.
-   Throws **TokenError** Any token validation error.
-   Throws **OAuthError** Any errors from the server. e.g. {error: 'server_error', description: ''}
-   Throws **RequestError** Any errors during a HTTP request.

Returns **[Promise][10]** The tokens of the authenticated user or an error.

## silentSignin

Silent sign in will attempt to authenticate the user in a hidden iframe.
Sign in will be successful only if there is a Cloud Directory SSO token in the browser.
You will need to enable SSO on the App ID dashboard.

### Example

```javascript
const {accessToken, accessTokenPayload, idToken, idTokenPayload} = await appID.silentSignin();
```

-   Throws **OAuthError** Any errors from the server. e.g. {error: 'access_denied', description: 'User not signed in'}
-   Throws **AppIDError** "Silent sign-in timed out" - The iframe will close after 5 seconds if authentication could not be completed.
-   Throws **TokenError** Any token validation error.
-   Throws **RequestError** Any errors during a HTTP request.

Returns **[Promise][10]** The tokens of the authenticated user.

## getUserInfo

This method will made a GET request to the user info endpoint using the access token of the authenticated user.

### Parameters

-   `accessToken` **[string][9]** The App ID access token of the user

-   Throws **AppIDError** "Access token must be a string" - Invalid access token.
-   Throws **RequestError** Any errors during a HTTP request.

Returns **[Promise][10]** The user information for the authenticated user. Example: {sub: '', email: ''}

[1]: #installation
[2]: #getting-started
[3]: #api-reference
[4]: #init
[5]: #signin
[6]: #silentsignin
[7]: #getuserinfo
[8]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object
[9]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String
[10]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise
[11]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number