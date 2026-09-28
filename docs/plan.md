# Plan por fases

Plan de desarrollo del MVP, escrito el 2026-09-28 y aprobado por Lomito Dev. Es la
fuente de las decisiones; el estado de avance vive en [roadmap.md](roadmap.md). Se
conserva tal cual, sin acentos, como el resto de la documentacion.

---

## Contexto

Lomito Dev quiere entregar **planes de entrenamiento personalizados** por web movil a
personas que llegan desde sus contenidos. La herramienta solo **planifica y explica**
(perfil, metodologia, rutinas con tarjetas de ejercicio: imagen, musculos, aproximacion,
series efectivas, repeticiones, RIR, descanso, como hacerlo, errores comunes). El
**seguimiento** sigue viviendo en **Lomito Train** (`https://lomito-train.netlify.app/`),
que ya existe y no se duplica.

El documento `lomito-training-plan.md` fija alcance y metodologia (1 serie de
aproximacion al 50–60 %, 2 series efectivas a RIR 1–2, progresion por repeticiones antes
que por carga) y pide evaluar vanilla/Vue/React. La carpeta
`/Volumes/Kingston 1TB/Proyectos/LomitoDev/lomito-workouts` esta vacia y no es repo.

**Resultado esperado:** una web estatica mobile-first, sin backend ni base de datos,
publicada en GitHub Pages bajo el nombre y la firma **Lomito Workouts**, con un cliente
de ejemplo (Push / Cuadriceps / Pull / Posterior), 22 ejercicios con imagen, la misma
identidad visual y las mismas convenciones de trabajo que Lomito Train, y un contenido
en JSON (biblioteca de ejercicios + un archivo por cliente) que una skill de Claude Code
edita sin tocar codigo.

### Decisiones tomadas

| Decision                | Eleccion                                                                                                                                                                                                                                                                                      |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Stack                   | **React 19 + Vite 7 + JS/JSX + Sass**, tomando Lomito Train como template completo (confirmado): design system, tokens, mixins, componentes compartidos, tooling y convenciones. Clonar es lo mas rapido y deja dos apps en el mismo stack.                                                   |
| Tema visual             | **Tokens de Lomito Train tal cual** (confirmado): acento azul, glass, claro/oscuro **siguiendo al sistema, sin boton**. Asi no existe `localStorage` en el proyecto. `#B30000` queda como `--danger`.                                                                                         |
| Nombre y firma          | **Lomito Workouts** (confirmado): nombre del proyecto, paquete `lomito-workouts`, wordmark de la cabecera, firma del pie, `document.title`, OG y README. El nombre del repositorio decide la URL (`…github.io/lomito-workouts/`); el build no lo necesita saber (`base: './'`).               |
| Logo                    | **El mismo de Lomito Train** (confirmado): se copian `src/assets/logo-mark.png` (cabecera y pie) y `public/{favicon-16,favicon-32,apple-touch-icon,og-image}.png`. No se genera arte nuevo.                                                                                                   |
| Backend y base de datos | **Ninguno por ahora** (confirmado): sitio estatico, contenido en JSON dentro del repositorio, sin API, sin cuentas, sin `localStorage`. Los datos de cliente se separan del codigo desde el dia 1 para que migrar a un backend, si algun dia hace falta, no obligue a reescribir la interfaz. |
| Hosting                 | **GitHub Pages con GitHub Actions**, como pide el doc. Rutas por hash (`/#/<slug>`). Netlify serviria el mismo `dist/` sin cambios.                                                                                                                                                           |
| Idioma                  | **Solo espanol**, con el mecanismo i18n de Lomito Train recortado a un locale, para que siga valiendo "ningun texto en el JSX".                                                                                                                                                               |
| Vocabulario             | Alineado con Lomito Train: cada **dia** del plan es una `routine` ("Rutina"), porque el cliente creara una rutina por dia en Lomito Train. `day` sigue prohibido; el numero del dia es la posicion en la lista.                                                                               |
| Contenido               | Biblioteca en `src/content/exercises/<grupo>/<id>.json` (entra al bundle). **Clientes en `public/clients/<slug>.json`, cargados con `fetch`**: con `import.meta.glob` el mapa de chunks expondria todos los slugs en el JS principal. Metodologia en `src/content/methodology.json`.          |
| Estructura de datos     | Rangos como objetos (`"reps": { "min": 8, "max": 12 }`), descanso en segundos (`restSeconds`), `warmupSets` entero, objetivo y nivel por catalogo. Frecuencia y musculos de cada rutina se **derivan**, no se escriben.                                                                       |
| Imagenes                | **free-exercise-db** (Unlicense) como fuente provisional. Se descargan **una vez** a `public/exercises/<id>/0.jpg,1.jpg` y se commitean: el sitio nunca depende del host externo. Cada ejercicio guarda `source` para poder sustituirlas por material propio.                                 |
| Privacidad              | Sitio publico sin login: **sin indice de clientes**, slugs no adivinables (`juan-7k2p`), `noindex`, solo nombre de pila o apodo, sin datos de salud en `notes`.                                                                                                                               |
| Sin tracking            | Ningun campo de peso, marca, historial, sesion o temporizador; lo vigila `lint:content`.                                                                                                                                                                                                      |
| Tarjeta de ejercicio    | Como en el doc: imagen visible (dos fotogramas), musculos y prescripcion siempre a la vista; "Como hacerlo" y "Errores comunes" plegados.                                                                                                                                                     |

---

## Hallazgos (verificado en codigo y en la fuente de imagenes)

### Lomito Train, la referencia

- **No es Vue**: React 19.2, Vite 7, react-router 8 (`createHashRouter`), Sass ITCSS
  (7 capas con `@layer` nativo) + BEMIT, `@mdi/js` + `@mdi/react`. Sin TypeScript.
- **Tooling reutilizable tal cual**: Prettier, ESLint 9 flat (react, jsx-a11y, import-x
  con `no-cycle`, unused-imports, reglas de capas), Stylelint, husky + lint-staged +
  commitlint con ambitos cerrados, `npm run check`. Scripts propios: `check-classes.mjs`
  (BEMIT contra SCSS, se copia tal cual) y `check-i18n.mjs` (se adapta a un idioma).
- **Tokens**: `src/styles/settings/_tokens.scss` (primitivos + mapas `light`/`dark`),
  emitidos en `generic/_custom-properties.scss` como `--bg`, `--surface`, `--text`,
  `--accent`, `--accent-text`, `--danger`… (sin prefijo `--color-`; el `docs/styles.md`
  de Lomito Train esta desactualizado). `--accent` es relleno; como texto en oscuro da
  4,14:1 y no pasa AA: el texto va siempre con `--accent-text`.
- **Mixins**: `glass-card`, `glass-card-strong`, `input-base`, `touch-target`,
  `touch-target-extended`, `flex-*`, `respond-to(sm|md|lg)` (mobile-first).
