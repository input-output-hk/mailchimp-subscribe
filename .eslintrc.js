module.exports =  {
  parser:  'babel-eslint',
  extends:  [
    'standard',
    'standard-react',
    'eslint:recommended',
    'plugin:import/errors',
    'plugin:import/warnings'
  ],
  plugins: [
    'jest'
  ],
  rules:  {
    'import/no-unresolved': 'error',
    'import/named': 'error',
    'import/namespace': 'error',
    'import/default': 'error',
    'import/export': 'error',
    'jest/no-disabled-tests': 'warn',
    'jest/no-focused-tests': 'error',
    'jest/no-identical-title': 'error',
    'jest/prefer-to-have-length': 'warn',
    'jest/valid-expect': 'error'
  },
  settings:  {
    'import/ignore': [ 'node_modules/*' ]
  },
  env: {
    'jest/globals': true
  }
}
