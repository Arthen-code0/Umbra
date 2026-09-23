import { useQuery } from '@tanstack/react-query';
import { useEffect, useId, useState } from 'react';
import { listarExperiencias } from '../lib/api/experiencias';
import { ErrorApi, type TipoExperiencia } from '../lib/api/tipos';
import ProveedorConsultas from '../lib/ProveedorConsultas';
import EstadoError from '../components/EstadoError';
import Skeleton from '../components/Skeleton';
import TarjetaExperiencia from '../components/TarjetaExperiencia';

type Orden = 'precio-asc' | 'precio-desc' | 'duracion-asc' | 'duracion-desc';

interface FiltrosUI {
  tipos: TipoExperiencia[];
  precioMax: number;
  aptaNinos: boolean;
  orden: Orden | '';
}

const PRECIO_TOPE = 100;

const FILTROS_INICIALES: FiltrosUI = {
  tipos: [],
  precioMax: PRECIO_TOPE,
  aptaNinos: false,
  orden: '',
};

const TIPOS: { valor: TipoExperiencia; etiqueta: string }[] = [
  { valor: 'observacion', etiqueta: 'Observación' },
  { valor: 'astrofotografia', etiqueta: 'Astrofotografía' },
  { valor: 'familiar', etiqueta: 'Familiar' },
];

const OPCIONES_ORDEN: { valor: Orden | ''; etiqueta: string }[] = [
  { valor: '', etiqueta: 'Recomendado' },
  { valor: 'precio-asc', etiqueta: 'Precio: menor a mayor' },
  { valor: 'precio-desc', etiqueta: 'Precio: mayor a menor' },
  { valor: 'duracion-asc', etiqueta: 'Duración: más corta primero' },
  { valor: 'duracion-desc', etiqueta: 'Duración: más larga primero' },
];

function leerFiltrosDeUrl(): FiltrosUI {
  if (typeof window === 'undefined') return FILTROS_INICIALES;
  const params = new URLSearchParams(window.location.search);
  const tiposParam = params.get('tipo');
  const precioParam = params.get('precioMax');
  return {
    tipos: tiposParam ? (tiposParam.split(',') as TipoExperiencia[]) : [],
    precioMax: precioParam ? Number(precioParam) : PRECIO_TOPE,
    aptaNinos: params.get('aptaNinos') === '1',
    orden: (params.get('orden') as Orden | null) ?? '',
  };
}

function escribirFiltrosEnUrl(filtros: FiltrosUI) {
  const url = new URL(window.location.href);
  const params = url.searchParams;
  params.delete('tipo');
  params.delete('precioMax');
  params.delete('aptaNinos');
  params.delete('orden');
  if (filtros.tipos.length > 0) params.set('tipo', filtros.tipos.join(','));
  if (filtros.precioMax < PRECIO_TOPE) params.set('precioMax', String(filtros.precioMax));
  if (filtros.aptaNinos) params.set('aptaNinos', '1');
  if (filtros.orden) params.set('orden', filtros.orden);
  window.history.replaceState({}, '', `${url.pathname}${params.toString() ? `?${params}` : ''}`);
}

