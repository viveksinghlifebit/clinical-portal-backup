module.exports = {
  env: {
    browser: true,
    es2021: true,
    jest: true
  },
  extends: [
    'standard'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module'
  },
  plugins: [
    '@typescript-eslint'
  ],
  rules: {
    'space-before-function-paren': 'off',
    'no-unused-vars': 'off',
    'no-undef': 'off',
    'no-param-reassign': [2, { props: false }],
    'prefer-const': ['error', { destructuring: 'any', ignoreReadBeforeAssign: false }],
    'no-return-await': 'error'
  }
}
