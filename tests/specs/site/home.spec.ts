import { test, expect } from '../../support/fixtures';
import { orderJson } from '../../support/site';

const order = orderJson();

test.beforeEach(async ({ page, mail }) => {
  void mail; // switches the outside world off (see support/fixtures.ts)
  await page.goto('/');
});

test.describe('page basics', () => {
  test('loads with a headline, About me text and no browser errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errors.push(m.text()); });
    await page.reload();
    await expect(page.getByRole('heading', { level: 1 })).not.toBeEmpty();
    await expect(page.getByRole('heading', { name: 'About me' })).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('the headshot loads', async ({ page }) => {
    const img = page.locator('.hero-img img');
    await expect(img).toBeVisible();
    await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBeGreaterThan(0);
  });

  test('main navigation is in page order', async ({ page }) => {
    const links = page.getByRole('navigation', { name: 'Main' }).getByRole('link');
    await expect(links).toHaveText(['About Me', 'My Journey', 'Work', 'Resumes']);
  });

  test('clicking a nav link scrolls to that section and highlights it', async ({ page }) => {
    const nav = page.getByRole('navigation', { name: 'Main' });
    await nav.getByRole('link', { name: 'Work' }).click();
    await expect(page.locator('#work')).toBeInViewport();
    await expect(nav.getByRole('link', { name: 'Work' })).toHaveAttribute('aria-current', 'location');
    await nav.getByRole('link', { name: 'About Me' }).click();
    await expect(nav.getByRole('link', { name: 'About Me' })).toHaveAttribute('aria-current', 'location');
  });

  test('theme toggle switches between dark and light', async ({ page }) => {
    const toggle = page.locator('#theme');
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await toggle.click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  });

  test('the editor is hidden from search engines', async ({ page, request }) => {
    const robots = await request.get('/robots.txt');
    expect(await robots.text()).toContain('Disallow: /edit');
    await page.goto('/edit');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  });
});

test.describe('background stars', () => {
  test('are decoration: not links, and clicking one does not scroll', async ({ page }) => {
    await expect(page.locator('a.dot')).toHaveCount(0);
    const dot = page.locator('.dot').first();
    const before = await page.evaluate(() => [scrollY, location.hash]);
    await dot.click({ force: true });
    await page.waitForTimeout(400);
    expect(await page.evaluate(() => [scrollY, location.hash])).toEqual(before);
  });

  test('grow when rolled over', async ({ page }) => {
    const dot = page.locator('.dot').first();
    const scale = () => dot.evaluate((el) => getComputedStyle(el, '::after').transform);
    const rest = await scale();
    await dot.hover({ force: true });
    await expect.poll(scale).not.toBe(rest);
  });
});

test.describe('My Journey', () => {
  test('shows one moment at a time and steps with the buttons', async ({ page }) => {
    const tabs = page.getByRole('tab');
    await expect(tabs).toHaveCount(order.timeline.length);
    await expect(tabs.first()).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('.tl-step:visible')).toHaveCount(1);

    await page.getByRole('button', { name: 'Next moment' }).click();
    await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('.tl-step:visible')).toHaveCount(1);
    await page.getByRole('button', { name: 'Previous moment' }).click();
    await expect(tabs.first()).toHaveAttribute('aria-selected', 'true');
  });

  test('jumps to any moment from the pills', async ({ page }) => {
    const tabs = page.getByRole('tab');
    const last = tabs.nth(order.timeline.length - 1);
    await last.click();
    await expect(last).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('.tl-step:visible')).toHaveCount(1);
  });

  test('each moment has a period, a title and tags', async ({ page }) => {
    const step = page.locator('.tl-step:visible');
    await expect(step.locator('.tl-period')).not.toBeEmpty();
    await expect(step.getByRole('heading', { level: 3 })).not.toBeEmpty();
    await expect(step.getByRole('list', { name: 'Tags' }).getByRole('listitem').first()).toBeVisible();
  });

  test('a picture-and-video slideshow steps with its arrows', async ({ page }) => {
    // find a moment that has more than one slide
    const tabs = page.getByRole('tab');
    let found = false;
    for (let i = 0; i < order.timeline.length && !found; i++) {
      await tabs.nth(i).click();
      found = (await page.locator('.tl-step:visible .tl-snext').count()) > 0;
    }
    test.skip(!found, 'No journey step has more than one picture or video right now.');
    const step = page.locator('.tl-step:visible');
    const count = step.locator('.tl-scount');
    await expect(count).toHaveText(/^1 \/ \d+$/);
    await step.getByRole('button', { name: 'Next picture or video' }).click();
    await expect(count).toHaveText(/^2 \/ \d+$/);
    await step.getByRole('button', { name: 'Previous picture or video' }).click();
    await expect(count).toHaveText(/^1 \/ \d+$/);
  });
});

