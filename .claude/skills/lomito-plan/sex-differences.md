# Diferencias entre hombres y mujeres al programar

Referencia de la skill `lomito-plan`. Se lee antes de escribir un plan nuevo. Resume
las diferencias anatomicas y fisiologicas entre hombres y mujeres que pueden importar
al disenar una rutina, y por que el sexo no decide la rutina por si solo.

Como se aplica en la skill esta en la seccion "Sexo del cliente" de
[SKILL.md](SKILL.md). Donde este documento y la metodologia de SKILL.md difieran
(repeticiones por encima de 12, por ejemplo), manda la metodologia.

La premisa central:

> No existe una rutina universal "de hombre" y otra "de mujer". La programacion parte
> del objetivo, el nivel de entrenamiento, la antropometria, la recuperacion y las
> preferencias individuales. El sexo aporta consideraciones adicionales, pero no es el
> principal determinante del programa.

## 1. Diferencias anatomicas

Existen diferencias sexuales promedio en anatomia y composicion corporal que pueden
influir en el entrenamiento.

| Caracteristica                           | Hombres                          | Mujeres                        |
| ---------------------------------------- | -------------------------------- | ------------------------------ |
| Masa muscular absoluta                   | Mayor en promedio                | Menor en promedio              |
| Masa muscular relativa del tren superior | Mayor en promedio                | Menor en promedio              |
| Pelvis y cadera                          | Generalmente mas estrecha        | Generalmente mas ancha         |
| Angulo Q                                 | Generalmente menor               | Generalmente mayor             |
| Proporciones femur y torso               | Diferentes en promedio           | Diferentes en promedio         |
| Distribucion de grasa                    | Mayor tendencia central/visceral | Mayor tendencia gluteo-femoral |
| Fuerza absoluta                          | Mayor en promedio                | Menor en promedio              |

Son diferencias de poblacion, no reglas individuales. La variabilidad entre personas
es considerable: una mujer entrenada puede tener mas fuerza o capacidad de trabajo que
un hombre sedentario. La programacion no asume capacidades ni limitaciones a partir
del sexo.

## 2. Anatomia y seleccion de ejercicios

La anatomia puede cambiar la seleccion. Las diferencias individuales en:

- longitud del femur;
- longitud del torso;
- ancho de la pelvis;
- movilidad de tobillo y cadera;
- estructura articular;
- proporciones corporales;

cambian la forma en que una persona ejecuta o tolera un ejercicio. Dos personas pueden
hacer la misma sentadilla y sentir estimulos o molestias distintos por sus
proporciones.

Por eso una rutina no dice "mujer = sentadilla" ni "hombre = sentadilla". Se elige la
variante que entrena el musculo objetivo de forma eficiente y tolerable:

- sentadilla trasera;
- sentadilla hack;
- prensa;
- sentadilla bulgara;
- hip thrust;
- extension de rodilla;
- curl femoral.

La variante depende de la persona, el objetivo y el contexto, y siempre dentro de lo
que permite su nivel (tabla de seleccion de SKILL.md).

## 3. Fuerza

Los hombres tienen, en promedio, mas fuerza absoluta, sobre todo en el tren superior.
Eso no significa que un plan para una mujer use automaticamente pesos ligeros ni que
uno para un hombre use pesos pesados. La carga depende de:

- la capacidad individual;
- la tecnica;
- el rango de repeticiones;
- la proximidad al fallo;
- la progresion;
- el objetivo del ejercicio.

> La carga se prescribe para la persona, no para su sexo.

## 4. Repeticiones y resistencia a la fatiga

Las mujeres pueden mostrar mas resistencia a la fatiga muscular en determinadas
tareas y condiciones. En ciertos ejercicios eso les permite tolerar relativamente
bien:

- mas repeticiones;
- descansos algo mas cortos;
- mas trabajo submaximo.

Pero no significa "mujeres = altas repeticiones" ni "hombres = bajas repeticiones".
Ambos sexos desarrollan hipertrofia en un rango amplio de repeticiones cuando las
series se hacen con suficiente esfuerzo y el volumen es el adecuado. Los dos pueden
usar 5-8, 8-12 o 10-15 repeticiones, y 15-20 o mas en algunos aislamientos. En Lomito
Workouts el rango lo fija la metodologia de SKILL.md, igual para los dos.

La diferencia esta en como responde y se recupera cada persona, no en una regla
rigida por sexo.

## 5. El objetivo importa mas que el sexo

Una de las diferencias mas importantes al construir una rutina no depende del sexo,
sino del objetivo.

Objetivo centrado en gluteos y piernas: se prioriza gluteo mayor, gluteo medio,
cuadriceps, isquiosurales y aductores.

