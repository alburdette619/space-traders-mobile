// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat.js');
const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended');
const cspellESLintPluginRecommended = require('@cspell/eslint-plugin/recommended');

module.exports = defineConfig([
  expoConfig,
  eslintPluginPrettierRecommended,
  cspellESLintPluginRecommended,
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
      'no-unused-vars': 'off',
    },
  },
]);
