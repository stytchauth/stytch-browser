import { join } from 'node:path';

import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import strip from '@rollup/plugin-strip';
import copy from 'rollup-plugin-copy';
import { dts } from 'rollup-plugin-dts';
import styles from 'rollup-plugin-styler';
import { minify, swc } from 'rollup-plugin-swc3';

const __dirname = import.meta.dirname;

const IS_WATCH = process.env.ROLLUP_WATCH === 'true';

const BROWSER_TARGETS = {
  chrome: '109', // Last version to support Windows 7 and Vista, released Jan 2023
  firefox: '106', // Released October 2022
  safari: '16', // Released September 2022
};

// React Native has bundled Babel config which we should assume the consumer is using
const RN_TARGETS = {
  node: '18',
};

/**
 * @typedef {'cjs' | 'esm' | 'cjs-legacy' | 'esm-legacy'} OutputFormat
 * @typedef {'development' | 'production'} Environment
 * @typedef {Environment | 'iife'} BuildType
 */

/** @type {Environment[]} */
const ENVIRONMENTS = ['development', 'production'];

/**
 * @template T
 * @param {T | false | null | undefined} value
 * @returns {value is T}
 */
const isTruthy = (value) => Boolean(value);

/** @type {import('rollup').OutputOptions} */
const commonOutputOptions = {
  sourcemap: true,
  // n.b. this doesn't work as expected for ESM output; see
  // https://github.com/rollup/rollup/issues/5265
  interop: 'auto',
};

/**
 * @param {Environment} env
 * @param {OutputFormat[]} outputs
 * @returns {import('rollup').OutputOptions[]}
 */
function getOutputConfig(env, outputs) {
  /** @type {Record<OutputFormat, import('rollup').OutputOptions>} */
  const formats = {
    cjs: {
      ...commonOutputOptions,
      dir: 'dist/cjs',
      format: 'cjs',
      entryFileNames: '[name].cjs',
    },
    'cjs-legacy': {
      ...commonOutputOptions,
      dir: 'dist/cjs-legacy',
      format: 'cjs',
      entryFileNames: '[name].js',
    },

    esm: {
      ...commonOutputOptions,
      dir: 'dist/esm',
      format: 'es',
      preserveModules: true,
      preserveModulesRoot: 'src',
      entryFileNames: '[name].mjs',
    },
    'esm-legacy': {
      ...commonOutputOptions,
      dir: 'dist/esm',
      format: 'es',
      preserveModules: true,
      preserveModulesRoot: 'src',
      entryFileNames: '[name].js',
    },
  };

  // We only output cjs and esm for development
  const filteredFormats = env === 'development' ? outputs.filter((o) => o === 'esm' || o === 'cjs') : outputs;

  const options = filteredFormats.map((o) => formats[o]);
  if (env === 'development') {
    // Add -dev to all development output dirs
    return options.map((option) => ({ ...option, dir: option.dir + '-dev' }));
  } else {
    return options;
  }
}

/**
 * @param {string} entryName
 * @returns {import('rollup').OutputOptions}
 */
function getIifeConfig(entryName) {
  return {
    ...commonOutputOptions,
    dir: 'dist/iife',
    format: 'iife',
    entryFileNames: entryName + '.js',
    name: 'stytch',
    plugins: [minify({ mangle: true, compress: true, sourceMap: true })],
  };
}

/** @param {string} entry */
const sourcePath = (entry) => `./src/${entry}.ts`;

/** @typedef {Object} RollupConfigOptions
 * @property {string[]} entrypoints
 * @property {import('type-fest').PackageJson} packageJson
 * @property {import('rollup').Plugin[]} [plugins]
 * @property {boolean} [browser]
 * @property {boolean} [iife]
 * @property {Record<string, string>} [targets]
 * @property {OutputFormat[]} outputs
 */

/**
 * @param {RollupConfigOptions} options
 * @returns {import('rollup').RollupOptions[]}
 */
