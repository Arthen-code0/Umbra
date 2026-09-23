import type { Disponibilidad } from '../lib/api/tipos';
import { fechaAIso } from '../lib/fecha';
import { hashTexto } from '../lib/hash';
import { buscarExperienciaPorId } from './experiencias';

const DIAS_CON_DISPONIBILIDAD = 30;

/**
 * Genera plazas libres deterministas (misma experiencia + misma fecha ⇒
 * mismo resultado) para los próximos 30 días. Aproximadamente 1 de cada 8
 * fechas queda agotada a propósito, para poder ver CA-05.2 con cualquier
 * experiencia sin depender del azar en cada carga.
 */
export function generarDisponibilidad(
  experienciaId: string,
  aforoMaximo: number,
  hoy: Date = new Date(),
): Disponibilidad[] {
  const resultado: Disponibilidad[] = [];
  for (let offset = 1; offset <= DIAS_CON_DISPONIBILIDAD; offset++) {
    const fecha = new Date(hoy);
    fecha.setDate(fecha.getDate() + offset);
    const fechaIso = fechaAIso(fecha);
    const semilla = hashTexto(`${experienciaId}#${fechaIso}`);
    const agotada = semilla % 8 === 0;
    const plazasLibres = agotada ? 0 : 1 + (semilla % aforoMaximo);
    resultado.push({ experienciaId, fecha: fechaIso, plazasLibres });
  }
  return resultado;
}

export function obtenerDisponibilidadDe(experienciaId: string, hoy?: Date): Disponibilidad[] {
  const experiencia = buscarExperienciaPorId(experienciaId);
  if (!experiencia) return [];
  return generarDisponibilidad(experienciaId, experiencia.aforoMaximo, hoy);
}
