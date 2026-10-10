# Recomendacion nutrimental: formula y fuentes

Este documento es la fuente de `src/domain/model/computeDiet.js` y de `npm run diet`.
La primera parte es el documento original de Lomito Dev sobre calorias y proteina, tal
cual (por eso lleva acentos y el nombre antiguo del producto). El anexo del final recoge
lo que Lomito Workouts anade: grasas, carbohidratos, fibra, agua, redondeos y unidades.

Lo que sale de aqui es una recomendacion orientativa con rangos, no una dieta que haya
que seguir al pie de la letra. Las entradas (peso, estatura, edad, sexo, actividad) no
se guardan en el repositorio: solo el bloque `diet` que imprime el script.

---

# Lomito Training — Estimación de calorías y proteína

> **Propósito:** generar recomendaciones iniciales de energía y proteína para orientar una alimentación relacionada con el entrenamiento. No es una dieta clínica, una prescripción individual ni una verdad absoluta. Los resultados son estimaciones que deben contrastarse con la evolución real de la persona.

## 1. Datos necesarios

Para estimar calorías de forma más útil, solicitar:

- **Edad** en años.
- **Sexo usado por la ecuación** (masculino/femenino), porque la fórmula predictiva Mifflin–St Jeor utiliza constantes diferentes. Si no se desea responder, se puede mostrar un rango aproximado en vez de fingir precisión.
- **Peso actual** en kg.
- **Estatura** en cm.
- **Actividad diaria fuera del entrenamiento**: principalmente sentado, algo de movimiento, activo o trabajo físico.
- **Entrenamiento semanal**: tipo, sesiones por semana y duración aproximada.
- **Objetivo**: pérdida de grasa, mantenimiento/recomposición o ganancia de masa muscular.
- Opcional pero recomendable: promedio de peso de 2–3 semanas, cambios recientes de peso e ingesta aproximada actual, si la conoce.

**Por qué no basta con peso y estatura:** no capturan edad, sexo utilizado por la fórmula, actividad diaria ni ejercicio. El gasto también cambia entre personas con las mismas medidas.

## 2. Estimar el metabolismo en reposo

Como punto de partida para adultos, usar la ecuación de **Mifflin–St Jeor**. Estima el gasto energético en reposo (GER), no el gasto total diario.

Con peso en kg, estatura en cm y edad en años:

- **Masculino:** `GER = (10 × peso) + (6.25 × estatura) − (5 × edad) + 5`
- **Femenino:** `GER = (10 × peso) + (6.25 × estatura) − (5 × edad) − 161`

El resultado se expresa aproximadamente en kcal/día.

Estas ecuaciones son predicciones poblacionales: pueden sobrestimar o subestimar el gasto de una persona. No interpretar el GER como una cantidad obligatoria de comida ni como un límite clínico de ingesta.

## 3. Estimar calorías de mantenimiento

Calcular el gasto energético total diario (GET/TDEE) como aproximación:

`Mantenimiento estimado = GER × factor de actividad`

Factores orientativos —no son categorías exactas ni universales—:

| Factor | Descripción orientativa                                                       |
| -----: | ----------------------------------------------------------------------------- |
|   1.20 | Muy sedentario: trabajo sentado y poco movimiento cotidiano                   |
|   1.35 | Actividad ligera: algo de caminata y/o ejercicio ligero ocasional             |
|   1.50 | Actividad moderada: ejercicio regular y movimiento cotidiano moderado         |
|   1.70 | Actividad alta: entrenamientos frecuentes y/o trabajo físicamente activo      |
|   1.90 | Actividad muy alta: trabajo físico exigente y entrenamiento frecuente/intenso |

Elegir el factor según **la suma de actividad cotidiana y entrenamiento**, evitando contar dos veces el mismo ejercicio. Si hay dudas entre dos niveles, mostrar un rango de mantenimiento calculado con ambos factores.

### Ejemplo ilustrativo

Persona adulta de 30 años, 70 kg, 170 cm, con la constante masculina:

`GER = (10 × 70) + (6.25 × 170) − (5 × 30) + 5 = 1,617.5 kcal/día`

Si se estima un factor de actividad de 1.50:

