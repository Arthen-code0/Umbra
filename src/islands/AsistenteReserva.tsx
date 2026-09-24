import { useQuery } from '@tanstack/react-query';
import { useEffect, useId, useMemo, useReducer } from 'react';
import { EXPERIENCIAS, buscarExperienciaPorId } from '../data/experiencias';
import { obtenerDisponibilidad } from '../lib/api/experiencias';
import { crearReserva } from '../lib/api/reservas';
import { ErrorApi, type Reserva } from '../lib/api/tipos';
import { formatearHoras } from '../lib/formato';
import { formatearFechaCorta, formatearFechaLegible } from '../lib/fecha';
import ProveedorConsultas from '../lib/ProveedorConsultas';
import EstadoError from '../components/EstadoError';
import IndicadorPasos from '../components/IndicadorPasos';

const PLAZAS_MINIMAS = 1;
const PLAZAS_MAXIMAS = 8;

type CampoPaso3 = 'nombre' | 'email' | 'telefono';

interface EstadoAsistente {
  paso: 1 | 2 | 3 | 4;
  experienciaId: string;
  fecha: string;
  plazas: number;
  nombre: string;
  email: string;
  telefono: string;
  comentarios: string;
  tocados: Partial<Record<CampoPaso3, boolean>>;
  intentoEnvio: boolean;
  enviando: boolean;
  errorEnvio: string | null;
  reservaConfirmada: Reserva | null;
}

type Accion =
  | { tipo: 'IR_A_PASO'; paso: EstadoAsistente['paso'] }
  | { tipo: 'ELEGIR_EXPERIENCIA'; experienciaId: string }
  | { tipo: 'ELEGIR_FECHA'; fecha: string }
  | { tipo: 'CAMBIAR_PLAZAS'; plazas: number }
  | { tipo: 'CAMBIAR_CAMPO'; campo: CampoPaso3 | 'comentarios'; valor: string }
  | { tipo: 'TOCAR_CAMPO'; campo: CampoPaso3 }
  | { tipo: 'INTENTAR_ENVIAR' }
  | { tipo: 'INICIAR_ENVIO' }
  | { tipo: 'ENVIO_OK'; reserva: Reserva }
  | { tipo: 'ENVIO_ERROR'; mensaje: string };

function leerExperienciaInicial(): string {
  if (typeof window === 'undefined') return '';
  const idDeUrl = new URLSearchParams(window.location.search).get('experiencia');
  return idDeUrl && buscarExperienciaPorId(idDeUrl) ? idDeUrl : '';
}

const ESTADO_INICIAL: EstadoAsistente = {
  paso: 1,
  experienciaId: '',
  fecha: '',
  plazas: 2,
  nombre: '',
  email: '',
  telefono: '',
  comentarios: '',
  tocados: {},
  intentoEnvio: false,
  enviando: false,
  errorEnvio: null,
  reservaConfirmada: null,
};

function reductor(estado: EstadoAsistente, accion: Accion): EstadoAsistente {
  switch (accion.tipo) {
    case 'IR_A_PASO':
      return { ...estado, paso: accion.paso };
    case 'ELEGIR_EXPERIENCIA':
      return { ...estado, experienciaId: accion.experienciaId, fecha: '' };
    case 'ELEGIR_FECHA':
      return { ...estado, fecha: accion.fecha };
    case 'CAMBIAR_PLAZAS':
      return { ...estado, plazas: accion.plazas };
    case 'CAMBIAR_CAMPO':
      return { ...estado, [accion.campo]: accion.valor };
    case 'TOCAR_CAMPO':
      return { ...estado, tocados: { ...estado.tocados, [accion.campo]: true } };
    case 'INTENTAR_ENVIAR':
      return { ...estado, intentoEnvio: true };
    case 'INICIAR_ENVIO':
      return { ...estado, enviando: true, errorEnvio: null };
    case 'ENVIO_OK':
      return { ...estado, enviando: false, reservaConfirmada: accion.reserva };
    case 'ENVIO_ERROR':
      return { ...estado, enviando: false, errorEnvio: accion.mensaje };
    default:
      return estado;
  }
}

function inicializar(): EstadoAsistente {
  return { ...ESTADO_INICIAL, experienciaId: leerExperienciaInicial() };
}

