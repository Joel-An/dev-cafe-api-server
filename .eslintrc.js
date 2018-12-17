module.exports = {
  extends: 'airbnb-base',
  rules: {
    'linebreak-style': 0,
    'no-underscore-dangle': ['error', { allow: ['_id'] }],
    'no-console': ['error', { allow: ['error'] }],
    'max-len': [
      'error',
      { code: 80, ignoreUrls: true, ignoreRegExpLiterals: true },
    ],
  },
};
