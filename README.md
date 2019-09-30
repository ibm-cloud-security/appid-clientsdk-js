[![Codacy Badge](https://api.codacy.com/project/badge/Grade/a30e7499a5234d3494508b7050975beb)](https://www.codacy.com/app/kajabfab/appid-clientsdk-js?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=ibm-cloud-security/appid-clientsdk-js&amp;utm_campaign=Badge_Grade)

# IBM Cloud App ID Client SDK
Client-side javascript SDK for the IBM Cloud App ID service. 
Read the [official documentation](https://console.ng.bluemix.net/docs/services/appid/index.html#gettingstarted) for information about getting started with IBM Cloud App ID Service.

## Table of Contents

-   [Installation][1]

-   [Getting Started][2]

-   [API Reference][3]

## Installation
Using npm:
```javascript
npm install ibmcloud-appid-js
```

From the CDN:
```html
<script src="""></script>
```

Or for development purposes use the minified file in this repo:
```html
<script type='text/javascript' src="dist/appid.min.js"></script>
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
Read the [official documentation](https://cloud.ibm.com/docs/services/appid?topic=appid-getting-started#gettingstarted) for information about getting started with IBM Cloud App ID Service.

## API Reference
Checkout our API reference [here](https://ibm-cloud-security.github.io/appid-clientsdk-js/).

[1]: #installation
[2]: #getting-started
[3]: #api-reference