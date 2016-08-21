var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  entry: [
    /*===== yeoman entry hook =====*/
    './src/index.js',
    'bootstrap-sass!./bootstrap-sass.config.js'
  ],
  output: {
    path: path.join(__dirname, 'build'),
    filename: 'bundle.js'
  },
  resolve: {
    root: [path.join(__dirname, 'bower_components'), path.join(__dirname, 'src')]
  },
  plugins: [
    new webpack.ResolverPlugin(new webpack.ResolverPlugin.DirectoryDescriptionFilePlugin('bower.json', ['main'])),
    new ExtractTextPlugin('styles.css', {allChunks: true}),
    new webpack.ProvidePlugin({
      /*===== yeoman provide plugin hook =====*/
      m: 'mithril',
      $: 'jquery',
      jQuery: 'jquery',
      jquery: 'jquery'
    }),
    new webpack.DefinePlugin({
      TRELLO_APP_KEY: JSON.stringify(process.env.TRELLO_APP_KEY)
    })
  ],
  module: {
    loaders: [
      // ES6 transpiler
      {
        test: /\.js$/,
        loader: 'babel',
        exclude: /(node_modules|bower_components\/(?!rxjs-es|moment))/
      },
      /*===== yeoman sass hook end =====*/
      // Static files
      {
        test: /\.html$/,
        loader: 'static'
      },
      // Image files
      {
        test: /\.(png|jpg|gif)$/,
        loader: 'url?limit=8192'
      },
      // Font files
      {
        test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url?limit=10000&mimetype=application/font-woff'
      },
      {
        test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url?limit=10000&mimetype=application/font-woff'
      },
      {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url?limit=10000&mimetype=application/octet-stream'
      },
      {
        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'file'
      },
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url?limit=10000&mimetype=image/svg+xml'
      },
      {
        test: /bootstrap-sass\/assets\/javascripts\//,
        loader: 'imports?jQuery=jquery'
      }
    ]
  }
};
