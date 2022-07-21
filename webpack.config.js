const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyPlugin = require("copy-webpack-plugin")

module.exports = {
  entry: './src/index',
  output: {
    path: path.join(__dirname, '/dist'),
    filename: 'bundle.js'
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    alias: {
      // 'react-dom$': 'react-dom/profiling',
      // 'scheduler/tracing': 'scheduler/tracing-profiling',
      '@mui/styled-engine': '@mui/styled-engine-sc',
    },
  },
  devServer: {
    host: '0.0.0.0',
    //port: 8080,
    open: true,
    //hot: true,
    historyApiFallback: true,
  },
  module: {
    rules: [{
      test: /\.[tj]sx?$/,
      use: 'babel-loader',
      exclude: /node_modules/,
    }, {
      test: /\.css$/i,
      use: ['style-loader', 'css-loader'],
    }]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html'
    }),
    new CopyPlugin({
      patterns: [
        { from: "static", to: "." },
      ],
    }),
  ]
}