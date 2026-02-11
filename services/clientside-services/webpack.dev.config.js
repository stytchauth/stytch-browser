/* eslint-disable @typescript-eslint/no-require-imports */
const config = require('./webpack.config');

/**
 * Sets up a proxy to your remote dev API instance
 * API sets a __Host- cookie as well as a regular cookie
 * but Chrome does not accept __Host cookies for local development
 * cf https://bugs.chromium.org/p/chromium/issues/detail?id=1263426
 *
 * So, we reattach the __Host cookie on each request
 */
module.exports = {
  ...config,
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    static: './dist',
    liveReload: false,
    hot: false,
    webSocketServer: false,
    // Arbitrary unique-ish port #
    port: 8076,
    proxy: [
      {
        '/v1': {
          target: 'https://api.' + process.env.ROOT_STYTCH_URL,
          // Uncomment this line to use test instead of live
          // TODO: Drive this with an env var too...
          // target: 'https://test.' + process.env.ROOT_STYTCH_URL,
          changeOrigin: true,
          cookieDomainRewrite: {
            [process.env.ROOT_STYTCH_URL]: 'localhost',
          },
          onProxyReq: function (proxyReq, req) {
            const cookies = req.headers['cookie'];
            if (!cookies) {
              return;
            }
            let token = cookies.split('stytch_csrf_private_token=')[1];

            if (!token) {
              return;
            }
            token = token.split(';')[0];

            proxyReq.setHeader(
              'cookie',
              `stytch_csrf_private_token=${token}; __Host-stytch_csrf_private_token=${token};`,
            );
          },
          withCredentials: true,
        },
      },
    ],
  },
};