- **Se copian sin cambios**: `Chip`, `ErrorBoundary`, `validation/{validate,rules,normalize,parseDecimal}.js`,
  `catalogs/equipment.js`, `styles/**`. **Se adaptan**: `Layout` (sin `BottomNav`),
  `Button` (prop `as` para enlaces y `min-height` 44 en `md`, hoy mide 40),
  `I18nProvider`/`config`/`catalogs`/`format` (un idioma, sin `settingsRepository`).
- **No se copia**: `src/theme/**`, `src/domain/storage/**`, `services/{pdf,excel,file,pwa}`,
  `bootstrap.js`, `RecoveryScreen`, `ToastProvider`, `Modal`, `Field`, `SortableList`,
  `DetailHeader`, `BottomNav`, script inline de tema en `index.html`, manifest, PWA.
- **Trampas documentadas**: `styles/main.scss` va en la **primera linea** de `main.jsx`
  (si un componente entra antes, `@layer components` se crea antes que `_layers.scss` y
  se pierde todo el espaciado); `react-hooks/set-state-in-effect` prohibe `setState`
  sincrono dentro de un efecto.
- **Node no puede importar `src/domain` de Lomito Train tal cual**: sus imports
  relativos no llevan extension (`'../validation/rules'`, `ERR_MODULE_NOT_FOUND`
  verificado). Como los scripts de este proyecto importan el dominio, aqui los imports
  relativos del dominio llevan `.js` (lo impone ESLint).
- **Vite si reescribe** `/favicon-32.png` a `./favicon-32.png` con `base: './'`
  (verificado en el `dist/` de Lomito Train): GitHub Pages en subruta funciona sin tocar
  `index.html`.
- `Intl.PluralRules('es')` en Node 24 devuelve `one, many, other`: cada plural
  necesita tres formas; `check-i18n.mjs` lo exige.

### free-exercise-db (fuente de imagenes)

- 876 ejercicios en `dist/exercises.json`; licencia **Unlicense** (`LICENSE.md`),
  derivado de `wrkout/exercises.json`. Imagenes en
  `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/<Id>/0.jpg`
  y `/1.jpg` (inicio y fin): JPEG **850×567 (3:2), 40–73 kB**.
- Los 22 ids de la biblioteca inicial responden **200** en los dos fotogramas (tabla en F1).

### Convenciones que se heredan (CLAUDE.md, CONTRIBUTING.md y memoria)

- `PRODUCT.md` + `CLAUDE.md` antes del codigo; vocabulario cerrado; "donde va cada cosa";
  reglas duras vigiladas por lint; `docs/roadmap.md` con el estado real, actualizado en
  el mismo cambio.
- Identificadores en ingles; comentarios, JSDoc, docs y commits en espanol **sin
  acentos** (los JSON de contenido y los locales si llevan acentos). Sin emojis.
- Conventional Commits: asunto en espanol, imperativo, minuscula, ≤ 72 caracteres,
  ambito de la lista cerrada, cuerpo con el porque, `Co-Authored-By` cuando hubo IA.
- **Ningun `git add`/`commit`/`push` sin un "si" explicito para ese commit concreto.**
- Ninguna dependencia fuera de la lista de este plan sin consultarla antes.

---

## Arquitectura

```
lomito-workouts/                        (paquete: lomito-workouts)
  index.html                            adaptado: sin script de tema, sin manifest ni metas apple-*; dos meta theme-color por media; noindex; OG "Lomito Workouts"
  vite.config.js                        adaptado: sin VitePWA; alias @, @app, @content, @domain, @features, @i18n, @services, @shared, @styles
  eslint.config.js                      adaptado (anexo B)
  jsconfig.json                         mismos alias (sin @theme, con @content)
  .env                                  VITE_SITE_URL=https://carlosarce10.github.io/lomito-workouts
  .editorconfig .npmrc .gitignore .prettierrc.json .stylelintrc.json .stylelintignore .lintstagedrc.json   copiados
  .prettierignore                       "public/*" + "!public/clients/" (los JSON de clientes si se formatean)
  .gitmessage commitlint.config.js      ambitos nuevos
  .husky/pre-commit .husky/commit-msg   copiados (nunca .husky/_/, lo genera prepare)
  .github/workflows/deploy.yml          build + deploy a GitHub Pages
  .claude/skills/lomito-plan/SKILL.md   F5
  CLAUDE.md PRODUCT.md README.md CONTRIBUTING.md
  docs/plan.md docs/roadmap.md docs/content.md docs/styles.md
  scripts/check-classes.mjs             copiado tal cual
  scripts/check-i18n.mjs                sin el bloque de paridad ni el de codigos de validacion
  scripts/check-content.mjs             NUEVO: biblioteca, clientes, metodologia, imagenes
  scripts/fetch-exercise-images.mjs     NUEVO
  public/favicon-16.png favicon-32.png apple-touch-icon.png og-image.png   copiados de lomito-train/public: el mismo logo
  public/clients/<slug>.json            un cliente por archivo, servido tal cual
  public/exercises/<id>/0.jpg 1.jpg     generados por npm run images y versionados
  public/exercises/ATTRIBUTION.md       generado
  src/
    main.jsx                            styles/main.scss PRIMERO; StrictMode > I18nProvider > ErrorBoundary > RouterProvider
    assets/logo-mark.png                copiado
    app/routes.jsx                      '/' HomePage · ':clientSlug' PlanPage con loader · '*' -> '/'
    app/AppShell/AppShell.jsx           Layout + ScrollReset + Outlet
    app/bootstrap/ErrorBoundary/        copiado
    app/bootstrap/ErrorScreen/          NUEVO: titulo + boton recargar
    content/exercises/<grupo>/<id>.json biblioteca (glob eager)
    content/methodology.json
    domain/                             sin React; sin alias; imports relativos con .js
      catalogs/{muscles,equipment,levels,goals,sources,index}.js
      validation/{validate,rules,normalize,parseDecimal}.js   copiados (validate gana __min/__max; rules gana slug, range, listOfText, source)
      validation/limits.js              limites de este proyecto
      schemas/{exercise,client,methodology}.schema.js
      model/resolvePlan.js              hidrata exerciseId, aplica defaults, deriva ordinal, frecuencia y musculos
    services/content/{library,methodology,clients,images}.js   unico sitio que conoce Vite (glob, BASE_URL) y fetch
    features/plan/                      index.js · pages/{HomePage,PlanPage} · components/{ClientProfile,RoutineTabs,RoutineSection,RoutineExerciseCard,PrescriptionGrid,MuscleBadgeList,MethodologySection,ProgressionExample,TrackingLink}
    i18n/                               I18nContext, useTranslation (tal cual); config, catalogs, format, I18nProvider (adaptados); locales/es/{common,plan,catalog}.json
    shared/components/{Layout,Chip,Button,Collapsible}
    styles/                             copiado tal cual salvo generic/_custom-properties.scss (solo :root + prefers-color-scheme)
```

