const PASOS = [
  { numero: 1, etiqueta: 'Experiencia' },
  { numero: 2, etiqueta: 'Fecha y plazas' },
  { numero: 3, etiqueta: 'Tus datos' },
  { numero: 4, etiqueta: 'Resumen' },
] as const;

export default function IndicadorPasos({ pasoActual }: { pasoActual: number }) {
  return (
    <ol className="indicador-pasos" aria-label="Progreso de la reserva">
      {PASOS.map((paso) => {
        const estado =
          paso.numero === pasoActual
            ? 'actual'
            : paso.numero < pasoActual
              ? 'completado'
              : 'pendiente';
        return (
          <li
            key={paso.numero}
            className={`indicador-pasos__item indicador-pasos__item--${estado}`}
            aria-current={estado === 'actual' ? 'step' : undefined}
          >
            <span className="indicador-pasos__numero" aria-hidden="true">
              {estado === 'completado' ? '✓' : paso.numero}
            </span>
            <span className="indicador-pasos__etiqueta">{paso.etiqueta}</span>
          </li>
        );
      })}
    </ol>
  );
}