const PATRON_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validarPaso3(
  datos: Pick<EstadoAsistente, CampoPaso3>,
): Partial<Record<CampoPaso3, string>> {
  const errores: Partial<Record<CampoPaso3, string>> = {};
  if (!datos.nombre.trim()) errores.nombre = 'Este campo es obligatorio';
  if (!datos.email.trim()) errores.email = 'Este campo es obligatorio';
  else if (!PATRON_EMAIL.test(datos.email.trim()))
    errores.email = 'Introduce un correo electrónico válido';
  if (!datos.telefono.trim()) errores.telefono = 'Este campo es obligatorio';
  else if (datos.telefono.trim().replace(/[\s-]/g, '').length < 9)
    errores.telefono = 'Introduce un teléfono válido (mínimo 9 dígitos)';
  return errores;
}

function AsistenteInterno() {
  const [estado, dispatch] = useReducer(reductor, undefined, inicializar);
  const idsCampos = {
    nombre: useId(),
    email: useId(),
    telefono: useId(),
    comentarios: useId(),
  };

  const experiencia = estado.experienciaId
    ? buscarExperienciaPorId(estado.experienciaId)
    : undefined;

  const consultaDisponibilidad = useQuery({
    queryKey: ['disponibilidad', estado.experienciaId],
    queryFn: () => obtenerDisponibilidad(estado.experienciaId),
    enabled: Boolean(estado.experienciaId) && estado.paso === 2,
  });

  const diaSeleccionado = consultaDisponibilidad.data?.find((dia) => dia.fecha === estado.fecha);
  const plazasLibres = diaSeleccionado?.plazasLibres ?? 0;
  const plazasMaximasPaso2 = Math.min(PLAZAS_MAXIMAS, plazasLibres || PLAZAS_MAXIMAS);

  const erroresPaso3 = useMemo(
    () => validarPaso3({ nombre: estado.nombre, email: estado.email, telefono: estado.telefono }),
    [estado.nombre, estado.email, estado.telefono],
  );

  useEffect(() => {
    document.title = `Paso ${estado.paso} de 4 — Reservar — Umbra`;
  }, [estado.paso]);

  if (estado.reservaConfirmada) {
    return <PantallaConfirmacion reserva={estado.reservaConfirmada} experiencia={experiencia} />;
  }

  async function confirmarReserva() {
    dispatch({ tipo: 'INICIAR_ENVIO' });
    try {
      const reserva = await crearReserva({
        experienciaId: estado.experienciaId,
        fecha: estado.fecha,
        plazas: estado.plazas,
        nombre: estado.nombre,
        email: estado.email,
        telefono: estado.telefono,
        comentarios: estado.comentarios || undefined,
      });
      dispatch({ tipo: 'ENVIO_OK', reserva });
    } catch (error) {
      dispatch({
        tipo: 'ENVIO_ERROR',
        mensaje:
          error instanceof ErrorApi ? error.problema.detail : 'Ha ocurrido un error inesperado.',
      });
    }
  }

  function irAlPaso3SiValido() {
    if (!estado.fecha || estado.plazas < PLAZAS_MINIMAS || plazasLibres === 0) return;
    dispatch({ tipo: 'IR_A_PASO', paso: 3 });
  }

  function intentarAvanzarDesdePaso3() {
    dispatch({ tipo: 'INTENTAR_ENVIAR' });
    const errores = validarPaso3(estado);
    if (Object.keys(errores).length > 0) {
      const primerCampoConError = (['nombre', 'email', 'telefono'] as CampoPaso3[]).find(
        (campo) => errores[campo],
      );
      if (primerCampoConError) {
        document.getElementById(idsCampos[primerCampoConError])?.focus();
      }
      return;
    }
    dispatch({ tipo: 'IR_A_PASO', paso: 4 });
  }

  return (
    <div className="asistente-reserva">
      <IndicadorPasos pasoActual={estado.paso} />

      {estado.paso === 1 && (
        <PasoExperiencia
          seleccionId={estado.experienciaId}
          onSeleccionar={(id) => dispatch({ tipo: 'ELEGIR_EXPERIENCIA', experienciaId: id })}
          onContinuar={() => estado.experienciaId && dispatch({ tipo: 'IR_A_PASO', paso: 2 })}
        />
      )}

      {estado.paso === 2 && experiencia && (
        <PasoFecha
          experiencia={experiencia}
          fecha={estado.fecha}
          plazas={estado.plazas}
          plazasLibres={plazasLibres}
          plazasMaximas={plazasMaximasPaso2}
          consulta={consultaDisponibilidad}
          onElegirFecha={(fecha) => dispatch({ tipo: 'ELEGIR_FECHA', fecha })}
          onCambiarPlazas={(plazas) => dispatch({ tipo: 'CAMBIAR_PLAZAS', plazas })}
          onAtras={() => dispatch({ tipo: 'IR_A_PASO', paso: 1 })}
          onContinuar={irAlPaso3SiValido}
        />
      )}

      {estado.paso === 3 && (
        <PasoDatos
          estado={estado}
          errores={erroresPaso3}
          idsCampos={idsCampos}
          onCambiarCampo={(campo, valor) => dispatch({ tipo: 'CAMBIAR_CAMPO', campo, valor })}
          onTocarCampo={(campo) => dispatch({ tipo: 'TOCAR_CAMPO', campo })}
          onAtras={() => dispatch({ tipo: 'IR_A_PASO', paso: 2 })}
          onContinuar={intentarAvanzarDesdePaso3}
        />
      )}

      {estado.paso === 4 && experiencia && (
        <PasoResumen
          estado={estado}
          experiencia={experiencia}
          onAtras={() => dispatch({ tipo: 'IR_A_PASO', paso: 3 })}
          onConfirmar={confirmarReserva}
        />
      )}
    </div>
  );
}

