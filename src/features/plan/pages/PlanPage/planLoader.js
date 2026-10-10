import { redirect } from 'react-router';

import { buildNutritionPlan } from '@domain/model/nutritionPlan';
import { resolvePlan } from '@domain/model/resolvePlan';
import { isClientSlug } from '@domain/validation/slugs';
import { loadClient } from '@services/content/clients';
import { LIBRARY } from '@services/content/library';
import { METHODOLOGY } from '@services/content/methodology';
import { FOODS, PLATES } from '@services/content/nutrition';

/**
 * Carga y resuelve el plan de la ruta antes de pintarla.
 *
 * Un slug con forma invalida o que no existe vuelve a la portada sin decir nada:
 * en un sitio publico, una pantalla de "no existe" seria una invitacion a probar
 * otros. Un fallo de red o un contenido roto lanza, y errorElement lo muestra.
 *
 * @param {{ params: { clientSlug: string } }} args
 * Si el plan trae recomendacion nutrimental, tambien calcula sus porciones y platos:
 * un alimento que falta es contenido roto y se trata igual que un ejercicio huerfano.
 *
 * @returns {Promise<object>} El plan resuelto, con `nutrition` o null.
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
  if (!plan.value.diet) return { ...plan.value, nutrition: null };

  const nutrition = buildNutritionPlan({ diet: plan.value.diet, foods: FOODS, plates: PLATES });
  if (!nutrition.ok) throw new Error(nutrition.error);
  return { ...plan.value, nutrition: nutrition.value };
}
