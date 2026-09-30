# Cuestionario para un cliente nuevo

Preguntas que se le hacen a un cliente antes de crear su plan con la skill
`lomito-plan`. El cuestionario va con acentos porque se envia tal cual al cliente;
el resto de este documento sigue la convencion de la documentacion.

Cada pregunta indica, entre parentesis, el campo del plan que llena. La forma de
esos campos esta en [content.md](content.md).

## Imprescindibles

Sin estas respuestas la skill no puede escribir el plan y tiene que preguntar: 1, 4,
5, 7, 10 y 13.

## Cuestionario

**Datos básicos**

1. ¿Cuál es tu nombre y apellido, tal como quieres que aparezcan en el plan? (`name`)
2. ¿Qué día quieres empezar? (`startDate`)
3. ¿Cuándo te gustaría que revisemos el plan? Lo habitual es a las 4–6 semanas.
   (`reviewDate`)

**Objetivo y experiencia**

4. ¿Qué buscas principalmente: ganar músculo, ganar fuerza o mejorar tu salud en
   general? (`goalId`)
5. ¿Cuánto tiempo llevas entrenando con pesas de forma constante? (`levelId`)
6. ¿Qué ejercicios dominas con buena técnica? Por ejemplo sentadilla, peso muerto,
   press de banca o dominadas. (nivel y elección de ejercicios)

**Disponibilidad**

7. ¿Cuántos días a la semana puedes entrenar de forma realista? (número de rutinas)
8. ¿Cuánto tiempo tienes por sesión? (ejercicios por rutina)
9. ¿Qué días sueles entrenar? ¿Alguno seguido? (orden de las rutinas)

**Lugar y equipamiento**

10. ¿Dónde entrenas: gimnasio completo, gimnasio pequeño o en casa?
    (`equipmentId` de cada ejercicio)
11. ¿Qué tienes disponible: barras, mancuernas, poleas, máquinas guiadas, banco
    inclinable? (equipamiento)
12. Si entrenas en casa, ¿hasta qué peso llegan tus mancuernas? (equipamiento)

**Limitaciones y preferencias**

13. ¿Tienes alguna lesión, molestia o movimiento que te duela o debas evitar?
    (`notes` y ejercicios que se excluyen)
14. ¿Hay algún ejercicio que no te guste o no quieras hacer? (elección de ejercicios)
15. ¿Quieres dar prioridad a algún grupo muscular? (reparto de las rutinas)

**Seguimiento**

16. ¿Ya usas Lomito Train para registrar tus entrenamientos? Si no, te explico cómo
    empezar. (enlace de seguimiento)

**Aviso para el cliente**

> Tu plan se abre con un enlace privado que solo tendrás tú. Cualquiera que tenga el
> enlace puede verlo, así que en el plan solo aparecerán tu nombre, tu apellido y
> observaciones breves, nunca datos médicos detallados.

## Lo que no se guarda

Peso corporal, edad y datos medicos no entran en el plan. El sitio es publico y el
slug es la unica proteccion. Si el cliente los comparte, sirven para el criterio del
entrenador, pero no se pasan a la skill ni se escriben en `notes`.

## De las respuestas a la skill

Con las respuestas, la peticion a la skill queda en una frase:

```
Crea el plan de Ana, principiante, hipertrofia, 3 dias, 60 minutos, gimnasio
completo, evitar press militar por molestia de hombro, empieza el 5 de octubre.
```
