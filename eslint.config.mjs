// @ts-check
import eslint from '@eslint/js';
import boundaries from 'eslint-plugin-boundaries';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'prettier/prettier': ['error', { endOfLine: 'auto' }],
    },
  },
  {
    files: ['libs/framework/src/**/*.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
    },
  },
  {
    files: ['libs/applications/src/modules/**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-unsafe-argument': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'prettier/prettier': ['error', { endOfLine: 'auto' }],
    },
  },
  // Layer boundaries, see docs/project-structure.md "Import rules"
  {
    files: ['apps/**/*.ts', 'libs/**/*.ts'],
    plugins: { boundaries },
    settings: {
      'import/resolver': {
        typescript: { project: './tsconfig.json' },
      },
      // First match wins: keep the application root last among libs/application
      'boundaries/elements': [
        { type: 'app', pattern: 'apps/*', capture: ['app'], partialMatch: false },
        { type: 'module', pattern: 'libs/application/src/modules/*', capture: ['module'], partialMatch: false },
        {
          type: 'integration',
          pattern: 'libs/application/src/integrations/*',
          capture: ['provider'],
          partialMatch: false,
        },
        { type: 'connection', pattern: 'libs/application/src/connnections', partialMatch: false },
        { type: 'config', pattern: 'libs/application/src/config', partialMatch: false },
        { type: 'application-root', pattern: 'libs/application/src', partialMatch: false },
        { type: 'framework', pattern: 'libs/framework/src/*', capture: ['concern'], partialMatch: false },
      ],
    },
    rules: {
      'boundaries/dependencies': [
        'error',
        {
          default: 'disallow',
          policies: [
            {
              from: { element: { type: 'app' } },
              allow: {
                to: {
                  element: { types: { anyOf: ['application-root', 'module', 'connection', 'config', 'framework'] } },
                },
              },
            },
            {
              from: { element: { type: 'application-root' } },
              allow: {
                to: { element: { types: { anyOf: ['module', 'connection', 'framework', 'config'] } } },
              },
            },
            {
              from: { element: { type: 'module' } },
              allow: {
                to: { element: { types: { anyOf: ['module', 'integration', 'connection', 'config', 'framework'] } } },
              },
            },
            {
              from: { element: { type: 'integration' } },
              allow: { to: { element: { type: 'framework' } } },
            },
            {
              from: { element: { type: 'connection' } },
              allow: { to: { element: { types: { anyOf: ['config', 'framework'] } } } },
            },
            {
              from: { element: { type: 'config' } },
              allow: { to: { element: { type: 'framework' } } },
            },
            {
              from: { element: { type: 'framework' } },
              allow: { to: { element: { type: 'framework' } } },
            },
            // Last match wins, so these override the allows above. Same-element imports are not checked.
            {
              disallow: { to: { element: { fileInternalPath: '!index.ts' } } },
              message: 'Import through the barrel (index.ts) only, never a nested path',
            },
            {
              // Side-effect entry that must load before Nest
              allow: {
                to: { element: { type: 'framework', captured: { concern: 'trace' }, fileInternalPath: 'register.ts' } },
              },
            },
          ],
        },
      ],
    },
  },
);
