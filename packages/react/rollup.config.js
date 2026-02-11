import ts from 'rollup-plugin-ts';

import resolve from '@rollup/plugin-node-resolve';

const fixBadImportPathsPlugin = () => {
  return {
    name: 'fix-bad-import-paths',
    generateBundle(outputOptions, bundle) {
      Object.entries(bundle).forEach(([fileName, chunkInfo]) => {
        // rollup-plugin-ts generates .d.ts files with import paths that will
        // not resolve externally (e.g., `import("core/dist/...")`). (Crudely)
        // find and replace such paths with properly qualified ones that will
        // resolve correctly.
        if (fileName.endsWith('.d.ts')) {
          /** @type string */
          const source = chunkInfo.source;
          const fixedSource = source.replace(/"(packages\/)?core\/dist\//g, '"@stytch/core/');
          chunkInfo.source = fixedSource;
        }
      });
    },
  };
};

const PLUGINS = [
  resolve({
    browser: true,
  }),
  ts({
    // We only want to emit one d.ts file for both esm and cjs builds
    outputPath: (path, kind) => {
      if (kind === 'declaration') {
        return path.replace('.esm.d.ts', '.d.ts');
      }
    },
  }),
  fixBadImportPathsPlugin(),
];

const EXTERNAL = [
  'react',
  'react-dom',
  '@stytch/vanilla-js',
  '@stytch/vanilla-js/headless',
  '@stytch/vanilla-js/b2b',
  '@stytch/vanilla-js/b2b/headless',
  '@stytch/vanilla-js/b2b/adminPortal',
];

export default [
  {
    input: {
      index: 'src/index.ts',
      'index.headless': 'src/index.headless.ts',
      'index.ui': 'src/index.ui.ts',
      'b2b/index': 'src/b2b/index.ts',
      'b2b/index.headless': 'src/b2b/index.headless.ts',
      'b2b/index.ui': 'src/b2b/index.ui.ts',
      'adminPortal/index': 'src/adminPortal/index.ts',
    },
    output: [
      { dir: 'dist', format: 'cjs', entryFileNames: '[name].js', sourcemap: true },
      { dir: 'dist', format: 'es', entryFileNames: '[name].esm.js', sourcemap: true },
    ],
    plugins: PLUGINS,
    external: EXTERNAL,
  },
];