test.describe('Work History', () => {
  const cards = (page: import('@playwright/test').Page) => page.locator('.grid > li:visible');

  test('lists every case study from the content files', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Work History' })).toBeVisible();
    await expect(page.locator('.grid > li')).toHaveCount(order.work.length);
    await expect(page.locator('.grid > li .card-more')).toHaveCount(order.work.length);
  });

  test('filter chips narrow the list and All brings everything back', async ({ page }) => {
    const total = order.work.length;
    await page.getByRole('button', { name: 'Engineering', exact: true }).click();
    const shown = await cards(page).count();
    expect(shown).toBeGreaterThan(0);
    expect(shown).toBeLessThan(total);
    for (const tags of await cards(page).locator('.tags').allTextContents()) expect(tags).toContain('Engineering');
    await expect(page.locator('#filter-status')).toHaveText(`Showing ${shown} case ${shown === 1 ? 'study' : 'studies'}`);
    await expect(page.getByRole('button', { name: 'Engineering', exact: true })).toHaveAttribute('aria-pressed', 'true');

    await page.getByRole('button', { name: 'All', exact: true }).click();
    await expect(cards(page)).toHaveCount(total);
  });

  test('Design & UX filter exists and works', async ({ page }) => {
    await page.getByRole('button', { name: 'Design & UX' }).click();
    for (const tags of await cards(page).locator('.tags').allTextContents()) expect(tags).toContain('Design');
  });

  test('More info opens a popup that closes with the button, Escape or the backdrop', async ({ page }) => {
    const first = page.locator('.grid > li').first();
    const title = await first.getByRole('heading', { level: 3 }).textContent();
    const dialog = page.locator('#case-dialog');

    await first.getByRole('button', { name: 'More info' }).click();
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('#case-title')).toHaveText(title!.trim());
    await expect(page.locator('html')).toHaveCSS('overflow', 'hidden'); // page behind does not scroll

    await dialog.getByRole('button', { name: 'Close case study details' }).click();
    await expect(dialog).toBeHidden();

    await first.getByRole('button', { name: 'More info' }).click();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();

    await first.getByRole('button', { name: 'More info' }).click();
    await dialog.click({ position: { x: 2, y: 2 } });
    await expect(dialog).toBeHidden();
  });

  test('every popup opens without errors and has its title', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    const buttons = page.locator('.card-more');
    for (let i = 0; i < order.work.length; i++) {
      const title = await page.locator('.grid > li').nth(i).getByRole('heading', { level: 3 }).textContent();
      await buttons.nth(i).click();
      await expect(page.locator('#case-title')).toHaveText(title!.trim());
      await page.keyboard.press('Escape');
    }
    expect(errors).toEqual([]);
  });

  test('a popup with several pictures or videos has working arrows', async ({ page }) => {
    const buttons = page.locator('.card-more');
    let found = false;
    for (let i = 0; i < order.work.length && !found; i++) {
      await buttons.nth(i).click();
      found = (await page.locator('#case-dialog .cs-gnext').count()) > 0;
      if (!found) await page.keyboard.press('Escape');
    }
    test.skip(!found, 'No case study has more than one picture or video right now.');
    const count = page.locator('#case-dialog .cs-gcount');
    await expect(count).toHaveText(/^1 of \d+$/);
    await page.locator('#case-dialog').getByRole('button', { name: 'Next picture or video' }).click();
    await expect(count).toHaveText(/^2 of \d+$/);
    await page.locator('#case-dialog').getByRole('button', { name: 'Previous picture or video' }).click();
    await expect(count).toHaveText(/^1 of \d+$/);
  });
});

