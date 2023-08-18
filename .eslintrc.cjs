/** @type {import("eslint").ESLint.ConfigData} */
// eslint-disable-next-line no-undef
module.exports = {
  root: true,
  env: {
    es2021: true,
  },
  extends: ['prettier'],
  ignorePatterns: ['build'],
  overrides: [
    {
      files: ['scripts/*.cjs', '.eslintrc.cjs'],
      env: { node: true },
      extends: ['eslint:recommended'],
      parser: 'espree',
      parserOptions: { sourceType: 'script' },
    },
    {
      files: ['vite.config.ts'],
      env: { node: true },
      extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      plugins: ['@typescript-eslint'],
    },
    {
      files: ['src/**/*.ts', 'src/**/*.tsx', 'test/**/*.ts', 'test/**/*.tsx'],
      env: { browser: true },
      extends: [
        'eslint:recommended',
        'plugin:react/recommended',
        'plugin:react-hooks/recommended',
        'plugin:react/jsx-runtime',
        'plugin:@typescript-eslint/recommended',
      ],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      plugins: ['react', '@typescript-eslint'],
      settings: {
        react: {
          version: 'detect',
        },
      },
    },
  ],
  rules: {
    'sort-imports': ['error', { ignoreDeclarationSort: true }],
    '@typescript-eslint/consistent-type-imports': 1,
    'react/prop-types': 'off',
  },
}
