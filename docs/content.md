# Contenido: biblioteca, clientes y metodologia

Todo lo que ve el cliente sale de tres fuentes JSON. Ninguna pasa por i18n: son
contenido editorial, y los escribe una persona o la skill `lomito-plan`.

| Fuente                   | Ruta                                      | Como entra                                                             |
| ------------------------ | ----------------------------------------- | ---------------------------------------------------------------------- |
| Biblioteca de ejercicios | `src/content/exercises/<grupo>/<id>.json` | Al bundle, por `import.meta.glob` en `src/services/content/library.js` |
| Metodologia              | `src/content/methodology.json`            | Al bundle, por import estatico                                         |
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
`core`, `quads`, `hamstrings`, `glutes`, `calves`. El grupo de cada musculo esta en
`muscles.js` (`chest-upper` es del grupo `chest`, `lats` del grupo `back`).

## Un cliente

Archivo `public/clients/<slug>.json`. El slug es el nombre del archivo:
`<nombre>-<cuatro caracteres al azar>`, por ejemplo `juan-7k2p`. Nunca se adivina ni
se reutiliza. `name` es solo nombre de pila o apodo: el sitio es publico.

```json
{
  "name": "Juan",
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
          "restSeconds": { "min": 60, "max": 90 },
          "warmupSets": 0
        }
      ]
    }
  ]
}
```

| Campo                  | Obligatorio | Forma                                                   |
| ---------------------- | ----------- | ------------------------------------------------------- |
| `name`                 | si          | 1 a 60 caracteres                                       |
| `goalId`               | si          | `hypertrophy`, `strength` o `general`                   |
| `levelId`              | si          | `beginner`, `intermediate` o `advanced`                 |
| `startDate`            | si          | `YYYY-MM-DD`                                            |
| `reviewDate`           | no          | `YYYY-MM-DD`                                            |
| `notes`                | no          | hasta 300 caracteres; nada de datos de salud detallados |
| `routines`             | si          | 1 a 7. Su numero es la posicion: no hay campo `day`     |
| `routines[].name`      | si          | 1 a 60 caracteres, unico dentro del cliente             |
| `routines[].notes`     | no          | hasta 300 caracteres                                    |
| `routines[].exercises` | si          | 1 a 12, sin `exerciseId` repetido                       |

Cada ejercicio prescrito lleva `exerciseId` y `reps` (`{ min, max }`) obligatorios.
`sets`, `rir`, `restSeconds` y `warmupSets` se omiten salvo que se aparten de la
metodologia: los valores por defecto viven en `methodology.defaults` y los aplica
`resolvePlan`. `notes` es opcional. Los musculos de la rutina y la frecuencia
semanal se derivan: no se escriben.

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
   `day`, `category`, `program`.
7. Un ejercicio con `source` tiene sus dos fotogramas en `public/exercises/<id>/`
   (aviso hasta que la fase 3 descargue las imagenes; error despues).

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
3. `npm run format`, `npm run lint:content` y `npm run check`.
4. La URL del plan es `<sitio>/#/<slug>`.

Prettier colapsa los arrays y objetos JSON que caben en una linea: todo JSON escrito
a mano o por un script pasa por `npm run format` antes de `check`.
