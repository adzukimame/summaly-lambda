import type { Handler } from 'aws-lambda';
import { Hono } from 'hono';
import { handle } from 'hono/aws-lambda';
import { summaly } from '@misskey-dev/summaly';
import type { SummalyPlugin } from '@misskey-dev/summaly';
import { youtube } from '@googleapis/youtube';
import { load as cheerioLoad } from 'cheerio';
import { decode as decodeHtml } from 'html-entities';
import sjson from 'secure-json-parse';
import { z } from 'zod/v4';

let disabledHostnames: string[] = [];

if (process.env['DISABLED_HOSTNAMES']) {
  try {
    const parsed = z.array(z.unknown()).parse(sjson.parse(process.env['DISABLED_HOSTNAMES']));
    disabledHostnames = parsed.filter(val => typeof val === 'string');
  }
  catch {
    // nop
  }
}

function clip(s: string, max: number) {
  if (s.trim() === '') {
    return s;
  }

  s = s.trim();

  return s.length > max ? s.substring(0, max) + '...' : s;
}

const youtubeApiKey = process.env['YOUTUBE_API_KEY'];

const plugins = [
  {
    test: (url: URL) => disabledHostnames.includes(url.hostname),
    summarize: (_url: URL) => new Promise((resolve) => { resolve(null); }),
  },
  {
    test: (url: URL) => ['youtube.com', 'www.youtube.com', 'music.youtube.com', 'youtu.be'].includes(url.hostname),
    summarize: async (url: URL) => {
      if (!youtubeApiKey) {
        return null;
      }

      const [contentId, contentType]: [string | null, 'video' | 'list' | 'clip']
        = url.hostname === 'youtu.be'
          ? [url.pathname.slice(1), 'video']
          : url.pathname === '/playlist'
            ? [url.searchParams.get('list'), 'list']
            : url.pathname.startsWith('/clip/')
              ? [url.pathname.slice(6), 'clip']
              : url.pathname.startsWith('/live/')
                ? [url.pathname.slice(6), 'video']
                : url.pathname.startsWith('/shorts/')
                  ? [url.pathname.slice(8), 'video']
                  : [url.searchParams.get('v'), 'video'];

      if (contentId === null || contentId === '' || contentType === 'clip') {
        return null;
      }

      const yt = youtube({
        version: 'v3',
        auth: youtubeApiKey,
      });

      const res = contentType === 'list'
        ? await yt.playlists.list({
          id: [contentId],
          part: ['snippet', 'player'],
        })
        : await yt.videos.list({
          id: [contentId],
          part: ['snippet', 'player'],
        });

      if (res.data.items === undefined || res.data.items.length === 0) {
        return null;
      }

      const detail = res.data.items[0];

      const $ = detail?.player?.embedHtml ? cheerioLoad(detail.player.embedHtml) : undefined;
      const playerUrl = $ ? $('iframe').attr('src') : null;
      const playerWidth = $ ? $('iframe').attr('width') : null;
      const playerHeight = $ ? $('iframe').attr('height') : null;

      return {
        title: detail?.snippet?.title ? clip(decodeHtml(detail.snippet.title), 100) : null,
        icon: 'https://www.youtube.com/favicon.ico',
        description: detail?.snippet?.description ? clip(decodeHtml(detail.snippet.description.replace(/\n/g, '')), 157) : null,
        thumbnail: detail?.snippet?.thumbnails?.maxres?.url ?? null,
        player: {
          url: playerUrl
            ? playerUrl.startsWith('http://')
              ? `https:${playerUrl.substring(5)}`
              : `https:${playerUrl}`
            : null,
          width: playerWidth ? parseInt(playerWidth) : null,
          height: playerHeight ? parseInt(playerHeight) : null,
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
      };
    },
  },
] as SummalyPlugin[];

export const app = new Hono();

app.get('*', async (ctx) => {
  const url = ctx.req.query('url');

  if (url === undefined || !URL.canParse(url)) {
    return ctx.body('url is required', 400);
  }

  try {
    const summary = await summaly(url, {
      lang: ctx.req.query('lang') ?? null,
      followRedirects: false,
      plugins,
    });

    return ctx.json(summary);
  }
  catch (e) {
    return ctx.json({ error: e instanceof Error ? e.toString() : e }, 500);
  }
});

export const handler: Handler = handle(app);
