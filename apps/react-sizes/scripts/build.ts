import fs from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

import react from '@vitejs/plugin-react';
import SondaVite from 'sonda/vite';
import SondaWebpack from 'sonda/webpack';
import { build } from 'vite';
import webpack, { type Configuration } from 'webpack';

import pageConfig from './pages.cjs';

// Outside of CI, we will output some additional stats from Webpack to help with tracing side effects
const IS_CI = Boolean(process.env.CI);

const sondaConfig = {
  open: false,
  deep: true,
  gzip: true,
  brotli: true,
  sources: true,
  filename: 'sonda.html',
};

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const distDir = resolve(packageRoot, 'dist');

// When adding a new test case, add it here
const pages = Object.keys(pageConfig).map((input) => {
  const path = resolve(packageRoot, 'src', input + '.tsx');
  return { input, path };
});

/* eslint-disable no-console */

console.log('Cleaning...', distDir);
fs.rmSync(distDir, { recursive: true, force: true });

console.log('Building with Vite...');
for (const { input, path } of pages) {
  const outDir = resolve(distDir, `vite/${input}`);
  await build({
    plugins: [
      react(),
      SondaVite({
        ...sondaConfig,
        outputDir: outDir,
      }),
    ],
    build: {
      assetsDir: '', // Don't put the JS in a separate folder
      sourcemap: true,
      outDir,
      rollupOptions: { input: { [input]: path } },
    },
  });
}

console.log('Building with Webpack...');
const webpackBuild = promisify(webpack);
const stats = await webpackBuild(
  pages.map(({ input, path }): Configuration => {
    const outDir = resolve(distDir, `webpack/${input}`);
    return {
      mode: 'production',
      entry: { [input]: path },
      output: {
        path: outDir,
        filename: '[name].js',
        clean: true,
      },
      resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
      },
      // Enable this when investigating size issues, since concatenateModules
      // makes tracing dependencies harder.
      //
      // optimization: {
      //   concatenateModules: false,
      // },
      //
      // A common config is splitChunks: { chunks: 'all' }
      // but we don't use it since it splits vendored packages out which makes size accounting less reliable
      module: {
        rules: [
          {
            test: /\.tsx?$/,
            use: {
              loader: 'ts-loader',
              options: {
                transpileOnly: true,
                configFile: resolve(packageRoot, 'tsconfig.app.json'),
              },
            },
            exclude: /node_modules/,
          },
        ],
      },
      plugins: [
        new SondaWebpack({
          ...sondaConfig,
          outputDir: outDir,
        }),
      ],
      devtool: 'source-map',
      stats: IS_CI
        ? false
        : {
            reasons: true,
            usedExports: true,
            providedExports: true,
            optimizationBailout: true,
            moduleTrace: true,
            errorDetails: true,
          },
    };
  }),
);

if (stats?.hasErrors()) {
  for (const error of stats.stats.filter((s) => s.hasErrors()).flatMap((s) => s.compilation.errors.toString())) {
    console.error(error);
  }

  process.exit(1);
}

if (!IS_CI) {
  stats?.stats.forEach((stat) => {
    const json = stat.toJson();

    fs.writeFileSync(json.outputPath! + '/stats.json', JSON.stringify(json, null, 2));
  });
}
