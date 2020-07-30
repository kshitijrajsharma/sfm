const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const APP_DIR = path.resolve(__dirname, '../src');

module.exports = (env = {}) => {
  const { NODE_ENV } = env;
  return merge([
    {
      entry: ['@babel/polyfill', APP_DIR],
      output: {
        publicPath: '/',
      },
      resolve: {
        extensions: ['.js', '.jsx',],
        alias: {
          '@src': path.resolve(__dirname, '../src'),
        },
      },
      module: {
        rules: [
          {
            enforce: 'pre',
            test: /\.(js|jsx)$/,
            exclude: /node_modules/,
            loader: 'eslint-loader',
            options: {
              failOnWarning: true,
              failOnError: true,
              emitWarning: true,
            },
          },
          {
            test: /\.(js|jsx)$/,
            exclude: /node_modules/,
            use: 'babel-loader',
          },
          {
            test: /\.css$/,
            use: [
              NODE_ENV === 'production'
                ? MiniCssExtractPlugin.loader
                : 'style-loader',
              'css-loader',
            ],
          },
          {
            test: /\.s(a|c)ss$/,
            use: [
              NODE_ENV === 'production'
                ? MiniCssExtractPlugin.loader
                : 'style-loader',
              'css-loader',
              'sass-loader',
            ],
          },
          {
            test: /\.(png|svg|jpg|gif)$/,
            use: ['file-loader'],
          },
          {
            test: /\.woff(2)?(\?v=[a-z0-9]\.[a-z0-9]\.[a-z0-9])?$/,
            use: ['url-loader?limit=10000'],
          },
          {
            test: /\.(ttf|eot|svg)(\?v=[a-z0-9]\.[a-z0-9]\.[a-z0-9])?$/,
            use: ['file-loader'],
          },
        ],
      },
      plugins: [
        new HtmlWebpackPlugin({
          title: 'MY_APP',
          template: 'public/index.html',
          filename: 'index.html',
          inject: true,
          minify: {
            collapseWhitespace: true,
            collapseInlineTagWhitespace: true,
            minifyCSS: true,
            minifyURLs: true,
            minifyJS: true,
            removeComments: true,
            removeRedundantAttributes: true,
          },
        }),
        new webpack.DefinePlugin({
          'process.env.NODE_ENV': JSON.stringify(NODE_ENV),
        }),
      ],
      devtool: NODE_ENV === 'production' ? '' : 'eval-source-map',
    },
  ]);
};
