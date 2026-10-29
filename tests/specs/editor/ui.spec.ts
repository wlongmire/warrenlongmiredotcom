import { test, expect } from '@playwright/test';
import { PASSWORD } from '../../support/env';
import { openEditor, openFile } from '../../support/editor';
import { orderJson, readCopy, resetContent, TINY_PNG } from '../../support/site';

const WORK = 'src/content/work/01-galvanize-hack-reactor.md';
const STEP = 'src/content/timeline/02-build.md';

test.beforeEach(() => resetContent());
test.afterAll(() => resetContent());

const media = (page: import('@playwright/test').Page) => page.locator('#mlist .mitem');
const srcOrder = (text: string) => [...text.matchAll(/^\s*(?:-\s+)?(?:src|url):\s*"?([^"\n]+?)"?\s*$/gm)].map((m) => m[1]);

test.describe('signing in', () => {
  test('shows a login box, refuses a wrong password, accepts the right one', async ({ page }) => {
    await page.goto('/edit');
    await expect(page.getByRole('heading', { name: 'Edit the site' })).toBeVisible();
    await expect(page.locator('#app')).toHaveCount(0);

    await page.getByLabel('Password').fill('wrong password');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page.locator('#login-status')).toContainText('not right');

    await page.getByLabel('Password').fill(PASSWORD);
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page.locator('#app')).toBeVisible();
  });

  test('sign out returns to the login box', async ({ page }) => {
    await openEditor(page);
    await page.getByRole('button', { name: 'Sign out' }).click();
    await expect(page.getByLabel('Password')).toBeVisible();
  });
});

