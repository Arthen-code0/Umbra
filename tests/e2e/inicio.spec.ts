import { expect, test } from '@playwright/test';

test('con movimiento reducido no se carga la escena 3D ni se fija la narrativa', async ({
  browser,
}) => {
  const contexto = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await contexto.newPage();
  const peticiones: string[] = [];
  page.on('request', (r) => peticiones.push(r.url()));

  await page.goto('/');
  await page.waitForTimeout(1500);

  await expect(page.locator('.hero-3d canvas')).toHaveCount(0);
  await expect(page.locator('[data-narrativa]')).not.toHaveClass(/narrativa--animada/);
  await expect(page.getByText('La luz se marcha despacio')).toBeVisible();
  await expect(page.getByText('Ahora sí, el telescopio')).toBeVisible();
  expect(peticiones.some((url) => /\/escena3d\.[\w-]+\.js/.test(url))).toBe(false);
  await contexto.close();
});

test('sin JavaScript el contenido de la portada se lee entero', async ({ browser }) => {
  const contexto = await browser.newContext({ javaScriptEnabled: false });
  const page = await contexto.newPage();
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/cielo todavía se ve entero/);
  await expect(page.getByText('La luz se marcha despacio')).toBeVisible();
  await expect(page.getByText('Tres formas de pasar la noche')).toBeVisible();
  await contexto.close();
});

test('con movimiento normal en escritorio se activa la narrativa fijada', async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, 'La narrativa fijada solo se activa en pantallas anchas');
  await page.goto('/');
  await expect(page.locator('[data-narrativa]')).toHaveClass(/narrativa--animada/, {
    timeout: 8000,
  });
});
