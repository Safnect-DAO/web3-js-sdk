const path = require('path');
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");
const webpack = require('webpack');

module.exports = {
  entry: './btcsdk_0.2.0.js',
  output: {
    filename: 'btcsdk.min_0.2.0.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'Btc',
    libraryTarget: 'umd'
  },
  plugins: [
    new NodePolyfillPlugin(),
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
    }),
  ],
   module: {
    rules: [
      {
        test: /\.m?js$/, // 匹配.js和.mjs文件
        exclude: /node_modules/, // 排除node_modules中的文件
        use: {
          loader: 'babel-loader', // 使用babel-loader转译
        },
      },
    ],
  },
  target: 'web', // 指定打包目标为Web环境
  mode: 'production', // 或'development'根据需要选择
};