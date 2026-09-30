# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Usuario primario: una persona que entrena en un gimnasio y recibio de Lomito Dev un
plan de entrenamiento personalizado. Lo abre desde el enlace que le compartieron, casi
siempre en el movil, y lo consulta antes de la sesion y entre serie y serie: que
ejercicio toca, cuantas series, en que rango, cuanto descanso y como se hace.

Situacion de uso: de pie, en el gimnasio, con el movil en una mano, a veces con prisa.
Manda sobre cualquier decision de interfaz: texto legible sin zoom, tarjetas que se
leen de un vistazo, areas tactiles grandes, nada que exija precision.

Muchos usuarios son principiantes: la interfaz explica RIR, serie de aproximacion y
progresion en lenguaje llano, en la misma pagina.

Audiencia secundaria: el propio Lomito Dev, que crea y modifica planes editando JSON
con ayuda de una skill de Claude Code.

No es un producto publico abierto. No hay cuentas, registro ni soporte. Cada plan es
un enlace privado.

## Product Purpose

Entregar y explicar planes de entrenamiento personalizados: perfil del cliente,
metodologia, rutinas por dia y tarjetas de ejercicio con imagen, musculos, series,
repeticiones, RIR, descanso, como hacerlo y errores comunes.

Exito: el cliente abre su enlace en el gimnasio, encuentra la rutina del dia en un
toque, entiende que hacer en cada ejercicio sin preguntar, y registra sus series en
Lomito Train.

Lo que no es: no registra pesos ni repeticiones, no guarda historial ni progresion, no
tiene temporizador. Todo eso vive en Lomito Train (https://lomito-train.netlify.app/)
y no se duplica aqui.

## Positioning

Lomito Workouts es la herramienta de planificacion y consulta de Lomito Dev; Lomito
Train es la de seguimiento. La separacion es explicita para el usuario: aqui "plan,
aprende, consulta, ejecuta"; alli "registra, mide, sigue tu progreso".

Frente a un PDF o una captura de pantalla: es una web movil con imagenes, se
actualiza sin reenviar nada, y ensena la metodologia, no solo la lista de ejercicios.

## Operating Context

- Web estatica en GitHub Pages, sin backend ni base de datos. Cada cliente es un JSON
  en el repositorio; la biblioteca de ejercicios se comparte entre clientes.
- Uso principal en movil, en vertical, con una mano. Escritorio solo para revisar.
- El gimnasio suele tener mala cobertura: la pagina es ligera, con imagenes locales y
  carga diferida. Funcionar sin conexion queda para una fase posterior.
- Idioma: espanol.

## Capabilities and Constraints

Funcionalidad del MVP:

- Perfil del cliente: nombre, objetivo, nivel, frecuencia, fechas de inicio y
  revision, observaciones.
- Seccion "Como entrenar" plegable: aproximacion, series efectivas, RIR, descanso,
  progresion y tecnica, con un ejemplo de progresion.
- Rutinas por dia con pestanas; cada ejercicio en una tarjeta con dos fotogramas,
  musculos, aproximacion, series efectivas, repeticiones, RIR, descanso, notas,
  "Como hacerlo" y "Errores comunes".
- Enlace a Lomito Train para registrar el entrenamiento.
- Portada generica sin lista de clientes.

Decisiones de producto tomadas:

- Sin backend, sin base de datos, sin cuentas, sin localStorage. El contenido vive en
  JSON y se publica con el sitio.
- Sin seguimiento de ningun tipo: es responsabilidad de Lomito Train.
- Tema claro y oscuro siguiendo al sistema, sin conmutador.
- Imagenes provisionales de free-exercise-db, descargadas y versionadas, con la
  fuente anotada en cada ejercicio para sustituirlas por material propio.

Restricciones tecnicas:

- Sin TypeScript. La forma de los JSON la valida `npm run lint:content` antes de cada
  build; el runtime no valida.
- Un slug no adivinable por cliente y `noindex` en el sitio. No es autenticacion:
  quien tenga el enlace ve el plan. El plan lleva el nombre y el apellido del cliente,
  por decision del entrenador, y ningun dato de salud detallado. El repositorio es
  publico: los JSON de clientes tambien se leen en GitHub.

## Brand Commitments

- Nombre: Lomito Workouts. Confirmado y no se toca. Es tambien la firma del pie.
- Mismo logotipo que Lomito Train. La interfaz hereda su sistema de diseno completo:
  tokens, tarjetas de vidrio, acento azul. El rojo del logotipo es solo color de
  peligro, como alli.
- Sin emojis ni iconos decorativos en documentacion, comentarios ni mensajes de commit.

## Evidence on Hand

- Documento de alcance y metodologia de Lomito Dev (septiembre de 2026): serie de
  aproximacion al 50-60 %, dos series efectivas a RIR 1-2, progresion por
  repeticiones antes que por carga.
- Codigo de Lomito Train en `../lomito-train`, del que se copian estilos, componentes
  y tooling.
- Dataset free-exercise-db (Unlicense) como fuente provisional de imagenes.
- No hay clientes reales, capturas ni metricas todavia. Nada de eso debe inventarse.

## Product Principles

1. El gimnasio manda. Si algo funciona en escritorio pero no de pie con una mano,
   esta mal.
2. Ensena, no solo dicta. El plan explica como entrenar: la tecnica va antes que la
   carga y progresar no es subir peso cada semana.
3. Un solo vocabulario, el de Lomito Train. Cada dia del plan es una rutina, igual que
   alli, porque el cliente la recreara alli.
4. Simplicidad primero. No se construye lo que todavia no hace falta.
5. El contenido vive aparte del codigo, para que un plan se cree o cambie sin tocar la
   interfaz.
6. Independencia de proveedores: ninguna imagen ni dato critico depende de un
   servicio externo en tiempo de ejecucion.

## Accessibility & Inclusion

- WCAG 2.1 AA para contraste de texto en ambos temas, heredado y medido en Lomito
  Train.
- Areas tactiles de 44 por 44 pixeles como minimo.
- Todo lo plegable se abre con teclado y se anuncia: details con summary, y botones
  con aria-pressed para las pestanas.
- Lenguaje llano para principiantes; los terminos tecnicos se explican en la propia
  pagina.
