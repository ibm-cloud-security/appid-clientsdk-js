const path = require('path');
module.exports = [
    {
        entry: './src/index.js',
        mode: 'production',
        output: {
            filename: 'appid.min.js',
            path: path.resolve(__dirname, 'dist'),
            libraryTarget: 'var',
            library: 'AppID'
        }
    },
    {
        entry: './src/index.js',
        mode: 'production',
        output: {
            filename: 'appid.umd.min.js',
            path: path.resolve(__dirname, 'dist'),
            libraryTarget: 'umd',
            library: 'AppID'
        }
    }
];
