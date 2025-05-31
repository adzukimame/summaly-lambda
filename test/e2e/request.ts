import { it, expect, describe, beforeAll } from 'vitest';

process.env['DISABLED_HOSTNAMES'] = '["exapmle.org"]';

import { app } from '../../src/index';

beforeAll(() => {
  process.env['DISABLED_HOSTNAMES'] = '["exapmle.org"]';
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

describe('YouTubeの', () => {
  describe.each([
    { type: '通常の動画URL', url: 'https://www.youtube.com/watch?v=NMIEAhH_fTU' },
    { type: '動画の短縮URL', url: 'https://youtu.be/NMIEAhH_fTU' },
  ])('$typeへのリクエストが', ({ url }) => {
    it('成功する', async () => {
      const res = await app.request(`http://example.local/?url=${encodeURIComponent(url)}`);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json).toEqual({
        title: '【アイドルマスター】「Stage Bye Stage」(歌：島村卯月、渋谷凛、本田未央)',
        icon: 'https://www.youtube.com/favicon.ico',
        description: 'Website▶https://columbia.jp/idolmaster/Playlist▶https://www.youtube.com/playlist?list=PL83A2998CF3BBC86D2018年7月18日発売予定THE IDOLM@STER CINDERELLA GIRLS CG STAR...',
        thumbnail: 'https://i.ytimg.com/vi/NMIEAhH_fTU/maxresdefault.jpg',
        player: {
          url: 'https://www.youtube.com/embed/NMIEAhH_fTU',
          width: 480,
          height: 270,
          allow: [
            'autoplay',
            'clipboard-write',
            'encrypted-media',
            'picture-in-picture',
            'web-share',
            'fullscreen',
          ],
        },
        sitename: 'YouTube',
        sensitive: false,
        activityPub: null,
        url: url,
      });
    });
  });

  describe('\'再生リストのURL\'へのリクエストが', () => {
    it('成功する', async () => {
      const res = await app.request(`http://example.local/?url=${encodeURIComponent('https://www.youtube.com/playlist?list=PLYq4yLvct07nrKLfAWL1FtwHCbsUpL9W_')}`);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json).toEqual({
        title: '先生、ちょっとお時間いただけますか？',
        icon: 'https://www.youtube.com/favicon.ico',
        description: null,
        thumbnail: 'https://i.ytimg.com/vi/a_stK_fFXQI/maxresdefault.jpg',
        player: {
          url: 'https://www.youtube.com/embed/videoseries?list=PLYq4yLvct07nrKLfAWL1FtwHCbsUpL9W_',
          width: 640,
          height: 360,
          allow: [
            'autoplay',
            'clipboard-write',
            'encrypted-media',
            'picture-in-picture',
            'web-share',
            'fullscreen',
          ],
        },
        sitename: 'YouTube',
        sensitive: false,
        activityPub: null,
        url: 'https://www.youtube.com/playlist?list=PLYq4yLvct07nrKLfAWL1FtwHCbsUpL9W_',
      });
    });
  });
});
