var path = require('path');
var webpack = require('webpack');

module.exports = {
    devServer: {
        inline: true,
        contentBase: './build',
        port: 3000
    },
    devtool: 'cheap-module-eval-source-map',
    entry: './src/index.js',
    module: {
        loaders: [
            {
                test: /\.js$/,
                loaders: ['babel-loader'],
                exclude: /node_modules/
            },
            {
                test: /\.scss/,
                loader: 'style-loader!css-loader!sass-loader'
            },
            { 
                test: /\.css$/,
                loader: "style-loader!css-loader"
            },
        ]
        rules: [
            {
                test: /\.css$/,
                use: [
                    { loader: "style-loader" },
                    { loader: "css-loader" }
                ]
            }
        ]
    },
    resolve: {
        alias: {
            react: path.resolve('node_modules/react'),
        },
    },
    output: {
        path: __dirname + "/dist",
        filename: 'bundle.js'
    },
    plugins: [
        new webpack.optimize.OccurrenceOrderPlugin()
    ]
};