import { defineConfig } from 'eslint/config';
import js from '@eslint/js';
import tsEslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import lingui from 'eslint-plugin-lingui';
import prettier from 'eslint-config-prettier';
import testingLibrary from 'eslint-plugin-testing-library';
import pluginCypress from 'eslint-plugin-cypress';
import pluginChaiFriendly from 'eslint-plugin-chai-friendly';
import pluginJest from 'eslint-plugin-jest';
import pluginImport from 'eslint-plugin-import';
import simpleImportSort from 'eslint-plugin-simple-import-sort';

const OFF = 0;
const WARNING = 1;
const ERROR = 2;

export default defineConfig(
  // Base configuration for all files
  js.configs.recommended,
  tsEslint.configs.recommended,
  tsEslint.configs.stylistic,
  pluginImport.flatConfigs.typescript,
  reactHooks.configs['recommended-latest'],
  prettier,

  // React plugin and overrides
  react.configs.flat.recommended,
  {
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      // We don't use prop types in demo apps, and everywhere else uses TS which has prop typing automatically
      'react/prop-types': OFF,

      // Don't really care about this
      'react/display-name': OFF,

      // We need to use these for backwards compat
      'react/no-deprecated': OFF,

      // Different packages using different runtimes confuses the plugin, so we don't use jsx-runtime config
      // which causes typescript-eslint to complain about React imports in places where we use the old runtime
      // AND we disable this rule so it doesn't complain about missing React import in places using the new runtime
      'react/react-in-jsx-scope': OFF,
    },
  },

  {
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
  },

  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    rules: {
      'no-console': ERROR,
      'no-restricted-syntax': [
        'error',
        {
          selector:
            "CallExpression[callee.object.name='console'][callee.property.name!=/^(log|warn|error|info|trace)$/]",
          message: 'Unexpected property on console object was called',
        },
      ],

      '@typescript-eslint/no-restricted-imports': [
        ERROR,
        {
          patterns: [
            {
              group: ['@stytch/*/dist'],
              message: "Don't import from dist; use a supported entrypoint instead.",
            },
            {
              group: ['@stytch/*/src'],
              message: "Don't import from src; use a supported entrypoint instead.",
            },
          ],
          paths: [
            {
              name: '@lingui/core/macro',
              importNames: ['t'],
              message:
                "Don't import 't' from '@lingui/core/macro'. Use 'useLingui' from '@lingui/react/macro' and its returned 't' function instead.",
            },
            {
              name: '@lingui/react',
              importNames: ['useLingui'],
              message: "Use 'useLingui' from '@lingui/react/macro' instead.",
            },
            {
              name: '@lingui/react/macro',
              importNames: ['Trans'],
              message:
                "Use the 'Trans' component from '@lingui/react' instead, which supports named component placeholders.",
            },
          ],
        },
      ],

      '@typescript-eslint/no-unused-vars': [
        ERROR,
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],

      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',

      // Existing usage of type/interface is fairly evenly split
      '@typescript-eslint/consistent-type-definitions': OFF,

      // TypeScript already handles these
      'no-undef': OFF,
      'react/prop-types': OFF,
    },
  },

  // Web specific configuration
  {
    files: ['**/web/src/**/*.{ts,tsx}'],
    plugins: {
      lingui,
    },
    rules: {
      ...lingui.configs.recommended.rules,
      'lingui/no-unlocalized-strings': [
        ERROR,
        {
          ignore: [
            '^#[A-Fa-f0-9]{3,6}$',
            '^ALL_ALLOWED$',
            '^RESTRICTED$',
            '^REQUIRED_FOR_ALL$',
            '^OPTIONAL$',
            '^NameID$',
            '^firstName$',
            '^lastName$',
            '^id$',
            '^stytch\\.com$',
            '^https://[^\\s]+$',
            // underscore, dash, or dot-separated identifiers are probably not user-facing
            '^[a-zA-Z0-9]+[_.-][a-zA-Z0-9_.-]+$', // TODO: review
            // camelcase identifiers are probably not user-facing
            '^[a-z][a-zA-Z0-9]*$',
            // PascalCase identifiers ending with Error are probably error names
            '^[A-Z][a-zA-Z0-9]*Error$',
            // css selectors
            '^&(:[a-z]+)?( .*)?$',
            // CSS variables and functions
            'var\\(--.+\\)',
            'calc\\(.+\\)',
            // Directives
            'use client',
            'use server',
          ],
          ignoreNames: [
            { regex: { pattern: '^[A-Z0-9_-]+$' } }, // TODO: review
            { regex: { pattern: '^[A-Z0-9_-]+_SCOPE$' } },
            { regex: { pattern: '^[A-Z0-9_-]+_WEB_COMPONENT_NAME$' } },
            { regex: { pattern: '^className' } },
            'direction',
            'size',
            'justifyContent',
            'key',
            'type',
            'color',
            'id',
            'name',
            'variant',
            'method',
            'fontWeight',
            'border',
            'lineHeight',
            'backgroundColor',
            'borderRadius',
            'whiteSpace',
            'target',
            'rel',
            'align',
            'boxShadow',
            'display',
            'gap',
            'padding',
            'fontSize',
            'position',
            'marginTop',
            'marginBottom',
            'alignItems',
            'autoComplete',
            'variableName',
            'data-testid',
            'fill',
            'xmlns',
            'history',
            'url',
            'cursor',
            'fontFamily',
            'borderWidth',
            'flexDirection',
            'width',
            'maxWidth',
            'overflow',
            'filter_name',
            'operator',
            'screen',
            'labelVariant',
            'viewId',
            'searchKeys',
            'idPrefix',
            'titleVariant',
            'scimConnectionKey',
            'fieldId',
            'borderBottom',
            'horizontal',
            'vertical',
            'flexWrap',
            'textTransform',
            'background',
            'outline',
            'letterSpacing',
            'paddingLeft',
            'textAlign',
            // styled components props, e.g. `$placement`
            { regex: { pattern: '^\\$.*$' } },
            'iconSize',
            'action',
            'basicAuthHeader',
            'operation',
            'sameSite',
            'labelColor',
            'visibility',
            'prompt_parent_id',
            'context',
            'placement',
            'passwordrules',
            'displayName',
          ],
          ignoreFunctions: [
            'Error', // TODO: review
            'StytchSDKUsageError',
            'console.*',
            'logger.*',
            'useMutate',
            '*.get',
            '*.getItem',
            '*.has',
            '*.delete',
            '*.setItem',
            '*.attachShadow',
            '*.includes',
            '*.endsWith',
            '*.replace',
            '*.call',
            '*.buildSDKUrl',
            '*.getPropertyValue',
            'Symbol.for',
            'Symbol',
            'window.solana.request',
            'document.createElement',
            'document.getElementById',
            'document.getElementsByTagName',
            '*.querySelector',
            'encodeURIComponent',
            'PKCEManager',
            'window.crypto.subtle.digest',
            'useLocalStorage',
            'useSessionStorage',
            'makeAdminPortalComponentMountFn',
            'mutate',
            'useRbac',
            'useStateSliceSetter',
            'setOption',
            'styled',
            'theme.breakpoints.down',
            'useShortId',
            'uaContains',
            'useSWR',
            'mutateSWR',
            'checkNotSSR',
            'checkB2BNotSSR',
            '*.addEventListener',
            '*.removeEventListener',
            'matchMedia',
            'useMediaQuery',
            'DEV',
            'validateInDev',
            'invariant',
            'noProviderError',
            'create*Component',
            'usePresentationWithDefault',
            'getButtonId',
          ],
        },
      ],
    },
  },

  // React Native configuration
  {
    files: ['**/react-native/src/**/*.{ts,tsx}'],
    rules: {
      // RN uses require for assets
      '@typescript-eslint/no-require-imports': OFF,
    },
  },

  // Jest and other configs
  {
    files: ['**/jest-config/**/*.js', '**/jest.setup.js', '**/*.config.js'],
    rules: {
      // Jest and other configs are currently stuck in CJS because we're running on Node 20
      '@typescript-eslint/no-require-imports': OFF,
    },
  },

  // Test files configuration
  {
    files: ['**/*.{test,spec}.{ts,tsx,js,jsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': OFF,
      '@typescript-eslint/ban-ts-comment': OFF,
      'react/display-name': OFF,
      'lingui/no-unlocalized-strings': OFF,

      'jest/expect-expect': [
        WARNING,
        // TODO: At some point we will create shared jest configs and use jest-dom matchers
        { assertFunctionNames: ['expect*', 'expectToThrow', 'screen.getBy*', 'screen.findBy*'] },
      ],
      // This disallows using classes and functions as test names
      'jest/valid-title': OFF,
    },
    extends: [testingLibrary.configs['flat/react'], pluginJest.configs['flat/recommended']],
  },

  // Test utilities and story files
  {
    files: [
      '**/testUtils/*',
      '**/testUtils.*',
      '**/storyUtils.*',
      '**/*.{test,spec,stories}.{ts,tsx,js,jsx}',
      '**/flows/helpers.tsx',
      '**/flows/b2b/helpers.tsx',
    ],
    rules: {
      '@typescript-eslint/no-restricted-imports': OFF,
      'lingui/no-unlocalized-strings': OFF,
    },
  },

  // Cypress E2E test files
  {
    files: ['**/cypress/e2e/**/*.{ts,tsx,js,jsx}'],
    extends: [pluginCypress.configs.recommended, pluginChaiFriendly.configs.recommendedFlat],
  },

  // Mock files
  {
    files: ['**/__mocks__/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': OFF,
      '@typescript-eslint/ban-ts-comment': OFF,
      'lingui/no-unlocalized-strings': OFF,
    },
  },

  // Type definition files
  {
    files: ['**/*.d.ts'],
    rules: {
      // This rule gets confused by `declare module 'foo'`
      'lingui/no-unlocalized-strings': OFF,
    },
  },

  // Admin portal files
  {
    files: ['**/adminPortal/**'],
    rules: {
      // TODO: enable when ready
      'lingui/no-unlocalized-strings': OFF,
    },
  },
);
