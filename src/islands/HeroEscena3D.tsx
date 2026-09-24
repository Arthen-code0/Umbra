import { useEffect, useRef } from 'react';

function dispositivoAptoPara3D(): boolean {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  return (navigator.hardwareConcurrency ?? 4) > 2;
}

/**
 * Capa 3D del hero. Three.js se importa dinámicamente solo si el dispositivo
 * es apto: con movimiento reducido o poca potencia, el cielo SVG estático de
 * fondo es el hero y no se descarga la librería.
 */
export default function HeroEscena3D() {
  const contenedor = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const elemento = contenedor.current;
    if (!elemento || !dispositivoAptoPara3D()) return;

    let cancelado = false;
    let desmontar: (() => void) | undefined;

    import('../lib/escena3d').then(({ crearEscena }) => {
      if (cancelado) return;
      desmontar = crearEscena(elemento);
    });

    return () => {
      cancelado = true;
      desmontar?.();
    };
  }, []);

  return <div ref={contenedor} className="hero-3d" aria-hidden="true" />;
}
