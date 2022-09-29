module.exports = {
  'env': {
    'browser': true,
    'es2021': true
  },
  'extends': [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier'
  ],
  'overrides': [
  ],
  'settings': {
    'react': {
      'version': 'detect'
    }
  },
  'parser': '@typescript-eslint/parser',
  'parserOptions': {
    'ecmaVersion': 'latest',
    'project': 'tsconfig.json',
    'sourceType': 'module'
  },
  'plugins': [
    'react',
    '@typescript-eslint',
    'prettier'
  ],
  'rules': {
    'prettier/prettier': 'error',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/prefer-nullish-coalescing': 'warn'
  }
};