`Mantenimiento ≈ 1,617.5 × 1.50 = 2,426 kcal/día`

Redondear a aproximadamente **2,400 kcal/día**, no presentar 2,426 como una medición exacta.

## 4. Calorías según objetivo

Primero estimar el mantenimiento. Después aplicar un ajuste moderado y revisable:

| Objetivo                      |         Punto de partida orientativo | Fórmula                     |
| ----------------------------- | -----------------------------------: | --------------------------- |
| Déficit / pérdida de grasa    | 10–20 % por debajo del mantenimiento | `mantenimiento × 0.80–0.90` |
| Mantenimiento / recomposición |              Cerca del mantenimiento | `mantenimiento × 0.95–1.05` |
| Superávit / ganancia muscular |  5–10 % por encima del mantenimiento | `mantenimiento × 1.05–1.10` |

Los porcentajes son **rangos prácticos iniciales**, no reglas fisiológicas rígidas. Un déficit más pequeño puede ser apropiado para personas ya delgadas, con mucha actividad o que priorizan el rendimiento. Un superávit mayor no garantiza más músculo y puede aumentar la ganancia de grasa.

### Ejemplo con mantenimiento de 2,400 kcal

- **Déficit moderado (15 %):** `2,400 × 0.85 = 2,040 kcal/día`
- **Mantenimiento:** aproximadamente `2,400 kcal/día`
- **Superávit moderado (7 %):** `2,400 × 1.07 = 2,568 kcal/día`

En la recomendación, se podría mostrar **2,000–2,100 kcal** para déficit, **2,300–2,500 kcal** para mantenimiento y **2,500–2,650 kcal** para superávit, aclarando qué porcentaje se utilizó.

## 5. Proteína diaria por kilogramo de peso

Para adultos sanos que entrenan, la literatura deportiva suele situar una ingesta útil alrededor de **1.4–2.0 g/kg/día**. En un plan de entrenamiento de fuerza, usar **1.6–2.2 g/kg/día como rango práctico de recomendación** es razonable; 2.2 g/kg no es un mínimo obligatorio ni todas las personas necesitan llegar al extremo superior.

Fórmula:

`Proteína diaria (g) = peso corporal (kg) × objetivo de proteína (g/kg)`

Rangos prácticos iniciales:

| Contexto                                                   |                                               Rango orientativo |
| ---------------------------------------------------------- | --------------------------------------------------------------: |
| Actividad física general                                   |                       1.2–1.6 g/kg/día como referencia flexible |
| Entrenamiento de fuerza, mantenimiento o ganancia muscular |                                                1.6–2.0 g/kg/día |
| Déficit calórico con entrenamiento de fuerza               | 1.8–2.2 g/kg/día como opción práctica para muchos adultos sanos |

**Ejemplo para 70 kg:**

- 1.6 g/kg: `70 × 1.6 = 112 g/día`
- 1.8 g/kg: `70 × 1.8 = 126 g/día`
- 2.0 g/kg: `70 × 2.0 = 140 g/día`
- 2.2 g/kg: `70 × 2.2 = 154 g/día`

No es necesario acertar un número exacto cada día. La constancia y la alimentación global importan más que perseguir un decimal. Se puede distribuir la proteína entre las comidas según horarios, apetito y preferencias.

### Precaución con el peso usado

En personas con obesidad o un porcentaje elevado de grasa corporal, multiplicar directamente el peso actual por un valor alto puede producir una meta de proteína innecesariamente elevada. En esos casos, conviene valorar peso objetivo, peso ajustado o masa libre de grasa con criterio profesional, en lugar de aplicar automáticamente la fórmula.

## 6. Cómo validar y ajustar la estimación

El cálculo inicial es una hipótesis de trabajo. Si la persona acepta registrar datos, revisar tendencias durante **2–4 semanas**:

1. Registrar el peso varias mañanas por semana, en condiciones similares.
2. Usar el **promedio semanal**, no reaccionar a una medición aislada.
3. Considerar hambre, energía, rendimiento, recuperación, adherencia y cambios en la actividad.
4. Si el objetivo es pérdida de grasa y el promedio no cambia durante varias semanas, revisar primero la consistencia del registro, actividad y porciones; después ajustar modestamente las calorías.
5. Si el peso cae demasiado rápido, empeora el rendimiento o la recuperación, considerar reducir el déficit.
6. En ganancia muscular, observar que el aumento sea gradual y ajustar si el peso sube demasiado rápido.

