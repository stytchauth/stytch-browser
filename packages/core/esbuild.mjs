import * as esbuild from 'esbuild';

/** @type esbuild.BuildOptions */
const commonOptions = {
  logLevel: 'debug',
  // minify: true,
  bundle: true,
  format: 'esm',
  sourcemap: true,
  target: ['chrome110', 'firefox106', 'safari16'],
};

await esbuild
  .context({
    entryPoints: ['src/index.ts'],
    outfile: 'dist/index.esm.js',
    ...commonOptions,
  })
  .then((ctx) => ctx.watch());

await esbuild
  .context({
    entryPoints: ['src/public/index.ts'],
    outfile: 'dist/public/index.esm.js',
    ...commonOptions,
  })
  .then((ctx) => ctx.watch());

await esbuild
  .context({
    entryPoints: ['src/testing/index.ts'],
    outfile: 'dist/public/index.esm.js',
    ...commonOptions,
  })
  .then((ctx) => ctx.watch());
