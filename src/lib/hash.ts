/**
 * Hash entero simple y determinista (djb2) usado para derivar datos
 * simulados estables (disponibilidad, cielo de esta noche) a partir de una
 * cadena, sin depender de Math.random().
 */
export function hashTexto(texto: string): number {
  let hash = 5381;
  for (let i = 0; i < texto.length; i++) {
    hash = (hash * 33) ^ texto.charCodeAt(i);
  }
  return Math.abs(hash);
}
