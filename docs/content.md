# Contenido: biblioteca, clientes y metodologia

Todo lo que ve el cliente sale de cuatro fuentes JSON. Ninguna pasa por i18n: son
contenido editorial, y los escribe una persona o la skill `lomito-plan`.

| Fuente                   | Ruta                                      | Como entra                                                             |
| ------------------------ | ----------------------------------------- | ---------------------------------------------------------------------- |
| Biblioteca de ejercicios | `src/content/exercises/<grupo>/<id>.json` | Al bundle, por `import.meta.glob` en `src/services/content/library.js` |
| Metodologia              | `src/content/methodology.json`            | Al bundle, por import estatico                                         |
| Nutricion                | `src/content/nutrition/*.json`            | Al bundle, por import estatico                                         |
| Clientes                 | `public/clients/<slug>.json`              | Se sirve tal cual y se carga con `fetch` al abrir `/#/<slug>`          |

Los clientes no entran al bundle a proposito: con `import.meta.glob` el mapa de chunks
expondria todos los slugs en el JS principal, y el slug es lo unico que protege un
plan en un sitio publico sin login.

Antes de cada build, `npm run lint:content` valida las tres fuentes contra los
esquemas de `src/domain/schemas/` y las invariantes de abajo. El runtime no valida:
`resolvePlan` solo resuelve referencias y aplica valores por defecto.

## Un ejercicio

Archivo `src/content/exercises/<grupo>/<id>.json`. El archivo se llama como su `id`
y la carpeta es el grupo de su primer musculo.

```json
{
  "id": "incline-db-press",
  "name": "Press inclinado con mancuernas",
  "muscleIds": ["chest-upper", "shoulders-front", "triceps"],
  "equipmentId": "dumbbell",
  "instructions": [
    "Ajusta el banco a 30-45 grados. ...",
    "Empuja ...",
    "Baja en 2-3 segundos ..."
  ],
  "commonMistakes": [
    "Inclinar el banco mas de 45 grados: el trabajo pasa al hombro.",
    "..."
  ],
  "source": { "provider": "free-exercise-db", "id": "Incline_Dumbbell_Press" }
}
```

| Campo            | Obligatorio | Forma                                                                  |
| ---------------- | ----------- | ---------------------------------------------------------------------- |
| `id`             | si          | kebab-case en ingles, unico en toda la biblioteca                      |
| `name`           | si          | 1 a 60 caracteres, en espanol, con acentos                             |
| `muscleIds`      | si          | 1 a 4 ids de `src/domain/catalogs/muscles.js`; el primero manda        |
| `equipmentId`    | si          | id de `src/domain/catalogs/equipment.js` (los mismos que Lomito Train) |
| `instructions`   | si          | 1 a 8 pasos de hasta 200 caracteres: que hacer, en orden               |
| `commonMistakes` | si          | 0 a 6 errores de hasta 200 caracteres                                  |
| `source`         | no          | `{ provider, id }`; sin `source` la tarjeta muestra un icono           |

Grupos y carpetas: `chest`, `back`, `shoulders`, `biceps`, `triceps`, `forearms`,
`core`, `quads`, `hamstrings`, `glutes`, `adductors`, `calves`. El grupo de cada musculo esta en
`muscles.js` (`chest-upper` es del grupo `chest`, `lats` del grupo `back`).

## Un cliente

Archivo `public/clients/<slug>.json`. El slug es el nombre del archivo:
`<nombre>-<cuatro caracteres al azar>`, por ejemplo `ana-3f9q`. Nunca se adivina ni
se reutiliza. `name` lleva nombre y apellido. El slug protege el enlace, pero el
repositorio es publico: los JSON de clientes se leen en GitHub.

```json
{
  "name": "Ana López",
  "goalId": "hypertrophy",
  "levelId": "beginner",
  "startDate": "2026-09-28",
  "reviewDate": "2026-11-09",
  "notes": "Molestia leve en el hombro derecho: nada de press militar con barra.",
  "routines": [
    {
      "name": "Push",
      "notes": "Empieza por el press inclinado.",
      "exercises": [
        { "exerciseId": "incline-db-press", "reps": { "min": 8, "max": 12 } },
        {
          "exerciseId": "db-lateral-raise",
          "reps": { "min": 12, "max": 15 },
          "warmupSets": 0
        }
      ]
    }
  ]
}
```

| Campo                      | Obligatorio | Forma                                                                 |
| -------------------------- | ----------- | --------------------------------------------------------------------- |
| `name`                     | si          | nombre y apellido, 1 a 60 caracteres                                  |
| `goalId`                   | si          | `hypertrophy`, `strength` o `general`                                 |
| `levelId`                  | si          | `beginner`, `intermediate` o `advanced`                               |
| `startDate`                | si          | `YYYY-MM-DD`                                                          |
| `reviewDate`               | no          | `YYYY-MM-DD`                                                          |
| `notes`                    | no          | hasta 300 caracteres; nada de datos de salud detallados               |
| `unitSystemId`             | no          | `metric` (por defecto) o `imperial`; solo cambia como se muestra      |
| `diet`                     | no          | el bloque que imprime `npm run diet`, nunca escrito a mano            |
| `routines`                 | si          | 1 a 7. Su numero es la posicion: no hay campo `day`                   |
| `routines[].name`          | si          | 1 a 60 caracteres, unico dentro del cliente                           |
| `routines[].notes`         | no          | hasta 300 caracteres; es el calentamiento, se lee antes de empezar    |
| `routines[].cardioMinutes` | no          | cardio al terminar, 0 a 120; sin el, 30 de la metodologia; 0 lo quita |
| `routines[].exercises`     | si          | 1 a 12, sin `exerciseId` repetido                                     |

