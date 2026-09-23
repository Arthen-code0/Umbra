import { EXPERIENCIAS, buscarExperienciaPorId } from '../../data/experiencias';
import { obtenerDisponibilidadDe } from '../../data/disponibilidad';
import { crearProblema, debeSimularError, simularLatencia } from './cliente';
import {
  ErrorApi,
  type Disponibilidad,
  type Experiencia,
  type RespuestaPaginada,
  type TipoExperiencia,
} from './tipos';

export interface FiltrosExperiencias {
  tipo?: TipoExperiencia;
  precioMax?: number;
  aptaNinos?: boolean;
  orden?: 'precio-asc' | 'precio-desc' | 'duracion-asc' | 'duracion-desc';
  page?: number;
  size?: number;
}

const TAMANIO_PAGINA_POR_DEFECTO = 12;

/** GET /api/v1/experiencias — listado paginado, filtrable y ordenable. */
export async function listarExperiencias(
  filtros: FiltrosExperiencias = {},
): Promise<RespuestaPaginada<Experiencia>> {
  await simularLatencia();
  if (debeSimularError()) {
    throw new ErrorApi(
      crearProblema({
        type: 'error-servicio',
        title: 'No se ha podido cargar el catálogo',
        status: 500,
        detail: 'El listado de experiencias no responde en este momento. Inténtalo de nuevo.',
      }),
    );
  }

  let resultado = EXPERIENCIAS.filter((experiencia) => {
    if (filtros.tipo && experiencia.tipo !== filtros.tipo) return false;
    if (typeof filtros.precioMax === 'number' && experiencia.precio > filtros.precioMax)
      return false;
    if (typeof filtros.aptaNinos === 'boolean' && experiencia.aptaNinos !== filtros.aptaNinos)
      return false;
    return true;
  });

  resultado = ordenar(resultado, filtros.orden);

  const page = filtros.page ?? 1;
  const size = filtros.size ?? TAMANIO_PAGINA_POR_DEFECTO;
  const total = resultado.length;
  const total_pages = Math.max(1, Math.ceil(total / size));
  const inicio = (page - 1) * size;

  return {
    data: resultado.slice(inicio, inicio + size),
    meta: { page, size, total, total_pages },
  };
}

function ordenar(experiencias: Experiencia[], orden: FiltrosExperiencias['orden']): Experiencia[] {
  const copia = [...experiencias];
  switch (orden) {
    case 'precio-asc':
      return copia.sort((a, b) => a.precio - b.precio);
    case 'precio-desc':
      return copia.sort((a, b) => b.precio - a.precio);
    case 'duracion-asc':
      return copia.sort((a, b) => a.duracionHoras - b.duracionHoras);
    case 'duracion-desc':
      return copia.sort((a, b) => b.duracionHoras - a.duracionHoras);
    default:
      return copia;
  }
}

/** GET /api/v1/experiencias/{id} */
export async function obtenerExperiencia(id: string): Promise<Experiencia> {
  await simularLatencia();
  if (debeSimularError()) {
    throw new ErrorApi(
      crearProblema({
        type: 'error-servicio',
        title: 'No se ha podido cargar la experiencia',
        status: 500,
        detail: 'El detalle de esta experiencia no responde en este momento. Inténtalo de nuevo.',
      }),
    );
  }
  const experiencia = buscarExperienciaPorId(id);
  if (!experiencia) {
    throw new ErrorApi(
      crearProblema({
        type: 'recurso-no-encontrado',
        title: 'Experiencia no encontrada',
        status: 404,
        detail: `No existe ninguna experiencia con id "${id}".`,
      }),
    );
  }
  return experiencia;
}

/** GET /api/v1/experiencias/{id}/disponibilidad */
export async function obtenerDisponibilidad(id: string): Promise<Disponibilidad[]> {
  await simularLatencia();
  if (debeSimularError()) {
    throw new ErrorApi(
      crearProblema({
        type: 'error-servicio',
        title: 'No se ha podido cargar la disponibilidad',
        status: 500,
        detail: 'El calendario de disponibilidad no responde en este momento. Inténtalo de nuevo.',
      }),
    );
  }
  const experiencia = buscarExperienciaPorId(id);
  if (!experiencia) {
    throw new ErrorApi(
      crearProblema({
        type: 'recurso-no-encontrado',
        title: 'Experiencia no encontrada',
        status: 404,
        detail: `No existe ninguna experiencia con id "${id}".`,
      }),
    );
  }
  return obtenerDisponibilidadDe(id);
}
