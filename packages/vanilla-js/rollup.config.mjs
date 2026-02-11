import alias from '@rollup/plugin-alias';
import babel, { getBabelOutputPlugin } from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import typescript from '@rollup/plugin-typescript';
import sizes from 'rollup-plugin-sizes';
import dts from 'rollup-plugin-dts';

let plugins = [
  alias({
    entries: [
      { find: 'react', replacement: 'preact/compat' },
      { find: 'react-dom/test-utils', replacement: 'preact/test-utils' },
      { find: 'react-dom', replacement: 'preact/compat' },
      { find: 'react/jsx-runtime', replacement: 'preact/jsx-runtime' },
    ],
  }),
];

const replacements = {
  // TODO: Find a better way to handle envs between Storybook, dev and prod
  'process.env.STORYBOOK': JSON.stringify(false),
};

if (process.env.ROLLUP_WATCH !== 'true') {
  // We only use rollup for final artifacts - we use TSC for dev work
  // set process.env.NODE_ENV to prod so we get a minified/prod copy of react
  replacements['process.env.NODE_ENV'] = JSON.stringify('production');
}

plugins = plugins.concat([
  replace(replacements),
  resolve({
    browser: true,
    extensions: ['.js', '.ts', '.tsx', '.jsx', '.json'],
  }),
  commonjs({
    include: /node_modules/,
  }),
  json(),
  babel({
    extensions: ['.js', '.ts', '.tsx', '.jsx'],
    compact: false,
    presets: [
      '@babel/preset-typescript',
      [
        '@babel/preset-react',
        {
          pragma: 'h',
          pragmaFrag: 'Fragment',
        },
      ],
    ],
    plugins: ['@lingui/babel-plugin-lingui-macro'],
  }),
  getBabelOutputPlugin({
    presets: ['@babel/preset-env'],
    shouldPrintComment: (comment) => {
      return (
        // preserve pure annotations
        comment.includes('__PURE__') ||
        // preserve loud comments
        comment.startsWith('!')
      );
    },
  }),
  typescript({
    declaration: false,
    noForceEmit: true,
    noEmitOnError: !!process.env.CI,
    tsconfig: './tsconfig.build.json',
  }),
]);

if (process.env.ROLLUP_WATCH !== 'true') {
  plugins = plugins.concat([sizes()]);
}
export default function () {
  const devReactB2CConf = [
    {
      input: './src/index.ts',
      output: [{ file: './dist/index.esm.js', format: 'es', sourcemap: true }],
      plugins,
    },
    {
      input: './src/index.headless.ts',
      output: [{ file: './dist/index.headless.esm.js', format: 'es', sourcemap: true }],
      plugins,
    },
  ];

  if (process.env.DEV_REACT_B2C === 'true') {
    return devReactB2CConf;
  }

  const configs = [['index'], ['index.headless'], ['b2b/index', 'b2b/index.headless', 'adminPortal/index']];

  return [
    ...configs.map((entrypoints) => ({
      input: entrypoints.reduce((acc, entry) => {
        acc[entry] = `./src/${entry}.ts`;
        return acc;
      }, {}),
      output: [
        { dir: 'dist', format: 'cjs', entryFileNames: '[name].js', sourcemap: true },
        { dir: 'dist', format: 'es', entryFileNames: '[name].esm.js', sourcemap: true },
      ],
      plugins,
      onwarn: (warning, warn) => {
        // Module level directives cause errors when bundled, "use client" in "node_modules/react-hot-toast/dist/index.mjs" was ignored.
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
          return;
        }
        warn(warning);
      },
    })),
    {
      input: configs.flat().reduce((acc, entry) => {
        acc[entry] = `./src/${entry}.ts`;
        return acc;
      }, {}),
      output: [{ dir: 'dist', format: 'es' }],
      plugins: [dts({ tsconfig: './tsconfig.build.json' })],
    },
  ];
}