Cada ejercicio prescrito lleva `exerciseId` y `reps` (`{ min, max }`) obligatorios.
`alternativeId` es opcional: el ejercicio que lo sustituye si el gimnasio no tiene la
maquina, con la misma prescripcion. En el plan se ve como un carrusel dentro de la
tarjeta. Tiene que existir, ser otro ejercicio, no estar ya en la rutina y compartir el
musculo principal (el primero de uno lo trabaja el otro).
`sets`, `rir`, `restSeconds` y `warmupSets` se omiten salvo que se aparten de la
metodologia: los valores por defecto viven en `methodology.defaults` y los aplica
`resolvePlan`. `notes` es opcional. Los musculos de la rutina y la frecuencia
semanal se derivan: no se escriben.

## La recomendacion nutrimental

`diet` es opcional y lo escribe `npm run diet` a partir de peso, estatura, edad, sexo,
actividad y objetivo de dieta. Esas entradas no se guardan: en el JSON solo entran
resultados en metrico, todos como rangos `{ min, max }` (un punto es `min === max`).
La formula y los redondeos estan en [diet.md](diet.md). En el plan es la pestana Dieta,
que solo aparece si el cliente tiene `diet`.

## La nutricion: alimentos, platos, suplementos y consejos

Cuatro archivos en `src/content/nutrition/`, iguales para todos los clientes. Cada
cliente los ve ajustados a su `diet` por `buildNutritionPlan`
(`src/domain/model/nutritionPlan.js`), que corre en el navegador porque solo usa
resultados.

| Archivo            | Cada entrada                                                                                 |
| ------------------ | -------------------------------------------------------------------------------------------- |
| `foods.json`       | `id`, `name`, `foodGroupId`, `grams`, `measure { amount, unit, unitPlural, step }`, `macros` |
| `plates.json`      | `id`, `name`, `mealIds` (desayuno, comida, cena, snack), `foodIds`, `source` de la foto      |
| `supplements.json` | `id`, `name`, `dose`, `body` (1 a 3 parrafos), `source` de la foto                           |
| `diet.json`        | `tips` (consejos cortos) y `sections` (id, titulo y parrafos, plegados al final)             |

Un alimento se describe por UNA porcion de mano de su grupo: una palma de proteina
(unos 25 g), un puno de carbohidratos (unos 25 g), un pulgar de grasa (unos 10 g) o un
puno de verdura (libre). `measure` es como se mide esa porcion en casa y `step` el
redondeo al escalarla; con `unit: "g"` la medida es el peso. `macros` son los gramos de
proteina, carbohidratos y grasa de esa porcion.

Un plato lista sus alimentos sin cantidades. Para cada cliente, las porciones del dia
se reparten un 80 % entre sus comidas principales y un 20 % a snacks: uno, entre la
comida y la cena, o dos (media manana y tarde) si ese 20 % pasa de 450 kcal. El dia se
muestra en ese orden y cada momento ofrece como carrusel todos los platos de su
`mealIds`; la primera opcion es la sugerida y no se repite entre momentos. Cada plato se
ajusta por iteracion a los gramos de su momento, porque los alimentos aportan macros de
otros grupos (los frijoles traen proteina). Despues cada cantidad se redondea a su
medida casera.

Proteina de calidad primero: la proteina de cada comida principal sale de su fuente
proteica (carne, pescado, huevo, lacteo, proteina en polvo), de 0,4 a 0,55 g por kilo
de peso en comida y cena, el valor mas alto que no pasa del maximo de proteina del dia,
y 0,3 g/kg en el desayuno, que es mas ligero. La que traen
arroz, tortilla o frijoles suma al total del dia pero no achica la carne. Ninguna
fuente de carbohidratos pasa de 2 1/2 porciones en un plato. Los snacks cubren lo que
falta para la mitad de cada rango del dia, descontando la proteina que ya trae su
avena o su granola. El total del dia muestra cuanta proteina viene de fuente de
calidad.

Las fotos las descarga `npm run photos` desde Openverse (licencias CC0, dominio publico
o CC BY) a `public/nutrition/<id>.jpg`, con la atribucion en
`public/nutrition/ATTRIBUTION.md`. Para usar una foto propia se quita `source` y se
coloca el archivo con el mismo nombre.

```
npm run diet -- --sex male --age 30 --height 170cm --body-mass 154lb --activity moderate --diet-goal deficit --meals 3
```

