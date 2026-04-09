import { NextResponse } from 'next/server';

// БЕРЕМ КЛЮЧИ ИЗ СЕЙФА (Файл .env)
const TG_TOKEN = process.env.TG_TOKEN;
const TG_CHAT_ID = process.env.TG_CHAT_ID;

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    // Пакуем данные в стандартный FormData (железобетонный формат для TG)
    const formData = new FormData();
    formData.append('chat_id', TG_CHAT_ID as string);
    formData.append('text', text);
    formData.append('parse_mode', 'HTML');

    const response = await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
      method: 'POST',
      body: formData
    });

    const data = await response.json();

    // Если Телеграм ругается, выводим ошибку в консоль сервера
    if (!response.ok) {
      console.error("❌ ОШИБКА ОТ ТЕЛЕГРАМА:", data);
      return NextResponse.json({ success: false, error: data.description }, { status: 500 });
    }

    console.log("✅ УСПЕШНО ОТПРАВЛЕНО В ТГ!");
    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("❌ ВНУТРЕННЯЯ ОШИБКА СЕРВЕРА:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}