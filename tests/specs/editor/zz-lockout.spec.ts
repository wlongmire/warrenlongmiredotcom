import { test, expect } from '@playwright/test';
import { WRITE_HEADERS } from '../../support/editor';
import { PASSWORD } from '../../support/env';

// Runs last. Uses its own made-up visitor address so it cannot lock out the other tests.
test('five wrong passwords lock further tries, even with the right password', async ({ request }) => {
  const headers = { ...WRITE_HEADERS, 'x-forwarded-for': '192.0.2.55' };
  for (let i = 0; i < 5; i++) expect((await request.post('/api/edit/login', { headers, data: { password: 'wrong-' + i } })).status()).toBe(401);
  const locked = await request.post('/api/edit/login', { headers, data: { password: PASSWORD } });
  expect(locked.status()).toBe(429);
  // someone else is not affected
  const other = await request.post('/api/edit/login', { headers: { ...WRITE_HEADERS, 'x-forwarded-for': '192.0.2.56' }, data: { password: PASSWORD } });
  expect(other.status()).toBe(200);
});
