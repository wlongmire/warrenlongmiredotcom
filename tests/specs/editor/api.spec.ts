import { test, expect } from '@playwright/test';
import { BASE_URL, PASSWORD } from '../../support/env';
import { signIn, WRITE_HEADERS } from '../../support/editor';
import { existsInCopy, orderJson, readCopy, readRoot, resetContent, TINY_PNG } from '../../support/site';

const WORK = 'src/content/work/04-pennlincs.md';
const fileUrl = (p: string) => `/api/edit/file?path=${encodeURIComponent(p)}`;

test.beforeEach(() => resetContent());
test.afterAll(() => resetContent());

test.describe('locked out without signing in', () => {
  for (const [method, url] of [['get', '/api/edit/files'], ['get', fileUrl(WORK)], ['get', '/api/edit/image?path=src/assets/headshot.jpg']] as const) {
    test(`${method.toUpperCase()} ${url.split('?')[0]} needs a sign-in`, async ({ request }) => {
      expect((await request[method](url)).status()).toBe(401);
    });
  }
  test('saving, uploading and ordering need a sign-in', async ({ request }) => {
    expect((await request.put('/api/edit/file', { headers: WRITE_HEADERS, data: { path: WORK, text: 'x', sha: 'x' } })).status()).toBe(401);
    expect((await request.put('/api/edit/order', { headers: WRITE_HEADERS, data: { kind: 'work', ids: [] } })).status()).toBe(401);
    expect((await request.post('/api/edit/upload', { headers: WRITE_HEADERS, multipart: { target: 'work-image', file: { name: 'a.png', mimeType: 'image/png', buffer: TINY_PNG } } })).status()).toBe(401);
  });
});

test.describe('signing in', () => {
  test('a wrong password is refused', async ({ request }) => {
    const res = await request.post('/api/edit/login', { headers: { ...WRITE_HEADERS, 'x-forwarded-for': '198.51.100.7' }, data: { password: 'not-it' } });
    expect(res.status()).toBe(401);
    expect((await request.get('/api/edit/files')).status()).toBe(401);
  });

  test('a login coming from another website is blocked', async ({ request }) => {
    const res = await request.post('/api/edit/login', { headers: { 'x-edit': '1', origin: 'https://evil.example' }, data: { password: PASSWORD } });
    expect(res.status()).toBe(403);
  });

  test('the right password signs in, and signing out locks it again', async ({ request }) => {
    await signIn(request);
    expect((await request.get('/api/edit/files')).status()).toBe(200);
    await request.post('/api/edit/logout', { headers: WRITE_HEADERS });
    expect((await request.get('/api/edit/files')).status()).toBe(401);
  });
});

