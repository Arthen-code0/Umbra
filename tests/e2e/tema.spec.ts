import { expect, test } from '@playwright/test';

test('respeta el sistema y recuerda la elección manual', async ({ page, isMobile }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/experiencias');
  await expect(page.locator('html')).not.toHaveAttribute('data-theme', /.+/);

  if (isMobile) await page.getByRole('button', { name: 'Abrir menú' }).click();
  await page.getByRole('button', { name: /Cambiar a modo oscuro/ }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});
