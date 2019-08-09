const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3005;

// Set public folder as root
app.use(express.static("../dist"));
app.use(express.static("public"));

// Allow front-end access to node_modules folder
// app.use('/AppIDClient', express.static(`../dist/AppIDClient`));

var oidc = require('./oidc.js');
let url = 'http://localhost:3005';
oidc(url, app);

// Listen for HTTP requests on port 3000
app.listen(port, () => {
	console.log(`${__dirname}/dist/`);
	console.log('listening on %d', port);
});