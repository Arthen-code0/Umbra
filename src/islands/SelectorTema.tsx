import { useEffect, useState } from 'react';

const CLAVE_ALMACENAMIENTO = 'umbra-tema';

type Tema = 'claro' | 'oscuro';

function obtenerTemaDelSistema(): Tema {
  if (typeof window === 'undefined') return 'oscuro';
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'claro' : 'oscuro';
}

function obtenerTemaActual(): Tema {
  const guardado = document.documentElement.getAttribute('data-theme');
  if (guardado === 'light') return 'claro';
  if (guardado === 'dark') return 'oscuro';
  return obtenerTemaDelSistema();
}

function aplicarTema(tema: Tema) {
  document.documentElement.setAttribute('data-theme', tema === 'claro' ? 'light' : 'dark');
  try {
    window.localStorage.setItem(CLAVE_ALMACENAMIENTO, tema === 'claro' ? 'light' : 'dark');
  } catch {
    // almacenamiento no disponible (navegación privada); el tema no persiste, pero sigue funcionando
  }
}

/**
 * Selector de tema claro/oscuro. El estado inicial ya lo fija el script inline
 * de LayoutBase.astro (para evitar parpadeo); este componente solo refleja y
 * cambia ese estado tras la hidratación.
 */
export default function SelectorTema() {
  const [tema, setTema] = useState<Tema>('oscuro');
  const [montado, setMontado] = useState(false);

  useEffect(() => {
    // Lectura única del atributo que ya fijó el script inline de LayoutBase
    // antes del primer pintado (no es una suscripción ni una petición de datos).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTema(obtenerTemaActual());
    setMontado(true);
  }, []);

  function alternar() {
    const nuevo: Tema = tema === 'claro' ? 'oscuro' : 'claro';
    setTema(nuevo);
    aplicarTema(nuevo);
  }

  return (
    <button
      type="button"
      className="selector-tema"
      onClick={alternar}
      aria-label={
        montado ? `Cambiar a modo ${tema === 'claro' ? 'oscuro' : 'claro'}` : 'Cambiar tema'
      }
      title={montado ? `Modo ${tema}` : undefined}
    >
      {tema === 'claro' ? <IconoSol /> : <IconoLuna />}
    </button>
  );
}

function IconoSol() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="4.5" fill="currentColor" />
      <g stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M12 2.5v2.4M12 19.1v2.4M4.2 4.2l1.7 1.7M18.1 18.1l1.7 1.7M2.5 12h2.4M19.1 12h2.4M4.2 19.8l1.7-1.7M18.1 5.9l1.7-1.7" />
      </g>
    </svg>
  );
}

function IconoLuna() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
      <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.8 6.8 0 0 0 10.5 10.5Z" fill="currentColor" />
    </svg>
  );
}
