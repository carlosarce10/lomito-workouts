---
name: lomito-plan
description: Crea o modifica el plan de un cliente de Lomito Workouts (JSON en public/clients y, si hace falta, ejercicios nuevos en src/content/exercises) y deja npm run check en verde sin commitear. Usar cuando se pida crear, cambiar o revisar el plan de un cliente, cambiar un ejercicio de su rutina o agregar un ejercicio a la biblioteca.
---

# Plan de un cliente

Lomito Workouts entrega planes de solo lectura. Un plan es un JSON en
`public/clients/<slug>.json` que referencia ejercicios de la biblioteca
`src/content/exercises/<grupo>/<id>.json`. Esta skill escribe esos archivos y nada
mas. El seguimiento (pesos, marcas, historial) es de Lomito Train y no existe aqui.

## Antes de escribir

1. Leer `CLAUDE.md` (vocabulario canonico y reglas duras) y `docs/content.md` (forma
   de cada JSON e invariantes).
2. Leer los catalogos: `src/domain/catalogs/muscles.js`, `equipment.js`, `levels.js`,
   `goals.js`; los limites en `src/domain/validation/limits.js`; los valores por
   defecto en `src/content/methodology.json`.
3. Listar la biblioteca (`ls src/content/exercises/*/`) para reutilizar lo que existe.

## Datos que hacen falta

Las preguntas estan en `docs/intake.md`, que es el cuestionario que el entrenador
envia al cliente. Si la peticion no trae las imprescindibles (nombre de pila o
apodo, objetivo, nivel, dias por semana, lugar y equipamiento, lesiones o
molestias), preguntarlas antes de escribir, con la misma redaccion. Las demas se
preguntan solo si cambian la eleccion de ejercicios. Para modificar un plan: el slug.

Peso corporal, edad y datos medicos no se escriben en el plan aunque el cliente los
haya dado.

## Seleccion de ejercicios

El nivel del cliente (`levelId`) decide que ejercicios pueden entrar en su plan. Un
ejercicio que exige tecnica que el cliente todavia no tiene no es un buen ejercicio
para el, por bien que trabaje el musculo.

| Nivel          | Entra                                                                                                              | No entra                                                                                                                               |
| -------------- | ------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| `beginner`     | Maquinas guiadas y poleas. Mancuernas solo en movimientos simples: curls, elevaciones laterales. Lumbares sin peso | Hip thrust, peso muerto y rumano, sentadilla con barra, sentadilla bulgara, zancadas, remo con barra, press militar, dominadas, fondos |
| `intermediate` | Lo anterior, mas barra libre en los basicos, mancuernas en presses y remos, unilaterales, hip thrust, rumano       | Variantes olimpicas y ejercicios de potencia                                                                                           |
| `advanced`     | Toda la biblioteca                                                                                                 |                                                                                                                                        |

Reglas fijas, en cualquier nivel:

- **Un solo patron de sentadilla o prensa por dia de pierna.** Prensa, sentadilla hack,
  sentadilla, bulgara y zancada son el mismo patron: nunca dos en la misma rutina.
  El resto del dia se completa con extension de cuadriceps, curl femoral, gluteo y
  gemelo.
- Si la biblioteca solo tiene una version tecnica de un ejercicio, se crea la version
  guiada (en maquina o polea) en lugar de meter la tecnica.
- En la respuesta se dice que ejercicios se descartaron por nivel y cual los sustituye.

## Pasos

1. **Slug.** Para un cliente nuevo, `<nombre>-<cuatro caracteres al azar>`:
   `node -e "const a='abcdefghijklmnopqrstuvwxyz0123456789';console.log(Array.from(require('crypto').randomBytes(4),b=>a[b%36]).join(''))"`.
   Nunca se reutiliza ni se adivina. Un cliente existente conserva el suyo.
2. **Rutinas.** Aplicando la seleccion de ejercicios de arriba, cada dia es una `routine` con `name` unico y sus `exercises`. Solo
   `exerciseId` y `reps` son obligatorios por ejercicio; `sets`, `rir`, `restSeconds`
   y `warmupSets` se omiten salvo que se aparten de la metodologia. `notes` cuando
   el entrenador quiera decir algo de ese ejercicio. No existe `day`: el orden en la
   lista es el dia.
3. **Ejercicios nuevos** solo si no hay uno equivalente en la biblioteca. Se crean
   en `src/content/exercises/<grupo de muscleIds[0]>/<id>.json` con `id` en ingles y
   kebab-case, `name`, `instructions` (3 a 5 pasos) y `commonMistakes` (2 a 3) en
   espanol con acentos, y `source` de free-exercise-db si existe:
   `node scripts/find-exercise.mjs <texto>` devuelve los ids. Si no hay imagen, se
   deja sin `source` y se avisa.
4. **Imagenes.** Si hubo ejercicios nuevos con `source`: `npm run images -- <id>`.
5. **Formato y puerta.** `npx prettier --write` sobre los archivos tocados, despues
   `npm run lint:content` y, si pasa, `npm run check`. Un error del script se corrige
   en el JSON, nunca relajando el esquema.
6. **Respuesta.** Archivos creados o cambiados, la URL del plan
   (`https://carlosarce10.github.io/lomito-workouts/#/<slug>`), y los ejercicios que
   quedaron sin imagen. Proponer el mensaje de commit (Conventional Commits, ambito
   `content`, en espanol sin acentos) y **no ejecutarlo**.

## Limites

- Puede tocar: `public/clients/*.json`, `src/content/exercises/**/*.json` y, solo
  a traves de `npm run images`, `public/exercises/**`.
- No puede tocar: `src/**/*.{js,jsx,scss}`, `src/content/methodology.json`,
  `src/i18n/**`, ni la configuracion del repositorio.
- Nunca `git add`, `git commit` ni `git push`.
- Nunca borra un cliente sin que se lo pidan por su slug.
- Nunca escribe campos de seguimiento (`weight`, `record`, `history`, `session`,
  `timer`, `log`), datos de salud detallados en `notes`, ni consejos medicos.
