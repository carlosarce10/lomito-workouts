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
4. Para un plan nuevo, leer [sex-differences.md](sex-differences.md): las diferencias
   entre hombres y mujeres que se tienen en cuenta al programar.

## Datos que hacen falta

Las preguntas estan en `docs/intake.md`, que es el cuestionario que el entrenador
envia al cliente. Si la peticion no trae las imprescindibles (nombre y apellido, sexo,
objetivo, nivel, dias por semana, lugar y equipamiento, lesiones o molestias),
preguntarlas antes de escribir, con la misma redaccion. Las demas se preguntan solo si
cambian la eleccion de ejercicios. Para modificar un plan: el slug.

El sexo nunca se deduce del nombre: se pregunta. "Prefiere no decirlo" es una
respuesta valida y el plan se escribe igual.

Peso corporal, edad, sexo y datos medicos no se escriben en el plan aunque el cliente
los haya dado.

## Metodologia de programacion

La metodologia de Lomito Dev esta basada en la evidencia: el musculo crece con
volumen suficiente y descanso suficiente, no con mas dias ni con mas ejercicios. Estas
reglas mandan sobre cualquier peticion del cliente; si una respuesta del cuestionario
las contradice (por ejemplo, "puedo entrenar 6 dias"), se aplica la regla y se explica
por que en la respuesta.

**Frecuencia.** Entre 4 y 5 dias por semana por defecto. El cuerpo necesita reposar
para seguir progresando, asi que los dias disponibles son un maximo, no un objetivo.
3 dias o 6 dias solo en un caso concreto, y ese caso se nombra en la respuesta.

**Frecuencia por musculo.** Cada grupo se entrena 2 o 3 veces por semana y nunca en
dos dias seguidos, abdomen incluido. Con el mismo volumen semanal, entrenarlo a diario
no suma estimulo y le quita recuperacion; ademas, el abdomen ya trabaja como
estabilizador en los ejercicios pesados. Un grupo prioritario sube de volumen con mas
ejercicios en esas 2 o 3 sesiones, no con mas dias. Si ademas trabaja como secundario
en los compuestos (el gluteo en prensa, hack, sentadilla o bisagras de cadera), sus
aislados se concentran en 2 sesiones con al menos 72 h entre ellas: con el mismo
volumen, 2 sesiones rinden como 3 y el musculo recupera mejor. Con 3 dias de pierna y
el gluteo como prioridad, son 2 dias de parte posterior (gluteo y femoral) y 1 de
parte anterior (cuadriceps y aductores). El dia anterior no lleva aislados de gluteo
ni bisagras; su compuesto es una variante que carga el cuadriceps (prensa con los
pies a media altura, hack), y sus series cuentan para el gluteo como las de cualquier
compuesto.

**Acondicionamiento.** Un principiante que nunca ha entrenado en gimnasio empieza con
un bloque de 2 semanas de acondicionamiento fisico, de 3 a 4 dias, con RIR 2-3 para
aprender la tecnica. El bloque de hipertrofia se escribe despues, al revisar el plan.
Alguien que ya entreno y lo dejo no es "nunca ha hecho gym": se le pregunta al
entrenador si hace falta.

**Series.** 2 series efectivas y 1 de aproximacion por ejercicio, que son los valores
por defecto de `methodology.json`: no se escribe `sets` ni `warmupSets` salvo una
razon concreta (2 aproximaciones en el ejercicio principal de pierna, por ejemplo).
Las 2 aproximaciones solo valen si ese ejercicio abre la sesion. Si llega despues de
los aislados de su grupo, el musculo no empieza con tanta demanda y basta con 1.

**Repeticiones.** El maximo es 12 y lo habitual es de 6 a 10. Solo se pasa de 12 en
los musculos que responden mejor a mas repeticiones: deltoides posterior, deltoides
lateral (elevaciones laterales), gemelos y abdomen.

| Tipo de ejercicio                               | Rango habitual |
| ----------------------------------------------- | -------------- |
| Principal o compuesto                           | 6-8 o 6-10     |
| Accesorio o aislamiento                         | 8-10 o 8-12    |
| Deltoides posterior y lateral, gemelos, abdomen | hasta 15       |

**Calentamiento y cardio.** El calentamiento va en `notes` de cada rutina, que se lee
antes del primer ejercicio, con estos textos y ningun otro (nada de bici, remo ni
eliptica antes de empezar):

- Dia de tren superior: "Calentamiento: rotaciones externas e internas con liga para el
  manguito rotador, aperturas con liga y circulos de hombro, 2 × 15."
- Dia de tren inferior: "Calentamiento: balanceos de pierna, circulos de cadera, puente
  de gluteo y sentadilla sin peso, 2 × 10." Con una lesion de rodilla, la sentadilla
  sin peso se cambia por extensiones de rodilla sin peso.