// Los pasos 1 y 2 se implementan a continuación (T-09); los pasos 3, 4 y la
// confirmación llegan en T-10. Placeholders mínimos mientras tanto.

interface PropsPasoExperiencia {
  seleccionId: string;
  onSeleccionar: (id: string) => void;
  onContinuar: () => void;
}

function PasoExperiencia({ seleccionId, onSeleccionar, onContinuar }: PropsPasoExperiencia) {
  return (
    <section aria-labelledby="paso1-titulo" className="paso-reserva">
      <h2 id="paso1-titulo">1. Elige una experiencia</h2>
      <div className="selector-experiencias" role="radiogroup" aria-labelledby="paso1-titulo">
        {EXPERIENCIAS.map((experiencia) => (
          <label
            key={experiencia.id}
            className={`tarjeta selector-experiencias__opcion ${seleccionId === experiencia.id ? 'is-seleccionada' : ''}`}
          >
            <input
              type="radio"
              name="experiencia"
              value={experiencia.id}
              checked={seleccionId === experiencia.id}
              onChange={() => onSeleccionar(experiencia.id)}
            />
            <span className="selector-experiencias__nombre">{experiencia.nombre}</span>
            <span className="selector-experiencias__meta">
              {formatearHoras(experiencia.duracionHoras)} h · {experiencia.precio} €/persona
            </span>
          </label>
        ))}
      </div>
      <div className="paso-reserva__acciones">
        <span />
        <button
          type="button"
          className="boton boton--primario"
          disabled={!seleccionId}
          onClick={onContinuar}
        >
          Continuar
        </button>
      </div>
    </section>
  );
}

interface PropsPasoFecha {
  experiencia: NonNullable<ReturnType<typeof buscarExperienciaPorId>>;
  fecha: string;
  plazas: number;
  plazasLibres: number;
  plazasMaximas: number;
  consulta: ReturnType<typeof useQuery<import('../lib/api/tipos').Disponibilidad[], unknown>>;
  onElegirFecha: (fecha: string) => void;
  onCambiarPlazas: (plazas: number) => void;
  onAtras: () => void;
  onContinuar: () => void;
}

