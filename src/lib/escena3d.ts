import {
  BufferGeometry,
  CanvasTexture,
  Float32BufferAttribute,
  Group,
  LineBasicMaterial,
  LineSegments,
  MathUtils,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Scene,
  WebGLRenderer,
} from 'three';

/** Sprite circular para que las estrellas no se vean como cuadrados. */
function crearSpriteRedondo(): CanvasTexture {
  const lienzo = document.createElement('canvas');
  lienzo.width = lienzo.height = 64;
  const ctx = lienzo.getContext('2d')!;
  const brillo = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  brillo.addColorStop(0, 'rgba(255,255,255,1)');
  brillo.addColorStop(0.35, 'rgba(255,255,255,0.9)');
  brillo.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = brillo;
  ctx.fillRect(0, 0, 64, 64);
  return new CanvasTexture(lienzo);
}

const COLOR_ESTRELLA = 0xf1eee6;
const COLOR_CONSTELACION = 0xf0b374;

/** Puntos (x, y) de la constelación de Umbra y los pares que se unen con una línea. */
const NODOS: [number, number][] = [
  [-3.2, 1.6],
  [-1.9, 2.4],
  [-0.6, 1.5],
  [0.9, 2.6],
  [2.2, 1.7],
  [0.6, 0.2],
  [-0.7, -0.9],
];
const ENLACES: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [3, 5],
  [5, 6],
  [2, 6],
];

function crearCampoDeEstrellas(cantidad: number, sprite: CanvasTexture): Points {
  const posiciones = new Float32Array(cantidad * 3);
  for (let i = 0; i < cantidad; i++) {
    const radio = 25 + Math.random() * 45;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    posiciones[i * 3] = radio * Math.sin(phi) * Math.cos(theta);
    posiciones[i * 3 + 1] = radio * Math.sin(phi) * Math.sin(theta);
    posiciones[i * 3 + 2] = radio * Math.cos(phi);
  }
  const geometria = new BufferGeometry();
  geometria.setAttribute('position', new Float32BufferAttribute(posiciones, 3));
  const material = new PointsMaterial({
    color: COLOR_ESTRELLA,
    size: 0.5,
    map: sprite,
    sizeAttenuation: true,
    transparent: true,
    depthWrite: false,
    opacity: 0.9,
  });
  return new Points(geometria, material);
}

function crearConstelacion(sprite: CanvasTexture): Group {
  const grupo = new Group();
  const posiciones = NODOS.flatMap(([x, y]) => [x, y, 0]);

  const geometriaNodos = new BufferGeometry();
  geometriaNodos.setAttribute('position', new Float32BufferAttribute(posiciones, 3));
  grupo.add(
    new Points(
      geometriaNodos,
      new PointsMaterial({
        color: COLOR_CONSTELACION,
        size: 0.7,
        map: sprite,
        sizeAttenuation: true,
        transparent: true,
        depthWrite: false,
      }),
    ),
  );

  const segmentos = ENLACES.flatMap(([a, b]) => [
    NODOS[a][0],
    NODOS[a][1],
    0,
    NODOS[b][0],
    NODOS[b][1],
    0,
  ]);
  const geometriaLineas = new BufferGeometry();
  geometriaLineas.setAttribute('position', new Float32BufferAttribute(segmentos, 3));
  grupo.add(
    new LineSegments(
      geometriaLineas,
      new LineBasicMaterial({ color: COLOR_CONSTELACION, transparent: true, opacity: 0.55 }),
    ),
  );

  grupo.position.set(3.2, 0.4, -9);
  return grupo;
}

/**
 * Monta la escena en el contenedor y devuelve la función que la desmonta.
 * Reacciona al ratón (solo con puntero fino) y al scroll, se pausa fuera de
 * pantalla y limita el pixel ratio a 2.
 */
export function crearEscena(contenedor: HTMLElement): () => void {
  const esMovil = window.innerWidth < 768;
  const punteroFino = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  let renderizador: WebGLRenderer;
  try {
    renderizador = new WebGLRenderer({ alpha: true, antialias: !esMovil });
  } catch {
    return () => undefined;
  }
  renderizador.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  contenedor.appendChild(renderizador.domElement);

  const escena = new Scene();
  const camara = new PerspectiveCamera(60, 1, 0.1, 200);
  camara.position.z = 6;

  const mundo = new Group();
  const sprite = crearSpriteRedondo();
  const estrellas = crearCampoDeEstrellas(esMovil ? 600 : 1600, sprite);
  const constelacion = crearConstelacion(sprite);
  mundo.add(estrellas, constelacion);
  escena.add(mundo);

  const raton = { x: 0, y: 0 };
  const objetivo = { x: 0, y: 0 };

  function ajustarTamano() {
    const { clientWidth: ancho, clientHeight: alto } = contenedor;
    if (ancho === 0 || alto === 0) return;
    renderizador.setSize(ancho, alto, false);
    camara.aspect = ancho / alto;
    camara.updateProjectionMatrix();
  }

  function alMoverRaton(evento: PointerEvent) {
    objetivo.x = (evento.clientX / window.innerWidth - 0.5) * 2;
    objetivo.y = (evento.clientY / window.innerHeight - 0.5) * 2;
  }

  let visible = true;
  let idAnimacion = 0;
  let primerFotograma = true;

  function fotograma() {
    idAnimacion = 0;
    if (!visible || document.hidden) return;

    raton.x = MathUtils.lerp(raton.x, objetivo.x, 0.05);
    raton.y = MathUtils.lerp(raton.y, objetivo.y, 0.05);

    const progresoScroll = Math.min(window.scrollY / window.innerHeight, 1);
    mundo.rotation.y = raton.x * 0.18 + performance.now() * 0.000006;
    mundo.rotation.x = raton.y * 0.1;
    mundo.rotation.z = progresoScroll * 0.25;
    camara.position.z = 6 - progresoScroll * 2.5;

    renderizador.render(escena, camara);
    if (primerFotograma) {
      primerFotograma = false;
      contenedor.classList.add('is-lista');
    }
    idAnimacion = requestAnimationFrame(fotograma);
  }

  function arrancar() {
    if (idAnimacion === 0) idAnimacion = requestAnimationFrame(fotograma);
  }

  const observadorVisibilidad = new IntersectionObserver(([entrada]) => {
    visible = entrada.isIntersecting;
    if (visible) arrancar();
  });
  observadorVisibilidad.observe(contenedor);

  const observadorTamano = new ResizeObserver(ajustarTamano);
  observadorTamano.observe(contenedor);

  if (punteroFino) window.addEventListener('pointermove', alMoverRaton, { passive: true });
  document.addEventListener('visibilitychange', arrancar);

  ajustarTamano();
  arrancar();

  return () => {
    visible = false;
    cancelAnimationFrame(idAnimacion);
    observadorVisibilidad.disconnect();
    observadorTamano.disconnect();
    window.removeEventListener('pointermove', alMoverRaton);
    document.removeEventListener('visibilitychange', arrancar);
    mundo.traverse((objeto) => {
      if (objeto instanceof Points || objeto instanceof LineSegments) {
        objeto.geometry.dispose();
        (objeto.material as PointsMaterial | LineBasicMaterial).dispose();
      }
    });
    sprite.dispose();
    renderizador.dispose();
    renderizador.domElement.remove();
    contenedor.classList.remove('is-lista');
  };
}
