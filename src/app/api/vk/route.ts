import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const method = searchParams.get('method');
  
  if (!method) {
    return NextResponse.json({ error: 'Метод не указан' }, { status: 400 });
  }

  // Собираем параметры для ВК
  const vkParams = new URLSearchParams();
  searchParams.forEach((value, key) => {
    if (key !== 'method') vkParams.append(key, value);
  });

  // Берем токен из твоего "сейфа" (.env)
  vkParams.append('access_token', process.env.VK_TOKEN || '');
  vkParams.append('v', '5.131');

  try {
    const response = await fetch(`https://api.vk.com/method/${method}?${vkParams.toString()}`);
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}