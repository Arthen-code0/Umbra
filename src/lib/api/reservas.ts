import { buscarExperienciaPorId } from '../../data/experiencias';
import { obtenerDisponibilidadDe } from '../../data/disponibilidad';
import { formatearFechaLegible } from '../fecha';
import { crearProblema, debeSimularError, simularLatencia } from './cliente';
import { ErrorApi, type DatosNuevaReserva, type Reserva } from './tipos';

const PLAZAS_MINIMAS = 1;
const PLAZAS_MAXIMAS = 8; // RN-04

const PATRON_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ALFABETO_LOCALIZADOR = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function generarLocalizador(): string {
  let codigo = 'UMB-';
  for (let i = 0; i < 6; i++) {
    codigo += ALFABETO_LOCALIZADOR[Math.floor(Math.random() * ALFABETO_LOCALIZADOR.length)];
  }
  return codigo;
}

function validarCamposObligatorios(datos: DatosNuevaReserva): { field: string; message: string }[] {
  const errores: { field: string; message: string }[] = [];

  if (!datos.nombre?.trim()) {
    errores.push({ field: 'nombre', message: 'Este campo es obligatorio' });
  }
  if (!datos.email?.trim()) {
    errores.push({ field: 'email', message: 'Este campo es obligatorio' });
  } else if (!PATRON_EMAIL.test(datos.email.trim())) {
    errores.push({ field: 'email', message: 'Introduce un correo electrónico válido' });
  }
  if (!datos.telefono?.trim()) {
    errores.push({ field: 'telefono', message: 'Este campo es obligatorio' });
  }
  if (
    !Number.isInteger(datos.plazas) ||
    datos.plazas < PLAZAS_MINIMAS ||
    datos.plazas > PLAZAS_MAXIMAS
  ) {
    errores.push({
      field: 'plazas',
      message: `El número de plazas debe estar entre ${PLAZAS_MINIMAS} y ${PLAZAS_MAXIMAS}`,
    });
  }
  if (!datos.fecha) {
    errores.push({ field: 'fecha', message: 'Este campo es obligatorio' });
  }
  if (!datos.experienciaId) {
    errores.push({ field: 'experienciaId', message: 'Selecciona una experiencia' });
  }

  return errores;
}

/**
 * POST /api/v1/reservas — crea una reserva aplicando RN-01 (aforo por
 * fecha) y RN-04 (1-8 plazas por formulario). No hay persistencia real: la
 * reserva "creada" no sobrevive a un refresco de página (fuera de alcance,
 * spec §2).
 */
export async function crearReserva(datos: DatosNuevaReserva): Promise<Reserva> {
  await simularLatencia(400, 1100);

  if (debeSimularError()) {
    throw new ErrorApi(
      crearProblema({
        type: 'error-servicio',
        title: 'No se ha podido registrar la reserva',
        status: 500,
        detail:
          'El sistema de reservas no responde en este momento. Tus datos no se han guardado: inténtalo de nuevo en unos minutos.',
      }),
    );
  }

  const errores = validarCamposObligatorios(datos);
  if (errores.length > 0) {
    throw new ErrorApi(
      crearProblema({
        type: 'validacion',
        title: 'Revisa los datos de la reserva',
        status: 422,
        detail: 'Hay campos incompletos o con un formato incorrecto.',
        errors: errores,
      }),
    );
  }

  const experiencia = buscarExperienciaPorId(datos.experienciaId);
  if (!experiencia) {
    throw new ErrorApi(
      crearProblema({
        type: 'recurso-no-encontrado',
        title: 'Experiencia no encontrada',
        status: 404,
        detail: `No existe ninguna experiencia con id "${datos.experienciaId}".`,
      }),
    );
  }

  const disponibilidadDelDia = obtenerDisponibilidadDe(datos.experienciaId).find(
    (dia) => dia.fecha === datos.fecha,
  );
  const plazasLibres = disponibilidadDelDia?.plazasLibres ?? 0;
  if (datos.plazas > plazasLibres) {
    throw new ErrorApi(
      crearProblema({
        type: 'plazas-insuficientes',
        title: 'No hay plazas suficientes',
        status: 409,
        detail: `Quedan ${plazasLibres} plaza${plazasLibres === 1 ? '' : 's'} libre${plazasLibres === 1 ? '' : 's'} para el ${formatearFechaLegible(datos.fecha)} y se han solicitado ${datos.plazas}.`,
      }),
    );
  }

  return {
    ...datos,
    nombre: datos.nombre.trim(),
    email: datos.email.trim().toLowerCase(),
    telefono: datos.telefono.trim(),
    id: crypto.randomUUID(),
    localizador: generarLocalizador(),
    creadaEn: new Date().toISOString(),
  };
}