test.describe('the editor', () => {
  test.beforeEach(({ page }) => openEditor(page));

  test('opens on the Home page intro and lists things in site order', async ({ page }) => {
    await expect(page.locator('.path')).toHaveText('src/content/pages/about.md');
    const order = orderJson();
    const opens = await page.locator('#side [data-open]').evaluateAll((els) => els.map((e) => (e as HTMLElement).dataset.open!));
    const ids = (kind: string) => opens.filter((p) => p.includes(`/${kind}/`)).map((p) => p.split('/').pop()!.replace('.md', ''));
    expect(ids('timeline')).toEqual(order.timeline);
    expect(ids('work')).toEqual(order.work);
    expect(opens[0]).toBe('src/content/pages/about.md');
  });

  test('shows one continuous file and an example template', async ({ page }) => {
    await openFile(page, WORK);
    await expect(page.locator('#doc')).toHaveValue(/^---\n[\s\S]*title:/);
    await page.getByText('Example text template').click();
    await expect(page.locator('#tpl')).toContainText('media:');
  });

  test('Save writes the file in the test copy and says so', async ({ page }) => {
    await openFile(page, WORK);
    const doc = page.locator('#doc');
    await doc.fill((await doc.inputValue()).replace(/^outcome:.*$/m, 'outcome: "Edited in the browser test."'));
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.locator('#msg')).toContainText('Saved');
    expect(readCopy(WORK)).toContain('Edited in the browser test.');
  });

  test('a problem is explained and nothing is saved', async ({ page }) => {
    await openFile(page, WORK);
    const doc = page.locator('#doc');
    await doc.fill((await doc.inputValue()).replace(/^title:.*\n/m, ''));
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.locator('#msg')).toContainText('"title" is required');
    expect(readCopy(WORK)).toContain('title:');
  });

  test('keeps unsaved edits when the page reloads', async ({ page }) => {
    await openFile(page, WORK);
    const doc = page.locator('#doc');
    const edited = (await doc.inputValue()).replace(/^outcome:.*$/m, 'outcome: "Unsaved words."');
    await doc.fill(edited);
    await page.reload();
    await expect(page.locator('#doc')).toHaveValue(edited);
    await expect(page.locator('#msg')).toContainText('restored');
  });

  test.describe('pictures and videos', () => {
    test.beforeEach(({ page }) => openFile(page, STEP));

    test('are listed with the first one previewed', async ({ page }) => {
      const doc = await page.locator('#doc').inputValue();
      expect(await media(page).count()).toBe((doc.match(/^\s*-\s+type:/gm) ?? []).length);
      await expect(page.locator('.mprev')).toBeVisible();
    });

    test('clicking an item previews it', async ({ page }) => {
      const items = media(page);
      await items.nth(1).locator('.mpick').click();
      await expect(items.nth(1)).toHaveClass(/sel/);
      await items.nth(0).locator('.mpick').click();
      await expect(items.nth(0)).toHaveClass(/sel/);
    });

    test('the arrow keys on a handle reorder the list and the file text', async ({ page }) => {
      const before = srcOrder(await page.locator('#doc').inputValue());
      await media(page).first().locator('.mgrip').focus();
      await page.keyboard.press('ArrowDown');
      await expect(page.locator('#pic-msg')).toContainText('Moved to position 2');
      const after = srcOrder(await page.locator('#doc').inputValue());
      expect(after.slice(0, 2)).toEqual([before[1], before[0]]);
      expect(after.slice(2)).toEqual(before.slice(2));
    });

    test('dragging a handle reorders the list', async ({ page }) => {
      const before = srcOrder(await page.locator('#doc').inputValue());
      await media(page).first().evaluate((el) => el.scrollIntoView({ block: 'center' }));
      const from = await media(page).first().locator('.mgrip').boundingBox();
      const to = await media(page).nth(1).boundingBox();
      await page.mouse.move(from!.x + from!.width / 2, from!.y + from!.height / 2);
      await page.mouse.down();
      await page.mouse.move(from!.x + 10, to!.y + to!.height + 6, { steps: 8 });
      await page.mouse.up();
      const after = srcOrder(await page.locator('#doc').inputValue());
      expect(after[0]).toBe(before[1]);
      expect(after[1]).toBe(before[0]);
    });

    test('reordering and saving keeps the file valid', async ({ page }) => {
      await media(page).first().locator('.mgrip').focus();
      await page.keyboard.press('ArrowDown');
      await page.getByRole('button', { name: 'Save' }).click();
      await expect(page.locator('#msg')).toContainText('Saved');
    });

    test('removing an item has an Undo', async ({ page }) => {
      const count = await media(page).count();
      const text = await page.locator('#doc').inputValue();
      await media(page).first().locator('.mx').click();
      await expect(media(page)).toHaveCount(count - 1);
      await page.getByRole('button', { name: 'Undo' }).click();
      await expect(media(page)).toHaveCount(count);
      await expect(page.locator('#doc')).toHaveValue(text);
    });

    test('the description and fit can be changed without touching the text', async ({ page }) => {
      await media(page).filter({ hasText: 'Picture' }).first().locator('.mpick').click();
      await page.getByLabel('Description').fill('A new description from the test');
      await page.getByLabel('How should it show?').selectOption('cover');
      const text = await page.locator('#doc').inputValue();
      expect(text).toContain('alt: "A new description from the test"');
      expect(text).toContain('fit: cover');
    });

    test('a YouTube video can be added, and a bad link is refused', async ({ page }) => {
      const count = await media(page).count();
      await page.getByLabel('Add a YouTube video to this step').fill('https://example.com/nope');
      await page.getByRole('button', { name: 'Add video' }).click();
      await expect(page.locator('#pic-msg')).toContainText('YouTube link');
      await expect(media(page)).toHaveCount(count);

      await page.getByLabel('Add a YouTube video to this step').fill('https://youtu.be/dQw4w9WgXcQ');
      await page.getByRole('button', { name: 'Add video' }).click();
      await expect(media(page)).toHaveCount(count + 1);
      await expect(media(page).last()).toContainText('Video');
      await page.getByRole('button', { name: 'Save' }).click();
      await expect(page.locator('#msg')).toContainText('Saved');
      expect(readCopy(STEP)).toContain('https://youtu.be/dQw4w9WgXcQ');
    });

    test('a photo can be added: the name becomes its description, and it fits by default', async ({ page }) => {
      const count = await media(page).count();
      await page.locator('#ap-file').setInputFiles({ name: 'Test Photo.png', mimeType: 'image/png', buffer: TINY_PNG });
      await page.getByRole('button', { name: 'Add Photo' }).click();
      await expect(media(page)).toHaveCount(count + 1);
      const text = await page.locator('#doc').inputValue();
      expect(text).toMatch(/src: "test-photo\.png"\n\s+alt: "test photo"\n\s+fit: contain/);
      // The dev server may reload the page when a new picture file appears; the unsaved text is restored.
      await page.waitForTimeout(2500);
      await expect(page.locator('#doc')).toHaveValue(text);
      await page.getByRole('button', { name: 'Save' }).click();
      await expect(page.locator('#msg')).toContainText('Saved');
    });

    test('adding a photo without choosing one asks for a file', async ({ page }) => {
      await page.getByRole('button', { name: 'Add Photo' }).click();
      await expect(page.locator('#pic-msg')).toContainText('Choose a picture');
    });
  });

  test('arrow keys move a case study in the left list and save the order', async ({ page }) => {
    const order = orderJson().work;
    const grip = page.locator('#side ul.sortable[data-kind="work"] li').first().locator('.grip');
    await grip.focus();
    await page.keyboard.press('ArrowDown');
    await expect.poll(() => JSON.parse(readCopy('src/data/order.json')).work.slice(0, 2), { timeout: 10_000 }).toEqual([order[1], order[0]]);
  });

  test('a new case study can be created', async ({ page }) => {
    page.on('dialog', (d) => d.accept('Test Project'));
    await page.getByRole('button', { name: '+ New case study' }).click();
    await expect(page.locator('#doc')).toHaveValue(/title: "Test Project"/);
  });

  test('the Home page intro has a simple headshot box', async ({ page }) => {
    await expect(page.locator('.path')).toHaveText('src/content/pages/about.md');
    await expect(page.locator('#ap-alt')).toHaveCount(0);
    await expect(page.locator('#ap-fit')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Upload and replace' })).toBeVisible();
  });

  test('the Home page intro points at the headshot by file name and still previews it', async ({ page }) => {
    await expect(page.locator('#doc')).toHaveValue(/^headshot: "headshot\.jpg"/m);
    const img = page.locator('#pics img').first();
    await expect(img).toBeVisible();
    await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBeGreaterThan(0);
  });

  test('the Resumes page shows each resume slot', async ({ page }) => {
    await page.locator('[data-resume]').click();
    await expect(page.locator('#main')).toContainText('Instructional Design');
  });
});
