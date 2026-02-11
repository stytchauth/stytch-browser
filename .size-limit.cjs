const pages = require('react-sizes/scripts/pages.cjs');

const bundlers = ['vite', 'webpack'];
const otherFrameworks = ['vanilla', 'vue', 'svelte'];

const ROOT = __dirname;
const REACT_SIZES_PATH = ROOT + '/apps/react-sizes';
const OTHER_FRAMEWORK_JS_PATH = ROOT + '/apps/other-framework-demo';
const VANILLA_JS_PATH = ROOT + '/packages/vanilla-js';

// Esbuild is really noisy with sideEffects warnings, and size-limit doesn't filter them out by default which breaks
// the size-limit action when it tries to parse the output including warnings as JSON and fails
/**
 * @param config {import('esbuild').BuildOptions}
 * @return {import('esbuild').BuildOptions}
 */
const modifyEsbuildConfig = (config) => ({
  ...config,
  logLevel: 'error',
  treeShaking: true,
});

module.exports = [
  // Library outputs
  {
    name: 'Vanilla JS Headless CJS',
    path: VANILLA_JS_PATH + '/dist/cjs/index.headless.cjs',
    modifyEsbuildConfig,
  },
  {
    name: 'Vanilla JS B2B Headless CJS',
    path: VANILLA_JS_PATH + '/dist/cjs/b2b/index.headless.cjs',
    modifyEsbuildConfig,
  },
  {
    name: 'Vanilla JS Admin Portal',
    path: VANILLA_JS_PATH + '/dist/esm/adminPortal/index.mjs',
    modifyEsbuildConfig,
  },
  {
    name: 'Vanilla JS Admin Portal (Org Settings only)',
    path: VANILLA_JS_PATH + '/dist/esm/adminPortal/index.mjs',
    import: '{ mountAdminPortalOrgSettings }',
    modifyEsbuildConfig,
  },

  // Test apps
  ...bundlers.flatMap((bundler) =>
    Object.entries(pages).map(([page, name]) => ({
      name: `${name} (${bundler})`,
      path: `${REACT_SIZES_PATH}/dist/${bundler}/${page}/*.js`,
      modifyEsbuildConfig,
    })),
  ),

  // Other frameworks
  ...otherFrameworks.map((framework) => ({
    name: framework,
    path: `${OTHER_FRAMEWORK_JS_PATH}/dist/${framework}/assets/*.js`,
    modifyEsbuildConfig,
  })),
];
