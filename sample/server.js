const express = require('express');

const app = express();
const port = process.env.PORT || 3005;

// Set public folder as root
app.use(express.static("../dist"));
app.use(express.static("public"));

// Listen for HTTP requests on port 3000
app.listen(port, () => {
	console.log(`${__dirname}/dist/`);
	console.log('listening on %d', port);
});