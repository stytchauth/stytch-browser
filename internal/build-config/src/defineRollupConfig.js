import alias from '@rollup/plugin-alias';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import { dts } from 'rollup-plugin-dts';
import { swc } from 'rollup-plugin-swc3';

const DEFAULT_TARGETS = {
  node: '18',
  chrome: '110',
  firefox: '106',
  safari: '16',
};

const DEFAULT_OUTPUTS = ['cjs', 'esm', 'cjs-legacy', 'esm-legacy', 'cjs-dev', 'esm-dev'];

/**
 * @template T
 * @param {T | false | null | undefined} value
 * @returns {value is T}
 */
const isTruthy = (value) => Boolean(value);

/** @typedef {Object} RollupConfigOptions
 * @property {string[]} entrypoints
 * @property {import('type-fest').PackageJson} packageJson
 * @property {import('rollup').Plugin[]} [plugins]
 * @property {Record<string, string>} [targets]
 * @property {string[]} [outputs]
 */

/**
 * @param {RollupConfigOptions} options
 */
export const defineRollupConfig = ({
  entrypoints,
  packageJson,
  plugins,
  targets = DEFAULT_TARGETS,
  outputs = DEFAULT_OUTPUTS,
}) => {
  // Treat all dependencies and peerDependencies as external packages
  const externalPackages = [
    ...Object.keys(packageJson.dependencies || {}),
    ...Object.keys(packageJson.peerDependencies || {}),
  ];

  /** @type {import('rollup').RollupOptions['external']} */
  const external = (id) => externalPackages.some((pkg) => id === pkg || id.startsWith(`${pkg}/`));

  const input = entrypoints.reduce((acc, entry) => {
    acc[entry] = `./src/${entry}.ts`;
    return acc;
  }, /** @type {{[key: string]: string}} */ ({}));

  const includeTypescriptConfig = !packageJson.private;

  /**
   * @param {string} env
   * @returns {import('rollup').OutputOptions[]}
   */
  const getOutputConfigs = (env) => {
    /** @type {import('rollup').OutputOptions} */
    const common = {
      // n.b. this doesn't work as expected for ESM output; see
      // https://github.com/rollup/rollup/issues/5265
      interop: 'auto',
    };

    /** @type {import('rollup').OutputOptions} */
    const cjs = {
      ...common,
      dir: 'dist/cjs',
      format: 'cjs',
      entryFileNames: '[name].cjs',
    };

    /** @type {import('rollup').OutputOptions} */
    const esm = {
      ...common,
      dir: 'dist/esm',
      format: 'es',
      preserveModules: true,
      preserveModulesRoot: 'src',
      entryFileNames: '[name].mjs',
    };

    /** @type {import('rollup').OutputOptions} */
    const cjsDev = {
      ...cjs,
      dir: 'dist/cjs-dev',
    };

    /** @type {import('rollup').OutputOptions} */
    const esmDev = {
      ...esm,
      dir: 'dist/esm-dev',
    };

    /** @type {import('rollup').OutputOptions} */
    const cjsLegacy = {
      ...cjs,
      dir: 'dist/cjs-legacy',
      entryFileNames: '[name].js',
    };

    /** @type {import('rollup').OutputOptions} */
    const esmLegacy = {
      ...esm,
      dir: 'dist/esm-legacy',
      entryFileNames: '[name].js',
    };

    const outputConfigs =
      env === 'development'
        ? [outputs.includes('cjs-dev') && cjsDev, outputs.includes('esm-dev') && esmDev]
        : [
            outputs.includes('cjs') && cjs,
            outputs.includes('cjs-legacy') && cjsLegacy,
            outputs.includes('esm') && esm,
            outputs.includes('esm-legacy') && esmLegacy,
          ];

    return outputConfigs.filter(isTruthy);
  };

  /** @type {import('rollup').RollupOptions[]} */
  const buildConfigs = ['production', 'development'].map((env) => {
    return {
      input,
      output: getOutputConfigs(env),
      plugins: [
        alias({
          entries: [
            // Temporarily alias core to its source until it can be updated to
            // remove its compiled build output
            {
              find: '@stytch/core/public',
              replacement: new URL('../../../packages/core/src/public/index.ts', import.meta.url).pathname,
            },
            {
              find: '@stytch/core',
              replacement: new URL('../../../packages/core/src/index.ts', import.meta.url).pathname,
            },
          ],
        }),
        replace({
          preventAssignment: true,
          values: {
            'process.env.NODE_ENV': JSON.stringify(env),
          },
        }),
        swc({
          env: {
            targets,
          },
          jsc: {
            target: undefined,
            parser: {
              syntax: 'typescript',
            },
          },
        }),
        resolve({ exportConditions: [env] }),
        commonjs(),
        json(),
        ...(plugins || []),
      ],
      external,
    };
  });

  /** @type {import('rollup').RollupOptions} */
  const typescriptConfig = {
    input,
    output: [
      {
        dir: 'dist/types',
        format: 'es',
        entryFileNames: '[name].d.ts',
      },
    ],
    plugins: [
      dts({
        respectExternal: true,
      }),
    ],
    external,
  };

  return [...buildConfigs, includeTypescriptConfig ? typescriptConfig : undefined].filter(isTruthy);
};
