import { Navigate } from 'react-router';

import { HomePage, PlanError, PlanLoading, PlanPage, planLoader } from '@features/plan';

import AppShell from './AppShell/AppShell';

/**
 * Tabla de rutas. Es la unica fuente de verdad de que pantallas existen.
 *
 * El plan se carga en un loader y no en un efecto: la pagina recibe los datos ya
 * resueltos, el estado de carga lo pinta HydrateFallback y el de error, errorElement.
 */
export const routes = [
  {
    path: '/',
    Component: AppShell,
    children: [
      { index: true, Component: HomePage },
      {
        path: ':clientSlug',
        Component: PlanPage,
        loader: planLoader,
        HydrateFallback: PlanLoading,
        errorElement: <PlanError />,
      },
      { path: '*', Component: () => <Navigate to="/" replace /> },
    ],
  },
];
