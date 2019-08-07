const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3005;

// Set public folder as root
app.use(express.static("public"));

// Allow front-end access to node_modules folder
// app.use('/AppIDClient', express.static(`../dist/AppIDClient`));

app.get("/dist/AppIDClient.js", function(req, res){
	res.sendFile(path.join(__dirname, '../dist/AppIDClient.js'));
});

var oidc = require('./oidc.js');
let url = 'http://localhost:3005';
oidc(url, app);

// Listen for HTTP requests on port 3000
app.listen(port, () => {
	console.log(`${__dirname}/dist/`);
	console.log('listening on %d', port);
});