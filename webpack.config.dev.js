const path = require('path');

module.exports = {
	mode: "development",
	entry: "./src/index.js",
	devtool: 'inline-source-map',
	output: {
		filename: "index.js",
		library: 'sjgmap',
		libraryTarget: "umd",
	},
	module: {
		rules: [
			{
				test: /\.(js)$/,
				include: path.resolve(__dirname, "src"),
				loader: 'babel-loader',
				options: {
					cacheDirectory: true
				}
			}
		],
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
		port: '8777',
		host: 'localhost',
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