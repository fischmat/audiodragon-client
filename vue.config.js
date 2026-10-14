const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
		open: true,
		host: 'localhost',
		port: 3000,
		https: false,
    proxy: {
      '/v1': { target: 'http://localhost:8080' },
      '/events': { target: 'http://localhost:8080', ws: true },
    },
  },
  configureWebpack: {
    devtool: 'source-map',
    module: {
      rules: [
        {
          test: /\.worker\.js$/,
          use: { loader: "worker-loader" }
        }
      ]
    }
  }
})
