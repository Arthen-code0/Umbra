interface Props {
  titulo?: string;
  detalle: string;
  onReintentar: () => void;
}

/** Estado de error reutilizable: mensaje en lenguaje humano + botón de reintentar. */
export default function EstadoError({ titulo = 'Algo ha ido mal', detalle, onReintentar }: Props) {
  return (
    <div className="estado-error tarjeta" role="alert">
      <svg viewBox="0 0 24 24" width="32" height="32" aria-hidden="true" focusable="false">
        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <path d="M12 7v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="12" cy="16.2" r="1.1" fill="currentColor" />
      </svg>
      <div>
        <p className="estado-error__titulo">{titulo}</p>
        <p>{detalle}</p>
      </div>
      <button type="button" className="boton boton--secundario" onClick={onReintentar}>
        Reintentar
      </button>
    </div>
  );
}
