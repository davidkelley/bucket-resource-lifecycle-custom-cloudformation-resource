const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: {
    DeleteObjects: './functions/DeleteObjects',
  },
  externals: {
    'aws-sdk': 'aws-sdk',
  },
  target: 'node',
  output: {
    libraryTarget: 'commonjs2',
    path: `${__dirname}/out`,
    filename: '[name].js',
  },
  plugins: [
    new UglifyJSPlugin(),
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: ['babel-loader'],
        exclude: /node_modules/,
      },
    ],
  },
};
