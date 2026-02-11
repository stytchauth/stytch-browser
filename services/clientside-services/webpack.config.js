/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable no-console */
const dotenv = require('dotenv');

const paths = ['.env', '.env.local', '.env.prod'];

for (let path of paths) {
  console.log('Attempting to apply env vars at', path);
  const output = dotenv.config({ path });
  if (output.error && output.error.code === 'ENOENT') {
    console.log('Unable to apply', path, 'falling back to next opt');
  } else {
    break;
  }
}

const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const webpack = require('webpack');
const path = require('path');

if (!process.env.ROOT_STYTCH_URL || !process.env.ROOT_STYTCH_URL.includes('stytch.com')) {
  console.log('Missing ROOT_STYTCH_URL config for cookie rewriting. Please add it to your .env.local file!');
  process.exit(1);
}
if (!process.env.TEST_API_URL) {
  console.log('Missing TEST_API_URL. Please add it to your .env.local file!');
  process.exit(1);
}
if (!process.env.LIVE_API_URL) {
  console.log('Missing LIVE_API_URL. Please add it to your .env.local file!');
  process.exit(1);
}

module.exports = {
  entry: './src/index.ts',
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    filename: '[name].[contenthash].js',
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [
    new CleanWebpackPlugin({
      verbose: true,
      protectWebpackAssets: false,
      cleanAfterEveryBuildPatterns: ['*.LICENSE.txt'],
    }),
    new HtmlWebpackPlugin({
      title: 'Stytch Clientside Services',
      scriptLoading: 'blocking',
    }),
    new webpack.DefinePlugin({
      'process.env': JSON.stringify({
        TEST_API_URL: process.env.TEST_API_URL,
        LIVE_API_URL: process.env.LIVE_API_URL,
      }),
    }),
  ],
};
