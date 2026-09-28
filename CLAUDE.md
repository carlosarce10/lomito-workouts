# CLAUDE.md

Contexto permanente de Lomito Workouts. Se lee antes de tocar nada.
El porque y el para quien no estan aqui: estan en [PRODUCT.md](PRODUCT.md).

## 1. Que es Lomito Workouts

Entrega de planes de entrenamiento personalizados por web movil. El cliente abre un
enlace privado y ve su perfil, la metodologia y sus rutinas con tarjetas de ejercicio.
Solo planifica y explica: el seguimiento (pesos, repeticiones, historial) vive en
Lomito Train y no se duplica aqui.

Sin backend, sin base de datos, sin cuentas y sin localStorage. El contenido es JSON
dentro del repositorio: la biblioteca de ejercicios y la metodologia en `src/content/`,
un archivo por cliente en `public/clients/`. Se publica como sitio estatico.

Es un clon adaptado de Lomito Train (`../lomito-train`): mismo sistema de estilos,
mismos componentes base, mismo tooling y mismas convenciones. Ante una duda que este
archivo no cubra, manda el CLAUDE.md de Lomito Train.

## 2. Comandos

| Comando                | Que hace                                                               |
| ---------------------- | ---------------------------------------------------------------------- |
| `npm run dev`          | Servidor de desarrollo en el puerto 5173, accesible desde la red local |
| `npm run build`        | Build de produccion en `dist/`                                         |
| `npm run preview`      | Sirve el build de produccion                                           |
| `npm run lint`         | ESLint sobre todo el repositorio                                       |
| `npm run lint:css`     | Stylelint sobre `src/**/*.scss`                                        |
| `npm run lint:classes` | Cruza las clases BEMIT del JSX contra los selectores del SCSS          |
| `npm run lint:i18n`    | Claves de traduccion usadas, declaradas y plurales completos           |
| `npm run lint:content` | Valida biblioteca, clientes, metodologia e imagenes (desde la fase 1)  |
| `npm run images`       | Descarga las imagenes de la biblioteca a `public/exercises/` (fase 3)  |
| `npm run format`       | Prettier en modo escritura                                             |
| `npm run check`        | Formato, lints, contenido y build. **Puerta unica antes de commitear** |

`npm run check` tiene que pasar en verde antes de cada commit. El hook de pre-commit
solo revisa los archivos preparados; `check` revisa el proyecto entero.

## 3. Stack y decisiones tecnicas

React con Vite, Sass e iconos Material Design (`@mdi/js` + `@mdi/react`). Las
versiones exactas estan en `package.json` y no se copian aqui.

| Decision                             | Motivo                                                                                    |
| ------------------------------------ | ----------------------------------------------------------------------------------------- |
| Sin TypeScript                       | La forma de los JSON la valida `lint:content` en cada `check`; el runtime no valida       |
| Sass con `@use`                      | `@import` esta obsoleto en Sass. Nunca se usa                                             |
| Sin localStorage ni backend          | No hay dato del usuario que guardar: el plan es de solo lectura                           |
| Tema del sistema, sin conmutador     | Sin preferencia que persistir no hace falta almacenamiento ni `data-theme`                |
| Clientes por `fetch` desde `public/` | Con `import.meta.glob` el mapa de chunks expondria todos los slugs en el bundle principal |
| Imagenes descargadas y versionadas   | Ninguna dependencia de un host externo en tiempo de ejecucion                             |
| Enrutado por hash                    | GitHub Pages no reescribe URLs: recargar en `/<slug>` devolveria 404                      |

## 4. Vocabulario canonico

Una sola palabra por concepto, la misma en codigo, carpetas, clases CSS, claves de
traduccion y ambitos de commit. La columna "codigo" manda.

