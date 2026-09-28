# Exportacion del plan a Lomito Train

El cliente descarga su plan desde la tarjeta "Registra tu entrenamiento en Lomito
Train" y lo importa en Lomito Train (Ajustes, Importar datos). Alli cada dia del plan
es una rutina con sus ejercicios y las series efectivas listas para anotar.

Es la unica integracion entre las dos aplicaciones, y es un archivo: no hay red entre
ellas, ni cuentas, ni servidor.

## Que se exporta y que no

| Va en el archivo                                          | No va                                               |
| --------------------------------------------------------- | --------------------------------------------------- |
| Cada ejercicio una sola vez: nombre, grupos, equipamiento | Instrucciones, errores comunes, imagenes            |
| Cuantas series efectivas pide cada ejercicio              | Pesos, repeticiones hechas, marcas: son del cliente |
| Una rutina por dia, con su nombre y un color              | Repeticiones, RIR y descanso: se leen en el plan    |

Lomito Train no tiene donde guardar un rango de repeticiones ni un RIR, y su modelo de
serie es peso y repeticiones hechas. El plan sigue siendo la referencia de que hacer;
Lomito Train, el registro de lo hecho.

## Formato, version 1

```json
{
  "app": "lomito-workouts",
  "kind": "plan",
  "planVersion": 1,
  "exportedAt": "2026-09-28T18:00:00.000Z",
  "title": "Plan de Juan",
  "data": {
    "exercises": [
      {
        "key": "incline-db-press",
        "name": "Press inclinado con mancuernas",
        "muscleGroupIds": ["push", "upperbody"],
        "equipmentId": "dumbbell",
        "setCount": 2
      }
    ],
    "routines": [
      {
        "name": "Día 1 · Push",
        "colorId": "lavender",
        "exerciseKeys": ["incline-db-press"]
      }
    ]
  }
}
```

- `app` distingue un plan de una copia de seguridad de Lomito Train, que usa
  `"lomito-train"`. Una version de Lomito Train anterior a esta integracion rechaza el
  archivo como "no es una copia valida" y no toca nada: nunca lo trata como una copia
  que sustituye los datos.
- `planVersion` sube si cambia la forma del archivo. Lomito Train rechaza una version
  mayor que la que conoce y pide actualizar.
- `key` es el id del ejercicio en la biblioteca de Lomito Workouts. Solo sirve para
  que las rutinas referencien ejercicios dentro del archivo: Lomito Train genera sus
  propios ids.
- `muscleGroupIds`, `equipmentId` y `colorId` usan el vocabulario y los catalogos de
  Lomito Train, no los de aqui. Es la unica excepcion a la palabra prohibida
  `muscleGroup`: son campos de otra aplicacion.
- Los nombres se recortan a 60 caracteres, el maximo de Lomito Train.

## Traduccion de catalogos

Vive en `src/domain/catalogs/tracking.js`, el unico archivo que sabe como es Lomito
Train. La construccion del archivo, en `src/domain/model/trackingExport.js`.

- Musculos: cada musculo de aqui se traduce a los grupos de Lomito Train (empuje,
  tiron, pierna, tren superior, tren inferior). Los del musculo principal van primero,
  sin duplicados y con un maximo de cinco. La lumbar va con el tren inferior porque se
  trabaja el dia de cadena posterior.
- Equipamiento: los dos proyectos comparten el mismo catalogo, sin traduccion.
- Colores de rutina: cada dia toma el siguiente color de la paleta de Lomito Train.
- Un ejercicio que aparece en dos rutinas se exporta una vez, con el mayor numero de
  series efectivas que pida cualquiera de ellas.

## Que hace Lomito Train al importarlo

Un plan se fusiona con lo que el cliente ya tiene; nada se borra. Las reglas viven en
`src/domain/storage/planImport.js` de Lomito Train y en su `docs/export.md`:

1. Un ejercicio con el mismo nombre que uno existente, sin distinguir acentos ni
   mayusculas, es ese ejercicio: se reutiliza con sus series y su marca.
2. Un ejercicio nuevo se crea con tantas series vacias como `setCount`.
3. Una rutina con el mismo nombre que una existente se actualiza con los ejercicios
   del plan y conserva su color. Por eso importar dos veces el mismo plan, o una
   revision del plan, no duplica nada.
4. La confirmacion dice que se anade y que se conserva. El boton no es de peligro.

Consecuencia para quien escribe planes: el nombre de un ejercicio es su identidad en
Lomito Train. Renombrar un ejercicio de la biblioteca hace que la siguiente
importacion cree uno nuevo en lugar de reutilizar el que ya tiene series.

## Verificado de extremo a extremo

Archivo descargado desde el plan de ejemplo e importado dos veces en un Lomito Train
con datos previos: un ejercicio con el mismo nombre que uno del plan y dos series
registradas, otro ejercicio propio y una rutina propia.

| Comprobacion                              | Resultado                                          |
| ----------------------------------------- | -------------------------------------------------- |
| Ejercicios tras la primera importacion    | 23: 21 nuevos, 1 reutilizado, 1 propio             |
| Ejercicio con el mismo nombre             | mismo id, series 22,5 x 10 y 22,5 x 9 intactas     |
| Ejercicio nuevo                           | grupos y equipamiento traducidos, 2 series vacias  |
| Rutina y ejercicio propios                | intactos                                           |
| Rutinas del plan                          | 4, con los colores lavanda, menta, cielo, durazno  |
| Referencias huerfanas                     | 0                                                  |
| Segunda importacion                       | mismos ids de ejercicios y rutinas, nada duplicado |
| Pantalla de la rutina importada           | se pinta con la marca del ejercicio reutilizado    |
| Copia de seguridad propia de Lomito Train | sigue mostrando la confirmacion de sustituir       |
