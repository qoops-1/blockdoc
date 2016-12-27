'use strict'

module.exports = {
    entry: "./app/app.jsx",
    output: {
        path: __dirname + "/build",
        filename: "bundle.js",
    },
    module: {
    loaders: [
      {
        test: /.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: ['es2015', 'react']
        }
      },
      {
        test: /\.json$/,
        loader: 'json-loader'
      }
    ]
  }
}