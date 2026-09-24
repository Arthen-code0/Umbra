const PALABRAS_POR_MINUTO = 200;

/** Minutos de lectura estimados (mínimo 1) a 200 palabras por minuto. */
export function calcularTiempoLectura(texto: string): number {
  const palabras = texto.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(palabras / PALABRAS_POR_MINUTO));
}
