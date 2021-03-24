module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    sourceType: 'module',
  },
  plugins: ['typescript-sort-keys', 'prettier', 'jest'],
  extends: [
    'eslint:recommended',
    'airbnb-typescript/base',
    'plugin:prettier/recommended',
    'plugin:typescript-sort-keys/recommended',
    'prettier',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'import/prefer-default-export': 'off',
    'class-methods-use-this': 'off',
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/promise-function-async': 'error',
    'import/order': ['error', { alphabetize: { order: 'asc' } }],
    'jest/expect-expect': [
      'error',
      {
        assertFunctionNames: ['expect', 'request.*.expect'],
      },
    ],
    'prettier/prettier': 'error',
  },
};
