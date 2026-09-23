interface Props {
  valor: number;
  etiqueta: string;
  sufijo?: string;
}

const RADIO = 42;
const CIRCUNFERENCIA = 2 * Math.PI * RADIO;

/** Anillo de progreso circular reutilizado para fase lunar y visibilidad. */
export default function Medidor({ valor, etiqueta, sufijo = '%' }: Props) {
  const valorAcotado = Math.max(0, Math.min(100, valor));
  const relleno = (valorAcotado / 100) * CIRCUNFERENCIA;

  return (
    <div className="medidor" role="img" aria-label={`${etiqueta}: ${valorAcotado}${sufijo}`}>
      <svg viewBox="0 0 96 96" aria-hidden="true" focusable="false">
        <circle cx="48" cy="48" r={RADIO} className="medidor__pista" />
        <circle
          cx="48"
          cy="48"
          r={RADIO}
          className="medidor__progreso"
          strokeDasharray={`${relleno} ${CIRCUNFERENCIA}`}
          transform="rotate(-90 48 48)"
        />
      </svg>
      <div className="medidor__valor" aria-hidden="true">
        <strong>{valorAcotado}</strong>
        <span>{sufijo}</span>
      </div>
    </div>
  );
}
