import * as esbuild from 'esbuild';
import babel from 'esbuild-plugin-babel';

// B2C UI Build
await esbuild
  .context({
    logLevel: 'debug',
    alias: {
      react: './node_modules/react',
    },
    entryPoints: ['src/index.ts'],
    bundle: true,
    format: 'esm',
    outfile: 'dist/index.esm.js',
    sourcemap: true,
    target: ['chrome110', 'firefox106', 'safari16'],
    plugins: [
      babel({
        filter: /\.(ts|tsx)$/,
        config: {
          presets: ['@babel/preset-typescript', '@babel/preset-react'],
          plugins: ['@lingui/babel-plugin-lingui-macro'],
        },
      }),
    ],
  })
  .then((ctx) => ctx.watch());

// B2C Headless Build
await esbuild
  .context({
    logLevel: 'debug',
    alias: {
      react: './node_modules/react',
    },
    entryPoints: ['src/index.headless.ts'],
    bundle: true,
    format: 'esm',
    outfile: 'dist/index.headless.esm.js',
    sourcemap: true,
    target: ['chrome110', 'firefox106', 'safari16'],
  })
  .then((ctx) => ctx.watch());

// B2B UI Build
await esbuild
  .context({
    logLevel: 'debug',
    alias: {
      react: './node_modules/react',
    },
    entryPoints: ['src/b2b/index.ts', 'src/adminPortal/index.ts'],
    bundle: true,
    format: 'esm',
    outdir: 'dist',
    outExtension: {
      '.js': '.esm.js',
    },
    sourcemap: true,
    target: ['chrome110', 'firefox106', 'safari16'],
    plugins: [
      babel({
        filter: /\.(ts|tsx)$/,
        config: {
          presets: ['@babel/preset-typescript', '@babel/preset-react'],
          plugins: ['@lingui/babel-plugin-lingui-macro'],
        },
      }),
    ],
  })
  .then((ctx) => ctx.watch());

// TODO: Do we not have a proper B2B Headless Entrypoint ?!
// let b2bHeadless = await esbuild.context({
//   logLevel: 'debug',
//   alias: {
//     'react': './node_modules/react'
//   },
//   entryPoints: ['src/b2b/index.headless.ts'],
//   bundle: true,
//   format: 'esm',
//   outfile: 'dist/b2b/index.headless.esm.js',
//   target: ['chrome110', 'firefox106', 'safari16'],
// })
//
// await b2bHeadless.watch()