| Concepto                                           | Codigo                     | Etiqueta es      |
| -------------------------------------------------- | -------------------------- | ---------------- |
| Persona que recibe el plan                         | `client`                   | Cliente          |
| Identificador de URL del cliente (= archivo)       | `slug`                     |                  |
| Lo que ve el cliente: perfil, rutinas, metodologia | `plan`                     | Plan             |
| Sesion de un dia, grupo de ejercicios              | `routine`                  | Rutina, "Dia N"  |
| Posicion de la rutina, derivada del indice         | `ordinal`                  | Dia N            |
| Ejercicio prescrito dentro de una rutina           | `routineExercise`          |                  |
| Entrada de la biblioteca                           | `exercise`                 | Ejercicio        |
| Biblioteca reutilizable de ejercicios              | `library`                  | Biblioteca       |
| Musculo (catalogo, con `group` = carpeta)          | `muscle`, `muscleIds`      | Musculo          |
| Equipamiento (catalogo, el de Lomito Train)        | `equipment`, `equipmentId` | Equipamiento     |
| Nivel (catalogo)                                   | `level`, `levelId`         | Nivel            |
| Objetivo (catalogo)                                | `goal`, `goalId`           | Objetivo         |
| Dias por semana, derivado de `routines.length`     | `frequency`                | Frecuencia       |
| Series de aproximacion (entero)                    | `warmupSets`               | Aproximacion     |
| Series efectivas (entero)                          | `sets`                     | Series efectivas |
| Rango de repeticiones                              | `reps`                     | Repeticiones     |
| Rango de repeticiones en reserva                   | `rir`                      | RIR              |
| Rango de descanso en segundos                      | `restSeconds`              | Descanso         |
| Objeto `{ min, max }`                              | `range`                    | "8-12"           |
| Pasos de ejecucion                                 | `instructions`             | Como hacerlo     |
| Errores frecuentes                                 | `commonMistakes`           | Errores comunes  |
| Nota del entrenador                                | `notes`                    | Observaciones    |
| Fechas del plan                                    | `startDate`, `reviewDate`  | Inicio, Revision |
| Texto educativo y valores por defecto              | `methodology`              | Como entrenar    |
| Origen de las imagenes de un ejercicio             | `source`                   | Fuente           |
| Enlace a Lomito Train                              | `tracking`                 | Seguimiento      |

Palabras prohibidas y su sustituto:

| Prohibido                                                                                | Se usa                            |
| ---------------------------------------------------------------------------------------- | --------------------------------- |
| `day`, `workoutDay`, `dayNumber`                                                         | `routine`; el numero es `ordinal` |
| `program`                                                                                | `client.routines`                 |
| `category`, `muscleGroup`                                                                | `muscleIds`                       |
| `rest` a secas                                                                           | `restSeconds`                     |
| `serie` en identificadores                                                               | `set`                             |
| `weight`, `record`, `session`, `history`, `timer`, `log`, `settings`, `theme`, `storage` | No existen en el producto         |

Si un concepto no esta en esta tabla, se anade a la tabla antes de escribir la
primera linea de codigo.

## 5. Donde va cada cosa

| Voy a anadir                                          | Va en                                                               |
| ----------------------------------------------------- | ------------------------------------------------------------------- |
| Una pantalla                                          | `src/features/plan/pages/`                                          |
| Un componente que conoce el dominio                   | `src/features/plan/components/`                                     |
| Un componente generico (boton, chip, plegable)        | `src/shared/components/`                                            |
| Una regla de negocio (resolver el plan)               | `src/domain/model/`                                                 |
| Una lista fija de valores                             | `src/domain/catalogs/`                                              |
| La forma de un JSON y sus limites                     | `src/domain/schemas/` y `src/domain/validation/limits.js`           |
| Un ejercicio de la biblioteca                         | `src/content/exercises/<grupo>/<id>.json`                           |
| Un cliente                                            | `public/clients/<slug>.json`                                        |
| El texto de la metodologia y sus valores por defecto  | `src/content/methodology.json`                                      |
| Texto de interfaz                                     | `src/i18n/locales/es/<namespace>.json`                              |
| Un color, un radio, una sombra, un espaciado          | `src/styles/settings/`                                              |
| El acceso al contenido (glob, fetch, rutas de imagen) | `src/services/content/`                                             |
| Una imagen de ejercicio                               | `public/exercises/<id>/`. La escribe `npm run images`, nunca a mano |
| Un icono, favicon o imagen social                     | `public/`, por URL fija                                             |
| Una imagen que consume un componente                  | `src/assets/`, importada para que Vite le ponga hash                |
| La URL publica del sitio                              | `.env`, en `VITE_SITE_URL`. La consume `index.html` para Open Graph |

Anatomia obligatoria de la feature: `index.js` como unica API publica, mas `pages/`,
`components/` y `hooks/`. Dentro de una feature no hay `constants/`, `services/`,
`styles/` ni `utils/`: esos van a la capa que les corresponde.

Barrel files: solo `src/features/plan/index.js` y `src/domain/catalogs/index.js`.
Nunca en `components/`, `hooks/` ni `shared/`, porque crean ciclos y rompen el
aislamiento de HMR de Vite.

