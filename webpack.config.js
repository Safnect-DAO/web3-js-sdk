const path = require('path');
//const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");

module.exports = {
  entry: './wallet.js',
  output: {
    filename: 'mvcsdk_0.2.03.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'Mvc',
    libraryTarget: 'umd'
  },
  plugins: [
    // ... 其他插件
    // new NodePolyfillPlugin()
  ]
};