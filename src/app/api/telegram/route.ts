import { NextResponse } from 'next/server';

const TG_PROXY_URL =
  'https://script.google.com/macros/s/AKfycbyzYAb2DdTz53e99uCU-wohEhF7495zNaGsyEUbS5cJjA9oyl0Je5kOD21B8T_81PXm2w/exec';

export async function POST(request: Request) {
  try {
    const { text } = await request.json();
    await fetch(TG_PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, secret: process.env.TG_PROXY_SECRET }),
      redirect: 'manual',
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('❌ ВНУТРЕННЯЯ ОШИБКА СЕРВЕРА:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}