test.describe('signed in', () => {
  test.beforeEach(({ request }) => signIn(request));

  test('lists the files in site order', async ({ request }) => {
    const data = await (await request.get('/api/edit/files')).json();
    const order = orderJson();
    expect(data.work.map((f: any) => f.name.replace(/\.md$/, ''))).toEqual(order.work);
    expect(data.timeline.map((f: any) => f.name.replace(/\.md$/, ''))).toEqual(order.timeline);
  });

  test('only content files can be opened', async ({ request }) => {
    for (const bad of ['src/pages/index.astro', 'package.json', '../package.json', 'src/content/work/../../../package.json', '.env', 'src/lib/editor/auth.ts']) {
      expect((await request.get(fileUrl(bad))).status(), bad).toBe(400);
    }
  });

  test('changes without the editor header or from another origin are blocked', async ({ request }) => {
    const doc = await (await request.get(fileUrl(WORK))).json();
    const body = { path: WORK, text: doc.text, sha: doc.sha };
    expect((await request.put('/api/edit/file', { data: body })).status()).toBe(403);
    expect((await request.put('/api/edit/file', { headers: { 'x-edit': '1', origin: 'https://evil.example' }, data: body })).status()).toBe(403);
  });

  test('saving writes the file; an out-of-date copy is refused', async ({ request }) => {
    const doc = await (await request.get(fileUrl(WORK))).json();
    const text = doc.text.replace(/^outcome:.*$/m, 'outcome: "Changed by the test suite."');
    const ok = await request.put('/api/edit/file', { headers: WRITE_HEADERS, data: { path: WORK, text, sha: doc.sha } });
    expect(ok.status()).toBe(200);
    expect(readCopy(WORK)).toContain('Changed by the test suite.');
    expect(readRoot(WORK)).not.toContain('Changed by the test suite.'); // the real project is untouched

    const stale = await request.put('/api/edit/file', { headers: WRITE_HEADERS, data: { path: WORK, text, sha: doc.sha } });
    expect(stale.status()).toBe(409);
  });

  test.describe('checks before saving', () => {
    const save = async (request: import('@playwright/test').APIRequestContext, edit: (t: string) => string) => {
      const doc = await (await request.get(fileUrl(WORK))).json();
      const res = await request.put('/api/edit/file', { headers: WRITE_HEADERS, data: { path: WORK, text: edit(doc.text), sha: doc.sha } });
      return { status: res.status(), body: await res.json() };
    };
    const media = (items: string) => (t: string) => t.replace(/^---\n/, `---\nmedia:\n${items}\n`);

    test('a missing required field', async ({ request }) => {
      const r = await save(request, (t) => t.replace(/^title:.*\n/m, ''));
      expect(r.status).toBe(422);
      expect(r.body.problems.join(' ')).toContain('"title" is required');
    });
    test('broken text at the top', async ({ request }) => {
      expect((await save(request, (t) => t.replace(/^---\n/, '---\ntitle: "unclosed\n'))).status).toBe(422);
    });
    test('an unknown track', async ({ request }) => {
      expect((await save(request, (t) => t.replace(/^tracks:.*$/m, 'tracks: [made-up]'))).status).toBe(422);
    });
    test('a script tag in the text', async ({ request }) => {
      expect((await save(request, (t) => t + '\n<script>alert(1)</script>\n')).status).toBe(422);
    });
    test('a video that is not a YouTube link', async ({ request }) => {
      const r = await save(request, media('  - type: video\n    url: "https://example.com/video"'));
      expect(r.status).toBe(422);
      expect(r.body.problems.join(' ')).toContain('YouTube');
    });
    test('a picture that was never uploaded', async ({ request }) => {
      const r = await save(request, media('  - type: image\n    src: "nope.jpg"\n    alt: "x"'));
      expect(r.status).toBe(422);
      expect(r.body.problems.join(' ')).toContain('has not been uploaded');
    });
    test('an unknown media type', async ({ request }) => {
      expect((await save(request, media('  - type: audio\n    url: "x"'))).status).toBe(422);
    });
    test('a good YouTube video and a picture written as just a file name', async ({ request }) => {
      const up = await request.post('/api/edit/upload', { headers: WRITE_HEADERS, multipart: { target: 'work-image', file: { name: 'check.png', mimeType: 'image/png', buffer: TINY_PNG } } });
      expect(up.status()).toBe(200);
      const r = await save(request, media('  - type: video\n    url: "https://youtu.be/dQw4w9WgXcQ"\n  - type: image\n    src: "check.png"\n    alt: "A check"'));
      expect(r.status).toBe(200);
    });
  });

  test.describe('uploads', () => {
    const upload = (request: import('@playwright/test').APIRequestContext, target: string, name: string, mimeType: string, buffer: Buffer) =>
      request.post('/api/edit/upload', { headers: WRITE_HEADERS, multipart: { target, file: { name, mimeType, buffer } } });

    test('a real picture is stored in the right folder with a clean name', async ({ request }) => {
      const res = await upload(request, 'work-image', 'My Photo (1).PNG', 'image/png', TINY_PNG);
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.path).toBe('src/assets/work/my-photo-1.png');
      expect(existsInCopy(body.path)).toBe(true);
      const tl = await (await upload(request, 'timeline-image', 'step.png', 'image/png', TINY_PNG)).json();
      expect(tl.path).toBe('src/assets/timeline/step.png');
    });
    test('a file pretending to be a picture is refused', async ({ request }) => {
      expect((await upload(request, 'work-image', 'fake.png', 'image/png', Buffer.from('this is not a picture'))).status()).toBe(400);
    });
    test('a wrong file type is refused', async ({ request }) => {
      expect((await upload(request, 'work-image', 'script.js', 'text/javascript', Buffer.from('alert(1)'))).status()).toBe(400);
    });
    test('a file over 4 MB is refused', async ({ request }) => {
      const big = Buffer.concat([TINY_PNG, Buffer.alloc(4.5 * 1024 * 1024)]);
      expect((await upload(request, 'work-image', 'big.png', 'image/png', big)).status()).toBe(413);
    });
    test('a resume must be a real PDF', async ({ request }) => {
      const bad = await request.post('/api/edit/upload', { headers: WRITE_HEADERS, multipart: { target: 'resume', resumeId: 'engineering', file: { name: 'r.pdf', mimeType: 'application/pdf', buffer: Buffer.from('nope') } } });
      expect(bad.status()).toBe(400);
      const good = await request.post('/api/edit/upload', { headers: WRITE_HEADERS, multipart: { target: 'resume', resumeId: 'engineering', file: { name: 'r.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4\n%test\n') } } });
      expect(good.status()).toBe(200);
      expect(existsInCopy('public/resumes/engineering.pdf')).toBe(true);
    });
  });

  test.describe('picture preview', () => {
    test('serves pictures from the site folders only', async ({ request }) => {
      expect((await request.get('/api/edit/image?path=src/assets/headshot.jpg')).status()).toBe(200);
      for (const bad of ['package.json', 'src/assets/../../package.json', 'src/content/work/04-pennlincs.md', '.env']) {
        expect((await request.get(`/api/edit/image?path=${encodeURIComponent(bad)}`)).status(), bad).toBe(400);
      }
    });
  });

  test.describe('order', () => {
    test('saves a new order', async ({ request }) => {
      const order = orderJson();
      const ids = [...order.work].reverse();
      const res = await request.put('/api/edit/order', { headers: WRITE_HEADERS, data: { kind: 'work', ids } });
      expect(res.status()).toBe(200);
      expect(JSON.parse(readCopy('src/data/order.json')).work).toEqual(ids);
      const list = await (await request.get('/api/edit/files')).json();
      expect(list.work.map((f: any) => f.name.replace(/\.md$/, ''))).toEqual(ids);
    });
    test('refuses a list that is missing, repeating or inventing items', async ({ request }) => {
      const ids = orderJson().work;
      const put = (list: string[]) => request.put('/api/edit/order', { headers: WRITE_HEADERS, data: { kind: 'work', ids: list } });
      for (const bad of [ids.slice(1), [...ids, 'made-up'], []]) expect((await put(bad)).status()).toBe(409); // not the files that exist
      expect((await put([...ids.slice(1), ids[1]])).status()).toBe(400); // a repeat
      expect((await request.put('/api/edit/order', { headers: WRITE_HEADERS, data: { kind: 'nonsense', ids } })).status()).toBe(400);
    });
  });

  test('the site details file keeps the contact form address', async ({ request }) => {
    const before = JSON.parse(readCopy('src/data/site.json'));
    const doc = await (await request.get(fileUrl('src/data/site.json'))).json();
    expect(doc.text).not.toContain('contactEndpoint');
    const res = await request.put('/api/edit/file', { headers: WRITE_HEADERS, data: { path: 'src/data/site.json', text: doc.text.replace(/^name:.*$/m, 'name: Test Name'), sha: doc.sha } });
    expect(res.status()).toBe(200);
    const after = JSON.parse(readCopy('src/data/site.json'));
    expect(after.name).toBe('Test Name');
    expect(after.contactEndpoint).toBe(before.contactEndpoint);
  });
});
