import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';

/** Resuelve una ruta dentro de src/ a partir de este archivo. */
const src = (path) => fileURLToPath(new URL(`./src/${path}`, import.meta.url));

export default defineConfig({
  // Rutas relativas en el build: con enrutado por hash, index.html es siempre la
  // entrada, asi que el dist funciona igual en la raiz de un dominio que en la
  // subruta de GitHub Pages, sin tener que saber donde se va a publicar.
  base: './',
  plugins: [react()],
  resolve: {
    // Vite solo sustituye cuando el id es igual a la clave o empieza por clave + '/',
    // asi que '@' no captura '@shared/...' y el orden no importa. Los alias se
    // declaran en tres sitios que deben coincidir: aqui (build), jsconfig.json
    // (editor) y eslint.config.js (lint).
    alias: {
      '@': src(''),
      '@app': src('app'),
      '@content': src('content'),
      '@domain': src('domain'),
      '@features': src('features'),
      '@i18n': src('i18n'),
      '@services': src('services'),
      '@shared': src('shared'),
      '@styles': src('styles'),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        // Permite "@use 'styles/foundation'" desde cualquier profundidad. Se usa
        // loadPaths y no additionalData: additionalData inyecta el mismo codigo en
        // cada archivo compilado.
        loadPaths: [src('')],
      },
    },
  },
  server: {
    host: true,
    port: 5173,
  },
});
