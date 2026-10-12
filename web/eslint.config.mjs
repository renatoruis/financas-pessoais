import { FlatCompat } from '@eslint/eslintrc';
import boundaries from 'eslint-plugin-boundaries';
import unicorn from 'eslint-plugin-unicorn';

const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

/** Camadas da Clean Architecture. A ordem importa: o primeiro padrão que encaixa ganha. */
const elements = [
  { type: 'domain', pattern: 'src/domain/**/*', partialMatch: false },
  { type: 'application', pattern: 'src/application/**/*', partialMatch: false },
  { type: 'composition', pattern: 'src/composition/**/*', partialMatch: false },
  { type: 'infrastructure', pattern: 'src/infrastructure/**/*', partialMatch: false },
  { type: 'ui', pattern: 'src/ui/**/*', partialMatch: false },
  { type: 'app', pattern: 'src/app/**/*', partialMatch: false },
];

const allow = (from, to) => ({
  from: { element: { type: from } },
  allow: { to: { element: { types: { anyOf: to } } } },
});

const NEXT_ENTRY_FILES = [
  'src/app/**/page.tsx',
  'src/app/**/layout.tsx',
  'src/app/**/not-found.tsx',
  'src/app/**/error.tsx',
  'src/app/**/loading.tsx',
];

const config = [
  { ignores: ['.next/**', 'node_modules/**', 'drizzle/**', 'next-env.d.ts'] },
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: { boundaries, unicorn },
    settings: {
      'boundaries/elements': elements,
      'boundaries/include': ['src/**/*'],
      // Ficheiros especiais do Next na raiz de `src`: arranque e middleware de sessão.
      'boundaries/ignore': ['src/instrumentation.ts', 'src/middleware.ts'],
      'import/resolver': { typescript: { project: './tsconfig.json' } },
    },
    rules: {
      'boundaries/dependencies': [
        'error',
        {
          default: 'disallow',
          policies: [
            allow('domain', ['domain']),
            allow('application', ['application', 'domain']),
            allow('infrastructure', ['infrastructure', 'application', 'domain']),
            allow('composition', ['infrastructure', 'application', 'domain']),
            allow('ui', ['ui', 'domain']),
            allow('app', ['app', 'ui', 'application', 'domain', 'composition']),
          ],
        },
      ],
      'unicorn/filename-case': ['error', { case: 'kebabCase' }],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      'import/no-default-export': 'error',
      'max-lines': ['error', { max: 200, skipBlankLines: true, skipComments: true }],
      'max-lines-per-function': ['error', { max: 40, skipBlankLines: true, skipComments: true }],
      'max-params': ['error', 4],
      'no-console': ['error', { allow: ['warn', 'error'] }],
      eqeqeq: 'error',
    },
  },
  {
    files: ['src/**/*.tsx'],
    rules: {
      'max-lines-per-function': ['error', { max: 120, skipBlankLines: true, skipComments: true }],
    },
  },
  {
    files: ['src/domain/**/*.ts', 'src/application/**/*.ts'],
    ignores: ['**/*.test.ts'],
    rules: {
      '@typescript-eslint/no-magic-numbers': [
        'error',
        { ignore: [-1, 0, 1, 2, 10, 100], ignoreEnums: true, ignoreReadonlyClassProperties: true },
      ],
    },
  },
  {
    files: ['src/**/*.test.ts'],
    rules: { 'max-lines-per-function': 'off', 'max-lines': ['error', 300] },
  },
  {
    files: NEXT_ENTRY_FILES,
    rules: { 'import/no-default-export': 'off' },
  },
  {
    files: ['src/infrastructure/db/*.ts'],
    rules: { 'no-console': 'off' },
  },
];

export default config;
