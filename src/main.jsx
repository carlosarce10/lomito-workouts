// El sistema de estilos se importa ANTES que cualquier componente, y el orden
// importa de verdad: Vite inyecta el CSS de cada .scss co-locado en el orden en que
// se importa su modulo. Si un componente entra primero, el navegador ve un
// "@layer components" antes de que _layers.scss haya declarado el orden de las
// capas, y una capa ya creada no se puede reordenar: el reset acaba ganandole a los
// componentes y se pierde todo el espaciado. Verificado en pantalla en Lomito Train.
//

import './styles/main.scss';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createHashRouter, RouterProvider } from 'react-router';

import ErrorBoundary from './app/bootstrap/ErrorBoundary/ErrorBoundary';
import ErrorScreen from './app/bootstrap/ErrorScreen/ErrorScreen';
import { routes } from './app/routes';
import I18nProvider from './i18n/I18nProvider/I18nProvider';

// Enrutado por hash y no por historial: la aplicacion se sirve como estatico en
// GitHub Pages, y un hosting sin reescrituras devolveria 404 al recargar en /<slug>.
const router = createHashRouter(routes);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <I18nProvider>
      <ErrorBoundary fallback={() => <ErrorScreen />}>
        <RouterProvider router={router} />
      </ErrorBoundary>
    </I18nProvider>
  </StrictMode>,
);
