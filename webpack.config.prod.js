const path = require('path');

module.exports = {
	mode: "production",
	entry: "./src/index.js",
	output: {
		path: path.resolve(__dirname, 'dist'),
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
			},
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
		]
	}
};