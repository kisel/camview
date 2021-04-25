// debug/development only webpack configuration
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');

const appConfig = {
    backendHost: process.env.BACKEND_HOST || 'localhost',
    backendPort: parseInt(process.env.BACKEND_PORT || '8000'),
    webpackPort: parseInt(process.env.FRONTEND_PORT || '8080'),
}
const base_url = process.env.BASE_URL || '/';
const config = require('../webpack.config.js');
const frontEndEntry = config[0];

if (!process.env.NO_HOT_RELOAD) {
    frontEndEntry.entry.webpack_client = 'webpack-dev-server/client?/';
    frontEndEntry.entry.webpack_hot = 'webpack/hot/dev-server';
    frontEndEntry.plugins.push(new webpack.HotModuleReplacementPlugin());
}

// enable CSS source maps for dev server
// see note in a main config file
(frontEndEntry.module.rules || []).forEach(rule => {
    (rule.use || []).forEach(use => {
        if (use.loader in ['sass-loader', 'css-loader']) {
            use.options = use.options || {};
            use.options.sourceMap = true;
        }
    });
});

const compiler = webpack(config);

console.log('Loading WebpackDevServer');

const backend_proxy_options = {
    target: `http://${appConfig.backendHost}:${appConfig.backendPort}`,
    timeout: 1000 * 60 * 10,
    proxyTimeout: 1000 * 60 * 10,
};

const server = new WebpackDevServer(compiler, {
  // Enable special support for Hot Module Replacement(see 'inline' commend above)
  hot: false, // should be false as we're adding HotModuleReplacementPlugin manually

  host: appConfig.backendHost,
  port: appConfig.webpackPort,
  //publicPath: base_url,

  historyApiFallback: true,

  // Set this if you want to enable gzip compression for assets
  compress: false,

  proxy: {
    [`${base_url}api/**`]: backend_proxy_options,
  },

  disableHostCheck: true, // connect to any backend target(even with untrusted SSL cert)
  watchOptions: { // optional compatibility options
    aggregateTimeout: 300,
    poll: 1000
  },

  stats: { colors: true }
});

server.listen(appConfig.webpackPort, function() {
    console.log('Available entry routes:');
    console.log(base_url);
    console.log('/webpack-dev-server/');
});
