import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import importX from 'eslint-plugin-import-x';
import unusedImports from 'eslint-plugin-unused-imports';
import prettier from 'eslint-config-prettier/flat';
import { defineConfig, globalIgnores } from 'eslint/config';

// Este producto no guarda nada en el navegador: no hay dato del usuario que persistir.
const SIN_ALMACENAMIENTO = 'Lomito Workouts no usa almacenamiento del navegador.';

const SIN_REACT = [
  { name: 'react', message: 'src/domain y src/services no pueden importar React.' },
  { name: 'react-dom', message: 'src/domain y src/services no pueden importar React.' },
];

export default defineConfig([
  globalIgnores(['dist', 'dist-ssr', 'coverage', 'public']),

  // Archivos de configuracion y scripts del repositorio: entorno Node, sin React.
  {
    files: ['*.config.js', '.lintstagedrc.js', 'commitlint.config.js', 'scripts/**/*.mjs'],
    extends: [js.configs.recommended],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.node,
    },
  },

  // Codigo de aplicacion.
  {
    files: ['src/**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      react.configs.flat.recommended,
      react.configs.flat['jsx-runtime'],
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      jsxA11y.flatConfigs.recommended,
      importX.flatConfigs.recommended,
    ],
    plugins: { 'unused-imports': unusedImports },
    languageOptions: {
      ecmaVersion: 'latest',
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    settings: {
      react: { version: 'detect' },
      'import-x/resolver': {
        // Los alias se declaran en tres sitios que deben coincidir: vite.config.js
        // (build), jsconfig.json (editor) y aqui (lint).
        alias: {
          extensions: ['.js', '.jsx'],
          map: [
            ['@', './src'],
            ['@app', './src/app'],
            ['@content', './src/content'],
            ['@domain', './src/domain'],
            ['@features', './src/features'],
            ['@i18n', './src/i18n'],
            ['@services', './src/services'],
            ['@shared', './src/shared'],
            ['@styles', './src/styles'],
          ],
        },
        node: { extensions: ['.js', '.jsx'] },
      },
    },
    rules: {
      // Sin TypeScript, la forma de los datos la valida lint:content antes del build.
      'react/prop-types': 'off',

      // Imports muertos: se marcan como error y se autoarreglan con --fix.
      'no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'error',
        { vars: 'all', varsIgnorePattern: '^_', args: 'after-used', argsIgnorePattern: '^_' },
      ],

      // Orden de imports: un unico criterio, sin discusion en revision.
      'import-x/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          pathGroups: [
            { pattern: '@domain/**', group: 'internal', position: 'before' },
            { pattern: '@services/**', group: 'internal', position: 'before' },
            { pattern: '@content/**', group: 'internal', position: 'before' },
            { pattern: '@shared/**', group: 'internal', position: 'before' },
            { pattern: '@i18n/**', group: 'internal', position: 'before' },
            { pattern: '@features/**', group: 'internal', position: 'after' },
            { pattern: '@app/**', group: 'internal', position: 'after' },
            { pattern: '@/**', group: 'internal', position: 'after' },
          ],
          distinctGroup: false,
          pathGroupsExcludedImportTypes: ['builtin', 'external'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      'import-x/no-unresolved': 'error',
      'import-x/no-duplicates': 'error',
      'import-x/no-cycle': ['error', { maxDepth: Infinity }],

      // Ningun almacenamiento del navegador, en ningun archivo. Se vigilan las dos
      // formas de llegar a el: la propiedad de window y el global desnudo.
      'no-restricted-properties': [
        'error',
        { object: 'window', property: 'localStorage', message: SIN_ALMACENAMIENTO },
        { object: 'window', property: 'sessionStorage', message: SIN_ALMACENAMIENTO },
      ],
      'no-restricted-globals': [
        'error',
        { name: 'localStorage', message: SIN_ALMACENAMIENTO },
        { name: 'sessionStorage', message: SIN_ALMACENAMIENTO },
      ],

      // Un catch vacio oculta un fallo: prohibido.
      'no-empty': ['error', { allowEmptyCatch: false }],

      // Una feature solo se toca por su API publica, y salir de la carpeta del
      // componente con rutas relativas se hace siempre por alias. '../algo' se
      // permite: sigue siendo local y legible dentro de la feature.
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@features/*/*'],
              message: 'Importa solo la API publica de la feature: @features/<nombre>.',
            },
            {
              group: ['../../../*', '../../../../*'],
              message: 'Usa un alias: tres niveles arriba siempre sale de la carpeta.',
            },
          ],
        },
      ],
    },
  },

  // El dominio no conoce a nadie del proyecto salvo a si mismo, y sus imports
  // relativos llevan extension: los scripts de Node lo importan sin pasar por Vite.
  {
    files: ['src/domain/**/*.js'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '@features/*',
                '@shared/*',
                '@app/*',
                '@services/*',
                '@content/*',
                '@i18n/*',
                '@/*',
              ],
              message: 'src/domain no depende de ninguna otra capa.',
            },
          ],
          paths: SIN_REACT,
        },
      ],
      'import-x/extensions': ['error', 'ignorePackages', { js: 'always' }],
    },
  },

  // Los servicios son adaptadores puros: conocen Vite y fetch, no React.
  {
    files: ['src/services/**/*.js'],
    rules: {
      'no-restricted-imports': ['error', { paths: SIN_REACT }],
    },
  },

  // Debe ir el ultimo: apaga las reglas de ESLint que chocan con Prettier.
  prettier,
]);
