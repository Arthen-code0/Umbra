import type { Experiencia } from '../lib/api/tipos';
import IlustracionExperiencia from './IlustracionExperiencia';

const ETIQUETAS_TIPO: Record<Experiencia['tipo'], string> = {
  observacion: 'Observación',
  astrofotografia: 'Astrofotografía',
  familiar: 'Familiar',
};

interface Props {
  experiencia: Experiencia;
  indice?: number;
}

export default function TarjetaExperiencia({ experiencia, indice = 0 }: Props) {
  return (
    <article className="tarjeta tarjeta-experiencia">
      <a href={`/experiencias/${experiencia.id}`} className="tarjeta-experiencia__enlace-imagen">
        <IlustracionExperiencia
          tipo={experiencia.tipo}
          semilla={indice + 1}
          titulo={experiencia.nombre}
        />
      </a>
      <div className="tarjeta-experiencia__cuerpo">
        <span className="etiqueta">{ETIQUETAS_TIPO[experiencia.tipo]}</span>
        <h3>
          <a href={`/experiencias/${experiencia.id}`}>{experiencia.nombre}</a>
        </h3>
        <p>{experiencia.resumen}</p>
        <dl className="tarjeta-experiencia__datos">
          <div>
            <dt>Duración</dt>
            <dd>
              {experiencia.duracionHoras % 1 === 0
                ? experiencia.duracionHoras
                : experiencia.duracionHoras.toFixed(1)}{' '}
              h
            </dd>
          </div>
          <div>
            <dt>Precio</dt>
            <dd>{experiencia.precio} € /persona</dd>
          </div>
          <div>
            <dt>Apta para niños</dt>
            <dd>{experiencia.aptaNinos ? `Sí, desde ${experiencia.edadMinima} años` : 'No'}</dd>
          </div>
        </dl>
        <a href={`/experiencias/${experiencia.id}`} className="boton boton--secundario">
          Ver detalle
        </a>
      </div>
    </article>
  );
}
