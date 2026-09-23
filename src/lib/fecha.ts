const FORMATEADOR_LARGO = new Intl.DateTimeFormat('es-ES', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const FORMATEADOR_CORTO = new Intl.DateTimeFormat('es-ES', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
});

/** Convierte una fecha ISO ("2026-10-14") a "14 de octubre de 2026", sin desfases de zona horaria. */
export function formatearFechaLegible(fechaIso: string): string {
  const [anio, mes, dia] = fechaIso.split('-').map(Number);
  return FORMATEADOR_LARGO.format(new Date(Date.UTC(anio, mes - 1, dia)));
}

/** Convierte una fecha ISO a un formato corto para selectores ("mar. 14 oct"). */
export function formatearFechaCorta(fechaIso: string): string {
  const [anio, mes, dia] = fechaIso.split('-').map(Number);
  return FORMATEADOR_CORTO.format(new Date(Date.UTC(anio, mes - 1, dia)));
}

export function fechaAIso(fecha: Date): string {
  return fecha.toISOString().slice(0, 10);
}
