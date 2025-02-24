import eslint from '@eslint/js';
import eslintPluginPerfectionist from 'eslint-plugin-perfectionist';
import eslintPluginPrettier from 'eslint-plugin-prettier/recommended';
import eslintPluginReactHooks from 'eslint-plugin-react-hooks';
import * as eslintPluginRegexp from 'eslint-plugin-regexp';
import tsEslint from 'typescript-eslint';
import unusedImports from 'eslint-plugin-unused-imports';

export default tsEslint.config(
  eslint.configs.recommended,
  ...tsEslint.configs.strict,
  eslintPluginPerfectionist.configs['recommended-natural'],
  eslintPluginRegexp.configs['flat/recommended'],
  eslintPluginPrettier,
  {
    plugins: {
      'unused-imports': unusedImports,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],
    },
  },
  {
    settings: { react: { version: 'detect' } },
    rules: {
      // The developer should be able to decide whether to the non null assertion or not.
      '@typescript-eslint/no-non-null-assertion': 'off',

      // Declare the order of imports and the typescript alias pattern.
      'perfectionist/sort-imports': [
        'error',
        {
          internalPattern: ['^\\$/.+'],
          newlinesBetween: 'always',
          groups: [
            'type',
            ['builtin', 'external'],
            'internal-type',
            'internal',
            ['parent-type', 'sibling-type', 'index-type'],
            ['parent', 'sibling', 'index'],
            'object',
            'style',
            'unknown',
          ],
        },
      ],
      'perfectionist/sort-objects': "off",
      "perfectionist/sort-modules": "off",

      // Enforce correct imports / exports
      '@typescript-eslint/consistent-type-exports': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
    },
  },
);
