import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// Только методы чтения, которые нужны сайту. Всё остальное (например, wall.post)
// запрещено — иначе через сайт любой мог бы действовать от имени нашего аккаунта ВК.
const ALLOWED_METHODS = new Set([
  'utils.resolveScreenName',
  'wall.get',
  'market.get',
  'market.getAlbums',
  'video.get',
]);

// Кэш ответов ВК: сайт не дёргает ВК на каждого посетителя,
// а если ВК временно отказывает (Flood control и т.п.) — показываем последние удачные данные.
const TTL_MS = 10 * 60 * 1000; // 10 минут
const CACHE_FILE = path.join(process.cwd(), '.vk-cache.json');

type Entry = { time: number; data: unknown };
let cache: Record<string, Entry> | null = null;
const inFlight = new Map<string, Promise<unknown>>();

async function loadCache(): Promise<Record<string, Entry>> {
  if (cache) return cache;
  try {
    cache = JSON.parse(await fs.readFile(CACHE_FILE, 'utf8'));
  } catch {
    cache = {};
  }
  return cache!;
}

async function saveCache() {
  try {
    await fs.writeFile(CACHE_FILE, JSON.stringify(cache));
  } catch {
    /* кэш на диске — не критично */
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const method = searchParams.get('method');

  if (!method) {
    return NextResponse.json({ error: 'Метод не указан' }, { status: 400 });
  }
  if (!ALLOWED_METHODS.has(method)) {
    return NextResponse.json({ error: 'Метод не разрешён' }, { status: 403 });
  }

  const vkParams = new URLSearchParams();
  searchParams.forEach((value, key) => {
    if (key !== 'method' && key !== 'access_token') vkParams.append(key, value);
  });
  vkParams.sort();
  const key = `${method}?${vkParams.toString()}`;

  const store = await loadCache();
  const cached = store[key];
  if (cached && Date.now() - cached.time < TTL_MS) {
    return NextResponse.json(cached.data);
  }

  // Сначала отдельный ключ сайта (VK_SITE_TOKEN), при ошибке — основной VK_TOKEN.
  // Так сайт не зависит от ограничений аккаунта, через который идёт автопостинг.
  const tokens = [process.env.VK_SITE_TOKEN, process.env.VK_TOKEN].filter(Boolean) as string[];

  const callVK = async () => {
    let last: any = null;
    for (const token of tokens) {
      const p = new URLSearchParams(vkParams);
      p.append('access_token', token);
      p.append('v', '5.131');
      last = await fetch(`https://api.vk.com/method/${method}?${p.toString()}`).then((r) => r.json());
      if (last && last.response !== undefined) return last;
    }
    return last;
  };

  try {
    // одинаковые одновременные запросы идут в ВК один раз
    let pending = inFlight.get(key);
    if (!pending) {
      pending = callVK().finally(() => inFlight.delete(key));
      inFlight.set(key, pending);
    }
    const data: any = await pending;

    if (data && data.response !== undefined) {
      store[key] = { time: Date.now(), data };
      saveCache();
      return NextResponse.json(data);
    }

    // ВК вернул ошибку — отдаём последние удачные данные, если они есть
    if (cached) return NextResponse.json(cached.data);
    console.error('VK API error', method, data?.error?.error_code, data?.error?.error_msg);
    return NextResponse.json(data);
  } catch (error) {
    if (cached) return NextResponse.json(cached.data);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