Direccion de dependencias (la impone ESLint):

```
app -> features -> { shared, domain, services, i18n }
services/content -> nada del proyecto (conoce Vite y fetch; devuelve { ok })
domain -> solo domain          shared -> solo shared
```

### Vocabulario canonico (va a CLAUDE.md)

| Concepto                                               | Codigo                     | Etiqueta es                          |
| ------------------------------------------------------ | -------------------------- | ------------------------------------ |
| Persona que recibe el plan                             | `client`                   | Cliente                              |
| Identificador de URL del cliente (= nombre de archivo) | `slug`                     | —                                    |
| Lo que ve el cliente: perfil, rutinas, metodologia     | `plan`                     | Plan                                 |
| Sesion de un dia, grupo de ejercicios                  | `routine`                  | Rutina, en pantalla "Dia N · Nombre" |
| Posicion de la rutina, derivada del indice             | `ordinal`                  | Dia N                                |
| Ejercicio prescrito dentro de una rutina               | `routineExercise`          | —                                    |
| Entrada de la biblioteca                               | `exercise`                 | Ejercicio                            |
| Biblioteca reutilizable                                | `library`                  | Biblioteca                           |
| Musculo (catalogo, con `group` = carpeta)              | `muscle`, `muscleIds`      | Musculo                              |
| Equipamiento (catalogo, el de Lomito Train)            | `equipment`, `equipmentId` | Equipamiento                         |
| Nivel (catalogo)                                       | `level`, `levelId`         | Nivel                                |
| Objetivo (catalogo)                                    | `goal`, `goalId`           | Objetivo                             |
| Dias por semana, derivado de `routines.length`         | `frequency`                | Frecuencia                           |
| Series de aproximacion (entero)                        | `warmupSets`               | Aproximacion                         |
| Series efectivas (entero)                              | `sets`                     | Series efectivas                     |
| Rango de repeticiones                                  | `reps`                     | Repeticiones                         |
| Rango de repeticiones en reserva                       | `rir`                      | RIR                                  |
| Rango de descanso en segundos                          | `restSeconds`              | Descanso                             |
| Objeto `{ min, max }`                                  | `range`                    | "8–12"                               |
| Pasos de ejecucion                                     | `instructions`             | Como hacerlo                         |
| Errores frecuentes                                     | `commonMistakes`           | Errores comunes                      |
| Nota del entrenador                                    | `notes`                    | Observaciones                        |
| Fechas del plan                                        | `startDate`, `reviewDate`  | Inicio, Revision                     |
| Texto educativo y valores por defecto                  | `methodology`              | Como entrenar?                       |
| Origen de las imagenes                                 | `source`                   | Fuente                               |
| Enlace a Lomito Train                                  | `tracking`                 | Seguimiento                          |

Prohibidos y sustituto: `day`, `workoutDay` → `routine` (+ `ordinal`); `program` →
`client.routines`; `category`, `muscleGroup` → `muscleIds`; `rest` a secas →
`restSeconds`; `serie` en identificadores → `set`; `weight`, `record`, `session`,
`history`, `timer`, `log`, `settings`, `theme`, `storage` → no existen en el producto.
`lint:content` rechaza cualquier JSON con `weight`, `record`, `history`, `session`,
`timer`, `log`, `day`, `category` o `program`.

### Modelo de datos

`src/content/exercises/chest/incline-db-press.json` (archivo = `id`; carpeta = grupo de `muscleIds[0]`):

```json
{
  "id": "incline-db-press",
  "name": "Press inclinado con mancuernas",
  "muscleIds": ["chest-upper", "shoulders-front", "triceps"],
  "equipmentId": "dumbbell",
  "instructions": [
    "Banco a 30-45 grados. Mancuernas a la altura del pecho, codos algo por debajo de los hombros.",
    "Empuja hacia arriba y ligeramente hacia dentro hasta extender los brazos sin bloquear.",
    "Baja en 2-3 segundos, controlando, hasta sentir el estiramiento en el pecho."
  ],
  "commonMistakes": [
    "Inclinar el banco mas de 45 grados: el trabajo pasa al hombro.",
    "Rebotar abajo en vez de controlar la bajada."
  ],
  "source": { "provider": "free-exercise-db", "id": "Incline_Dumbbell_Press" }
}
```

Con `source` presente, las imagenes son siempre `public/exercises/<id>/0.jpg` y `1.jpg`
(contrato de rutas: sustituir el proveedor no toca codigo ni JSON, solo `source`).
Sin `source`, la tarjeta muestra un icono.

`public/clients/juan-7k2p.json` (archivo = slug, `^[a-z0-9]+(-[a-z0-9]+)*-[a-z0-9]{4}$`):

```json
{
  "name": "Juan",
  "goalId": "hypertrophy",
  "levelId": "beginner",
  "startDate": "2026-09-28",
  "reviewDate": "2026-11-09",
  "notes": "Molestia leve en el hombro derecho: evitar press militar con barra.",
  "routines": [
    {
      "name": "Push",
      "notes": "Empieza por el press inclinado: es el ejercicio principal del dia.",
      "exercises": [
        { "exerciseId": "incline-db-press", "reps": { "min": 8, "max": 12 } },
        {
          "exerciseId": "machine-chest-press",
          "reps": { "min": 8, "max": 12 }
        },
        {
          "exerciseId": "cable-crossover",
          "reps": { "min": 12, "max": 15 },
          "restSeconds": { "min": 60, "max": 90 },
          "warmupSets": 0
        },
        {
          "exerciseId": "seated-db-shoulder-press",
          "reps": { "min": 8, "max": 12 }
        },
        {
          "exerciseId": "db-lateral-raise",
          "reps": { "min": 12, "max": 15 },
          "restSeconds": { "min": 60, "max": 90 },
          "warmupSets": 0
        },
        {
          "exerciseId": "triceps-rope-pushdown",
          "reps": { "min": 10, "max": 15 },
          "restSeconds": { "min": 60, "max": 90 },
          "warmupSets": 0
        }
      ]
    }
  ]
}
```

Solo `exerciseId` y `reps` son obligatorios por ejercicio; `sets`, `rir`, `restSeconds`
y `warmupSets` heredan de `methodology.defaults` (`sets: 2, warmupSets: 1, rir: 1–2,
restSeconds: 120–180`) y `notes` es opcional.

`src/content/methodology.json`: `{ defaults, sections: [{ id, title, body[] }],
progressionExample: { title, steps[] } }` con los textos del doc (aproximacion, series
efectivas, RIR explicado para principiantes, descanso, progresion sin obligacion de
subir peso, tecnica antes que carga; ejemplo 8 → 9 → 10 → 11 → 12 → +carga → 8).