El peso fluctúa por hidratación, glucógeno, contenido intestinal y ciclo menstrual, entre otros factores. No cambiar calorías por fluctuaciones de pocos días. Las respuestas adaptativas del organismo hacen que una regla calórica simple no prediga perfectamente el cambio de peso a largo plazo.

## 7. Qué debería mostrar Lomito Training

Para cada persona, presentar los resultados como **estimaciones y rangos**, no como órdenes:

- **Datos usados:** peso, estatura, edad, sexo/constante seleccionada, actividad y objetivo.
- **Metabolismo en reposo estimado (GER).**
- **Mantenimiento estimado:** número redondeado y, cuando haya incertidumbre, rango.
- **Déficit recomendado:** rango calórico y porcentaje aplicado.
- **Mantenimiento:** rango calórico.
- **Superávit recomendado:** rango calórico y porcentaje aplicado.
- **Proteína diaria:** rango en gramos y factor usado (g/kg).
- **Supuestos y fecha de cálculo.**
- **Aviso de que debe revisarse** con datos reales tras unas semanas.

No conviene dar una cifra con precisión falsa, por ejemplo 2,426 kcal como si se hubiera medido el gasto metabólico. Mostrar 2,400 kcal o un intervalo comunica mejor la incertidumbre.

## 8. Límites y derivación profesional

Esta guía se plantea para **adultos** y para recomendaciones generales de entrenamiento. No usar automáticamente estos cálculos en menores de 18 años, embarazo o lactancia. Se necesita valoración individual si hay enfermedad renal, hepática o metabólica, diabetes tratada con fármacos que puedan causar hipoglucemia, antecedentes de trastornos de la conducta alimentaria, pérdida de peso involuntaria, bajo peso, cirugía bariátrica u otra situación clínica relevante.

No establecer una ingesta calórica mínima universal a partir de esta fórmula ni recomendar déficits extremos. En casos clínicos o necesidades terapéuticas, la recomendación debe revisarla un profesional de nutrición o salud cualificado.

## 9. Fuentes para profundizar

1. **Mifflin MD et al.** _A new predictive equation for resting energy expenditure in healthy individuals._ American Journal of Clinical Nutrition (1990). PubMed: https://pubmed.ncbi.nlm.nih.gov/2305711/
2. **International Society of Sports Nutrition (ISSN).** _Position Stand: protein and exercise._ Journal of the International Society of Sports Nutrition (2017). Texto completo: https://pmc.ncbi.nlm.nih.gov/articles/PMC5477153/
3. **National Institute of Diabetes and Digestive and Kidney Diseases (NIDDK).** _Body Weight Planner_ — herramienta y explicación de la estimación de calorías y actividad: https://www.niddk.nih.gov/bwp
4. **Hall KD et al.** _Quantification of the effect of energy imbalance on bodyweight._ The Lancet (2011). Investigación detrás del Body Weight Planner: https://www.niddk.nih.gov/research-funding/at-niddk/labs-branches/laboratory-biological-modeling/integrative-physiology-section/research/body-weight-planner

---

## Resumen operativo

1. Solicitar edad, sexo usado por la ecuación, peso, estatura, actividad diaria, entrenamiento y objetivo.
2. Calcular GER con Mifflin–St Jeor.
3. Estimar mantenimiento multiplicando por un factor de actividad y redondear.
4. Aplicar un déficit de 10–20 %, mantenimiento cercano al GET o superávit de 5–10 % como punto de partida.
5. Calcular proteína con peso × rango de g/kg adecuado al contexto.
6. Explicar que los resultados son estimaciones y ajustar según tendencias reales, recuperación, rendimiento y adherencia.

**La finalidad es orientar decisiones informadas, no sustituir una valoración nutricional individual.**

---

## Anexo de Lomito Workouts

### Macronutrientes anadidos

El documento original solo fija calorias y proteina. Para que la recomendacion sirva
para comer, se anaden con el criterio habitual de nutricion deportiva (ISSN):

