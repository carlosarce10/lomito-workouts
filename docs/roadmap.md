# Estado del plan

CLAUDE.md describe adonde va el proyecto. Este archivo dice por donde va.
Se actualiza en el mismo commit que cierra cada fase. El contenido de cada fase
esta en [plan.md](plan.md).

## Resumen

| Fase | Nombre              | Estado                                                        |
| ---- | ------------------- | ------------------------------------------------------------- |
| 0    | Andamiaje           | Completada                                                    |
| 1    | Dominio y contenido | Completada                                                    |
| 2    | Interfaz            | Completada                                                    |
| 3    | Imagenes            | Completada                                                    |
| 4    | Publicacion         | Lista: falta crear el repositorio, activar Pages y hacer push |
| 5    | Skill de planes     | Escrita: falta probarla en una sesion nueva                   |

## Lo que es cierto hoy

```
src/
  main.jsx                styles primero, I18nProvider, ErrorBoundary, router por hash
  app/                    routes (loader del plan) + AppShell + bootstrap/{ErrorBoundary,ErrorScreen}
  content/                exercises/<grupo>/*.json (22) + methodology.json
  domain/                 catalogs/ + schemas/ + validation/ + model/resolvePlan
  features/plan/          index.js + pages/{HomePage,PlanPage(+loader, +PlanLoading, +PlanError)}
                          + components/{ClientProfile,MethodologySection,ProgressionExample,
                            RoutineTabs,RoutineSection,RoutineExerciseCard,PrescriptionGrid,
                            MuscleBadgeList,TrackingLink}
  i18n/                   config + catalogs + format + provider + locales/es/{common,plan,catalog}
  services/content/       library (glob), methodology, clients (fetch), images (rutas)
  shared/components/      Layout, Chip, Button, Collapsible
  styles/                 las siete capas de ITCSS, copiadas de Lomito Train
public/clients/           un JSON por cliente real; el de ejemplo se retiro
public/exercises/         22 carpetas con 0.jpg y 1.jpg + ATTRIBUTION.md
scripts/                  check-classes, check-i18n, check-content, fetch-exercise-images, find-exercise
.github/workflows/        deploy.yml (GitHub Pages)
.claude/skills/           lomito-plan
```

Las reglas duras que vigila una herramienta: ESLint (alias, capas, almacenamiento,
extensiones en el dominio), Stylelint, `lint:classes` (BEMIT), `lint:i18n` (claves y
plurales) y `lint:content` (biblioteca, clientes, metodologia e imagenes). Todas
corren dentro de `npm run check`.

## Fase 0 — Andamiaje (completada)

Copiado de Lomito Train sin cambios: las siete capas de estilos, `Chip`,
`ErrorBoundary`, `check-classes.mjs`, la validacion del dominio, el catalogo de
equipamiento, el logotipo y los iconos, y toda la configuracion de calidad
(Prettier, Stylelint, ESLint, husky, lint-staged, commitlint).

Adaptado:

- `index.html`: sin script de tema ni manifest; dos `meta theme-color` por esquema;
  `noindex`; marca Lomito Workouts.
- `generic/_custom-properties.scss`: el tema sigue al sistema; fuera `data-theme`,
  `--nav-height` y `--toast-reserve`, que nadie escribe.
- `Layout`: sin barra inferior; cabecera con logotipo, wordmark y tagline; pie con la
  firma.
- `Button`: prop `as` para enlaces y 44 px de alto en la talla `md` (media 40).
- i18n: un idioma; `I18nProvider` sin repositorio de ajustes; `format` sin pesos ni
  fechas relativas; `check-i18n.mjs` sin paridad entre idiomas ni codigos de
  validacion.
- ESLint: alias `@content`, almacenamiento prohibido sin excepcion, extension `.js`
  obligatoria en `src/domain/`, scripts de Node linteados.
- Vite: sin PWA. Ambitos de commit propios.

Verificado en navegador (375 px, claro y oscuro):