function CatalogoInterno() {
  // Lectura única de la URL: el lazy initializer de useState corre en el
  // cliente durante la hidratación, así que no hace falta un efecto (ver
  // docs/diseno.md y la nota de SelectorTema.tsx sobre este mismo patrón).
  const [filtros, setFiltros] = useState<FiltrosUI>(() => leerFiltrosDeUrl());
  const [precioBorrador, setPrecioBorrador] = useState<number>(() => leerFiltrosDeUrl().precioMax);
  const [panelAbierto, setPanelAbierto] = useState(false);
  const idPrecio = useId();

  // Debounce del precio: el filtro real se actualiza 300ms después de mover el slider.
  useEffect(() => {
    const temporizador = window.setTimeout(() => {
      setFiltros((anteriores) =>
        anteriores.precioMax === precioBorrador
          ? anteriores
          : { ...anteriores, precioMax: precioBorrador },
      );
    }, 300);
    return () => window.clearTimeout(temporizador);
  }, [precioBorrador]);

  useEffect(() => {
    escribirFiltrosEnUrl(filtros);
  }, [filtros]);

  const consulta = useQuery({
    queryKey: ['experiencias', filtros],
    queryFn: () =>
      listarExperiencias({
        tipo: filtros.tipos.length === 1 ? filtros.tipos[0] : undefined,
        precioMax: filtros.precioMax < PRECIO_TOPE ? filtros.precioMax : undefined,
        aptaNinos: filtros.aptaNinos || undefined,
        orden: filtros.orden || undefined,
        size: 24,
      }),
  });

  const experiencias =
    filtros.tipos.length > 1
      ? (consulta.data?.data ?? []).filter((experiencia) =>
          filtros.tipos.includes(experiencia.tipo),
        )
      : (consulta.data?.data ?? []);

  function alternarTipo(tipo: TipoExperiencia) {
    setFiltros((anteriores) => ({
      ...anteriores,
      tipos: anteriores.tipos.includes(tipo)
        ? anteriores.tipos.filter((t) => t !== tipo)
        : [...anteriores.tipos, tipo],
    }));
  }

  function quitarFiltros() {
    setFiltros(FILTROS_INICIALES);
    setPrecioBorrador(PRECIO_TOPE);
  }

  const hayFiltrosActivos =
    filtros.tipos.length > 0 || filtros.precioMax < PRECIO_TOPE || filtros.aptaNinos;
  const contadorFiltros =
    filtros.tipos.length + (filtros.aptaNinos ? 1 : 0) + (filtros.precioMax < PRECIO_TOPE ? 1 : 0);

  return (
    <div className="catalogo">
      <div className="catalogo__barra">
        <button
          type="button"
          className="boton boton--secundario catalogo__disparador-filtros"
          aria-expanded={panelAbierto}
          aria-controls="panel-filtros"
          onClick={() => setPanelAbierto((abierto) => !abierto)}
        >
          Filtros {hayFiltrosActivos ? `(${contadorFiltros})` : ''}
        </button>
        <div className="campo catalogo__orden">
          <label htmlFor="orden-catalogo">Ordenar por</label>
          <select
            id="orden-catalogo"
            value={filtros.orden}
            onChange={(evento) =>
              setFiltros((anteriores) => ({
                ...anteriores,
                orden: evento.target.value as Orden | '',
              }))
            }
          >
            {OPCIONES_ORDEN.map((opcion) => (
              <option key={opcion.valor || 'recomendado'} value={opcion.valor}>
                {opcion.etiqueta}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="catalogo__layout">
        <aside
          id="panel-filtros"
          className={`catalogo__filtros ${panelAbierto ? 'is-abierto' : ''}`}
          aria-label="Filtrar experiencias"
        >
          <fieldset>
            <legend>Tipo de experiencia</legend>
            {TIPOS.map((tipo) => (
              <label key={tipo.valor} className="opcion-check">
                <input
                  type="checkbox"
                  checked={filtros.tipos.includes(tipo.valor)}
                  onChange={() => alternarTipo(tipo.valor)}
                />
                {tipo.etiqueta}
              </label>
            ))}
          </fieldset>

          <div className="campo">
            <label htmlFor={idPrecio}>Precio máximo: {precioBorrador} €</label>
            <input
              id={idPrecio}
              type="range"
              min={15}
              max={PRECIO_TOPE}
              step={5}
              value={precioBorrador}
              onChange={(evento) => setPrecioBorrador(Number(evento.target.value))}
            />
          </div>

          <label className="opcion-check">
            <input
              type="checkbox"
              checked={filtros.aptaNinos}
              onChange={(evento) =>
                setFiltros((anteriores) => ({ ...anteriores, aptaNinos: evento.target.checked }))
              }
            />
            Apta para niños
          </label>

          {hayFiltrosActivos && (
            <button type="button" className="boton boton--secundario" onClick={quitarFiltros}>
              Quitar filtros
            </button>
          )}
        </aside>

        <div className="catalogo__resultados" aria-live="polite">
          {consulta.isPending && (
            <div className="catalogo__grid">
              {Array.from({ length: 6 }).map((_, indice) => (
                <div className="tarjeta" key={indice}>
                  <Skeleton alto="10rem" />
                  <Skeleton alto="1.2rem" className="margen-arriba" />
                  <Skeleton alto="0.9rem" />
                  <Skeleton alto="0.9rem" />
                </div>
              ))}
              <span className="visualmente-oculto">Cargando experiencias…</span>
            </div>
          )}

          {consulta.isError && (
            <EstadoError
              titulo="No se han podido cargar las experiencias"
              detalle={
                consulta.error instanceof ErrorApi
                  ? consulta.error.problema.detail
                  : 'Ha ocurrido un error inesperado al cargar las experiencias.'
              }
              onReintentar={() => consulta.refetch()}
            />
          )}

          {consulta.isSuccess && experiencias.length === 0 && (
            <div className="tarjeta estado-vacio">
              <p>Ninguna experiencia cumple estos filtros ahora mismo.</p>
              <button type="button" className="boton boton--primario" onClick={quitarFiltros}>
                Quitar filtros
              </button>
            </div>
          )}

          {consulta.isSuccess && experiencias.length > 0 && (
            <div className="catalogo__grid">
              {experiencias.map((experiencia, indice) => (
                <TarjetaExperiencia
                  key={experiencia.id}
                  experiencia={experiencia}
                  indice={indice}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CatalogoExperiencias() {
  return (
    <ProveedorConsultas>
      <CatalogoInterno />
    </ProveedorConsultas>
  );
}
