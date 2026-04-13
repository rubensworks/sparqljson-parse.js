require("@rushstack/eslint-patch/modern-module-resolution");

module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ['./tsconfig.eslint.json'],
  },
  extends: [
    '@rubensworks'
  ],
  rules: {
    // Disabled due to incompatibility with TypeScript 6.x AST
    '@typescript-eslint/lines-between-class-members': 'off',
    // Disabled because TypeScript exports are often inline with their declarations
    'import/group-exports': 'off',
    // Allow require() calls for CJS modules without type declarations
    'import/no-commonjs': 'off',
  },
  overrides: [
    {
      files: [ '**/test/**/*.ts' ],
      rules: {
        'import/no-unassigned-import': 'off',
        'import/no-nodejs-modules': 'off',
        'mocha/no-return-from-async': 'off',
      },
    },
  ],
};
