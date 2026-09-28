# Estilos: ITCSS, BEMIT y tema

El sistema de estilos es el de Lomito Train, copiado sin cambios salvo la emision
del tema. Este documento resume lo que hace falta para trabajar aqui; la historia
completa y las mediciones de contraste estan en `../lomito-train/docs/styles.md`.

## Las siete capas

Orden de cascada, de menor a mayor especificidad. Lo garantiza `@layer` nativo de
CSS, declarado en `src/styles/_layers.scss`, no el orden de importacion.

| Capa         | Emite CSS | Contenido                                                        |
| ------------ | --------- | ---------------------------------------------------------------- |
| 1 settings   | No        | Escalas, breakpoints, mapas de tokens                            |
| 2 tools      | No        | Mixins y funciones                                               |
| 3 generic    | Si        | Reset y la emision de las custom properties                      |
| 4 elements   | Si        | Etiquetas desnudas: `body`, titulos, `input`. Aqui vive el fondo |
| 5 objects    | Si        | Patrones de maquetacion sin identidad visual, prefijo `o-`       |
| 6 components | Si        | Co-locados junto al `.jsx`, prefijo `c-`                         |
| 7 utilities  | Si        | Anulaciones de una sola propiedad, prefijo `u-`                  |

Un componente consume una sola cosa: `@use 'styles/foundation' as *;`, que reexporta
settings y tools. `src/styles/main.scss` es el unico punto de entrada global y va en
la primera linea de `src/main.jsx`.

## BEMIT

El bloque coincide siempre con el nombre del archivo y del componente:
`RoutineExerciseCard.jsx`, `RoutineExerciseCard.scss`, `.c-routine-exercise-card`.
Lo vigila `npm run lint:classes`.

| Prefijo       | Significa                                                         |
| ------------- | ----------------------------------------------------------------- |
| `o-`          | Objeto de maquetacion, reutilizable, sin identidad visual         |
| `c-`          | Componente                                                        |
| `u-`          | Utilidad. Anula una sola propiedad                                |
| `is-`, `has-` | Estado temporal. Nunca se estiliza suelto: siempre `.c-x.is-open` |
| `js-`         | Gancho de JavaScript. No lleva estilos jamas                      |

Vocabulario cerrado de estados: `is-selected`, `is-active`, `is-open`, `is-loading`.
El estado abierto de un `details` se estiliza con el atributo `[open]`, sin clase.

## Tokens en dos niveles

Primitivos: la escala de color cruda en `settings/_tokens.scss`. No se consumen en
los componentes. Semanticos: describen un rol y son los unicos que se consumen:
`--bg`, `--surface`, `--text`, `--text-secondary`, `--text-muted`, `--border`,
`--accent`, `--accent-text`, `--accent-subtle`, `--danger`, `--success`, `--focus`,
las sombras y el vidrio.

Relleno y texto no son intercambiables. `--accent` es un relleno (boton primario);
`--accent-text` es el texto sobre superficie. `--accent` como texto en oscuro da
4,14:1 y no pasa AA. Lo mismo para `--danger`/`--danger-text` y
`--success`/`--success-text`.

Ningun hex ni `rgba()` fuera de `src/styles/settings/`. Si un dato manda un color
(el grupo muscular de un chip), se inyecta como custom property desde el JSX y el
SCSS decide como usarla.

## Tema

Dos mapas, `light` y `dark`, en `settings/_tokens.scss`. Los emite una sola vez
`generic/_custom-properties.scss`: `:root` con el claro y, dentro de
`@media (prefers-color-scheme: dark)`, el oscuro. No hay `data-theme`, conmutador ni
preferencia guardada: el tema sigue al sistema. `index.html` lleva dos
`meta theme-color` con `media` para que la barra del navegador haga lo mismo.

## Mixins que se usan

`glass-card`, `glass-card-strong` (tarjetas de vidrio con respaldo opaco cuando no
hay `backdrop-filter`), `touch-target` y `touch-target-extended` (44 px), `flex-*`,
`text-truncate`, `hide-scrollbar` y `respond-to(sm|md|lg)`, que es siempre
`min-width`: movil primero.

Objetos: `.o-control` (control de icono de 44 px) y `.o-scroll-x` (fila con scroll
horizontal y barra oculta, la de las pestanas de rutina).