Resolver (`domain/model/resolvePlan.js`): hidrata cada `exerciseId` contra la biblioteca,
aplica defaults, deriva `ordinal` = indice + 1, `frequency` = `routines.length` y los
`muscleIds` de cada rutina (primer musculo de cada ejercicio, sin duplicados). Un id
huerfano devuelve `{ ok: false, error: 'orphanExercise', exerciseId }`; la pagina muestra
un estado de error, nunca una pantalla en blanco. No valida forma: eso lo hace
`lint:content` antes de todo build.

Limites (`domain/validation/limits.js`, nunca repetidos en el JSX): `name` 1–60,
`text` ≤ 200, `notes` ≤ 300, `musclesPerExercise` 1–4, `instructions` 1–8,
`commonMistakes` 0–6, `routinesPerClient` 1–7, `exercisesPerRoutine` 1–12, `sets` 1–6,
`warmupSets` 0–3, `reps` 1–50, `rir` 0–5, `restSeconds` 15–600.

### Carga de datos

```js
// services/content/library.js — unico glob del proyecto
const MODULES = import.meta.glob('../../content/exercises/*/*.json', {
  eager: true,
  import: 'default',
});
export const LIBRARY = new Map(Object.values(MODULES).map((e) => [e.id, e]));

// services/content/clients.js — nunca lanza; no-cache revalida por ETag (Pages cachea 10 min)
export async function loadClient(slug) {
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}clients/${slug}.json`, {
      cache: 'no-cache',
    });
    if (res.status === 404) return { ok: false, error: 'notFound' };
    if (!res.ok) return { ok: false, error: 'loadFailed' };
    return { ok: true, value: await res.json() };
  } catch (error) {
    return { ok: false, error: 'loadFailed', detail: error };
  }
}
```

Ruta `':clientSlug'` con `loader` de react-router: slug invalido o `notFound` →
`throw redirect('/')`; `loadFailed` u `orphanExercise` → `throw new Error(code)` que
recoge `errorElement` (mensaje + Reintentar con `useRevalidator`); exito → `useLoaderData()`.
`HydrateFallback` muestra "Cargando plan…". Sin efectos ni `setState`: evita
`react-hooks/set-state-in-effect`.

`check-content.mjs` no conoce Vite: recorre `src/content/` y `public/clients/` con `fs` +
`JSON.parse` e importa esquemas, reglas y catalogos con `import('../src/domain/….js')`.

---

## Fases

Cada fase deja `npm run check` en verde y algo verificable en el navegador. F0–F3 son
el MVP; F4 y F5 lo publican y lo hacen operable.

### F0 — Andamiaje · _riesgo nulo, 0 px_

1. `git init -b main` **antes** de `npm install` (`prepare` ejecuta `husky` y necesita `.git`).
   `git config --local commit.template .gitmessage`. Sin commits.
2. `package.json` (anexo A) escrito a mano; `npm install`.
3. Copiar de Lomito Train sin cambios: la lista de "Se copian sin cambios" de Hallazgos
   mas `.editorconfig`, `.npmrc`, `.gitignore`, `.prettierrc.json`, `.stylelintrc.json`,
   `.stylelintignore`, `.lintstagedrc.json`, `.husky/{pre-commit,commit-msg}`,
   `scripts/check-classes.mjs`, `src/i18n/{I18nContext.js,useTranslation.js}`,
   `src/assets/logo-mark.png`, `public/{favicon-16,favicon-32,apple-touch-icon,og-image}.png`.
4. Adaptar:
   - `index.html`: quitar script inline, `<link rel="manifest">` y las metas
     `application-name`/`apple-*`/`mobile-web-app-capable`; sustituir la `meta theme-color`
     por dos con `media="(prefers-color-scheme: light|dark)"` (`#eff6ff` / `#0b1220`);
     anadir `<meta name="robots" content="noindex, nofollow">`; titulos, description y
     OG con "Lomito Workouts". Los hrefs absolutos se quedan (Vite los reescribe).
   - `src/styles/generic/_custom-properties.scss`: solo `:root { @include emit(light) }`
     y `@media (prefers-color-scheme: dark) { :root { @include emit(dark) } }`; fuera
     los selectores `data-theme` y `--nav-height`/`--toast-reserve` (nadie los escribe).
   - `Layout`: sin `BottomNav`, `tabs` ni `headerAction`; cabecera con el **mismo logo
     de Lomito Train** (`logo-mark.png`, 32 px) y el wordmark "Lomito Workouts"; subtitulo
     `c-layout__tagline` ("Plan de entrenamiento") bajo el wordmark; `c-layout__footer`
     con la firma `t('app.signature')` ("Lomito Workouts") y el logo pequeno;
     `padding-bottom` del contenido `calc(#{$spacing-xl} + env(safe-area-inset-bottom))`.
   - `Button`: prop `as` (patron de `Chip`; con `as="a"` pasan `href`, `target`, `rel`);
     `&--md { min-height: $touch-target }`.
   - `i18n/config.js` (`LANGUAGES = ['es']`, `NAMESPACES = ['common','plan','catalog']`),
     `catalogs.js` (solo es), `format.js` (solo `formatNumber` `integer` y `formatDate`
     `date`), `I18nProvider.jsx` (sin `settingsRepository`, `language = 'es'` fijo, sin
     `setLanguage`; `t` y `buscar` tal cual).
   - `scripts/check-i18n.mjs`: quitar el bloque "Paridad entre idiomas" y el de codigos
     de validacion (no hay namespace `validation`: los codigos los imprime Node).
   - `vite.config.js`, `jsconfig.json`, `eslint.config.js` (anexo B),
     `commitlint.config.js` + `.gitmessage` (ambitos: `plan app domain content catalog
validation services shared ui styles i18n a11y images skill config deps docs ci release`),
     `.prettierignore`.
5. `src/main.jsx`, `app/routes.jsx`, `app/AppShell`, `app/bootstrap/ErrorScreen`,
   `features/plan/pages/HomePage` con un parrafo por `t()`; `locales/es/common.json`
   (`app.name`, `app.tagline`, `app.signature`, `action.retry`, `action.reload`,
   `error.title`, `error.render`)
   y `plan.json` (`home.intro`).
