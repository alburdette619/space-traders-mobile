// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat.js');
const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended');
const cspellESLintPluginRecommended = require('@cspell/eslint-plugin/recommended');
const perfectionist = require('eslint-plugin-perfectionist');

module.exports = defineConfig([
  expoConfig,
  cspellESLintPluginRecommended,
  perfectionist.configs['recommended-natural'],
  eslintPluginPrettierRecommended,
  {
    name: 'disable-overlapping-import-sorters',
    files: ['**/*.{js,jsx,ts,tsx}'],
    rules: {
      'import/order': 'off',
      'sort-imports': 'off',
    },
  },
  {
    ignores: ['dist/*'],
    rules: {
      '@cspell/spellchecker': [
        'warn',
        {
          configFile: './cspell.config.yaml',
        },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      'import/order': 'off',
      'no-unused-vars': 'off',
      'sort-imports': 'off',
    },
  },
]);
