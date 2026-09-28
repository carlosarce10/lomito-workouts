import { redirect } from 'react-router';

import { resolvePlan } from '@domain/model/resolvePlan';
import { isClientSlug } from '@domain/validation/slugs';
import { loadClient } from '@services/content/clients';
import { LIBRARY } from '@services/content/library';
import { METHODOLOGY } from '@services/content/methodology';

/**
 * Carga y resuelve el plan de la ruta antes de pintarla.
 *
 * Un slug con forma invalida o que no existe vuelve a la portada sin decir nada:
 * en un sitio publico, una pantalla de "no existe" seria una invitacion a probar
 * otros. Un fallo de red o un contenido roto lanza, y errorElement lo muestra.
 *
 * @param {{ params: { clientSlug: string } }} args
 * @returns {Promise<object>} El plan resuelto.
 */
export async function planLoader({ params }) {
  if (!isClientSlug(params.clientSlug)) throw redirect('/');

  const cliente = await loadClient(params.clientSlug);
  if (!cliente.ok) {
    if (cliente.error === 'notFound') throw redirect('/');
    throw new Error(cliente.error);
  }

  const plan = resolvePlan({ client: cliente.value, library: LIBRARY, methodology: METHODOLOGY });
  if (!plan.ok) throw new Error(plan.error);
  return plan.value;
}