- El cardio no se escribe en `notes`: la interfaz lo pinta despues del ultimo
  ejercicio ("Al terminar: 30 minutos de caminata en caminadora con la inclinacion al
  maximo"). Los 30 minutos vienen de `methodology.json`; otro tiempo solo si el
  entrenador lo indica, con `cardioMinutes` en la rutina, y `0` lo quita.

Los textos van con acentos en el JSON. Una nota propia de la rutina, si hace falta, va
despues del calentamiento, y todo cabe en los 300 caracteres de `notes`.

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
principal de un ejercicio. En los grupos prioritarios cuentan tambien los compuestos
donde aparecen como secundarios (ver "Grupos prioritarios").

| Series por semana | Para que                                                   |
| ----------------- | ---------------------------------------------------------- |
| 4-6               | Mantenimiento: conservar masa                              |
| 8-10              | Ganancia muscular: el punto de partida por defecto         |
| 10-16             | Alto volumen: solo para los grupos que el cliente prioriza |

El volumen se asigna segun los objetivos, las prioridades, la recuperacion y las
preferencias de cada cliente, independientemente del sexo. Los grupos prioritarios
del cliente van a 10-16; el resto, a 8-10; lo que no es objetivo, o lo que el cliente
prefiere no desarrollar, puede quedarse en mantenimiento. Nunca por encima de 16.

Mantenimiento es el minimo, no cero: biceps, triceps, gemelos y aductores llevan al
menos 4 series directas aunque no sean prioridad. Solo los antebrazos y la zona
lumbar se cubren de forma indirecta, con el agarre y las bisagras de cadera.

**Grupos prioritarios.** Un grupo prioritario se trabaja con ejercicios aislados o
monoarticulares, y el extra se lo dan los ejercicios compuestos que se anaden despues.
Monoarticular es el que mueve una sola articulacion: abductores, patada de gluteo y
hip thrust (solo mueve la cadera) para el gluteo; crunch o elevaciones para el
abdomen. Compuesto es el que mueve varias: prensa, hack o sentadilla, que tambien
cargan el gluteo. Dentro del bloque del grupo, los aislados van primero y los
compuestos despues, para que el compuesto llegue con el musculo ya cansado. Las
series de esos compuestos cuentan para el grupo prioritario aunque en el ejercicio
sea secundario, y tambien para su musculo principal: una prensa suma 2 al cuadriceps
y 2 al gluteo prioritario.

**Orden de la sesion.** Los grupos musculares van en secuencia: se terminan todos los
ejercicios de un grupo antes de pasar al siguiente. Nunca un ejercicio de pecho, uno
de espalda y otra vez pecho. Abren la sesion los grupos prioritarios; el abdomen va
siempre al final aunque sea prioridad, porque cansarlo antes de una carga pesada
resta estabilidad. Despues de los prioritarios, los grupos siguen de mayor a menor
volumen, y dentro de un grupo no prioritario los compuestos van antes que los
aislados.

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
- **La extension de cuadriceps esta en toda semana con pierna**, aunque el cuadriceps
  no sea prioridad: es de los mejores ejercicios de cuadriceps y no se quita para
  hacer sitio.
- Si la biblioteca solo tiene una version tecnica de un ejercicio, se crea la version
  guiada (en maquina o polea) en lugar de meter la tecnica.
- En la respuesta se dice que ejercicios se descartaron por nivel y cual los sustituye.

## Sexo del cliente

El sexo es contexto fisiologico, no una plantilla: individualizar primero y usar el
sexo como contexto. El fundamento esta en [sex-differences.md](sex-differences.md).

Lo que el sexo no cambia:

- **La metodologia.** Frecuencia, series, rangos de repeticiones, RIR, descanso y
  volumen semanal son los mismos para hombres y mujeres. Ninguna mujer pasa de 12
  repeticiones por ser mujer ni ningun hombre baja de 6 por ser hombre.
- **Las prioridades.** Los grupos que van a 10-16 series salen de la respuesta del
  cliente (pregunta de grupos prioritarios de `docs/intake.md`), nunca del sexo. Sin
  prioridad declarada, el reparto es equilibrado. No existe "mujer = gluteo" ni
  "hombre = pecho y brazos".
- **La seleccion por nivel.** Un ejercicio entra o sale por el nivel, las molestias y
  las preferencias, nunca por el sexo.
- **La carga.** El plan no prescribe pesos, y ninguna nota dice "peso ligero" ni "peso
  pesado" en funcion del sexo.

Lo que el sexo si aporta:

- **Variante de sentadilla o prensa.** La pelvis ancha y el angulo Q mayor son mas
  frecuentes en mujeres, no exclusivos. Si el cliente refiere molestia de rodilla o
  cadera en un patron de sentadilla, se elige el que tolera (prensa, hack o bulgara,
  segun el nivel) y se dice en la respuesta. Sin molestia referida, no cambia nada.
- **Tolerancia a la fatiga.** Las mujeres suelen tolerar mejor el trabajo submaximo.
  No cambia los valores por defecto; sirve como argumento para mantener el volumen de
  la metodologia cuando se duda de si la clienta lo recuperara.
- **Ciclo menstrual.** Solo si la clienta quiere tenerlo en cuenta, y fuera del plan:
  es un dato de salud y no se escribe en `notes`.

Los puntos que `sex-differences.md` deja pendientes de documentar no se convierten en
reglas por sexo hasta que esten escritos aqui.

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
   nivel o por lesion y su sustituto; si el sexo cambio alguna decision, cual y por
   que (lo normal es que no cambie ninguna); los archivos creados o cambiados, la URL
   del plan (`https://carlosarce10.github.io/lomito-workouts/#/<slug>`), y los
   ejercicios que quedaron sin imagen. Proponer el mensaje de commit (Conventional Commits, ambito
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
