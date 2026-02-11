import { getBabelOutputPlugin } from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import ts from 'rollup-plugin-ts';

export default [
  {
    input: {
      'index.esm': './src/index.ts',
      'public/index.esm': './src/public/index.ts',
      'testing/index.esm': './src/testing/index.ts',
    },
    output: [{ dir: 'dist', format: 'es', sourcemap: true }],
    plugins: [
      ts({ tsconfig: 'tsconfig.build.json' }),
      getBabelOutputPlugin({
        presets: ['@babel/preset-env'],
      }),
      resolve({
        browser: true,
      }),
      commonjs(),
    ],
  },
  {
    input: {
      index: './src/index.ts',
      'public/index': './src/public/index.ts',
      'testing/index': './src/testing/index.ts',
    },
    output: [{ dir: 'dist', format: 'cjs', sourcemap: true }],
    plugins: [
      ts({ tsconfig: 'tsconfig.build.json' }),
      getBabelOutputPlugin({
        presets: ['@babel/preset-env'],
      }),
      resolve({
        browser: true,
      }),
      commonjs(),
    ],
  },

  // Generating types
  ...[
    'index', //
    'public/index',
    'testing/index',
  ].map((path) => ({
    input: {
      [path]: `./src/${path}.ts`,
    },
    // These are copied back into dist as part of the build command
    output: [{ dir: 'build/types', format: 'cjs' }],
    plugins: [
      ts({ tsconfig: 'tsconfig.types.json' }),
      getBabelOutputPlugin({
        presets: ['@babel/preset-env'],
      }),
      resolve({
        browser: true,
      }),
      commonjs(),
    ],
  })),
];