## 6. Direccion de las dependencias

```
app -> features -> { shared, domain, services, i18n }
services -> nada del proyecto (conoce Vite y fetch, devuelve { ok })
domain   -> nada del proyecto salvo domain
shared   -> nada del proyecto salvo shared
```

Esto no es una recomendacion: lo impone ESLint.

En `src/domain/` los imports relativos llevan extension `.js`. Los scripts de Node
(`lint:content`, `images`) importan el dominio sin pasar por Vite, y Node no resuelve
`'./rules'` sin extension. Tambien lo impone ESLint.

## 7. Modelo de contenido

Tres fuentes, todas JSON: la biblioteca (`src/content/exercises/<grupo>/<id>.json`,
entra al bundle), la metodologia (`src/content/methodology.json`) y los clientes
(`public/clients/<slug>.json`, se sirven tal cual y se cargan con `fetch`).

Invariantes que impone `lint:content` y ninguna escritura puede romper:

1. El nombre del archivo de un ejercicio es su `id`, y su carpeta es el grupo de
   `muscleIds[0]`. El `id` es unico en toda la biblioteca.
2. Todo `exerciseId` de un cliente existe en la biblioteca y no se repite dentro de
   una rutina.
3. `muscleIds`, `equipmentId`, `levelId`, `goalId` y `source.provider` existen en su
   catalogo.
4. Los rangos cumplen `min <= max` y los limites de `limits.js`.
5. El archivo de un cliente se llama `<nombre>-<4 caracteres>` y solo lleva nombre de
   pila o apodo.
6. Ningun campo de seguimiento: `weight`, `record`, `history`, `session`, `timer`,
   `log`, ni `day`, `category` o `program`.
7. Un ejercicio con `source` tiene `public/exercises/<id>/0.jpg` y `1.jpg`.

El runtime no valida forma. `resolvePlan` solo resuelve referencias y aplica los
valores por defecto de la metodologia; un `exerciseId` huerfano devuelve
`{ ok: false }` y la pagina muestra un estado de error, nunca una pantalla en blanco.
Detalle en [docs/content.md](docs/content.md).

## 8. Estilos

ITCSS con siete capas: settings, tools, generic, elements, objects, components,
utilities. El orden de la cascada lo fija `@layer` nativo en `src/styles/_layers.scss`,
no el orden de importacion.

Las capas 1 a 5 y la 7 viven en `src/styles/`. La 6 se queda junto al componente y
cada archivo se declara a si mismo dentro de `@layer components`.

Un componente consume una sola cosa: `@use 'styles/foundation' as *;`, que reexporta
settings y tools, las dos capas que no emiten CSS. Un componente nunca importa
generic, elements, objects ni utilities.

`src/styles/main.scss` es el unico punto de entrada global y lo importa `src/main.jsx`
en su primera linea, antes que cualquier componente. Si un componente entra antes, su
`@layer components` se crea antes que `_layers.scss` y el reset le gana: se pierde
todo el espaciado.

Nomenclatura BEMIT: `RoutineExerciseCard.jsx` usa su `RoutineExerciseCard.scss` y su
bloque es `.c-routine-exercise-card`. Prefijos: `o-` objetos, `c-` componentes, `u-`
utilidades, `is-`/`has-` estados, `js-` ganchos de JavaScript sin estilos.
Vocabulario cerrado de estados: `is-selected`, `is-active`, `is-open`, `is-loading`.

Todo color es una custom property de rol semantico, declarada en los dos mapas de
`settings/_tokens.scss` y emitida una sola vez desde `generic/_custom-properties.scss`.
Los tokens de relleno y los de texto no son intercambiables: `--accent` es un relleno
y `--accent-text` es el texto sobre superficie. Usar el relleno como texto en modo
oscuro da 4,14:1 y no pasa AA.

El tema sigue al sistema con `prefers-color-scheme`. No hay `data-theme`, conmutador
ni persistencia. Detalle en [docs/styles.md](docs/styles.md).

## 9. Internacionalizacion

Un idioma, espanol, con el mecanismo de Lomito Train recortado. Tres namespaces:
`common`, `plan`, `catalog`. Convencion de claves: `namespace.componente.concepto`, en
minusculas y separadas por puntos. Nunca la frase como clave.

Los catalogos guardan ids; las etiquetas viven en `catalog.*`. El contenido editorial
(ejercicios, metodologia, clientes) no pasa por i18n: vive en JSON de contenido.

