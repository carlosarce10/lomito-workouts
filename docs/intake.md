# Cuestionario para un cliente nuevo

Preguntas que se le hacen a un cliente antes de crear su plan con la skill
`lomito-plan`. El cuestionario va con acentos porque se envia tal cual al cliente;
el resto de este documento sigue la convencion de la documentacion.

Cada pregunta indica, entre parentesis, el campo del plan que llena. La forma de
esos campos esta en [content.md](content.md).

## Imprescindibles

Sin estas respuestas la skill no puede escribir el plan y tiene que preguntar: 1, 2,
5, 6, 8, 11 y 14. En la 2, "prefiere no decirlo" cuenta como respuesta. Si el plan
lleva recomendación nutrimental, también 18 a 22.

## Cuestionario

**Datos básicos**

1. ¿Cuál es tu nombre y apellido, tal como quieres que aparezcan en el plan? (`name`)
2. ¿Cuál es tu sexo? Solo lo usa tu entrenador para ajustar el plan y no aparece en
   él. Puedes no responder. (criterio del entrenador, no se guarda)
3. ¿Qué día quieres empezar? (`startDate`)
4. ¿Cuándo te gustaría que revisemos el plan? Lo habitual es a los 2 meses.
   (`reviewDate`)

**Objetivo y experiencia**

5. ¿Qué buscas principalmente: ganar músculo, ganar fuerza o mejorar tu salud en
   general? (`goalId`)
6. ¿Cuánto tiempo llevas entrenando con pesas de forma constante? (`levelId`)
7. ¿Qué ejercicios dominas con buena técnica? Por ejemplo sentadilla, peso muerto,
   press de banca o dominadas. (nivel y elección de ejercicios)

**Disponibilidad**

8. ¿Cuántos días a la semana puedes entrenar de forma realista? (número de rutinas)
9. ¿Cuánto tiempo tienes por sesión? (ejercicios por rutina)
10. ¿Qué días sueles entrenar? ¿Alguno seguido? (orden de las rutinas)

**Lugar y equipamiento**

11. ¿Dónde entrenas: gimnasio completo, gimnasio pequeño o en casa?
    (`equipmentId` de cada ejercicio)
12. ¿Qué tienes disponible: barras, mancuernas, poleas, máquinas guiadas, banco
    inclinable? (equipamiento)
13. Si entrenas en casa, ¿hasta qué peso llegan tus mancuernas? (equipamiento)

**Limitaciones y preferencias**

14. ¿Tienes alguna lesión, molestia o movimiento que te duela o debas evitar?
    (`notes` y ejercicios que se excluyen)
15. ¿Hay algún ejercicio que no te guste o no quieras hacer? (elección de ejercicios)
16. ¿Quieres dar prioridad a algún grupo muscular? (reparto de las rutinas)

**Seguimiento**

17. ¿Ya usas Lomito Train para registrar tus entrenamientos? Si no, te explico cómo
    empezar. (enlace de seguimiento)

**Alimentación** (solo si el plan lleva recomendación nutrimental; es una orientación,
no una dieta estricta)

18. ¿Cuántos años tienes? (entrada de `npm run diet`)
19. ¿Cuánto pesas ahora? Si lo sabes, el promedio de las últimas 2 o 3 semanas. Puedes
    darlo en kilos o en libras. (entrada de `npm run diet`)
20. ¿Cuánto mides? En centímetros o en pies y pulgadas. (entrada de `npm run diet`)
21. Fuera del gimnasio, ¿cómo es tu día? Sentado casi todo el día; algo de caminata;
    movimiento moderado; trabajo físicamente activo; trabajo físico exigente.
    (entrada de `npm run diet`)
22. ¿Qué buscas con la alimentación: bajar grasa, mantenerte, recomponer (ganar músculo sin subir de peso) o ganar
    músculo? (`diet.dietGoalId`)
23. ¿Cuántas comidas sueles hacer al día? (`diet.mealsPerDay`)
24. ¿Tienes alguna alergia, restricción o alimento que no comas? (criterio del
    entrenador, no se guarda)
25. ¿En qué país vives? Decide si tu plan muestra kilos o libras. (`unitSystemId`)

**Aviso para el cliente**

> Tu plan se abre con un enlace privado que solo tendrás tú. Cualquiera que tenga el
> enlace puede verlo, así que en el plan solo aparecerán tu nombre, tu apellido y
> observaciones breves, nunca datos médicos detallados.

## Lo que no se guarda

Peso corporal, estatura, edad, sexo, alergias y datos medicos no entran en el plan. El
sitio es publico y el slug es la unica proteccion. El sexo si se pasa a la skill, que
lo usa como contexto al programar y no lo escribe en ningun campo. Peso, estatura,
edad, sexo y actividad se usan una sola vez como argumentos de `npm run diet`; en el
JSON entra unicamente el bloque `diet` que imprime el script (calorias y gramos, como
rangos), que no revela las entradas con precision. Alergias y datos medicos sirven para
el criterio del entrenador y no se escriben en `notes`. Ver [diet.md](diet.md).

## De las respuestas a la skill

Con las respuestas, la peticion a la skill queda en una frase:

```
Crea el plan de Ana, mujer, principiante, hipertrofia, 3 dias, 60 minutos, gimnasio
completo, evitar press militar por molestia de hombro, empieza el 5 de octubre.
```