export const defineRollupConfig = ({
  entrypoints,
  packageJson,
  plugins = [],
  browser,
  outputs,
  iife,
  targets = browser ? BROWSER_TARGETS : RN_TARGETS,
}) => {
  // Treat all dependencies and peerDependencies as external packages
  const externalPackages = [
    ...Object.keys(packageJson.dependencies || {}),
    ...Object.keys(packageJson.peerDependencies || {}),
  ];

  /** @type {import('rollup').RollupOptions['external']} */
  const external = (id) => externalPackages.some((pkg) => id === pkg || id.startsWith(`${pkg}/`));

  const input = Object.fromEntries(entrypoints.map((entry) => [entry, sourcePath(entry)]));

  /**
   * @type {{
   *  env: Environment;
   *  input: (import('rollup').InputOption);
   *  output: (import('rollup').OutputOptions | import('rollup').OutputOptions[]);
   * }[]}
   */
  const builds = ENVIRONMENTS.map((env) => ({
    env,
    input,
    output: getOutputConfig(env, outputs),
  }));

  /** @type {import('@swc/core').WasmPlugin[]}} */
  const swcPlugins = [];

  if (iife) {
    for (const entry of entrypoints) {
      builds.push({
        env: 'development',
        input: sourcePath(entry),
        output: getIifeConfig(entry),
      });
    }
  }

  if (browser) {
    plugins = [
      ...plugins,
      styles({
        modules: true,
        minimize: !IS_WATCH,
        config: {
          path: join(__dirname, 'postcss.config.js'),
        },
        mode: [
          'inject',
          (cssVariableName) =>
            `import {collectCss} from '@stytch/internal-style-injector';collectCss(${cssVariableName})`,
        ],
        // We don't use sourcemaps since this is injected which means the sourcemaps are included in
        // sources directly and not as a separate file, which means it will increase our bundle size
        // unnecessarily
      }),
    ];

    // Include lingui for web builds (we'll eventually also add RN eventually)
    swcPlugins.push(['@lingui/swc-plugin', {}]);
  }

  const includeTypescriptConfig = !packageJson.private;

  /** @type {import('rollup').RollupOptions[]} */
  const buildConfigs = builds.map(({ env, input, output }) => ({
    input,
    output,
    plugins: [
      replace({
        sourceMap: true,
        preventAssignment: true,
        values: {
          STYTCH_PACKAGE_NAME: JSON.stringify(packageJson.name),
          STYTCH_PACKAGE_VERSION: JSON.stringify(packageJson.version),

          'process.env.NODE_ENV': JSON.stringify(env),
          // TODO: Find a better way to handle envs between Storybook, dev and prod
          'process.env.STORYBOOK': JSON.stringify(false),
        },
      }),
      swc({
        env: {
          targets,
          bugfixes: true,
        },
        jsc: {
          target: undefined,
          parser: {
            syntax: 'typescript',
          },
          experimental: {
            plugins: swcPlugins,
          },
        },
        sourceMaps: true,
      }),

      // Must be after swc since strip() does not respect TypeScript syntax
      env === 'production' &&
        strip({
          include: '**/*.(ts|tsx|js|jsx)',
          functions: ['DEV', 'RUN_IN_DEV', 'validateInDev', 'chromaticIgnoreClassName'],
        }),
      commonjs({ include: /node_modules/ }),
      resolve({
        browser,
        extensions: ['.js', '.ts', '.tsx', '.jsx', '.json'],
        exportConditions: [env],
      }),
      json(),

      // In browser builds, to support shadcn, we create a special /theme
      // export specifically for the shadcn CSS import (so TW can read the CSS
      // variables we use - https://tailwindcss.com/docs/detecting-classes-in-source-files#explicitly-registering-sources).
      // The CSS file need to be manually copied out of web's src folder since
      // it is not imported anywhere and so will not be included in dist
      // otherwise. To keep the @source path stable, we also copy the JS file
      // it references into the same folder.
      browser
        ? copy({
            targets: [
              {
                src: '../web/src/ui/components/themes/shadcn.css',
                dest: 'dist/theme/',
              },
              {
                src: 'dist/esm/packages/web/src/ui/components/themes/shadcn.mjs',
                dest: 'dist/theme/',
                rename: 'shadcn.js', // Rename in case .mjs is not recognized as extension
              },
              {
                src: '../web/messages/en.po',
                dest: 'messages',
              },
              {
                src: '../web/messages/b2b/en.po',
                dest: 'messages/b2b',
              },
            ],
          })
        : undefined,

      ...(plugins || []),
    ].filter(isTruthy),
    external,
    onwarn: (warning, warn) => {
      // Module level directives cause errors when bundled, "use client" in "node_modules/react-hot-toast/dist/index.mjs" was ignored.
      if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
        return;
      }
      warn(warning);
    },
  }));

  /** @type {import('rollup').RollupOptions} */
  const typescriptConfig = {
    jsx: 'react',
    input,
    output: [
      {
        dir: 'dist/types',
        format: 'es',
        entryFileNames: '[name].d.ts',
      },
    ],
    plugins: [
      // Needed to resolve @stytch/core and fix strange external namespace resolution errors in vanilla-js
      resolve(),
      dts({
        // This should be true, since we bundle (not reference via dependencies) some packages
        // but currently it breaks with React/prop-types type files. It also causes the plugin
        // to use an incredible amount of RAM (more than 15GB). Instead, we use includeExternal
        // for a more targeted approach
        // respectExternal: true,

        // Include packages here when their types need to be bundled instead of referenced via import.
        // This is commonly used for internal packages
        // NOTE: Due to how TypeScript module resolution logic works, the package.json for each package
        //       MUST include a version field, even if it is a placeholder like "version": "0.0.0".
        //       Otherwise TS will not produce a packageId used internally by the plugin for this check
        includeExternal: ['@stytch/core', '@stytch/web', '@types/google-one-tap'],
      }),
    ],
  };

  return [
    ...buildConfigs, //
    includeTypescriptConfig ? typescriptConfig : undefined,
  ].filter(isTruthy);
};
