# appid-clientsdk-js
Client-side javascript SDK for the IBM Cloud App ID service

To run locally, first build the project:
```
npm run build
```

Start the sample app
```
cd sample
node server.js
```

## Getting Started
Load into your app using `script` tags
```
<script type='text/javascript' src="appid.js"></script>
```

You will need an [IBM Cloud App ID](https://www.ibm.com/cloud/app-id) instance with a `singlepageapp` application created.
Use the `clientId` and `discoveryEndpoint` from the application credentials to initialize the `AppID` instance.
```javascript
const appID = new AppID();
await appID.init({
    clientId: '<SPA_CLIENT_ID>',
    discoveryEndpoint: '<WELL_KNOWN_ENDPOINT>'
});
``` 

## Using Sign In with Popup
```html
<button id="login" class="button">Login</button>
```
The `signinWithPopup` function will trigger a login widget and return the full access and ID tokens along with its payload.
```javascript
const tokens = await appID.signinWithPopup();
```

A simple sample application can be found in the `sample` folder in this repo.