import './Button.scss';

/**
 * Boton de la aplicacion.
 *
 * El `type` por defecto es 'button' y no 'submit', que es lo que hace el navegador
 * cuando el atributo falta o es invalido. En Lomito Train un renombrado masivo de
 * clases dejo type="c-button", que segun la especificacion HTML cae a submit, y el
 * boton Cancelar de un formulario pasaba a guardar.
 *
 * Con `as="a"` es un enlace con el mismo aspecto: el unico caso de uso es el enlace
 * a Lomito Train, que abre otra web y no tiene sentido como boton.
 *
 * @param {object} props
 * @param {import('react').ReactNode} props.children Contenido.
 * @param {'primary'|'danger'|'ghost'|'icon'} [props.variant] Aspecto.
 * @param {'sm'|'md'|'lg'} [props.size] Tamano.
 * @param {'button'|'a'} [props.as] Etiqueta HTML. Por defecto 'button'.
 * @param {'button'|'submit'|'reset'} [props.type] Tipo HTML. Por defecto 'button'.
 * @param {boolean} [props.busy] Marca el boton como ocupado y lo deshabilita.
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  as: Etiqueta = 'button',
  type = 'button',
  disabled = false,
  busy = false,
  className = '',
  ...resto
}) {
  const inactivo = disabled || busy;
  const classes = ['c-button', `c-button--${variant}`, `c-button--${size}`, className]
    .filter(Boolean)
    .join(' ');

  // type y disabled solo existen en un boton; en un enlace serian atributos invalidos.
  const propiedadesDeBoton = Etiqueta === 'button' ? { type, disabled: inactivo } : {};

  return (
    <Etiqueta
      className={classes}
      onClick={onClick}
      aria-busy={busy || undefined}
      {...propiedadesDeBoton}
      {...resto}
    >
      {children}
    </Etiqueta>
  );
}
