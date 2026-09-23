import { fechaAIso } from '../fecha';
import { hashTexto } from '../hash';
import { crearProblema, debeSimularError, simularLatencia } from './cliente';
import {
  ErrorApi,
  type CieloEstaNoche,
  type EventoAstronomico,
  type FaseLunar,
  type Visibilidad,
} from './tipos';

const CICLO_SINODICO_DIAS = 29.53058867;
const EPOCA_LUNA_NUEVA_MS = Date.UTC(2000, 0, 6, 18, 14);

function calcularFaseLunar(fecha: Date): FaseLunar {
  const diasDesdeEpoca = (fecha.getTime() - EPOCA_LUNA_NUEVA_MS) / 86_400_000;
  const posicion =
    ((diasDesdeEpoca % CICLO_SINODICO_DIAS) + CICLO_SINODICO_DIAS) % CICLO_SINODICO_DIAS;
  const fraccion = posicion / CICLO_SINODICO_DIAS;
  const porcentajeIluminacion = Math.round(((1 - Math.cos(2 * Math.PI * fraccion)) / 2) * 100);

  let nombre: string;
  if (fraccion < 0.03 || fraccion > 0.97) nombre = 'Luna nueva';
  else if (fraccion < 0.22) nombre = 'Luna creciente';
  else if (fraccion < 0.28) nombre = 'Cuarto creciente';
  else if (fraccion < 0.47) nombre = 'Gibosa creciente';
  else if (fraccion < 0.53) nombre = 'Luna llena';
  else if (fraccion < 0.72) nombre = 'Gibosa menguante';
  else if (fraccion < 0.78) nombre = 'Cuarto menguante';
  else nombre = 'Luna menguante';

  return { nombre, porcentajeIluminacion };
}

function calcularVisibilidad(fecha: Date, iluminacionLunar: number): Visibilidad {
  const semilla = hashTexto(`visibilidad#${fechaAIso(fecha)}`);
  const factorMeteorologico = 55 + (semilla % 40); // 55-94: variabilidad simulada del cielo
  const penalizacionLunar = Math.round(iluminacionLunar * 0.3);
  const valor = Math.max(5, Math.min(99, factorMeteorologico - penalizacionLunar));

  let texto: string;
  if (valor >= 80) texto = 'Excelente';
  else if (valor >= 60) texto = 'Buena';
  else if (valor >= 40) texto = 'Regular';
  else texto = 'Baja, mejor consultar otro día';

  return { texto, valor };
}

const POOL_PLANETAS = [
  'Mercurio',
  'Venus',
  'Marte',
  'Júpiter',
  'Saturno',
  'Urano',
  'Neptuno',
] as const;

function calcularPlanetasVisibles(fecha: Date): string[] {
  const semilla = hashTexto(`planetas#${fechaAIso(fecha)}`);
  const cantidad = 2 + (semilla % 3); // entre 2 y 4 planetas visibles esa noche
  const inicio = semilla % POOL_PLANETAS.length;
  const seleccion: string[] = [];
  for (let i = 0; i < cantidad; i++) {
    seleccion.push(POOL_PLANETAS[(inicio + i) % POOL_PLANETAS.length]);
  }
  return seleccion;
}

/** Lluvias de estrellas con fecha de máximo recurrente cada año (mes-día fijos). */
const CALENDARIO_EVENTOS: { nombre: string; mes: number; dia: number }[] = [
  { nombre: 'Cuadrántidas (lluvia de estrellas)', mes: 1, dia: 3 },
  { nombre: 'Líridas (lluvia de estrellas)', mes: 4, dia: 22 },
  { nombre: 'Eta Acuáridas (lluvia de estrellas)', mes: 5, dia: 5 },
  { nombre: 'Delta Acuáridas (lluvia de estrellas)', mes: 7, dia: 30 },
  { nombre: 'Perseidas (lluvia de estrellas)', mes: 8, dia: 12 },
  { nombre: 'Oriónidas (lluvia de estrellas)', mes: 10, dia: 21 },
  { nombre: 'Leónidas (lluvia de estrellas)', mes: 11, dia: 17 },
  { nombre: 'Gemínidas (lluvia de estrellas)', mes: 12, dia: 14 },
];

const DIAS_VENTANA_EVENTOS = 30;

function calcularProximosEventos(hoy: Date): EventoAstronomico[] {
  const eventos: EventoAstronomico[] = [];
  for (const anioOffset of [0, 1]) {
    for (const evento of CALENDARIO_EVENTOS) {
      const fechaEvento = new Date(
        Date.UTC(hoy.getUTCFullYear() + anioOffset, evento.mes - 1, evento.dia),
      );
      const diasHastaEvento = Math.round((fechaEvento.getTime() - hoy.getTime()) / 86_400_000);
      if (diasHastaEvento >= 0 && diasHastaEvento <= DIAS_VENTANA_EVENTOS) {
        eventos.push({ nombre: evento.nombre, fecha: fechaAIso(fechaEvento) });
      }
    }
  }
  return eventos.sort((a, b) => a.fecha.localeCompare(b.fecha));
}

/** GET /api/v1/cielo-esta-noche */
export async function obtenerCieloEstaNoche(hoy: Date = new Date()): Promise<CieloEstaNoche> {
  await simularLatencia();

  if (debeSimularError()) {
    throw new ErrorApi(
      crearProblema({
        type: 'error-servicio',
        title: 'No se han podido cargar los datos del cielo',
        status: 500,
        detail:
          'El servicio de datos astronómicos no responde en este momento. Inténtalo de nuevo en unos segundos.',
      }),
    );
  }

  const faseLunar = calcularFaseLunar(hoy);

  return {
    fecha: fechaAIso(hoy),
    faseLunar,
    visibilidad: calcularVisibilidad(hoy, faseLunar.porcentajeIluminacion),
    planetasVisibles: calcularPlanetasVisibles(hoy),
    proximosEventos: calcularProximosEventos(hoy),
  };
}