6. Documentos: `PRODUCT.md` (esquema impeccable, como Lomito Train), `CLAUDE.md`
   (que es, comandos, stack, vocabulario, donde va cada cosa, dependencias, modelo de
   contenido, estilos, i18n, comentarios, commits, reglas duras, estado, mantenimiento;
   ninguna seccion > 30 lineas; reglas nuevas: "ningun `localStorage` ni `sessionStorage`",
   "ningun JSON entra al build sin `lint:content`", "ningun contenido editorial en JSX
   ni en i18n", "ninguna imagen desde un host externo en runtime", "en `src/domain/`
   los imports relativos llevan `.js`"), `README.md`, `CONTRIBUTING.md`, `docs/plan.md`
   (este plan, sin acentos), `docs/roadmap.md`, `docs/styles.md` (recortado: sin
   conmutador ni persistencia).

**Verificacion:** `npm run check` verde · `npm run dev` a 375 px: cabecera glass con
logo, "Lomito Workouts" y tagline; `getComputedStyle(document.querySelector('.c-layout__content')).padding`
= `16px` (si es `0px`, el orden de capas esta roto); con `prefers-color-scheme: dark`
emulado `body` es `rgb(11, 18, 32)` y `document.documentElement.getAttribute('data-theme')`
es `null`; Application > Storage vacio · `echo "feat(theme): x" | npx commitlint` falla y
`echo "feat(config): x" | npx commitlint` pasa.

### F1 — Dominio y contenido · _riesgo bajo, 0 px_

- Catalogos (solo ids; etiquetas en `catalog.json`):
  - `muscles.js`: `{ id, group, color }` con ids `chest`, `chest-upper`, `lats`,
    `back-upper`, `back-lower`, `shoulders-front`, `shoulders-side`, `shoulders-rear`,
    `biceps`, `triceps`, `forearms`, `abs`, `quads`, `hamstrings`, `glutes`, `calves`;
    grupos (= carpetas del doc §11) `chest back shoulders biceps triceps forearms core
quads hamstrings glutes calves`; color por grupo al estilo de `muscleGroups.js`.
  - `equipment.js` copiado; `levels.js` (`beginner intermediate advanced`); `goals.js`
    (`hypertrophy strength general`); `sources.js` (`free-exercise-db`: `baseUrl`,
    `license`, `frames`).
- `validation/validate.js` + `__min`/`__max` para listas; `rules.js` + `slug()`,
  `range({ min, max, integer })`, `listOfText({ min, max, itemMax })`, `source(ids)`;
  `limits.js`; `schemas/*` (anexo C); `model/resolvePlan.js` con JSDoc completo.
- Biblioteca (22 archivos; instrucciones y errores en espanol, 3–5 y 2–3 items,
  **borrador para revision de Lomito Dev**, adaptados del dataset, que es Unlicense):

| Rutina     | `id`                       | carpeta    | `equipmentId` | `source.id`                          |
| ---------- | -------------------------- | ---------- | ------------- | ------------------------------------ |
| Push       | `incline-db-press`         | chest      | dumbbell      | `Incline_Dumbbell_Press`             |
| Push       | `machine-chest-press`      | chest      | machine       | `Leverage_Chest_Press`               |
| Push       | `cable-crossover`          | chest      | cable         | `Cable_Crossover`                    |
| Push       | `seated-db-shoulder-press` | shoulders  | dumbbell      | `Seated_Dumbbell_Press`              |
| Push       | `db-lateral-raise`         | shoulders  | dumbbell      | `Side_Lateral_Raise`                 |
| Push       | `triceps-rope-pushdown`    | triceps    | cable         | `Triceps_Pushdown_-_Rope_Attachment` |
| Cuadriceps | `leg-extension`            | quads      | machine       | `Leg_Extensions`                     |
| Cuadriceps | `leg-press`                | quads      | machine       | `Leg_Press`                          |
| Cuadriceps | `hack-squat`               | quads      | machine       | `Hack_Squat`                         |
| Cuadriceps | `db-split-squat`           | quads      | dumbbell      | `Split_Squat_with_Dumbbells`         |
| Cuadriceps | `standing-calf-raise`      | calves     | machine       | `Standing_Calf_Raises`               |
| Pull       | `lat-pulldown`             | back       | cable         | `Wide-Grip_Lat_Pulldown`             |
| Pull       | `machine-row`              | back       | machine       | `Leverage_Iso_Row`                   |
| Pull       | `seated-cable-row`         | back       | cable         | `Seated_Cable_Rows`                  |
| Pull       | `face-pull`                | shoulders  | cable         | `Face_Pull`                          |
| Pull       | `db-biceps-curl`           | biceps     | dumbbell      | `Dumbbell_Bicep_Curl`                |
| Pull       | `hammer-curl`              | biceps     | dumbbell      | `Hammer_Curls`                       |
| Posterior  | `romanian-deadlift`        | hamstrings | barbell       | `Romanian_Deadlift`                  |
| Posterior  | `lying-leg-curl`           | hamstrings | machine       | `Lying_Leg_Curls`                    |
| Posterior  | `hip-thrust`               | glutes     | barbell       | `Barbell_Hip_Thrust`                 |
| Posterior  | `back-extension`           | back       | other         | `Hyperextensions_Back_Extensions`    |
| Posterior  | `seated-calf-raise`        | calves     | machine       | `Seated_Calf_Raise`                  |

- `public/clients/juan-7k2p.json` (4 rutinas), `src/content/methodology.json`,
  `services/content/{library,methodology,clients,images}.js`.
- `scripts/check-content.mjs` + `lint:content` dentro de `check`, antes de `build`.
  Falla con `ruta: mensaje` si: esquema incumplido; carpeta = grupo de `muscleIds[0]`;
  archivo = `id`; `id` duplicado; slug de cliente con forma invalida; `exerciseId`
  huerfano o repetido en la misma rutina; nombres de rutina repetidos; campo prohibido;
  imagen que falta (`0.jpg`/`1.jpg`) para un ejercicio con `source` (aviso en F1,
  error desde F3). Aviso: ejercicios que ningun cliente usa. Salida en verde:
  `Contenido correcto: 22 ejercicios, 1 cliente, 6 secciones de metodologia.`
- `catalog.json` con `muscles.*`, `equipment.*`, `levels.*`, `goals.*`; hasta F2 van en
  `PENDIENTES` de `check-i18n.mjs` (soporta prefijos `.*`).
- `docs/content.md`: como anadir un ejercicio y un cliente (lo que leera la skill);
  recordatorio de `npm run format` tras escribir JSON (Prettier colapsa arrays cortos).

**Verificacion:** `npm run lint:content` verde ·
`node --input-type=module -e "import('./src/domain/model/resolvePlan.js').then(() => console.log('ok'))"` ·
pruebas negativas, cada una falla con ruta y motivo y vuelve a verde al deshacer:
`exerciseId: "no-existe"`; mover `face-pull.json` a `chest/`; `"reps": { "min": 12, "max": 8 }`;
renombrar `juan-7k2p.json` a `juan.json`; anadir `"weight": 20` a un ejercicio ·
desde Node, resolver el cliente de ejemplo: 4 rutinas, `frequency === 4`,
`routines[0].exercises[1].sets === 2` (default) y `routines[0].exercises[2].warmupSets === 0` (override).

### F2 — Interfaz · _impacto maximo, riesgo medio_ · depende de F1

Orden de `PlanPage` a 375 px, con bloque BEMIT y patron de Lomito Train reutilizado:

1. `c-layout__header` (sticky): logo, "Lomito Workouts", tagline.
2. `c-plan-page__back`: enlace "Inicio" con `mdiArrowLeft`, 44 px (copia de `.c-detail-header__back`).
3. `c-client-profile` (glass-card): `__name` h2 "Plan de Juan"; `__stats` con tres
   `__stat-value`/`__stat-label` (patron de `ExerciseCard`): Objetivo, Nivel, "4 dias
   por semana" (plural `_one/_many/_other`); `__dates` con inicio y revision
   (`formatDate`); `__notes`.
4. `c-methodology-section`: `Collapsible` **cerrada** ("Como entrenar?"), `<details>`
   con `summary` ≥ 44 px, chevron que rota con `[open]`; secciones de `methodology.json`
   - `c-progression-example` (chips 8 → 9 → 10 → 11 → 12 → "+ carga" → 8 en `.o-scroll-x`).
5. `c-routine-tabs` (`.o-scroll-x`): pildoras "Dia 1 · Push"… copiando
   `.c-muscle-group-filter__chip` (44 px, `is-active`, `aria-pressed`); estado local,
   primera activa; sin scroll horizontal de pagina.
6. `c-routine-section`: `__title` h2, `c-muscle-badge-list` (chips con barra de color,
   derivados), `__notes`, `__list` (gap sm).
7. N × `c-routine-exercise-card` (glass-card, `shadow-sm`, patron de `RoutineExerciseCard`):
   `__header` (`__ordinal` en `--accent-text`, `__name` h3, `__equipment` icono MDI con
   `title`); `__frames` con dos `<img width="850" height="567" loading="lazy"
decoding="async">` en dos columnas (`aspect-ratio: 3 / 2`, `object-fit: contain`),
   `alt` "{{name}}, inicio" / "fin"; sin `source` o con `onError`, `__placeholder` con
   `mdiImageOff` del mismo tamano; `c-muscle-badge-list`; `c-prescription-grid`
   (`__warmup` "1 × 8–12 al 50–60 %" y cuatro celdas Series efectivas / Repeticiones /
   RIR / Descanso con valor lg bold `--accent-text` y etiqueta micro mayuscula);
   `__notes` en `--accent-subtle`; dos `Collapsible` cerrados: "Como hacerlo" (`<ol>`)
   y "Errores comunes" (`<ul>`).
8. `c-tracking-link` (glass-card-strong): "Registra tus series en Lomito Train",
   `Button as="a" variant="primary"` a ancho completo (44 px) con `mdiOpenInNew`,
   `target="_blank" rel="noreferrer"`, y la pista "Crea ahi una rutina por cada dia".
9. `c-layout__footer`: firma "Lomito Workouts" con el logo pequeno.

`HomePage`: intro ("Tu entrenador te comparte un enlace privado"), `MethodologySection`
**abierta**, `TrackingLink`. Sin lista de clientes. `PlanPage` fija `document.title`.
Descanso: minutos si `min` y `max` son multiplos de 60, si no segundos. Rangos por
`t('card.range', { min, max })` con guion corto tipografico. Estados de
`check-classes`: solo `is-active`; `[open]` no lleva clase.

Claves `plan.json` (orientativas): `home.*`, `profile.{goal,level,frequency_one/_many/_other,start,review}`,
`routine.ordinal`, `routine.tabsLabel`, `card.{warmup,sets,reps,rir,rest,restMinutes,restSeconds,range,instructions,mistakes,notes,imageStart,imageEnd,noImage}`,
`methodology.{title,progression}`, `status.{loading,failed,orphan}`, `tracking.{title,action,hint}`.

**Verificacion:** `npm run check` verde con `PENDIENTES` vacio ·
`grep -rnE "#[0-9a-fA-F]{3,6}\b|rgba?\(" src --include=*.scss --include=*.jsx | grep -v styles/settings`
→ 0 · `grep -rn "color: var(--accent)" src` → 0 · en navegador a 375×812 y 360×800,
claro y oscuro: orden de secciones; `document.documentElement.scrollWidth === 375`;
tocar "Dia 3 · Pull" cambia la seccion y `aria-pressed`; `details` abren y cierran con
raton y teclado; icono de respaldo en el hueco de imagen (aun sin JPEG); areas tactiles
≥ 44 px medidas en DevTools; foco visible en todo; `/#/juan-7k2p` sobrevive a la
recarga; `/#/no-existe` y `/#/JUAN-7K2P` redirigen a `/#/`; con Network "Offline" y
recarga: estado de fallo con Reintentar, que carga al volver online; "Inicio" vuelve
arriba · skill `browser-automation`: 0 errores de consola y captura.

### F3 — Imagenes · _riesgo medio (procedencia), 0 px de diseno_ · depende de F1

- `scripts/fetch-exercise-images.mjs` (Node 24, `fetch` global, sin dependencias):
  importa `SOURCE_PROVIDERS` del dominio; recorre `src/content/exercises/**/*.json`;
  para cada `source` descarga `baseUrl + id + '/' + frame` a `public/exercises/<id>/`;
  idempotente (salta lo que existe salvo `--force`); acepta ids como argumentos
  (`npm run images -- hack-squat`); concurrencia 4; aborta con `exit 1` y la URL ante
  cualquier no-200; comprueba `FF D8` (JPEG) antes de escribir; en macOS, si existe
  `sips`, reduce a 640 px y calidad 75 (850 px es 4× lo que se muestra; sin `sips` se
  guarda el original); escribe `public/exercises/ATTRIBUTION.md` (proveedor, Unlicense,
  origen `wrkout/exercises.json`, fecha, fila por ejercicio `id → source.id → URL`).
- `check-content.mjs`: `IMAGES_REQUIRED = true`.
- `docs/content.md`, seccion "Imagenes": procedencia, comando, contrato de rutas.

**Verificacion:** `npm run images` crea 22 carpetas × 2 archivos y `ATTRIBUTION.md`
con 22 filas; segunda ejecucion: 0 descargas · `file public/exercises/incline-db-press/0.jpg`
→ JPEG · `npm run check` verde · Network filtrado por `jpg`: solo cargan las imagenes
de la rutina visible; **ninguna** peticion a `raw.githubusercontent.com` (bloquear el
dominio en DevTools y comprobar que nada cambia); una rutina < 1 MB · Lighthouse
movil: CLS 0 · renombrar temporalmente un `0.jpg`: icono de respaldo, sin imagen rota;
`lint:content` lo nombra.

### F4 — Publicacion · _riesgo bajo_

- `.github/workflows/deploy.yml`: `on: push main` + `workflow_dispatch`; permisos
  `contents: read, pages: write, id-token: write`; `concurrency: pages`; job build
  (`actions/checkout`, `actions/setup-node` con Node 24 y `cache: npm`, `HUSKY: 0`,
  `npm ci`, `npm run check`, `actions/upload-pages-artifact` con `dist`); job deploy
  (`actions/deploy-pages`, environment `github-pages`). Usar la mayor version vigente de
  cada action al implementar.
- Repositorio: Settings > Pages > Source "GitHub Actions". `package-lock.json` versionado.
  `.env` con `VITE_SITE_URL` = URL real de Pages (lo unico del build que sabe donde se publica).
- README: "Publicar" (push a `main` despliega), URL de un plan
  `https://carlosarce10.github.io/lomito-workouts/#/<slug>`, como compartir por WhatsApp,
  "Anadir un cliente" (remite a `docs/content.md` y a la skill).
- Prueba local de subcarpeta antes del primer push: copiar `dist/` a
  `<scratchpad>/sub/lomito-workouts/`, `npx serve <scratchpad>/sub`, abrir
  `/lomito-workouts/#/juan-7k2p`.
- Crear el repo y hacer el primer push **solo con confirmacion explicita**.

**Verificacion:** Actions verde · `curl -I <url>/og-image.png` → 200 · en el movil real:
la URL abre el plan, recargar mantiene la ruta, imagenes desde el mismo dominio, tema
del sistema respetado, favicon · vista previa del enlace en WhatsApp con logotipo ·
Lighthouse movil: rendimiento y accesibilidad ≥ 90.

### F5 — Skill de planes · _riesgo bajo_

`.claude/skills/lomito-plan/SKILL.md` (activacion: "crea el plan de…", "modifica la
rutina de…", "cambia el ejercicio…", "agrega … a la biblioteca"):

1. Lee `CLAUDE.md`, `docs/content.md`, los catalogos, `limits.js`, `methodology.json`
   y la lista de la biblioteca.
2. Pide lo que falte: nombre de pila o apodo, objetivo, nivel, numero de rutinas y
   reparto, equipamiento disponible, molestias, fecha de inicio. Para modificar: el slug.
3. Slug nuevo `<nombre>-<4 caracteres aleatorios>`; nunca reutiliza ni adivina.
4. Compone con la biblioteca; un ejercicio nuevo solo si no hay equivalente: JSON en
   `src/content/exercises/<grupo>/<id>.json` con textos en espanol y `source`
   verificado con `fetch` de `…/exercises/<Id>.json` (si 404, sin `source` y avisa).
   Helper `scripts/find-exercise.mjs <texto>` que busca en `dist/exercises.json`.
5. Escribe `public/clients/<slug>.json` (solo `reps` obligatorio; el resto se omite
   salvo que se aparte de la metodologia); `npm run images` si hubo ejercicios nuevos.
6. `npx prettier --write` sobre lo tocado; `npm run lint:content`; `npm run check`.
7. Responde con archivos, URL del plan y ejercicios sin imagen. **Propone** el commit y
   **no lo ejecuta**.

Puede tocar: `public/clients/*.json`, `src/content/exercises/**/*.json`,
`public/exercises/**` (solo via `npm run images`). No puede tocar: `src/**/*.{js,jsx,scss}`,
`methodology.json`, `i18n`, configuracion. Nunca `git add`/`commit`; nunca borra un
cliente sin que se lo pidan por su slug; nunca consejos medicos ni campos de seguimiento.

**Verificacion:** en una sesion nueva, "crea el plan de Ana, principiante, hipertrofia,
3 dias full body, solo mancuernas" → `public/clients/ana-xxxx.json` valido, `check`
verde, `git status` solo con archivos nuevos, la URL abre el plan en `npm run dev`.

---

## Verificacion global y Definition of Done

- `npm run check` verde en cada fase; cero hex fuera de `styles/settings`; cero
  `localStorage`; cero texto literal en JSX (`lint:i18n`); cero clases sin regla
  (`lint:classes`); contenido valido (`lint:content`).
- Revision manual en 375 px y 360 px, claro y oscuro, con teclado y VoiceOver basico.
- El cliente de ejemplo se abre desde la URL publica en un movil real y se lee sin zoom
  durante un entrenamiento.
- `docs/roadmap.md` refleja el estado real al cerrar cada fase; `CLAUDE.md` describe el
  codigo que existe, no el objetivo.

## Riesgos

| Riesgo                                                                                                             | Mitigacion                                                                                                                                                                                                   |
| ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Procedencia dudosa de las fotos de free-exercise-db (Unlicense, pero sin cesion de derechos de imagen documentada) | Uso provisional y documentado; `source` + `ATTRIBUTION.md`; contrato de rutas para sustituirlas por material propio sin tocar codigo                                                                         |
| Sitio publico: si el repo es publico, `public/clients/` lista los clientes                                         | Solo nombre de pila o apodo (la skill lo impone); `noindex`; slug de 36⁴ combinaciones; si el repo debe ser privado, GitHub Pages exige plan de pago y Netlify no: mismo `dist`, solo cambia `VITE_SITE_URL` |
| Orden de capas CSS roto por un import antes de `main.scss`                                                         | Primera linea de `main.jsx` con el comentario de Lomito Train; la comprobacion del padding en F0 lo detecta en un minuto                                                                                     |
| `--accent` como texto (4,14:1 en oscuro)                                                                           | Solo `--accent-text`; grep al cerrar F2; `--accent` como relleno solo en `Button--primary`                                                                                                                   |
| GitHub Pages bajo `/repo/`                                                                                         | `base: './'` (Vite reescribe tambien los `<link>` de `public/`), hash routing, prueba de subcarpeta en F4; `index.html` cacheado 10 min → los JSON de clientes van con `cache: 'no-cache'`                   |
| Import relativo sin `.js` en `src/domain` rompe los scripts de Node                                                | `import-x/extensions` en ESLint para `src/domain/**`                                                                                                                                                         |
| Prettier colapsa arrays JSON: lo que escribe un script o la skill falla `format:check`                             | `prettier --write` tras escribir; `lint-staged` lo cubre al commitear                                                                                                                                        |
| Textos de ejercicios redactados por IA                                                                             | Marcados como borrador; Lomito Dev revisa antes de compartir                                                                                                                                                 |
| Peso del repo: 22 ejercicios ≈ 44 JPEG ≈ 1–2,5 MB (segun `sips`)                                                   | Aceptable; a partir de ~100 ejercicios, decidir `sharp` como devDependency o WebP                                                                                                                            |
| Inter desde Google Fonts, unica dependencia externa en runtime                                                     | Paridad con Lomito Train; la pila cae a la fuente del sistema. Sin conexion el sitio no abre: es un plan de consulta, asumido; PWA en backlog                                                                |

## Encontrado pero NO incluido (backlog, por valor)

1. **PWA sin conexion**: el gimnasio tiene mala cobertura; copiar `vite-plugin-pwa`,
   manifest e iconos de Lomito Train. Siguiente fase natural.
2. **Importar el plan en Lomito Train**: Lomito Train ya importa una copia de seguridad
   JSON con ejercicios y rutinas; generar ese archivo desde el plan evitaria que el
   cliente teclee sus rutinas. Integracion de alto valor entre las dos apps.
3. Boton de tema (requiere `localStorage` para la preferencia; ~40 lineas).
4. Locale `en` (el mecanismo ya esta; falta contenido).
5. Imagenes o videos propios (Fase 3 del doc de Lomito Dev); WebP.
6. Modo compacto de tarjeta (miniatura + prescripcion, detalle al tocar) si en el gimnasio
   se prefiere ver la rutina entera en una pantalla.
7. Vista de impresion / PDF del plan.
8. OG por cliente; duracion estimada por rutina (`durationMinutes`).

## Reglas de trabajo durante la implementacion

- Ningun `git add`, `commit` ni `push` sin tu "si" para ese commit concreto; se propone
  el mensaje en Conventional Commits (espanol sin acentos, ambito de la lista) con
  `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`, como en `CONTRIBUTING.md`.
- Las dependencias son exactamente las del anexo A; cualquier otra se consulta antes.
- Cada decision queda escrita en el repo (`CLAUDE.md`, `docs/`), no solo en el chat.
- Al cerrar cada fase: `npm run check` verde, comprobacion en navegador a 375 px y
  `docs/roadmap.md` actualizado en el mismo cambio.

---

## Anexo A — `package.json`

Scripts: `dev`, `build`, `preview`, `lint`, `lint:fix`, `lint:css`, `lint:css:fix`,
`lint:classes`, `lint:i18n`, `lint:content`, `format`, `format:check`, `images`,
`prepare` (`husky`) y
`check` = `format:check && lint && lint:css && lint:classes && lint:i18n && lint:content && build`
(en F0 sin `lint:content`, que entra en F1).

`dependencies`: `react ^19.2`, `react-dom ^19.2`, `react-router ^8.3`, `@mdi/js ^7.4`,
`@mdi/react ^1.6`. `devDependencies`: `vite ^7.3`, `@vitejs/plugin-react ^5.1`,
`sass ^1.97`, `eslint ^9.39`, `@eslint/js`, `globals`, `eslint-config-prettier`,
`eslint-import-resolver-alias`, `eslint-plugin-import-x`, `eslint-plugin-jsx-a11y`,
`eslint-plugin-react`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`,
`eslint-plugin-unused-imports`, `prettier ^3.9`, `stylelint ^17`,
`stylelint-config-standard-scss`, `stylelint-scss`, `husky ^9`, `lint-staged`,
`@commitlint/cli`, `@commitlint/config-conventional`, `@types/react`, `@types/react-dom`
(rangos exactos: los de `lomito-train/package.json`). **Fuera**: `@dnd-kit/*`, `exceljs`,
`jspdf`, `jspdf-autotable`, `uuid`, `vite-plugin-pwa`.

## Anexo B — `eslint.config.js` respecto a Lomito Train

1. Bloque Node: anadir `'scripts/**/*.mjs'` a `files` (hoy los scripts solo reciben Prettier).
2. Resolver alias: quitar `@theme`; anadir `['@content', './src/content']`; mantener `@services`.
3. `import-x/order`: pathGroup `@content/**` en lugar de `@theme/**`.
4. `import-x/no-unresolved: 'error'` sin `ignore` (no hay modulos `virtual:`).
5. Almacenamiento prohibido en todo `src`: mantener `no-restricted-properties`
   (`window.localStorage`, + `sessionStorage`) y anadir `no-restricted-globals` para
   `localStorage` y `sessionStorage` (el global desnudo). Sin bloque de excepcion.
6. Fusionar los dos bloques de `no-restricted-imports` en uno para `src/**/*.{js,jsx}`
   (`@features/*/*` y `../../../*`).
7. `src/domain/**/*.js`: mantener las prohibiciones y anadir
   `'import-x/extensions': ['error', 'ignorePackages', { js: 'always' }]`.
8. Bloque "domain y services no importan React": tal cual.

## Anexo C — Esquemas (forma; se escriben con `r.*` de `rules.js`)

```js
// exercise.schema.js
{ id: r.slug(), name: r.text(LIMITS.name),
  muscleIds: r.listOf({ valores: MUSCLE_IDS, ...LIMITS.musclesPerExercise }),
  equipmentId: r.oneOf(EQUIPMENT_IDS),
  instructions: r.listOfText({ ...LIMITS.instructions, itemMax: LIMITS.text.max }),
  commonMistakes: r.listOfText({ ...LIMITS.commonMistakes, itemMax: LIMITS.text.max }),
  source: r.optional(r.source(SOURCE_PROVIDER_IDS)) }

// client.schema.js
routineExerciseSchema = { exerciseId: r.slug(), reps: r.range({ ...LIMITS.reps, integer: true }),
  sets: r.optional(r.number({ ...LIMITS.sets, integer: true })),
  rir: r.optional(r.range({ ...LIMITS.rir, integer: true })),
  restSeconds: r.optional(r.range({ ...LIMITS.restSeconds, integer: true })),
  warmupSets: r.optional(r.number({ ...LIMITS.warmupSets, integer: true })),
  notes: r.optional(r.text({ min: 1, max: LIMITS.text.max })) }
routineSchema = { name: r.text(LIMITS.name), notes: r.optional(r.text({ min: 1, max: LIMITS.notes.max })),
  exercises: { __each: routineExerciseSchema, __min: 1, __max: LIMITS.exercisesPerRoutine.max } }
clientSchema = { name: r.text(LIMITS.name), goalId: r.oneOf(GOAL_IDS), levelId: r.oneOf(LEVEL_IDS),
  startDate: r.isoDate(), reviewDate: r.optional(r.isoDate()),
  notes: r.optional(r.text({ min: 1, max: LIMITS.notes.max })),
  routines: { __each: routineSchema, __min: 1, __max: LIMITS.routinesPerClient.max } }

// methodology.schema.js
{ defaults: { sets: r.number(...), warmupSets: r.number(...), rir: r.range(...), restSeconds: r.range(...) },
  sections: { __each: { id: r.slug(), title: r.text(LIMITS.name), body: r.listOfText({ min: 1, max: 4, itemMax: 400 }) }, __min: 1, __max: 8 },
  progressionExample: { title: r.text(LIMITS.name), steps: r.listOfText({ min: 2, max: 8, itemMax: LIMITS.text.max }) } }
```
