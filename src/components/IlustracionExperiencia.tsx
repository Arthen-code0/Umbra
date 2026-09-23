import type { ReactElement } from 'react';
import type { TipoExperiencia } from '../lib/api/tipos';

interface Props {
  tipo: TipoExperiencia;
  /** Semilla para variar ligeramente la posición de las estrellas sin ser aleatoria en cada render. */
  semilla?: number;
  titulo: string;
}

const ICONOS: Record<TipoExperiencia, (color: string) => ReactElement> = {
  observacion: (color) => (
    <g stroke={color} strokeWidth="2" fill="none" strokeLinecap="round">
      <circle cx="60" cy="46" r="16" />
      <path d="M44 46a16 16 0 0 0 26 12" />
      <path d="M60 30v-6M60 62v6M44 46h-6M76 46h6" strokeWidth="1.4" opacity="0.6" />
    </g>
  ),
  astrofotografia: (color) => (
    <g stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M40 66 60 30l20 36Z" />
      <path d="M60 30v10M50 50h20" strokeWidth="1.4" />
      <circle cx="60" cy="20" r="3" fill={color} stroke="none" />
    </g>
  ),
  familiar: (color) => (
    <g stroke={color} strokeWidth="2" fill="none" strokeLinecap="round">
      <path d="M46 58a14 14 0 1 1 14-14" />
      <circle cx="60" cy="44" r="14" />
      <path d="M60 30v6M60 58v-6" strokeWidth="1.4" opacity="0.7" />
      <circle cx="80" cy="58" r="5" strokeWidth="1.6" />
    </g>
  ),
};

function generarEstrellas(semilla: number, cantidad: number) {
  const estrellas = [];
  let s = semilla || 1;
  for (let i = 0; i < cantidad; i++) {
    s = (s * 9301 + 49297) % 233280;
    const x = (s / 233280) * 120;
    s = (s * 9301 + 49297) % 233280;
    const y = (s / 233280) * 50;
    s = (s * 9301 + 49297) % 233280;
    const r = 0.6 + (s / 233280) * 1;
    estrellas.push({ x, y, r, key: `${i}-${x.toFixed(1)}-${y.toFixed(1)}` });
  }
  return estrellas;
}

/** Arte generativo en SVG (sin fotografías) para cada experiencia, según su tipo. */
export default function IlustracionExperiencia({ tipo, semilla = 1, titulo }: Props) {
  const color = 'var(--color-primario-claro)';
  const estrellas = generarEstrellas(semilla, 14);

  return (
    <svg viewBox="0 0 120 80" role="img" aria-label={titulo} className="ilustracion-experiencia">
      <defs>
        <linearGradient id={`cielo-${tipo}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-superficie-alta)" />
          <stop offset="100%" stopColor="var(--color-superficie)" />
        </linearGradient>
      </defs>
      <rect width="120" height="80" fill={`url(#cielo-${tipo})`} />
      {estrellas.map((estrella) => (
        <circle
          key={estrella.key}
          cx={estrella.x}
          cy={estrella.y}
          r={estrella.r}
          fill="var(--color-texto-suave)"
        />
      ))}
      {ICONOS[tipo](color)}
    </svg>
  );
}
