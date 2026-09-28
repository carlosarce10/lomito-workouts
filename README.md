# Lomito Workouts

Planes de entrenamiento personalizados entregados por web movil. El cliente abre un
enlace privado y ve su perfil, la metodologia y sus rutinas con tarjetas de ejercicio:
imagen, musculos, series, repeticiones, RIR, descanso, como hacerlo y errores comunes.

Solo planifica y explica. El seguimiento del entrenamiento vive en
[Lomito Train](https://lomito-train.netlify.app/) y no se duplica aqui.

Sin backend, sin base de datos y sin cuentas: el contenido es JSON dentro del
repositorio y se publica como sitio estatico.

## Puesta en marcha

```bash
npm install
npm run dev
```

El servidor escucha en el puerto 5173 y acepta conexiones desde la red local, para
poder abrirlo desde el movil durante el desarrollo.

## Comandos

| Comando                | Que hace                                                |
| ---------------------- | ------------------------------------------------------- |
| `npm run dev`          | Servidor de desarrollo                                  |
| `npm run build`        | Build de produccion en `dist/`                          |
| `npm run preview`      | Sirve el build de produccion                            |
| `npm run lint`         | ESLint                                                  |
| `npm run lint:css`     | Stylelint                                               |
| `npm run lint:classes` | Cruza las clases BEMIT del JSX contra el SCSS           |
| `npm run lint:i18n`    | Claves de traduccion usadas, declaradas y plurales      |
| `npm run format`       | Prettier en modo escritura                              |
| `npm run check`        | Formato, lints y build. Puerta unica antes de commitear |

## Stack

React con Vite, Sass e iconos Material Design, clonado de Lomito Train: mismo sistema
de estilos, mismos componentes base y mismas convenciones. Sin TypeScript: la forma de
los JSON de contenido se valida con un script antes de cada build.

## Documentacion

| Documento                                          | Para que                                                               |
| -------------------------------------------------- | ---------------------------------------------------------------------- |
| [PRODUCT.md](PRODUCT.md)                           | Que es el producto, para quien y con que restricciones                 |
| [CLAUDE.md](CLAUDE.md)                             | Contexto tecnico: vocabulario, estructura, convenciones y reglas duras |
| [CONTRIBUTING.md](CONTRIBUTING.md)                 | Commits, atribucion y flujo de trabajo                                 |
| [docs/plan.md](docs/plan.md)                       | El plan por fases del MVP y sus decisiones                             |
| [docs/roadmap.md](docs/roadmap.md)                 | Que fase esta cerrada y que queda                                      |
| [docs/intake.md](docs/intake.md)                   | Cuestionario para un cliente nuevo, antes de crear su plan             |
| [docs/tracking-export.md](docs/tracking-export.md) | Formato del plan que importa Lomito Train                              |

Antes de escribir codigo se lee CLAUDE.md. Antes de escribir un commit se lee
CONTRIBUTING.md.

## Publicar

El sitio se publica en GitHub Pages con el workflow `.github/workflows/deploy.yml`:
cada push a `main` ejecuta `npm run check` y despliega `dist/`. Configuracion
necesaria una sola vez en el repositorio: Settings > Pages > Build and deployment >
Source: "GitHub Actions".

La URL publica sale de `VITE_SITE_URL` en `.env` (solo la usa `index.html` para la
vista previa del enlace): si el repositorio se llama distinto de `lomito-workouts`,
se cambia ahi.

El plan de un cliente vive en `https://carlosarce10.github.io/lomito-workouts/#/<slug>`.
Se comparte ese enlace tal cual por WhatsApp o donde sea; al abrirlo en el movil se
ve el plan sin instalar nada.

Para probar el build en una subruta antes de publicar, igual que lo servira Pages:

```bash
npm run build
mkdir -p /tmp/lomito-sub/lomito-workouts && cp -R dist/. /tmp/lomito-sub/lomito-workouts/
python3 -m http.server 5181 --directory /tmp/lomito-sub
# abrir http://127.0.0.1:5181/lomito-workouts/#/juan-7k2p
```

## Anadir o cambiar un plan

Los planes son JSON en `public/clients/` y la biblioteca de ejercicios en
`src/content/exercises/`. Como se escriben esta en [docs/content.md](docs/content.md).
En Claude Code, la skill `lomito-plan` (`.claude/skills/lomito-plan/`) crea o modifica
un plan siguiendo esas reglas y deja `npm run check` en verde, sin commitear.