| Comprobacion                 | Resultado                                      |
| ---------------------------- | ---------------------------------------------- |
| Orden de capas CSS           | `.c-layout__content` con padding de 16 px      |
| Tema del sistema             | fondo `#eff6ff` en claro y `#0b1220` en oscuro |
| `data-theme` en el raiz      | no existe                                      |
| Almacenamiento del navegador | vacio                                          |
| Wordmark                     | `--accent-text` en los dos temas               |
| Consola y red                | 0 errores, 0 peticiones fallidas               |
| Ancho del documento          | 375 px, sin scroll horizontal                  |

## Fase 1 — Dominio y contenido (completada)

Catalogos de musculos (16 musculos en 11 grupos, que son las carpetas de la
biblioteca), equipamiento (el de Lomito Train), niveles, objetivos y proveedores de
imagen. `validate.js` de Lomito Train mas `__min`/`__max` para listas; `rules.js` mas
`slug`, `plainDate`, `range`, `listOfText` y `source`. Esquemas de ejercicio, cliente
y metodologia. `resolvePlan` hidrata referencias, aplica los valores por defecto y
deriva ordinal, frecuencia y musculos de cada rutina.

Contenido: 22 ejercicios con instrucciones y errores comunes en espanol (borrador
para revision del entrenador), la metodologia con seis secciones y el ejemplo de
progresion, y el cliente de ejemplo `juan-7k2p` con cuatro rutinas.

`scripts/check-content.mjs` importa el dominio desde Node: por eso en `src/domain/`
los imports relativos llevan `.js`. Lo impone ESLint.

Verificado desde Node con el cliente de ejemplo:

| Comprobacion               | Resultado                                                    |
| -------------------------- | ------------------------------------------------------------ |
| Frecuencia derivada        | 4                                                            |
| Valores por defecto        | 2 series, RIR 1-2, 120-180 s, 1 serie de aproximacion        |
| Override por ejercicio     | `warmupSets: 0`, `restSeconds: 60-90`, `warmupSets: 2`       |
| Musculos derivados de Push | chest-upper, chest, shoulders-front, shoulders-side, triceps |
| `exerciseId` huerfano      | `{ ok: false, error: 'orphanExercise' }`                     |

Pruebas negativas de `lint:content`, cada una con ruta y motivo y de vuelta a verde
al deshacer: `exerciseId` huerfano, archivo en carpeta equivocada, rango con `min`
mayor que `max`, slug sin sufijo y campo prohibido `weight`.

## Fase 2 — Interfaz (completada)

El plan se carga en un `loader` de react-router: la pagina recibe los datos
resueltos, `HydrateFallback` pinta la carga y `errorElement` el fallo. Un slug
invalido o inexistente vuelve a la portada sin decir nada.

Verificado en navegador (375 px, claro y oscuro):

| Comprobacion                                   | Resultado                                                           |
| ---------------------------------------------- | ------------------------------------------------------------------- |
| Orden de secciones                             | volver, perfil, metodologia plegada, pestanas, rutina, Lomito Train |
| Pestanas                                       | cambian la rutina y `aria-pressed`; nombre accesible "Dia 3 Pull"   |
| Plegables                                      | cerrados por defecto en el plan, abiertos en la portada             |
| Areas tactiles                                 | volver 44, pestanas 45, resumenes 44, enlace 44 px                  |
| Foco con teclado                               | anillo `solid 2px`, `:focus-visible`                                |
| Ancho del documento                            | 375 px, sin scroll horizontal                                       |
| `/#/JUAN-7K2P`, `/#/juan`, `/#/no-existe-1234` | vuelven a `/#/`                                                     |
| Sin red al cargar el cliente                   | pantalla de error dentro del layout, con Reintentar                 |
| Recarga en `/#/juan-7k2p`                      | conserva el plan                                                    |
| Oscuro                                         | cifras y pestana activa en `--accent-text` (`#93c5fd`)              |
| Estilos en linea                               | solo los tamanos de los iconos MDI                                  |

Defectos propios que destapo la verificacion, no el build:

1. **Las fechas salian un dia antes.** `new Date('2026-09-28')` es medianoche UTC y
   en America es el dia anterior. `formatDate` construye las fechas de calendario en
   hora local.
