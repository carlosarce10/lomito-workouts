/**
 * Ruta publica de un fotograma de ejercicio. Es el contrato de rutas de
 * docs/content.md: `public/exercises/<id>/<frame>`, relativo a la base del sitio.
 *
 * @param {string} exerciseId Id del ejercicio.
 * @param {string} frame Nombre del fotograma, de IMAGE_FRAMES.
 * @returns {string}
 */
export const exerciseImageUrl = (exerciseId, frame) =>
  `${import.meta.env.BASE_URL}exercises/${exerciseId}/${frame}`;
