import './ProgressionExample.scss';

/**
 * Ejemplo de progresion de la metodologia: una lista de sesiones que muestra
 * como suben las repeticiones antes que la carga.
 *
 * @param {object} props
 * @param {{ title: string, steps: string[] }} props.example Ejemplo de methodology.json.
 */
export default function ProgressionExample({ example }) {
  return (
    <figure className="c-progression-example">
      <figcaption className="c-progression-example__title">{example.title}</figcaption>
      <ol className="c-progression-example__steps">
        {example.steps.map((paso) => (
          <li key={paso} className="c-progression-example__step">
            {paso}
          </li>
        ))}
      </ol>
    </figure>
  );
}
