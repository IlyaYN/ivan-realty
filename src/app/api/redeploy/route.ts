import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

export async function POST(request: Request) {
  try {
    const { secret } = await request.json();

    // Проверяем наш придуманный пароль
    if (secret !== process.env.REDEPLOY_SECRET) {
      return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 });
    }

    // Запускаем обновление
    exec('cd ~/ivan-realty && git pull && npm run build && pm2 restart ivan-realty');

    return NextResponse.json({ message: 'Обновление запущено!' });
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}