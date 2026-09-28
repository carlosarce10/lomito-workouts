/**
 * Descarga el JSON de un cliente desde public/clients/. Nunca lanza.
 *
 * Quien llama comprueba antes que el slug tiene la forma valida (isClientSlug del
 * dominio): un slug con "../" pediria otra ruta. La base es relativa, igual que el
 * build, asi que funciona en desarrollo, en la raiz de un dominio y en la subruta
 * de GitHub Pages.
 *
 * @param {string} slug Slug del cliente, ya validado.
 * @returns {Promise<{ ok: true, value: object } | { ok: false, error: 'notFound'|'loadFailed', detail?: unknown }>}
 */
export async function loadClient(slug) {
  try {
    // GitHub Pages cachea diez minutos. Con no-cache el navegador revalida por ETag
    // y un plan recien cambiado se ve al momento, sin bajar el archivo si no cambio.
    const respuesta = await fetch(`${import.meta.env.BASE_URL}clients/${slug}.json`, {
      cache: 'no-cache',
    });
    if (respuesta.status === 404) return { ok: false, error: 'notFound' };
    if (!respuesta.ok) return { ok: false, error: 'loadFailed' };
    // Un hosting con reescrituras (y Vite en desarrollo) devuelve 200 con el
    // index.html para un archivo que no existe: eso tambien es "no encontrado".
    const tipo = respuesta.headers.get('content-type') ?? '';
    if (!tipo.includes('json')) return { ok: false, error: 'notFound' };
    return { ok: true, value: await respuesta.json() };
  } catch (error) {
    return { ok: false, error: 'loadFailed', detail: error };
  }
}
