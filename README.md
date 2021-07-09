[![Codacy Badge](https://api.codacy.com/project/badge/Grade/a30e7499a5234d3494508b7050975beb)](https://www.codacy.com/app/kajabfab/appid-clientsdk-js?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=ibm-cloud-security/appid-clientsdk-js&amp;utm_campaign=Badge_Grade)

# IBM Cloud App ID JavaScript SDK
Client-side javascript SDK for the IBM Cloud App ID service to use with single-page applications created in Angular, React, or other frontend frameworks. 
Read the [documentation](https://cloud.ibm.com/docs/services/appid?topic=appid-single-page) for information on getting started with IBM Cloud App ID and single-page applications.
Apps using Node.js should use our [server-side SDK](https://github.com/ibm-cloud-security/appid-serversdk-nodejs).
## Table of Contents

-   [Installation][1]

-   [Getting Started][2]

-   [API Reference][3]

## Installation
Using npm:
```javascript
npm install ibmcloud-appid-js
```

```javascript
import AppID from 'ibmcloud-appid-js';
```

From the CDN:
```html
<script src="https://cdn.appid.cloud.ibm.com/appid-0.4.3.min.js"></script>
```

Or for development purposes use the minified file in this repo:
```html
<script type='text/javascript' src="dist/appid.min.js"></script>
```

## Getting Started
A sample application can be found in the `sample` folder in this repo.

You will need an [IBM Cloud App ID](https://www.ibm.com/cloud/app-id) instance with a `singlepageapp` application created.
Apps using Angular, React, or other frontend frameworks will require a specific type of credentials to use with IBM Cloud App ID. 
Visit [the docs](https://cloud.ibm.com/docs/services/appid?topic=appid-single-page#create-spa-credentials) to learn more about creating application credentials.

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
Read the [documentation](https://cloud.ibm.com/docs/services/appid?topic=appid-getting-started#gettingstarted) for information about getting started with IBM Cloud App ID Service.

## API Reference
Checkout our API reference [here](https://ibm-cloud-security.github.io/appid-clientsdk-js/).

[1]: #installation
[2]: #getting-started
[3]: #api-reference
