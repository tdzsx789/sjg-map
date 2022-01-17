const path = require('path');

module.exports = {
	mode: "development",
	entry: "./src/index.js",
    devtool: 'cheap-module-source-map',
	output: {
		filename: "index.js",
		library: 'sjgmap',
		libraryTarget: "umd",
	},
	module: {
	  rules: [
		{
		  test: /\.(png|jpg|jpeg|png|svg|cur|gif|webp|ttf|otf)$/,
		  use: [
			{
			  loader: 'url-loader',
			  options: {
				limit: 8192,
				name: 'static/[name].[hash].[ext]',
			  },
			},
		  ]
		}
	  ],
	},
	devServer: {
		host: 'localhost',
		port: '8777',
		open: true,
		client: {
			overlay: {
				errors: true,
				warnings: false
			}
		},
	},
	resolve: {
		extensions: ['.js'],
	}
};