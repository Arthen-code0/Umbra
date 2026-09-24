import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const PAGINAS: { nombre: string; ruta: string; esperar: string }[] = [
  { nombre: 'Inicio', ruta: '/', esperar: 'h1' },
  { nombre: 'Experiencias', ruta: '/experiencias', esperar: 'article h3' },
  { nombre: 'Detalle', ruta: '/experiencias/caza-de-la-via-lactea', esperar: 'h1' },
  { nombre: 'Reservar', ruta: '/reservar', esperar: 'text=1. Elige una experiencia' },
  { nombre: 'Cielo', ruta: '/el-cielo-esta-noche', esperar: 'text=Fase lunar' },
  { nombre: 'Diario', ruta: '/diario', esperar: 'article h2' },
  { nombre: 'Artículo', ruta: '/diario/que-ver-en-el-cielo-de-otono', esperar: '.prosa h2' },
  { nombre: '404', ruta: '/no-existe', esperar: 'h1' },
];

for (const tema of ['light', 'dark'] as const) {
  for (const pagina of PAGINAS) {
    test(`axe: ${pagina.nombre} (${tema}) sin violaciones serias`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: tema, reducedMotion: 'reduce' });
      await page.goto(pagina.ruta);
      await page.locator(pagina.esperar).first().waitFor();
      const resultado = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();
      const graves = resultado.violations.filter((v) =>
        ['serious', 'critical'].includes(v.impact ?? ''),
      );
      expect(
        graves.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`),
      ).toEqual([]);
    });
  }
}
