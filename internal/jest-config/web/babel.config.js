// import linguiPlugin from '@lingui/babel-plugin-lingui-macro';
// import presetEnv from '@babel/preset-env';
// import presetReact from '@babel/preset-react';
// import presetTypeScript from '@babel/preset-typescript';

const config = {
  plugins: ['@lingui/babel-plugin-lingui-macro'],
  presets: [
    ['@babel/preset-env', { loose: true, targets: { node: 'current' } }], //
    '@babel/preset-react',
    '@babel/preset-typescript',
  ],
};

module.exports = config;
