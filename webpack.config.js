const path = require('path');
module.exports = {
	entry: './src/index.js',
	output: {
		filename: 'appid.js',
		path: path.resolve(__dirname, 'dist'),
		libraryTarget: "var",
		library: "AppID"
	}
};