function PasoFecha({
  experiencia,
  fecha,
  plazas,
  plazasLibres,
  plazasMaximas,
  consulta,
  onElegirFecha,
  onCambiarPlazas,
  onAtras,
  onContinuar,
}: PropsPasoFecha) {
  const idFecha = useId();
  const idPlazas = useId();
  const sinPlazas = Boolean(fecha) && plazasLibres === 0;

  return (
    <section aria-labelledby="paso2-titulo" className="paso-reserva">
      <h2 id="paso2-titulo">2. Elige fecha y plazas</h2>
      <p className="paso-reserva__subtitulo">
        {experiencia.nombre} · horario {experiencia.horarios[0]}
      </p>

      {consulta.isPending && <p>Consultando disponibilidad…</p>}
      {consulta.isError && (
        <EstadoError
          detalle="No se ha podido consultar la disponibilidad. Inténtalo de nuevo."
          onReintentar={() => consulta.refetch()}
        />
      )}

      {consulta.isSuccess && (
        <>
          <div className="campo">
            <label htmlFor={idFecha}>Fecha</label>
            <select
              id={idFecha}
              value={fecha}
              onChange={(evento) => onElegirFecha(evento.target.value)}
            >
              <option value="">Selecciona una fecha</option>
              {consulta.data.map((dia) => (
                <option key={dia.fecha} value={dia.fecha}>
                  {formatearFechaCorta(dia.fecha)}
                  {dia.plazasLibres === 0
                    ? ' — sin plazas'
                    : ` — ${dia.plazasLibres} plazas libres`}
                </option>
              ))}
            </select>
          </div>

          <div className="campo" data-invalido={sinPlazas || undefined}>
            <label htmlFor={idPlazas}>Número de plazas</label>
            <input
              id={idPlazas}
              type="number"
              min={PLAZAS_MINIMAS}
              max={plazasMaximas}
              value={plazas}
              disabled={sinPlazas || !fecha}
              onChange={(evento) => onCambiarPlazas(Number(evento.target.value))}
            />
            {sinPlazas && <span className="error">Sin plazas disponibles para esta fecha</span>}
          </div>
        </>
      )}

      <div className="paso-reserva__acciones">
        <button type="button" className="boton boton--secundario" onClick={onAtras}>
          Atrás
        </button>
        <button
          type="button"
          className="boton boton--primario"
          disabled={!fecha || sinPlazas}
          onClick={onContinuar}
        >
          Continuar
        </button>
      </div>
    </section>
  );
}

interface PropsPasoDatos {
  estado: EstadoAsistente;
  errores: Partial<Record<CampoPaso3, string>>;
  idsCampos: Record<CampoPaso3 | 'comentarios', string>;
  onCambiarCampo: (campo: CampoPaso3 | 'comentarios', valor: string) => void;
  onTocarCampo: (campo: CampoPaso3) => void;
  onAtras: () => void;
  onContinuar: () => void;
}

function PasoDatos({
  estado,
  errores,
  idsCampos,
  onCambiarCampo,
  onTocarCampo,
  onAtras,
  onContinuar,
}: PropsPasoDatos) {
  function muestraError(campo: CampoPaso3) {
    return (estado.tocados[campo] || estado.intentoEnvio) && errores[campo];
  }

  return (
    <section aria-labelledby="paso3-titulo" className="paso-reserva">
      <h2 id="paso3-titulo">3. Tus datos</h2>

      <div className="campo" data-invalido={muestraError('nombre') || undefined}>
        <label htmlFor={idsCampos.nombre}>Nombre y apellidos</label>
        <input
          id={idsCampos.nombre}
          type="text"
          autoComplete="name"
          value={estado.nombre}
          aria-describedby={muestraError('nombre') ? `${idsCampos.nombre}-error` : undefined}
          aria-invalid={muestraError('nombre') ? true : undefined}
          onChange={(evento) => onCambiarCampo('nombre', evento.target.value)}
          onBlur={() => onTocarCampo('nombre')}
        />
        {muestraError('nombre') && (
          <span className="error" id={`${idsCampos.nombre}-error`}>
            {errores.nombre}
          </span>
        )}
      </div>

      <div className="campo" data-invalido={muestraError('email') || undefined}>
        <label htmlFor={idsCampos.email}>Correo electrónico</label>
        <input
          id={idsCampos.email}
          type="email"
          autoComplete="email"
          value={estado.email}
          aria-describedby={muestraError('email') ? `${idsCampos.email}-error` : undefined}
          aria-invalid={muestraError('email') ? true : undefined}
          onChange={(evento) => onCambiarCampo('email', evento.target.value)}
          onBlur={() => onTocarCampo('email')}
        />
        {muestraError('email') && (
          <span className="error" id={`${idsCampos.email}-error`}>
            {errores.email}
          </span>
        )}
      </div>

      <div className="campo" data-invalido={muestraError('telefono') || undefined}>
        <label htmlFor={idsCampos.telefono}>Teléfono</label>
        <input
          id={idsCampos.telefono}
          type="tel"
          autoComplete="tel"
          value={estado.telefono}
          aria-describedby={muestraError('telefono') ? `${idsCampos.telefono}-error` : undefined}
          aria-invalid={muestraError('telefono') ? true : undefined}
          onChange={(evento) => onCambiarCampo('telefono', evento.target.value)}
          onBlur={() => onTocarCampo('telefono')}
        />
        {muestraError('telefono') && (
          <span className="error" id={`${idsCampos.telefono}-error`}>
            {errores.telefono}
          </span>
        )}
      </div>

      <div className="campo">
        <label htmlFor={idsCampos.comentarios}>Comentarios (opcional)</label>
        <textarea
          id={idsCampos.comentarios}
          rows={3}
          value={estado.comentarios}
          onChange={(evento) => onCambiarCampo('comentarios', evento.target.value)}
        />
      </div>

      <div className="paso-reserva__acciones">
        <button type="button" className="boton boton--secundario" onClick={onAtras}>
          Atrás
        </button>
        <button type="button" className="boton boton--primario" onClick={onContinuar}>
          Continuar
        </button>
      </div>
    </section>
  );
}

