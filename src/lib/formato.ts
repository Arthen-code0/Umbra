/** 3.5 → "3,5"; 2 → "2" (decimales con coma, como se escribe en español). */
export function formatearHoras(horas: number): string {
  return String(horas).replace('.', ',');
}
