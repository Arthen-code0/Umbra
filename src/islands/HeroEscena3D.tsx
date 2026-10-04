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
    let tarea = 0;
    let iniciada = false;
    const eventos = ['pointerdown', 'touchstart', 'scroll', 'keydown'] as const;

    // La escena es una mejora, no contenido: arranca cuando el navegador
    // tras la carga y un pequeño retardo, para no competir con el primer pintado.
    const iniciar = () => {
      if (iniciada) return;
      iniciada = true;
      eventos.forEach((e) => window.removeEventListener(e, iniciar));
      import('../lib/escena3d').then(({ crearEscena }) => {
        if (!cancelado) desmontar = crearEscena(elemento);
      });
    };
    const programar = () => {
      if (window.innerWidth >= 768) {
        tarea = window.setTimeout(iniciar, 900);
        return;
      }
      // En móvil la escena espera a la primera interacción (o 4 s) para no
      // competir con la carga en dispositivos con menos CPU.
      eventos.forEach((e) => window.addEventListener(e, iniciar, { once: true, passive: true }));
      tarea = window.setTimeout(iniciar, 4000);
    };
    if (document.readyState === 'complete') programar();
    else window.addEventListener('load', programar, { once: true });

    return () => {
      cancelado = true;
      window.removeEventListener('load', programar);
      window.clearTimeout(tarea);
      eventos.forEach((e) => window.removeEventListener(e, iniciar));
      desmontar?.();
    };
  }, []);

  return <div ref={contenedor} className="hero-3d" aria-hidden="true" />;
}
