import { useQuery } from '@tanstack/react-query';
import { obtenerCieloEstaNoche } from '../lib/api/cielo';
import { ErrorApi } from '../lib/api/tipos';
import { formatearFechaLegible } from '../lib/fecha';
import ProveedorConsultas from '../lib/ProveedorConsultas';
import EstadoError from '../components/EstadoError';
import Medidor from '../components/Medidor';
import Skeleton from '../components/Skeleton';

function PanelCieloInterno() {
  const consulta = useQuery({
    queryKey: ['cielo-esta-noche'],
    queryFn: () => obtenerCieloEstaNoche(),
  });

  if (consulta.isPending) {
    return (
      <div className="panel-cielo" aria-live="polite">
        <span className="visualmente-oculto">Cargando el cielo de esta noche…</span>
        <div className="panel-cielo__grid">
          {Array.from({ length: 3 }).map((_, indice) => (
            <div className="tarjeta panel-cielo__tarjeta" key={indice}>
              <Skeleton alto="1rem" />
              <Skeleton alto="6rem" className="margen-arriba" />
            </div>
          ))}
        </div>
        <div className="tarjeta margen-arriba">
          <Skeleton alto="1rem" />
          <Skeleton alto="1rem" className="margen-arriba" />
        </div>
      </div>
    );
  }

  if (consulta.isError) {
    return (
      <EstadoError
        titulo="No se han podido cargar los datos del cielo"
        detalle={
          consulta.error instanceof ErrorApi
            ? consulta.error.problema.detail
            : 'Ha ocurrido un error inesperado.'
        }
        onReintentar={() => consulta.refetch()}
      />
    );
  }

  const cielo = consulta.data;
  if (!cielo) return null;

  return (
    <div className="panel-cielo" aria-live="polite">
      <p className="panel-cielo__fecha">
        Datos para la noche del {formatearFechaLegible(cielo.fecha)}
      </p>

      <div className="panel-cielo__grid">
        <div className="tarjeta panel-cielo__tarjeta">
          <h2>Fase lunar</h2>
          <Medidor valor={cielo.faseLunar.porcentajeIluminacion} etiqueta="Iluminación lunar" />
          <p className="panel-cielo__etiqueta-tarjeta">{cielo.faseLunar.nombre}</p>
        </div>

        <div className="tarjeta panel-cielo__tarjeta">
          <h2>Visibilidad</h2>
          <Medidor valor={cielo.visibilidad.valor} etiqueta="Visibilidad" sufijo="/100" />
          <p className="panel-cielo__etiqueta-tarjeta">{cielo.visibilidad.texto}</p>
        </div>

        <div className="tarjeta panel-cielo__tarjeta panel-cielo__planetas">
          <h2>Planetas visibles</h2>
          <ul className="panel-cielo__lista-planetas">
            {cielo.planetasVisibles.map((planeta) => (
              <li key={planeta}>{planeta}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="tarjeta panel-cielo__eventos">
        <h2>Próximos eventos astronómicos</h2>
        {cielo.proximosEventos.length === 0 ? (
          <p>No hay eventos astronómicos destacados en los próximos 30 días.</p>
        ) : (
          <ul className="panel-cielo__lista-eventos">
            {cielo.proximosEventos.map((evento) => (
              <li key={`${evento.nombre}-${evento.fecha}`}>
                <span>{evento.nombre}</span>
                <time dateTime={evento.fecha}>{formatearFechaLegible(evento.fecha)}</time>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default function PanelCielo() {
  return (
    <ProveedorConsultas>
      <PanelCieloInterno />
    </ProveedorConsultas>
  );
}
