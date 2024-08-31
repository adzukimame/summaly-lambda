import { it, expect, describe, beforeAll } from 'vitest';

process.env.DISABLED_HOSTNAMES = '["exapmle.org"]';

import { app } from '../../src/index';

beforeAll(() => {
  process.env.DISABLED_HOSTNAMES = '["exapmle.org"]';
});

describe('リクエストの', () => {
  describe('urlパラメータが', () => {
    it('ないなら失敗する', async () => {
      const res = await app.request('http://example.local');
      expect(res.status).toBe(400);
    });

    it('値が無いなら失敗する', async () => {
      const res = await app.request('http://example.local/?url');
      expect(res.status).toBe(400);
    });

    it('不正な値なら失敗する', async () => {
      const res = await app.request('http://example.local/?url=aaaa');
      expect(res.status).toBe(400);
    });

    it('妥当な値なら成功する', async () => {
      const res = await app.request(`http://example.local/?url=${encodeURIComponent('https://example.com/')}`);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.title).toBe('Example Domain');
    });
  });

  describe('ホスト名が', () => {
    it('DISABLED_HOSTNAMESに含まれているなら失敗する', async () => {
      const res = await app.request(`http://example.local/?url=${encodeURIComponent('https://example.org/')}`);
      expect(res.status).toBe(500);
      const json = await res.json();
      expect(json.title).toBe(undefined);
    });
  });
});