Objetivo centrado en el tren superior: se prioriza pectoral, dorsal, espalda alta,
deltoides, biceps y triceps.

Los dos objetivos valen para hombres y mujeres. "Rutina femenina = gluteos" y "rutina
masculina = pecho y brazos" son simplificaciones que no se usan como regla de
programacion.

## 6. Donde entra el sexo en la programacion

El sexo es una variable mas dentro de la programacion. La jerarquia:

```text
Sexo
  |
Consideraciones fisiologicas
  |
Objetivo
  |
Nivel de entrenamiento
  |
Volumen e intensidad
  |
Seleccion de ejercicios
  |
Antropometria y preferencias
  |
Frecuencia y distribucion semanal
  |
Progresion y ajustes
```

Expresado como flujo:

```text
SEXO
  |
  +-- Consideraciones fisiologicas
  |
  v
OBJETIVO ---------------+
                        |
NIVEL ------------------+
                        v
              PROGRAMACION INICIAL
                        |
ANTROPOMETRIA ----------+
                        |
PREFERENCIAS -----------+
                        v
              SELECCION DE EJERCICIOS
                        |
                        v
             VOLUMEN / INTENSIDAD
                        |
                        v
                   PROGRESION
                        |
                        v
               MONITOREO Y AJUSTE
```

## 7. Variables con mas peso que el sexo

1. **Objetivo**: hipertrofia, fuerza, recomposicion corporal, perdida de grasa,
   rendimiento o mantenimiento.
2. **Musculos prioritarios**: los que el cliente quiere desarrollar mas. Por ejemplo,
   prioridad alta en gluteos y deltoides, media en cuadriceps y espalda, baja en
   biceps.
3. **Nivel de entrenamiento**: principiante, intermedio o avanzado. Afecta sobre todo
   al volumen tolerable, la seleccion de ejercicios y la complejidad de la progresion.
4. **Disponibilidad**: dias por semana, duracion de la sesion y equipamiento.
5. **Antropometria**: ayuda a decidir que variantes de un ejercicio encajan mejor.
6. **Preferencias**: ejercicios que le gustan, los que no quiere hacer, maquinas
   disponibles, molestias o limitaciones conocidas.
7. **Recuperacion**: el reparto del volumen tiene en cuenta la capacidad real del
   cliente para recuperarse.

## 8. Principio fundamental

La rutina no se construye asi:

```text
IF sexo = mujer
    -> rutina femenina
ELSE
    -> rutina masculina
```

Sino asi:

```text
ENTRADA:
    sexo
    objetivo
    nivel
    dias disponibles
    musculos prioritarios
    equipamiento
    antropometria
    preferencias
    recuperacion

-> GENERAR PROGRAMA

-> DISTRIBUIR:
    frecuencia
    volumen
    intensidad
    ejercicios
    repeticiones
    descansos

-> MONITOREAR PROGRESION

-> AJUSTAR
```

El sexo puede modificar algunas decisiones, pero funciona como contexto fisiologico,
no como plantilla de rutina.

## 9. Resumen

Diferencias reales. Existen diferencias promedio entre hombres y mujeres en:

- masa muscular;
- fuerza absoluta;
- composicion corporal;
- estructura pelvica;
- proporciones corporales;
- algunas caracteristicas de fatiga y recuperacion.

Lo que no se asume. Nunca se da por hecho que:

- las mujeres necesitan altas repeticiones;
- los hombres necesitan bajas repeticiones;
- las mujeres deben entrenar sobre todo gluteos;
- los hombres deben entrenar sobre todo pecho y brazos;
- una mujer debe hacer ejercicios distintos solo por ser mujer.

> **Individualizar primero; usar el sexo como contexto, no como plantilla.**

Objetivo, nivel, antropometria, preferencias, disponibilidad y recuperacion pesan
mucho mas en la construccion de la rutina que el sexo por si solo.

## Pendiente de documentar

Este documento resume principios generales. Para convertirlos en reglas concretas
hace falta documentar por separado:

1. Diferencias de volumen semanal.
2. Frecuencia optima por grupo muscular.
3. Rangos de repeticiones.
4. RIR y RPE.
5. Descansos.
6. Capacidad de recuperacion.
7. Diferencias en hipertrofia entre sexos.
8. Ajustes durante el ciclo menstrual, cuando la persona quiera considerarlos.
9. Seleccion de ejercicios basada en antropometria.
10. Sistema de progresion y autorregulacion.

Mientras no esten escritos, la skill no inventa reglas por sexo para ninguno de estos
puntos: aplica la metodologia de SKILL.md, que es la misma para todos.
