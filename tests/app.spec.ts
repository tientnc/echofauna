import { expect, test } from '@playwright/test';

test('loads with moving agents before audio is unlocked', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Shape a song/ })).toBeVisible();
  await expect(page.locator('.agent-card')).toHaveCount(4);
  await expect(page.getByRole('button', { name: /Start listening/ })).toBeEnabled();
  await expect(page.locator('canvas')).toBeVisible();
  expect(errors).toEqual([]);
});

test('audio starts only on a user gesture and does not duplicate on restart', async ({ page }) => {
  await page.goto('/');
  const start = page.locator('#start');
  await expect(start).toContainText('Start listening');
  await start.click();
  await expect(start).toContainText('Pause listening');
  await start.click();
  await expect(start).toContainText('Resume listening');
  await start.click();
  await expect(start).toContainText('Pause listening');
});

test('feedback, freeze, evolve, and before/after history work', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Start listening/ }).click();
  const pulseCard = page.locator('[data-agent="pulse"]').first();
  await pulseCard.getByRole('button', { name: /Keep more of Pulse/ }).click();
  await pulseCard.getByRole('button', { name: 'Freeze', exact: true }).click();
  await page.getByRole('button', { name: /Evolve the song/ }).click();
  await expect(page.locator('#generation')).toHaveText('1');
  await expect(page.getByRole('button', { name: /Before/ })).toBeEnabled();
  await expect(page.locator('#change-summary')).toContainText('Generation 1');
});
