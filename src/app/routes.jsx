import { Navigate } from 'react-router';

import {
  HomePage,
  PlanDietPage,
  PlanError,
  PlanInfoPage,
  PlanLoading,
  PlanPage,
  planLoader,
  PlanRoutinesPage,
} from '@features/plan';

import AppShell from './AppShell/AppShell';

/**
 * Tabla de rutas. Es la unica fuente de verdad de que pantallas existen.
 *
 * El plan se carga en un loader y no en un efecto: la pagina recibe los datos ya
 * resueltos, el estado de carga lo pinta HydrateFallback y el de error, errorElement.
 * Sus tres pestanas son rutas hijas, para que el boton atras del movil y un enlace
 * directo funcionen: /#/<slug>, /#/<slug>/diet y /#/<slug>/info.
 */
export const routes = [
  {
    path: '/',
    Component: AppShell,
    children: [
      { index: true, Component: HomePage },
      {
        id: 'plan',
        path: ':clientSlug',
        Component: PlanPage,
        loader: planLoader,
        HydrateFallback: PlanLoading,
        errorElement: <PlanError />,
        children: [
          { index: true, Component: PlanRoutinesPage },
          { path: 'diet', Component: PlanDietPage },
          { path: 'info', Component: PlanInfoPage },
        ],
      },
      { path: '*', Component: () => <Navigate to="/" replace /> },
    ],
  },
];
