import { expect, test } from '@playwright/test';

test('muestra los datos del cielo de esta noche', async ({ page }) => {
  await page.goto('/el-cielo-esta-noche');
  await expect(page.getByRole('heading', { name: 'Fase lunar' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Planetas visibles' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Próximos eventos astronómicos' })).toBeVisible();
});

test('estado de error con reintentar', async ({ page }) => {
  await page.goto('/el-cielo-esta-noche?simular=error');
  await expect(page.getByRole('alert')).toContainText(
    'No se han podido cargar los datos del cielo',
  );
  await page.evaluate(() => history.replaceState({}, '', '/el-cielo-esta-noche'));
  await page.getByRole('button', { name: 'Reintentar' }).click();
  await expect(page.getByRole('heading', { name: 'Fase lunar' })).toBeVisible();
});
