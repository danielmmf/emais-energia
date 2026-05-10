const { test, expect } = require('@playwright/test');

test('producao: relatorio e PoC ArcGIS publicados', async ({ page }) => {
  const consoleErrors = [];
  const pageErrors = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  page.on('pageerror', (err) => {
    pageErrors.push(err.message);
  });

  await page.goto('/docs/report.html');
  await expect(page.getByRole('heading', { name: 'Dados reais da PID sao consumiveis.' })).toBeVisible();
  await expect(page.getByText('PoC isolada em Leaflet')).toBeVisible();

  await page.goto('/docs/pid-arcgis-poc.html');
  await expect(page.getByRole('heading', { name: 'Leaflet consumindo a camada publica de biometano da PID' })).toBeVisible();
  await expect(page.locator('#map')).toBeVisible();
  await expect(page.locator('#status')).toContainText('Camada publica carregada sem token.');
  await expect(page.locator('#count')).not.toHaveText('-');

  expect(pageErrors, 'page errors').toEqual([]);
  expect(
    consoleErrors.filter((entry) => !/Failed to load resource/i.test(entry)),
    'console errors'
  ).toEqual([]);
});
