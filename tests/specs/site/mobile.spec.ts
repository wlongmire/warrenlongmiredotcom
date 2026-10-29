import { test, expect } from '../../support/fixtures';

test.beforeEach(async ({ page, mail }) => { void mail; await page.goto('/'); });

test('the page does not scroll sideways on a phone', async ({ page }) => {
  const { scrollWidth, innerWidth } = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, innerWidth }));
  expect(scrollWidth).toBeLessThanOrEqual(innerWidth);
});

test('the headline, About me and navigation are all there', async ({ page }) => {
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Main' }).getByRole('link')).toHaveCount(4);
  await expect(page.getByRole('heading', { name: 'About me' })).toBeVisible();
});

test('the decorative stars are hidden on phones', async ({ page }) => {
  await expect(page.locator('.dots')).toBeHidden();
});

test('a case study popup fits the screen and closes', async ({ page }) => {
  await page.locator('.card-more').first().scrollIntoViewIfNeeded();
  await page.locator('.card-more').first().click();
  const dialog = page.locator('#case-dialog');
  await expect(dialog).toBeVisible();
  const box = await dialog.boundingBox();
  const vw = page.viewportSize()!.width;
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(vw);
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
});
