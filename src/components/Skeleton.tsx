interface Props {
  className?: string;
  alto?: string;
}

/** Bloque de esqueleto de carga. Usa `aria-hidden`: el estado de carga en sí lo anuncia un `aria-live` del contenedor. */
export default function Skeleton({ className = '', alto = '1rem' }: Props) {
  return <div className={`skeleton ${className}`} style={{ height: alto }} aria-hidden="true" />;
}
