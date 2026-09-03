import nx from '@nx/eslint-plugin';
import baseConfig from '../../../eslint.config.mjs';

export default [
  ...nx.configs['flat/angular'],
  ...nx.configs['flat/angular-template'],
  ...baseConfig,
  {
    files: ['**/*.ts'],
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'lib',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'lib',
          style: 'kebab-case',
        },
      ],
    },
  },
  {
    files: ['**/*.html'],
    // Override or add rules here
    rules: {},
  },

  // ── Regla de dependencia de Clean Architecture (nivel carpeta) ──
  // @nx/enforce-module-boundaries solo actúa ENTRE proyectos, no entre
  // carpetas, así que el capado interno lo hace no-restricted-imports.
  {
    files: ['**/domain/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            '**/application/**',
            '**/infrastructure/**',
            '**/presentation/**',
            '@angular/*',
          ],
        },
      ],
    },
  },
  {
    files: ['**/application/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        { patterns: ['**/infrastructure/**', '**/presentation/**'] },
      ],
    },
  },
  {
    files: ['**/infrastructure/**/*.ts'],
    rules: {
      'no-restricted-imports': ['error', { patterns: ['**/presentation/**'] }],
    },
  },
];
