/** Tipos compartidos por la API simulada, siguiendo el contrato de docs/specs/umbra/spec.md §9. */

export type TipoExperiencia = 'observacion' | 'astrofotografia' | 'familiar';

export interface PreguntaFrecuente {
  pregunta: string;
  respuesta: string;
}

export interface ElementoGaleria {
  /** Descripción usada para generar el arte SVG y como `alt`. */
  descripcion: string;
}

export interface Experiencia {
  id: string;
  nombre: string;
  tipo: TipoExperiencia;
  resumen: string;
  descripcion: string;
  duracionHoras: number;
  precio: number;
  aptaNinos: boolean;
  edadMinima: number;
  aforoMaximo: number;
  incluye: string[];
  horarios: string[];
  preguntasFrecuentes: PreguntaFrecuente[];
  galeria: ElementoGaleria[];
}

export interface Disponibilidad {
  experienciaId: string;
  /** Fecha en formato ISO 8601 (solo fecha), p. ej. "2026-10-14". */
  fecha: string;
  plazasLibres: number;
}

export interface DatosNuevaReserva {
  experienciaId: string;
  fecha: string;
  plazas: number;
  nombre: string;
  email: string;
  telefono: string;
  comentarios?: string;
}

export interface Reserva extends DatosNuevaReserva {
  id: string;
  localizador: string;
  creadaEn: string;
}

export interface FaseLunar {
  nombre: string;
  porcentajeIluminacion: number;
}

export interface Visibilidad {
  texto: string;
  valor: number;
}

export interface EventoAstronomico {
  nombre: string;
  fecha: string;
}

export interface CieloEstaNoche {
  fecha: string;
  faseLunar: FaseLunar;
  visibilidad: Visibilidad;
  planetasVisibles: string[];
  proximosEventos: EventoAstronomico[];
}

/** Error único en formato Problem Details (RFC 9457), igual que en habilidad-backend. */
export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  errors: { field: string; message: string }[];
}

export interface MetaPaginacion {
  page: number;
  size: number;
  total: number;
  total_pages: number;
}

export interface RespuestaPaginada<T> {
  data: T[];
  meta: MetaPaginacion;
}

export class ErrorApi extends Error {
  readonly problema: ProblemDetails;

  constructor(problema: ProblemDetails) {
    super(problema.detail);
    this.name = 'ErrorApi';
    this.problema = problema;
  }
}
