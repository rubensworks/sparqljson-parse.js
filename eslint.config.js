const config = require('@rubensworks/eslint-config');

module.exports = config([
  {
    files: [ '**/*.ts' ],
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: [ './tsconfig.eslint.json' ],
      },
    },
  },
  {
    ignores: [
      'README.md',
      'node_modules/**',
      'coverage/**',
      '**/*.js',
      '**/*.d.ts',
      '**/*.js.map',
    ],
  },
  {
    files: [ '**/*.ts' ],
    rules: {
      // Disabled due to incompatibility with TypeScript 6.x AST
      'ts/lines-between-class-members': 'off',
      // Requires strictNullChecks compiler option which is not enabled
      'ts/prefer-nullish-coalescing': 'off',
      // Project uses require() for CJS modules without type declarations
      'ts/no-require-imports': 'off',
      'ts/no-var-requires': 'off',
      // JSON parsing involves dynamic any types throughout
      'ts/no-unsafe-assignment': 'off',
      'ts/no-unsafe-return': 'off',
      'ts/no-unsafe-argument': 'off',
      // Allow UPPER_CASE static constants and PascalCase constructor variables
      'ts/naming-convention': [
        'error',
        {
          selector: 'default',
          format: [ 'camelCase' ],
          leadingUnderscore: 'forbid',
          trailingUnderscore: 'forbid',
        },
        {
          selector: 'import',
          format: null,
        },
        {
          selector: 'variable',
          format: [ 'camelCase', 'UPPER_CASE', 'PascalCase' ],
          leadingUnderscore: 'forbid',
          trailingUnderscore: 'forbid',
        },
        {
          selector: 'parameter',
          format: [ 'camelCase' ],
          leadingUnderscore: 'allow',
          trailingUnderscore: 'forbid',
        },
        {
          selector: 'classProperty',
          format: [ 'camelCase', 'UPPER_CASE' ],
          leadingUnderscore: 'forbid',
          trailingUnderscore: 'forbid',
        },
        {
          selector: 'typeLike',
          format: [ 'PascalCase' ],
        },
        {
          selector: [ 'typeParameter' ],
          format: [ 'PascalCase' ],
          prefix: [ 'T' ],
        },
        {
          selector: 'interface',
          format: [ 'PascalCase' ],
          custom: {
            regex: '^I[A-Z]',
            match: true,
          },
        },
        {
          // SPARQL variable names (?book), XML namespaced keys (xml:lang) cannot follow camelCase
          selector: 'objectLiteralProperty',
          format: null,
        },
      ],
    },
  },
  {
    files: [ '**/test/**/*.ts' ],
    rules: {
      // Tests use return-based promise pattern
      'jest/no-test-return-statement': 'off',
      'jest/prefer-expect-resolves': 'off',
      'jest/require-to-throw-message': 'off',
      'import/no-nodejs-modules': 'off',
    },
  },
]);
