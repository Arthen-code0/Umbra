/**
 * Scroll narrativo de Inicio ("del atardecer a la noche cerrada").
 *
 * GSAP y ScrollTrigger se importan dinámicamente y solo se activan con
 * pantalla ancha y sin `prefers-reduced-motion`. En cualquier otro caso las
 * cuatro fases quedan como secciones apiladas, con su propio fondo, legibles
 * sin animación ni JavaScript.
 */
export async function iniciarNarrativa(): Promise<() => void> {
  const raiz = document.querySelector<HTMLElement>('[data-narrativa]');
  if (!raiz) return () => undefined;

  const [{ gsap }, { ScrollTrigger }] = await Promise.all([
    import('gsap'),
    import('gsap/ScrollTrigger'),
  ]);
  gsap.registerPlugin(ScrollTrigger);

  const mm = gsap.matchMedia();
  mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
    const escenario = raiz.querySelector<HTMLElement>('.narrativa__escenario');
    const fases = gsap.utils.toArray<HTMLElement>('[data-fase]', raiz);
    const fondos = gsap.utils.toArray<HTMLElement>('.narrativa__fondo', raiz);
    const barra = raiz.querySelector<HTMLElement>('.narrativa__progreso span');
    if (!escenario || fases.length < 2) return;

    raiz.classList.add('narrativa--animada');
    gsap.set(fases, { autoAlpha: 0 });
    gsap.set(fases[0], { autoAlpha: 1 });
    gsap.set(fondos.slice(1), { autoAlpha: 0 });

    const linea = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: raiz,
        start: 'top top',
        end: `+=${(fases.length - 1) * 110}%`,
        pin: escenario,
        scrub: 0.6,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });

    for (let i = 1; i < fases.length; i++) {
      const etiqueta = `fase${i}`;
      linea
        .addLabel(etiqueta, '+=0.6')
        .to(fases[i - 1], { autoAlpha: 0, y: -40, duration: 0.6 }, etiqueta)
        .to(fondos[i], { autoAlpha: 1, duration: 1 }, etiqueta)
        .fromTo(
          fases[i],
          { autoAlpha: 0, y: 40 },
          { autoAlpha: 1, y: 0, duration: 0.6 },
          `${etiqueta}+=0.4`,
        );
    }
    linea.to({}, { duration: 0.6 });
    if (barra) linea.fromTo(barra, { scaleX: 0 }, { scaleX: 1, duration: linea.duration() }, 0);

    return () => raiz.classList.remove('narrativa--animada');
  });

  return () => mm.revert();
}