| Campo                 | Forma                                                                       |
| --------------------- | --------------------------------------------------------------------------- |
| `dietGoalId`          | `deficit`, `maintenance`, `recomposition` o `surplus`; distinto de `goalId` |
| `activityFactor`      | rango 1.2 a 1.9; dos valores cuando hubo duda entre niveles                 |
| `adjustmentPercent`   | rango -30 a 30, con signo                                                   |
| `restingCalories`     | rango 800 a 3500                                                            |
| `maintenanceCalories` | rango 1000 a 6000                                                           |
| `targetCalories`      | rango 1000 a 6000                                                           |
| `proteinPerKg`        | rango 1 a 2.5                                                               |
| `protein`             | rango 40 a 300 g                                                            |
| `fatPercent`          | rango 15 a 40 %                                                             |
| `fat`                 | rango 20 a 200 g                                                            |
| `carbs`               | rango 50 a 800 g                                                            |
| `fiber`               | rango 15 a 80 g                                                             |
| `water`               | opcional, rango 1000 a 6000 ml                                              |
| `mealsPerDay`         | opcional, 2 a 6                                                             |
| `calculatedAt`        | `YYYY-MM-DD`                                                                |
| `notes`               | opcional, hasta 300 caracteres del entrenador; nada de datos de salud       |

## La metodologia

`src/content/methodology.json`: `defaults` (series efectivas, series de
aproximacion, RIR y descanso por defecto), `sections` (id, titulo y parrafos de la
seccion "Como entrenar") y `progressionExample` (titulo y pasos del ejemplo de
progresion). Se cambia a mano, nunca desde la skill.

## Invariantes que impone lint:content

1. Archivo = `id`; carpeta = grupo de `muscleIds[0]`; `id` unico.
2. Todo `exerciseId` existe en la biblioteca y no se repite dentro de una rutina.
3. Ids de catalogo validos: musculos, equipamiento, nivel, objetivo, proveedor.
4. Rangos con `min <= max` y dentro de `src/domain/validation/limits.js`.
5. Slug de cliente con forma `nombre-xxxx`.
6. Ningun campo prohibido: `weight`, `record`, `history`, `session`, `timer`, `log`,
   `day`, `category`, `program`, ni las entradas de la dieta `bodyMass`, `height`,
   `age`, `sex`, `activityId`, `activityIds`, ni `menu`, `lb`, `pounds`, `oz`.
7. Un ejercicio con `source` tiene sus dos fotogramas en `public/exercises/<id>/`
   (aviso hasta que la fase 3 descargue las imagenes; error despues).
8. `diet`, si existe, cumple su esquema: solo resultados en metrico, como rangos.
9. Todo `foodId` de un plato existe; los ids de platos y suplementos no se repiten; uno
   con `source` tiene su foto en `public/nutrition/<id>.jpg`.
10. Un `alternativeId` existe, no es el mismo ejercicio, no esta ya en la rutina y
    comparte el musculo principal del ejercicio al que sustituye.

Avisa, sin fallar, de los ejercicios que ningun cliente usa.

## Imagenes

Contrato de rutas: `public/exercises/<id>/0.jpg` (posicion inicial) y `1.jpg`
(posicion final). La interfaz solo conoce esa ruta; de donde salen los archivos es
cosa del proveedor anotado en `source`.

Proveedor provisional: free-exercise-db (Unlicense). El dataset no documenta la
procedencia de las fotos, asi que se tratan como provisionales. `npm run images`
(fase 3) las descarga una vez a `public/exercises/` y escribe
`public/exercises/ATTRIBUTION.md`; los archivos se versionan para que el sitio no
dependa del host externo.

Para sustituirlas por material propio se anade un proveedor sin `baseUrl` al
catalogo `src/domain/catalogs/sources.js`, se apunta `source` a el y se colocan los
dos archivos a mano con los mismos nombres. Ni la interfaz ni el resto del JSON
cambian.

## Como anadir un ejercicio

1. Elegir un `id` en ingles y kebab-case que no exista.
2. Crear el JSON en la carpeta de su primer musculo, con textos en espanol.
3. Si hay imagen en free-exercise-db, anotar `source` con su id (ver
   `scripts/find-exercise.mjs` en la fase 5) y ejecutar `npm run images -- <id>`.
4. `npm run format` y `npm run lint:content`.

## Como anadir o cambiar un cliente

Las preguntas que se le hacen al cliente antes estan en [intake.md](intake.md).

1. Generar el slug (`nombre-xxxx`) y crear o abrir `public/clients/<slug>.json`.
2. Componer las rutinas con ejercicios de la biblioteca; solo `reps` por ejercicio
   salvo excepciones a la metodologia.
3. Si el cliente lleva recomendacion nutrimental, `npm run diet` con sus datos y pegar
   el bloque `diet` que imprime, sin tocar una cifra; `unitSystemId: "imperial"` si
   lee en libras.
4. `npm run format`, `npm run lint:content` y `npm run check`.
5. La URL del plan es `<sitio>/#/<slug>`.

Prettier colapsa los arrays y objetos JSON que caben en una linea: todo JSON escrito
a mano o por un script pasa por `npm run format` antes de `check`.
