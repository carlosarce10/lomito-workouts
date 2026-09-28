# Guia de contribucion

Convenciones de trabajo de Lomito Workouts. El contexto tecnico esta en
[CLAUDE.md](CLAUDE.md); el producto, en [PRODUCT.md](PRODUCT.md). Son las mismas
convenciones que Lomito Train.

## Antes de empezar

```bash
npm install          # instala tambien las devDependencies y activa los hooks de git
npm run dev
```

El `.npmrc` fija `include=dev`, asi que un clon limpio instala las herramientas de
calidad y el script `prepare` deja los hooks de husky activos sin ningun paso extra.

## Puerta de calidad

```bash
npm run check
```

Ejecuta, en este orden: comprobacion de formato, ESLint, Stylelint, clases BEMIT,
claves de traduccion, contenido y build. Tiene que pasar en verde antes de cada commit.

El hook de `pre-commit` ejecuta `lint-staged`, que formatea y corrige solo los
archivos preparados. Es rapido a proposito: su trabajo es que el codigo no se
desformatee, no sustituir a `npm run check`.

Si un hook estorba, se arregla el hook. No se usa `--no-verify` como habito.

## Mensajes de commit

Se sigue [Conventional Commits](https://www.conventionalcommits.org/). El hook
`commit-msg` lo verifica con commitlint y rechaza lo que no cumpla.

```
<tipo>(<ambito>): <descripcion>

<cuerpo: el porque del cambio>

<pie: BREAKING CHANGE y trailers de atribucion>
```

Reglas del asunto:

- En espanol, en imperativo, en minuscula, sin punto final.
- Maximo 72 caracteres.
- Describe **que cambia para quien lo usa o lo lee**, no que archivos se tocaron.
- Sin emojis.

### Tipos

| Tipo       | Cuando                                              |
| ---------- | --------------------------------------------------- |
| `feat`     | Funcionalidad nueva visible para el usuario         |
| `fix`      | Correccion de un defecto                            |
| `refactor` | Cambio interno sin alterar el comportamiento        |
| `style`    | Solo formato: espacios, comas, saltos. Nunca logica |
| `perf`     | Mejora de rendimiento                               |
| `docs`     | Documentacion                                       |
| `test`     | Pruebas                                             |
| `build`    | Dependencias, empaquetado, configuracion de build   |
| `ci`       | Integracion continua                                |
| `chore`    | Mantenimiento sin efecto en `src/`                  |
| `revert`   | Revierte un commit anterior                         |

### Ambitos

La lista cerrada vive en `commitlint.config.js`, que es la fuente de verdad. Los
ambitos coinciden con el vocabulario canonico de CLAUDE.md, no con nombres de
carpeta improvisados. Cuando aparece un modulo nuevo, se anade alli primero.

### Ejemplos

```
feat(plan): mostrar las rutinas por dia con pestanas
feat(content): anadir la biblioteca inicial de ejercicios
fix(a11y): dar 44 pixeles de alto al enlace a Lomito Train
refactor(domain): derivar los musculos de una rutina de sus ejercicios
build(deps): copiar el tooling de calidad de Lomito Train
docs: documentar el vocabulario canonico y las reglas duras
```

### Cambios que rompen el contenido

Cualquier cambio en la forma de los JSON de contenido (biblioteca, clientes,
metodologia) lleva `BREAKING CHANGE:` en el pie, con lo que hay que cambiar en los
archivos existentes.

## Atribucion

**Identidad de git coherente.** El nombre y el correo de los commits deben
identificar a una persona de forma estable.

**Trailers de atribucion.** Se anaden al pie del mensaje, separados por una linea
en blanco:

- `Co-Authored-By: Nombre <correo>` cuando el cambio se escribio entre varios, o
  con asistencia de una herramienta de IA. GitHub lo reconoce y atribuye el commit
  a ambos.

**Plantilla de mensaje.** Ya configurada en este repositorio:

```bash
git config --local commit.template .gitmessage
```

## Ramas

`main` es la rama de integracion, siempre debe construir, y es la que despliega a
GitHub Pages. El trabajo con riesgo va en una rama corta con el mismo vocabulario
que los ambitos de commit:

```
feat/plan-routine-tabs
fix/a11y-tracking-link
```
