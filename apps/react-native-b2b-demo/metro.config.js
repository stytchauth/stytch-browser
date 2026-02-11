// eslint-disable-next-line @typescript-eslint/no-require-imports
const { getDefaultConfig } = require('@expo/metro-config');
const config = getDefaultConfig(__dirname);
module.exports = {
  ...config,
  resolver: {
    ...config.resolver,
    resolveRequest: (context, moduleName, platform) => {
      if (moduleName == 'react') {
        return {
          filePath: `${__dirname}/node_modules/react/index.js`,
          type: 'sourceFile',
        };
      }
      if (moduleName == 'react-native') {
        return {
          filePath: `${__dirname}/node_modules/react-native/index.js`,
          type: 'sourceFile',
        };
      }
      if (moduleName == '@stytch/react-native-inappbrowser-reborn') {
        return {
          filePath: `${__dirname}/node_modules/@stytch/react-native-inappbrowser-reborn/index.js`,
          type: 'sourceFile',
        };
      }
      return context.resolveRequest(context, moduleName, platform);
    },
  },
};
