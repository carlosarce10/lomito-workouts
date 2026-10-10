import { useRouteLoaderData } from 'react-router';

/** Plan resuelto del cliente de la ruta, tal como lo deja planLoader. */
export default function usePlan() {
  return useRouteLoaderData('plan');
}