test.describe('Resumes', () => {
  test('each resume is a working download or says Coming soon', async ({ page, request }) => {
    const cards = page.locator('.rs-card');
    expect(await cards.count()).toBeGreaterThanOrEqual(4);
    for (const card of await cards.all()) {
      const link = card.getByRole('link', { name: 'Download PDF' });
      if (await link.count()) {
        const res = await request.get((await link.getAttribute('href'))!);
        expect(res.status()).toBe(200);
        expect(res.headers()['content-type']).toContain('pdf');
      } else {
        await expect(card.getByText('Coming soon')).toBeVisible();
      }
    }
  });

  test('includes a Design & UX resume', async ({ page }) => {
    await expect(page.locator('.rs-card h3', { hasText: /design/i })).not.toHaveCount(0);
  });
});

test.describe('Contact form', () => {
  const open = async (page: import('@playwright/test').Page) => {
    await page.getByRole('link', { name: 'Contact' }).click();
    await expect(page.locator('#contact-dialog')).toBeVisible();
  };
  const fill = async (page: import('@playwright/test').Page) => {
    await page.getByLabel('Name').fill('Test Person');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel("What's this about?").selectOption({ index: 1 });
    await page.getByLabel('Message').fill('Hello from the test suite.');
  };

  test('opens from the header and closes with Escape', async ({ page }) => {
    await open(page);
    await expect(page.getByLabel('Name')).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(page.locator('#contact-dialog')).toBeHidden();
  });

  test('asks for every field and for a valid email', async ({ page, mail }) => {
    await open(page);
    await page.getByRole('button', { name: 'Send' }).click();
    await expect(page.locator('.ct-status')).toHaveText('Please fill in every field.');
    await fill(page);
    await page.getByLabel('Email').fill('not-an-email');
    await page.getByRole('button', { name: 'Send' }).click();
    await expect(page.locator('.ct-status')).toHaveText('Please enter a valid email address.');
    expect(mail.sent).toHaveLength(0);
  });

  test('sends the message, shows a confirmation, and locks the form for a minute', async ({ page, mail }) => {
    await open(page);
    await fill(page);
    await page.getByRole('button', { name: 'Send' }).click();
    await expect(page.getByRole('heading', { name: 'Message sent' })).toBeVisible();
    await expect(page.locator('.ct-done-text')).toContainText('Thanks, Test Person');
    expect(mail.sent).toHaveLength(1);
    expect(mail.sent[0]).toMatchObject({ name: 'Test Person', email: 'test@example.com', message: 'Hello from the test suite.' });

    // closing and reopening shows the confirmation, not an empty form (no second message right away)
    await page.locator('.ct-done-close').click();
    await open(page);
    await expect(page.locator('.ct-done-text')).toHaveText('Your message was sent a moment ago.');
    expect(mail.sent).toHaveLength(1);
  });

  test('tells the visitor when sending fails, and keeps their message', async ({ page, mail }) => {
    mail.fail = true;
    await open(page);
    await fill(page);
    await page.getByRole('button', { name: 'Send' }).click();
    await expect(page.locator('.ct-status')).toContainText('That did not go through');
    await expect(page.getByLabel('Message')).toHaveValue('Hello from the test suite.');
  });

  test('a filled-in hidden spam field is accepted silently but nothing is sent', async ({ page, mail }) => {
    await open(page);
    await fill(page);
    await page.locator('input[name="company"]').evaluate((el: HTMLInputElement) => { el.value = 'spam'; });
    await page.getByRole('button', { name: 'Send' }).click();
    await expect(page.getByRole('heading', { name: 'Message sent' })).toBeVisible();
    expect(mail.sent).toHaveLength(0);
  });
});