| Concepto      | Regla                                                                                                                                                  |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Grasas        | Porcentaje de las calorias objetivo segun el objetivo: deficit 20-25 %, mantenimiento, recomposicion y superavit 25-30 %. Nunca por debajo de 0,6 g/kg |
| Carbohidratos | El resto de las calorias: `(kcal - proteina x 4 - grasas x 9) / 4`, con los puntos medios de proteina y grasas para que el rango siga al de calorias   |
| Fibra         | 14 g por cada 1000 kcal del objetivo                                                                                                                   |
| Agua          | 30 a 35 ml por kilo de peso                                                                                                                            |

Los porcentajes y los gramos por kilo de cada objetivo viven en
`src/domain/catalogs/dietGoals.js`; los factores de actividad, en `activity.js`.

### Recomposicion

Objetivo propio, separado de mantener (decision de Lomito Dev, 2026-10-10): ajuste de
-5 a +5 % como el mantenimiento, con proteina de 1,8 a 2,2 g/kg, el rango que el
documento original usa para deficit. Base: el metaanalisis de Morton y otros (2018)
situa en unos 1,6 g/kg el punto donde la ganancia de masa magra se estabiliza, con un
limite superior del intervalo de 2,2 g/kg; recomponer cerca del mantenimiento cae en
la mitad alta de ese rango. Mas de 2,2 g/kg (Longland y otros, 2016, usaron 2,4) se
justifica en deficits grandes, no aqui. Con menos de 1,8 la carne de calidad no cabe en
el dia: en un cliente con muchos carbohidratos, arroz, tortilla y frijoles ya aportan 45
a 50 g de proteina.

### Proteina de calidad en cada comida

La proteina de cada comida principal sale de su fuente proteica: de 0,4 a 0,55 g por
kilo de peso en comida y cena (Schoenfeld y Aragon, 2018), unos 30 a 43 g en un adulto
de 78 kg, que son 110 a 150 g cocidos de pollo, res o pescado. El desayuno se queda en
0,3 g/kg (unos 23 g): en una comida, 20 a 25 g de proteina de calidad ya estimulan la
sintesis muscular casi al maximo en adultos jovenes (Moore y otros, 2009; Witard y
otros, 2014), y asi no hacen falta 3 huevos y claras. La proteina de la guarnicion
cuenta para el total del dia, no para esos minimos.

### Redondeos

Ninguna cifra se muestra con precision falsa. Gasto en reposo a 10 kcal; mantenimiento
a 100 kcal, calculado sobre el gasto sin redondear (2426 pasa a 2400, como en la seccion
3); calorias objetivo a 50 kcal, y cuando el ajuste deja un punto se abre una banda de
2,5 % (2040 pasa a 2000-2100, como en la seccion 4); proteina, grasas, carbohidratos y
fibra a 5 g; agua a 100 ml. Las mitades exactas suben, salvo en las calorias objetivo,
donde van hacia el mantenimiento.

Con el ejemplo de las secciones 3 a 5 (30 anos, 70 kg, 170 cm, constante masculina,
factor 1,50) el script devuelve: reposo 1620, mantenimiento 2400, deficit 1900-2150 (o
2000-2100 con `--adjustment -15`), mantenimiento 2300-2500, superavit 2500-2650 con
`--adjustment 7`, proteina 125-155 g en deficit.

### Unidades

Los clientes de Mexico dan kilos y centimetros; los de Estados Unidos, libras y pies
con pulgadas. `npm run diet` acepta `172lb`, `78kg`, `5'9"`, `66in`, `1.67m` o `167cm`
y convierte una sola vez (`src/domain/model/units.js`). Todo lo que se calcula y se
guarda es metrico; el `unitSystemId` del cliente solo decide si la interfaz anade
libras y onzas.

### Como se usa

```
npm run diet -- --sex male --age 30 --height 170cm --body-mass 154lb --activity moderate --diet-goal deficit --meals 3
```

Opcionales: `--sex` (sin el, rango entre las dos constantes), `--activity a:b` cuando
hay duda entre dos niveles, `--adjustment`, `--protein-per-kg`, `--fat-percent` y
`--meals`. El bloque `diet` que imprime se pega tal cual en el JSON del cliente.
