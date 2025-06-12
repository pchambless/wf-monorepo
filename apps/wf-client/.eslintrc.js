module.exports = {
  extends: [
    'react-app',
    'react-app/jest'
  ],
  plugins: [
    'unused-imports'
  ],
  ignorePatterns: [
    'build/*',
    'node_modules/*',
    'coverage/*',
    'public/*'
  ],
  rules: {
    'unused-imports/no-unused-imports': 'error',
    'unused-imports/no-unused-vars': [
      'warn',
      { 
        vars: 'all', 
        varsIgnorePattern: '^_', 
        args: 'after-used', 
        argsIgnorePattern: '^_' 
      }
    ]
  }
};
