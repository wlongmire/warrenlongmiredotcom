import { test as base, expect } from '@playwright/test';

/**
 * Every site test runs with the outside world switched off:
 *  - the contact form's service (Formspree) is replaced by a stand-in, so no real email is ever sent
 *  - every other outside address (fonts, YouTube thumbnails) is blocked, so tests are fast and repeatable
 * `mail.sent` lists what the form tried to send; set `mail.fail = true` to simulate the service being down.
 */
type Mail = { sent: Record<string, unknown>[]; fail: boolean };

export const test = base.extend<{ mail: Mail }>({
  mail: async ({ page }, use) => {
    const mail: Mail = { sent: [], fail: false };
    await page.route((url) => !['localhost', '127.0.0.1'].includes(url.hostname), async (route) => {
      const req = route.request();
      if (/formspree\.io/.test(req.url())) {
        if (req.method() === 'POST') mail.sent.push(req.postDataJSON());
        return route.fulfill({ status: mail.fail ? 500 : 200, contentType: 'application/json', body: '{"ok":true}' });
      }
      return route.abort();
    });
    await use(mail);
  },
});
export { expect };
