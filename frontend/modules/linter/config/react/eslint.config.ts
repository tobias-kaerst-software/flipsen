import eslint from '@eslint/js';
import { ESLint } from 'eslint';
import eslintPluginJsxA11y from 'eslint-plugin-jsx-a11y';
import eslintPluginPerfectionist from 'eslint-plugin-perfectionist';
import eslintPluginPrettier from 'eslint-plugin-prettier/recommended';
import eslintPluginReact from 'eslint-plugin-react';
import eslintPluginReactHooks from 'eslint-plugin-react-hooks';
import * as eslintPluginRegexp from 'eslint-plugin-regexp';
import tsEslint from 'typescript-eslint';
import unusedImports from 'eslint-plugin-unused-imports';

export default tsEslint.config(
  eslint.configs.recommended,
  ...tsEslint.configs.strict,
  eslintPluginPerfectionist.configs['recommended-natural'],
  eslintPluginRegexp.configs['flat/recommended'],
  eslintPluginJsxA11y.flatConfigs.recommended,
  eslintPluginPrettier,
  {
    plugins: { react: eslintPluginReact as ESLint.Plugin },
    languageOptions: {
      parserOptions: { ecmaFeatures: { jsx: true }, projectService: true },
    },
  },
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
  // @ts-ignore - The types are incorrect.
  { plugins: { 'react-hooks': eslintPluginReactHooks }, rules: eslintPluginReactHooks.configs.recommended.rules },
  {
    settings: { react: { version: 'detect' } },
    rules: {
      // Vite automatically injects React into JSX files, so we don't need to import it.
      'react/react-in-jsx-scope': 'off',
      // We use TypeScript, so we don't need prop types.
      'react/prop-types': 'off',

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
