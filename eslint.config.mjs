import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import stylistic from '@stylistic/eslint-plugin';
import globals from 'globals';

export default tseslint.config(
  {
    files: ['**/*.{js,mjs,ts}'],
  },
  eslint.configs.recommended,
  stylistic.configs.recommended,
  tseslint.configs.stylisticTypeChecked,
  {
    files: ['**/*.{js,mjs,ts}'],
    ignores: ['test/**/*.{js,mjs,ts}'],
    extends: [
      tseslint.configs.strictTypeChecked,
    ],
  },
  {
    languageOptions: {
      globals: globals.node,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      'no-console': 'error',
    },
  },
  {
    rules: {
      '@stylistic/semi': ['error', 'always'],
      '@stylistic/comma-dangle': ['error', {
        arrays: 'always-multiline',
        objects: 'always-multiline',
        imports: 'always-multiline',
        exports: 'always-multiline',
        functions: 'never',
        enums: 'always-multiline',
        generics: 'never',
        tuples: 'always-multiline',
      }],
      '@stylistic/member-delimiter-style': ['error', {
        multiline: {
          delimiter: 'semi',
          requireLast: true,
        },
        singleline: {
          delimiter: 'semi',
          requireLast: false,
        },
        multilineDetection: 'brackets',
      }],
    },
  },
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', {
        args: 'all',
        argsIgnorePattern: '^_',
        caughtErrors: 'all',
        caughtErrorsIgnorePattern: '^_',
        destructuredArrayIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        ignoreRestSiblings: true,
      }],
    },
  },
  {
    ignores: ['built/*'],
  }
);
