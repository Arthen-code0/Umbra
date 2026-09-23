import { ErrorApi, type ProblemDetails } from './tipos';

/**
 * Simula la latencia de una API real. Todas las funciones de src/lib/api/
 * la usan para que los estados de "cargando" de la interfaz sean visibles
 * y comprobables, igual que ocurriría contra un backend real.
 */
export function simularLatencia(minMs = 300, maxMs = 900): Promise<void> {
  const duracion = minMs + Math.random() * (maxMs - minMs);
  return new Promise((resolve) => setTimeout(resolve, duracion));
}

/**
 * Lee `?simular=error` de la URL actual para poder forzar el modo de fallo
 * de la API sin backend real (ver docs/specs/umbra/spec.md §9).
 */
export function debeSimularError(): boolean {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).get('simular') === 'error';
}

export function crearProblema(
  datos: Pick<ProblemDetails, 'type' | 'title' | 'status' | 'detail'> &
    Partial<Pick<ProblemDetails, 'errors'>>,
): ProblemDetails {
  return {
    instance: typeof window !== 'undefined' ? window.location.pathname : '',
    errors: [],
    ...datos,
  };
}

export function lanzarErrorGenerico(instancia: string): never {
  throw new ErrorApi({
    ...crearProblema({
      type: 'error-servicio',
      title: 'No se ha podido completar la petición',
      status: 500,
      detail:
        'Ha ocurrido un problema al conectar con el observatorio. Inténtalo de nuevo en unos segundos.',
    }),
    instance: instancia,
  });
}