2. **Un slug con forma valida que no existe mostraba error en lugar de volver a la
   portada.** Vite en desarrollo, y cualquier hosting con reescrituras, responde 200
   con el `index.html`. `loadClient` trata una respuesta que no es JSON como "no
   encontrado".
3. **El nombre accesible de las pestanas concatenaba "Dia 1Push".** Un espacio entre
   los dos spans.
4. **"Principiante" se partia por la mitad.** Tres columnas iguales en 375 px no
   caben; las estadisticas del perfil son una fila que envuelve.

## Fase 3 — Imagenes (completada)

`npm run images` descarga los dos fotogramas de cada ejercicio con `source` a
`public/exercises/<id>/`, comprueba que son JPEG, los reduce a 640 px con `sips`
(macOS) y escribe `ATTRIBUTION.md`. Es idempotente: la segunda ejecucion no descarga
nada. Desde esta fase una imagen que falta es un error de `lint:content`.

| Comprobacion                  | Resultado                                           |
| ----------------------------- | --------------------------------------------------- |
| Archivos                      | 44 en 22 carpetas, 640 por 427, 3,1 MB en total     |
| Carga diferida                | 6 imagenes de la rutina visible cargadas, 8 pedidas |
| Hosts externos                | 0 peticiones fuera del sitio (salvo Google Fonts)   |
| Imagen que falla              | icono de respaldo en su lugar, sin imagen rota      |
| Segunda ejecucion de `images` | 0 descargas                                         |

## Fase 4 — Publicacion (lista para el primer push)

`.github/workflows/deploy.yml` construye con `npm run check` y despliega `dist/` a
GitHub Pages en cada push a `main`. Versiones de las actions comprobadas contra sus
releases al escribirlo.

Verificado el build servido bajo `/lomito-workouts/` con un servidor estatico: los
assets, el favicon y las imagenes resuelven bajo la subruta, la recarga conserva el
plan y no hay ninguna peticion fallida. La imagen social apunta a `VITE_SITE_URL`.

Pendiente, a mano: crear el repositorio `carlosarce10/lomito-workouts`, Settings >
Pages > Source "GitHub Actions", primer push, y comprobar en un movil real la URL
del plan y la vista previa del enlace.

## Fase 5 — Skill de planes (escrita)

`.claude/skills/lomito-plan/SKILL.md` y `scripts/find-exercise.mjs` (busca ids en
free-exercise-db). Pendiente: probar en una sesion nueva "crea el plan de Ana,
principiante, hipertrofia, 3 dias full body, solo mancuernas" y comprobar que deja
`check` en verde sin commitear.

## Despues del MVP — Exportacion a Lomito Train (completada)

El cliente descarga su plan y lo importa en Lomito Train, que lo fusiona con sus datos
sin borrar nada. Formato, reglas y verificacion de extremo a extremo en
[tracking-export.md](tracking-export.md). Requiere la version de Lomito Train con
`planImport`: la anterior rechaza el archivo sin tocar nada.

## Cliente de ejemplo retirado

El plan de demostracion `juan-7k2p` se retiro: incumplia la metodologia de
programacion que se fijo despues (tres ejercicios de pecho en un dia, tres patrones de
sentadilla en el de pierna, rangos de 12 a 15). Las verificaciones de las fases 1 a 4
se hicieron con el y siguen siendo validas: el codigo no depende de ningun cliente.

## Deuda conocida

| Deuda                                                                  | Fase que la cierra            |
| ---------------------------------------------------------------------- | ----------------------------- |
| La imagen social es la de Lomito Train (mismo logotipo, otro nombre)   | Backlog                       |
| Las estadisticas del perfil ocupan dos filas en 375 px                 | Cosmetico, backlog            |
| Los textos de los 22 ejercicios son borrador: los revisa el entrenador | Antes del primer cliente real |

## Backlog

1. PWA sin conexion: copiar `vite-plugin-pwa`, manifest e iconos de Lomito Train.
2. Boton de tema (requiere guardar la preferencia).
3. Locale `en`.
4. Imagenes o videos propios; WebP.
5. Modo compacto de tarjeta.
6. Vista de impresion.
7. Imagen social propia; duracion estimada por rutina.
