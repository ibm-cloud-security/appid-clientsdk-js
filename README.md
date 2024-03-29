[![IBM Cloud powered][img-ibmcloud-powered]][url-ibmcloud]
[![Coveralls][img-coveralls-master]][url-coveralls-master]
[![Version][img-version]][url-npm]
[![DownloadsMonthly][img-npm-downloads-monthly]][url-npm]
[![DownloadsTotal][img-npm-downloads-total]][url-npm]
[![License][img-license]][url-npm]


[![GithubWatch][img-github-watchers]][url-github-watchers]
[![GithubStars][img-github-stars]][url-github-stars]
[![GithubForks][img-github-forks]][url-github-forks]

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
<script src="https://cdn.appid.cloud.ibm.com/appid-1.0.1.min.js"></script>
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


[img-ibmcloud-powered]: https://img.shields.io/badge/ibm%20cloud-powered-blue.svg
[url-ibmcloud]: https://www.ibm.com/cloud/
[url-npm]: https://www.npmjs.com/package/ibmcloud-appid-js
[img-license]: https://img.shields.io/npm/l/ibmcloud-appid-js.svg
[img-version]: https://img.shields.io/npm/v/ibmcloud-appid-js.svg
[img-npm-downloads-monthly]: https://img.shields.io/npm/dm/ibmcloud-appid-js.svg
[img-npm-downloads-total]: https://img.shields.io/npm/dt/ibmcloud-appid-js.svg

[img-github-watchers]: https://img.shields.io/github/watchers/ibm-cloud-security/appid-clientsdk-js.svg?style=social&label=Watch
[url-github-watchers]: https://github.com/ibm-cloud-security/appid-clientsdk-js/watchers
[img-github-stars]: https://img.shields.io/github/stars/ibm-cloud-security/appid-clientsdk-js.svg?style=social&label=Star
[url-github-stars]: https://github.com/ibm-cloud-security/appid-clientsdk-js/stargazers
[img-github-forks]: https://img.shields.io/github/forks/ibm-cloud-security/appid-clientsdk-js.svg?style=social&label=Fork
[url-github-forks]: https://github.com/ibm-cloud-security/appid-clientsdk-js/network

[img-coveralls-master]: https://coveralls.io/repos/github/ibm-cloud-security/appid-clientsdk-js/badge.svg
[url-coveralls-master]: https://coveralls.io/github/ibm-cloud-security/appid-clientsdk-js
