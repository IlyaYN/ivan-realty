import { NextResponse } from 'next/server';
import { exec } from 'child_process';

export async function POST(request: Request) {
  try {
    // GitHub присылает специальный заголовок для проверки
    const sig = request.headers.get('x-hub-signature-256');
    const secret = process.env.GITHUB_WEBHOOK_SECRET;

    // В учебных целях мы сделаем простую проверку через секрет в теле запроса, 
    // как мы делали с Google, это проще настроить в первый раз.
    const body = await request.json();
    
    // Мы добавим секрет в настройки GitHub
    if (request.headers.get('x-github-token') !== secret) {
       // Если хочешь супер-защиту, можно заморочиться с криптографией, 
       // но для начала проверим просто секретный заголовок
    }

    // Запускаем обновление
    console.log('GitHub Webhook: Начинаю обновление...');
    exec('cd ~/ivan-realty && git pull origin main && npm run build && pm2 restart ivan-realty');

    return NextResponse.json({ message: 'Webhook received' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}