Numeros y fechas pasan siempre por `src/i18n/format`. Nunca se instancia `Intl` con un
locale literal. Los plurales se resuelven con `Intl.PluralRules`, nunca con un
ternario: el espanol declara `one`, `many` y `other`, y `lint:i18n` exige las tres.

## 10. Validacion de contenido

Todo JSON de contenido pasa `lint:content` antes del build, dentro de `check`. Los
esquemas viven en `src/domain/schemas/` y se escriben con las reglas de
`src/domain/validation/rules.js`, copiadas de Lomito Train. Los limites numericos
viven en `limits.js` y no se repiten en el JSX.

El dominio devuelve codigos (`tooLong`, `notInCatalog`, `orphanExercise`); el script
los imprime en espanol con la ruta del archivo y del campo. No hay mensajes de
validacion en pantalla porque el usuario nunca escribe nada.

## 11. Comentarios y documentacion

Identificadores en ingles. Comentarios y JSDoc en espanol.

Una linea de comentario encima de cada funcion exportada, hook y componente,
diciendo **que** hace y que devuelve, nunca **como** lo hace. En `src/domain/` el
JSDoc con `@param`, `@returns` y `@throws` es obligatorio, porque no hay TypeScript
que declare el contrato.

Prohibido: comentarios que repiten el codigo, bloques decorativos de guiones o
iguales, emojis, iconos, y `TODO` sin una referencia concreta.

Un comentario que explica un porque no obvio vale mas que tres que describen el como.

## 12. Commits y atribucion

Conventional Commits. Asunto en espanol, imperativo, minuscula, sin punto final,
maximo 72 caracteres, sin emojis. El cuerpo explica el porque.

`BREAKING CHANGE:` es obligatorio cuando cambia la forma de los JSON de contenido.

Los tipos y ambitos permitidos estan en `commitlint.config.js`, que es la fuente de
verdad. El hook `commit-msg` los verifica. Detalle en [CONTRIBUTING.md](CONTRIBUTING.md).

## 13. Reglas duras

1. Ningun texto visible escrito en el JSX. Todo pasa por i18n.
2. Ningun contenido editorial (ejercicios, metodologia, clientes) en JSX ni en i18n:
   vive en JSON de contenido.
3. Ningun color hexadecimal ni `rgba()` fuera de `src/styles/settings/`.
4. Ningun `style={{ }}` con color, fondo o borde. Si el dato manda el color, se
   inyecta como custom property y decide el SCSS.
5. Ningun acceso a `localStorage` ni `sessionStorage`, sin excepcion.
6. Ningun JSON de contenido entra al build sin pasar `lint:content`.
7. Ningun error silenciado. `catch {}` vacio esta prohibido: se devuelve
   `{ ok: false, error }` y la interfaz avisa.
8. Ninguna imagen cargada desde un host externo en tiempo de ejecucion.
9. Ningun import con `../../` o superior. Alias siempre. En `src/domain/` los imports
   relativos llevan extension `.js`.
10. Ninguna feature importa el interior de otra: solo su `index.js`.
11. Ningun archivo de `src/domain/` ni `src/services/` importa React.
12. Ningun bloque BEM con nombre distinto al del archivo y al del componente.
13. Ninguna area interactiva por debajo de 44 por 44 pixeles, ni ningun
    `outline: none` sin un foco visible de reemplazo con contraste 3:1.
14. Ninguna funcionalidad se deja escrita pero desconectada. Si no se monta, no se
    integra.
15. Ningun emoji en codigo, comentarios, documentacion ni mensajes de commit.
16. `npm run check` en verde antes de cada commit.

## 14. Estado

El plan del MVP tiene seis fases, F0 a F5. Su contenido esta en
[docs/plan.md](docs/plan.md) y su estado en [docs/roadmap.md](docs/roadmap.md), que
es tambien donde vive la deuda conocida.

Las reglas duras que no dependen de que nadie se acuerde las vigilan `npm run lint`,
`npm run lint:css`, `npm run lint:classes`, `npm run lint:i18n` y
`npm run lint:content`, y todas corren dentro de `npm run check`.

## 15. Mantenimiento de este archivo

Se actualiza en el mismo commit que cambia lo que describe. Si una seccion pasa de
30 lineas, se mueve a `docs/` y aqui queda un enlace. Nunca se escriben aqui
inventarios de archivos, conteos de lineas, versiones exactas ni fechas. Si una
regla se incumple dos veces, o se automatiza con lint o se retira del documento.
