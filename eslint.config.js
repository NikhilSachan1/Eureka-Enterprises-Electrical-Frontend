// @ts-check
const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');
const globals = require('globals');

module.exports = tseslint.config(
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
      ...angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    languageOptions: {
      parserOptions: {
        project: ['tsconfig.json'],
        createDefaultProgram: true,
      },
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      // Angular specific rules
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'app',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'app',
          style: 'kebab-case',
        },
      ],
      '@angular-eslint/no-empty-lifecycle-method': 'error',
      '@angular-eslint/no-input-rename': 'error',
      '@angular-eslint/no-output-native': 'error',
      '@angular-eslint/no-output-on-prefix': 'off',
      '@angular-eslint/no-output-rename': 'error',
      '@angular-eslint/use-lifecycle-interface': 'error',
      '@angular-eslint/use-pipe-transform-interface': 'error',
      '@angular-eslint/prefer-on-push-component-change-detection': 'warn',

      // TypeScript rules
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/no-inferrable-types': 'error',
      '@typescript-eslint/array-type': ['error', { default: 'array' }],
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
      '@typescript-eslint/explicit-function-return-type': 'warn',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': 'warn',
      '@typescript-eslint/prefer-optional-chain': 'warn',
      '@typescript-eslint/no-unnecessary-type-assertion': 'warn',
      '@typescript-eslint/no-empty-interface': 'error',

      // General ESLint rules
      'no-console': [
        'warn',
        { allow: ['warn', 'error', 'info', 'debug', 'group', 'groupEnd'] },
      ],
      'no-debugger': 'error',
      'no-alert': 'error',
      'no-var': 'error',
      'prefer-const': 'error',
      'prefer-arrow-callback': 'error',
      'prefer-template': 'error',
      'object-shorthand': 'error',
      'quote-props': ['error', 'as-needed'],
      'no-duplicate-imports': 'error',
      'no-useless-constructor': 'error',
      'no-useless-escape': 'off',
      'class-methods-use-this': 'off',
      'consistent-return': 'error',
      curly: 'error',
      'default-case': 'error',
      // 'dot-notation': 'error',
      eqeqeq: ['error', 'always'],
      'no-else-return': 'error',
      'no-empty-function': 'error',
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-lone-blocks': 'error',
      'no-multi-spaces': 'error',
      'no-new': 'error',
      'no-new-func': 'error',
      'no-new-wrappers': 'error',
      'no-return-await': 'error',
      'no-self-compare': 'error',
      'no-sequences': 'error',
      'no-throw-literal': 'error',
      'no-unmodified-loop-condition': 'error',
      'no-unused-expressions': 'error',
      'no-useless-call': 'error',
      'no-useless-concat': 'error',
      'prefer-promise-reject-errors': 'error',
      'prefer-destructuring': [
        'warn',
        {
          VariableDeclarator: { object: true, array: false },
          AssignmentExpression: { object: false, array: false },
        },
        { enforceForRenamedProperties: false },
      ],
      radix: 'error',
      'require-await': 'error',
      yoda: 'error',
      'no-shadow': 'error',
      'no-undef': 'error',
      'max-classes-per-file': ['warn', 1],
      'no-restricted-syntax': ['error', 'WithStatement'],
      'no-continue': 'warn',
    },
  },
  {
    files: ['**/*.html'],
    extends: [
      ...angular.configs.templateRecommended,
      ...angular.configs.templateAccessibility,
    ],
    rules: {
      // Template specific rules
      '@angular-eslint/template/alt-text': 'error',
      '@angular-eslint/template/elements-content': 'error',
      '@angular-eslint/template/label-has-associated-control': 'error',
      '@angular-eslint/template/table-scope': 'error',
      '@angular-eslint/template/valid-aria': 'error',
      '@angular-eslint/template/click-events-have-key-events': 'off',
      '@angular-eslint/template/mouse-events-have-key-events': 'error',
      '@angular-eslint/template/no-autofocus': 'error',
      '@angular-eslint/template/no-distracting-elements': 'error',
      '@angular-eslint/template/use-track-by-function': 'error',
      // '@angular-eslint/template/no-any': 'warn',
      '@angular-eslint/template/no-call-expression': 'off',
      '@angular-eslint/template/no-duplicate-attributes': 'error',
      '@angular-eslint/template/no-negated-async': 'error',
      '@angular-eslint/template/conditional-complexity': [
        'error',
        { maxComplexity: 3 },
      ],
      '@angular-eslint/template/no-interpolation-in-attributes': 'error',
      '@angular-eslint/template/banana-in-box': 'error',
    },
  }
);
