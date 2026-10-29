import { expect, type APIRequestContext, type Page } from '@playwright/test';
import { BASE_URL, PASSWORD } from './env';

export const WRITE_HEADERS = { 'x-edit': '1', origin: BASE_URL };

/** Signs in through the login API (the cookie stays on the request context / browser context). */
export async function signIn(request: APIRequestContext) {
  const res = await request.post('/api/edit/login', { headers: WRITE_HEADERS, data: { password: PASSWORD } });
  expect(res.status()).toBe(200);
}

export async function openEditor(page: Page) {
  await signIn(page.request);
  await page.goto('/edit');
  await expect(page.locator('#app')).toBeVisible();
  // the editor opens on the Home page intro by itself
  await expect(page.locator('#doc')).toBeVisible();
}

/** Opens one file by its path from the left-hand list. */
export async function openFile(page: Page, path: string) {
  await page.locator(`[data-open="${path}"]`).click();
  await expect(page.locator('#doc')).toBeVisible();
  await expect(page.locator('.path')).toHaveText(path);
}
