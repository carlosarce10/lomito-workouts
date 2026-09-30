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

## Metodologia de programacion

La metodologia de Lomito Dev esta basada en la evidencia: el musculo crece con
volumen suficiente y descanso suficiente, no con mas dias ni con mas ejercicios. Estas
reglas mandan sobre cualquier peticion del cliente; si una respuesta del cuestionario
las contradice (por ejemplo, "puedo entrenar 6 dias"), se aplica la regla y se explica
por que en la respuesta.

**Frecuencia.** Entre 4 y 5 dias por semana por defecto. El cuerpo necesita reposar
para seguir progresando, asi que los dias disponibles son un maximo, no un objetivo.
3 dias o 6 dias solo en un caso concreto, y ese caso se nombra en la respuesta.

**Acondicionamiento.** Un principiante que nunca ha entrenado en gimnasio empieza con
un bloque de 2 semanas de acondicionamiento fisico, de 3 a 4 dias, con RIR 2-3 para
aprender la tecnica. El bloque de hipertrofia se escribe despues, al revisar el plan.
Alguien que ya entreno y lo dejo no es "nunca ha hecho gym": se le pregunta al
entrenador si hace falta.

**Series.** 2 series efectivas y 1 de aproximacion por ejercicio, que son los valores
por defecto de `methodology.json`: no se escribe `sets` ni `warmupSets` salvo una
razon concreta (2 aproximaciones en el ejercicio principal de pierna, por ejemplo).

**Repeticiones.** El maximo es 12 y lo habitual es de 6 a 10. Solo se pasa de 12 en
los musculos que responden mejor a mas repeticiones, como el deltoides posterior.

| Tipo de ejercicio                          | Rango habitual |
| ------------------------------------------ | -------------- |
| Principal o compuesto                      | 6-8 o 6-10     |
| Accesorio o aislamiento                    | 8-10 o 8-12    |
| Deltoides posterior y excepciones anotadas | hasta 15       |

**Un ejercicio por parte o funcion del musculo.** Cada ejercicio de un dia trabaja
una parte distinta del grupo muscular. Nunca dos ejercicios que hacen literalmente la
misma funcion con otra maquina o herramienta: son ejercicios basura que fatigan el
musculo sin sumar estimulo.

| Grupo   | Bien                                                                         | Basura                                                  |
| ------- | ---------------------------------------------------------------------------- | ------------------------------------------------------- |
| Pecho   | Un press de pecho alto o medio y un aislamiento (pec deck, cristos)          | Press en maquina y press con mancuernas el mismo dia    |
| Espalda | Un tiron vertical (jalon) y un remo                                          | Dos remos casi iguales en maquinas distintas            |
| Hombro  | Un press, una elevacion lateral y un ejercicio de posterior                  | Dos elevaciones laterales con distinto material         |
| Triceps | Una extension en polea (cabeza lateral) y una sobre la cabeza (cabeza larga) | Cuerda, barra V y maquina de extension el mismo dia     |
| Biceps  | Un curl y un curl martillo (braquial)                                        | Curl con mancuernas, en polea y en maquina el mismo dia |
| Pierna  | Una prensa o sentadilla, extension, curl femoral, gluteo, gemelo             | Dos prensas o sentadillas (regla fija de abajo)         |

**Volumen semanal por musculo.** Se cuentan las series efectivas de cada grupo
muscular en toda la semana; las de aproximacion no cuentan. Con 2 series por
ejercicio, las series semanales son 2 por cada vez que el grupo aparece como musculo
principal de un ejercicio.

| Series por semana | Para que                                                   |
| ----------------- | ---------------------------------------------------------- |
| 4-6               | Mantenimiento: conservar masa                              |
| 8-10              | Ganancia muscular: el punto de partida por defecto         |
| 10-15             | Alto volumen: solo para los grupos que el cliente prioriza |

Los grupos prioritarios del cliente van a 10-15; el resto, a 8-10; lo que no es
objetivo puede quedarse en mantenimiento. Nunca por encima de 15.

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
2. **Rutinas.** Aplicando la metodologia y la seleccion de ejercicios de arriba, cada dia es una `routine` con `name` unico y sus `exercises`. Solo
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
6. **Respuesta.** Una tabla con las series efectivas por semana de cada grupo muscular
   y si cae en mantenimiento, ganancia o alto volumen; los ejercicios descartados por
   nivel o por lesion y su sustituto; los archivos creados o cambiados, la URL del plan
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