interface PropsPasoResumen {
  estado: EstadoAsistente;
  experiencia: NonNullable<ReturnType<typeof buscarExperienciaPorId>>;
  onAtras: () => void;
  onConfirmar: () => void;
}

function PasoResumen({ estado, experiencia, onAtras, onConfirmar }: PropsPasoResumen) {
  return (
    <section aria-labelledby="paso4-titulo" className="paso-reserva">
      <h2 id="paso4-titulo">4. Resumen y confirmación</h2>

      <dl className="resumen-reserva">
        <div>
          <dt>Experiencia</dt>
          <dd>{experiencia.nombre}</dd>
        </div>
        <div>
          <dt>Fecha</dt>
          <dd>{formatearFechaLegible(estado.fecha)}</dd>
        </div>
        <div>
          <dt>Plazas</dt>
          <dd>{estado.plazas}</dd>
        </div>
        <div>
          <dt>Nombre</dt>
          <dd>{estado.nombre}</dd>
        </div>
        <div>
          <dt>Email</dt>
          <dd>{estado.email}</dd>
        </div>
        <div>
          <dt>Teléfono</dt>
          <dd>{estado.telefono}</dd>
        </div>
        <div>
          <dt>Total estimado</dt>
          <dd>
            <strong>{experiencia.precio * estado.plazas} €</strong>
          </dd>
        </div>
      </dl>

      <p className="resumen-reserva__nota">
        Pago in situ o por transferencia: te lo confirmamos por email tras la reserva.
      </p>

      {estado.errorEnvio && (
        <div className="campo" data-invalido="true">
          <span className="error" role="alert">
            {estado.errorEnvio}
          </span>
        </div>
      )}

      <div className="paso-reserva__acciones">
        <button
          type="button"
          className="boton boton--secundario"
          onClick={onAtras}
          disabled={estado.enviando}
        >
          Atrás
        </button>
        <button
          type="button"
          className="boton boton--primario"
          onClick={onConfirmar}
          disabled={estado.enviando}
        >
          {estado.enviando ? 'Enviando…' : 'Confirmar reserva'}
        </button>
      </div>
    </section>
  );
}

function PantallaConfirmacion({
  reserva,
  experiencia,
}: {
  reserva: Reserva;
  experiencia: ReturnType<typeof buscarExperienciaPorId>;
}) {
  return (
    <section className="confirmacion-reserva tarjeta" aria-labelledby="confirmacion-titulo">
      <svg viewBox="0 0 48 48" width="56" height="56" aria-hidden="true" focusable="false">
        <circle cx="24" cy="24" r="22" fill="none" stroke="var(--color-exito)" strokeWidth="2" />
        <path
          d="M14 24l7 7 13-14"
          fill="none"
          stroke="var(--color-exito)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <h2 id="confirmacion-titulo">Reserva confirmada</h2>
      <p>
        Localizador: <strong>{reserva.localizador}</strong>
      </p>
      <p>
        {experiencia?.nombre} · {formatearFechaLegible(reserva.fecha)} · {reserva.plazas} plaza
        {reserva.plazas === 1 ? '' : 's'}
      </p>
      <p>Te hemos enviado la confirmación a {reserva.email}. Pago in situ o por transferencia.</p>
      <a className="boton boton--primario" href="/">
        Volver al inicio
      </a>
    </section>
  );
}

export default function AsistenteReserva() {
  return (
    <ProveedorConsultas>
      <AsistenteInterno />
    </ProveedorConsultas>
  );
}
