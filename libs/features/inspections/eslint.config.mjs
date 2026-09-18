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
    },
  },
  {
    files: ['**/*.html'],
    // Override or add rules here
    rules: {},
  },

  // ── Regla de dependencia de Clean Architecture (nivel carpeta) ──
  // Esta lib solo contiene domain + application (infra y presentation
  // quedan en cada app consumidora), pero las reglas se dejan completas
  // para que sigan valiendo si algún día se agrega infra/presentation aquí.
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
