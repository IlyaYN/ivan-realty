"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

// БЕРЕМ ID ИЗ СЕЙФА
const SPREADSHEET_ID = process.env.NEXT_PUBLIC_SPREADSHEET_ID;

async function fetchSheetData(sheetName: string) {
  try {
    const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=${sheetName}`;
    const response = await fetch(url);
    const csvText = await response.text();
    const lines = csvText.split('\n').filter(line => line.trim() !== '');
    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
    return lines.slice(1).map(line => {
      const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.replace(/"/g, '').trim());
      const obj: any = {};
      headers.forEach((header, i) => { obj[header] = values[i]; });
      return obj;
    });
  } catch (e) {
    console.error(`Ошибка загрузки ${sheetName}:`, e);
    return null;
  }
}

export default function PartnershipPage() {
  const [data, setData] = useState<any>({});
  const [formData, setFormData] = useState({ name: '', phone: '', service: '', agreement: false });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  useEffect(() => {
    async function loadData() {
      const sheetData = await fetchSheetData('partnership');
      if (sheetData) {
        const dataObj: any = {};
        sheetData.forEach((item: any) => { dataObj[item.key] = item.value; });
        setData(dataObj);
      }
    }
    loadData();
  }, []);

  const servicesArray = data.services_list 
    ? data.services_list.split(',').map((s: string) => s.trim()) 
    : ['Загрузка услуг...'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.agreement) {
      alert('Пожалуйста, подтвердите согласие на обработку данных.');
      return;
    }
    if (!formData.service) {
      alert('Пожалуйста, выберите услугу из списка.');
      return;
    }

    setStatus('loading');

    // Умная очистка спецсимволов для HTML формата (как в других формах)
    const escapeHTML = (str: string) => str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const safeName = escapeHTML(formData.name);
    const safePhone = escapeHTML(formData.phone);
    const safeService = escapeHTML(formData.service);

    const message = `🚀 <b>НОВАЯ ЗАЯВКА (ПАРТНЕРКА)</b>\n━━━━━━━━━━━━━━━━━━\n👤 <b>Партнер:</b> ${safeName}\n📞 <b>Телефон:</b> ${safePhone}\n🏢 <b>Услуга:</b> ${safeService}\n━━━━━━━━━━━━━━━━━━\n<i>Свяжитесь с партнером, чтобы обсудить детали!</i>`;

    try {
      // ИСПОЛЬЗУЕМ НАШ ВНУТРЕННИЙ БЕЗОПАСНЫЙ СЕРВЕР (ОБХОД VPN)
      const res = await fetch('/api/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: message })
      });

      const result = await res.json();
      
      if (!res.ok) throw new Error(result.error || `HTTP Error ${res.status}`);

      setStatus('success');
      setFormData({ name: '', phone: '', service: '', agreement: false });
    } catch (error: any) {
      console.error(error);
      setStatus('error');
      alert(`Ошибка отправки: ${error.message}`);
    }
  };

  return (
    <div className="main-scroll" style={{ paddingTop: '120px', paddingBottom: '60px', minHeight: '80vh' }}>
      
      <div className="text-block fade-in-1" style={{ marginBottom: '50px', textAlign: 'center', margin: '0 auto', maxWidth: '800px' }}>
        <div className="expert-badge" style={{ marginBottom: '15px' }}>
          <div className="expert-dot"></div>Сотрудничество
        </div>
        <h1 className="main-title" style={{ fontSize: 'clamp(2.2rem, 4vw, 3.5rem)' }}>{data.title || 'Загрузка...'}</h1>
        <p className="main-subtitle" style={{ fontSize: '16px', marginTop: '15px' }}>{data.subtitle}</p>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px', maxWidth: '1300px', margin: '0 auto', alignItems: 'center', justifyContent: 'center' }}>
        
        {/* ЛЕВАЯ КОЛОНКА */}
        <div className="fade-in-2" style={{ flex: '1 1 300px', maxWidth: '400px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '25px', color: '#fff' }}>Как это работает?</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {[1, 2, 3, 4].map((step) => (
              <div key={step} style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(234, 88, 12, 0.15)', border: '1px solid #ea580c', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#ea580c', fontWeight: '800', fontSize: '14px', flexShrink: 0 }}>
                  {step}
                </div>
                <div style={{ paddingTop: '4px', color: '#e4e4e7', fontSize: '14px', lineHeight: '1.4' }}>
                  {data[`step_${step}`]}
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '30px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <details style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '12px 15px', cursor: 'pointer' }}>
              <summary style={{ color: '#a1a1aa', fontWeight: '600', fontSize: '13px', outline: 'none' }}>Условия выплаты</summary>
              <div style={{ marginTop: '10px', fontSize: '12px', color: '#71717a', lineHeight: '1.5' }}>{data.legal_oferta}</div>
            </details>
            <details style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '12px 15px', cursor: 'pointer' }}>
              <summary style={{ color: '#a1a1aa', fontWeight: '600', fontSize: '13px', outline: 'none' }}>Политика обработки данных</summary>
              <div style={{ marginTop: '10px', fontSize: '12px', color: '#71717a', lineHeight: '1.5' }}>{data.legal_privacy}</div>
            </details>
          </div>
        </div>

        {/* ЦЕНТРАЛЬНАЯ КОЛОНКА */}
        <div className="fade-in-3" style={{ flex: '1.2 1 380px', maxWidth: '450px' }}>
          <div style={{ 
            background: 'rgba(20, 22, 28, 0.85)', border: '1px solid rgba(234, 88, 12, 0.4)', 
            boxShadow: '0 0 30px rgba(234, 88, 12, 0.15)', borderRadius: '20px', padding: '35px', backdropFilter: 'blur(15px)' 
          }}>
            
            {status === 'success' ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#22c55e', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" width="30" height="30"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                <h3 style={{ fontSize: '22px', color: '#fff', marginBottom: '10px' }}>Заявка отправлена!</h3>
                <p style={{ color: '#a1a1aa', fontSize: '14px' }}>Иван свяжется с вами в ближайшее время.</p>
                <button onClick={() => setStatus('idle')} className="btn-hollow" style={{ marginTop: '20px' }}>Отправить еще</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 style={{ fontSize: '20px', color: '#fff', marginBottom: '5px', textAlign: 'center' }}>Оставить заявку</h3>
                
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: '#a1a1aa', marginBottom: '6px', textTransform: 'uppercase', fontWeight: '700' }}>Ваше имя</label>
                  <input required type="text" placeholder="Иван Иванов" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', padding: '12px', borderRadius: '10px', color: '#fff', outline: 'none' }} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: '#a1a1aa', marginBottom: '6px', textTransform: 'uppercase', fontWeight: '700' }}>Ваш телефон</label>
                  <input required type="tel" placeholder="+7 (999) 000-00-00" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', padding: '12px', borderRadius: '10px', color: '#fff', outline: 'none' }} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: '#a1a1aa', marginBottom: '6px', textTransform: 'uppercase', fontWeight: '700' }}>Какая услуга нужна клиенту?</label>
                  <select required value={formData.service} onChange={e => setFormData({...formData, service: e.target.value})} style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', padding: '12px', borderRadius: '10px', color: '#fff', outline: 'none', appearance: 'none' }}>
                    <option value="" disabled style={{ background: '#1e2026', color: '#71717a' }}>-- Выберите услугу --</option>
                    {servicesArray.map((srv: string, idx: number) => (
                      <option key={idx} value={srv} style={{ background: '#1e2026' }}>{srv}</option>
                    ))}
                  </select>
                </div>

                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', marginTop: '5px' }}>
                  <input type="checkbox" checked={formData.agreement} onChange={e => setFormData({...formData, agreement: e.target.checked})} style={{ marginTop: '2px', accentColor: '#ea580c' }} />
                  <span style={{ fontSize: '11px', color: '#71717a', lineHeight: '1.4' }}>
                    Согласен на <Link href="/privacy" style={{ color: '#ea580c', textDecoration: 'underline' }}>обработку персональных данных</Link>
                  </span>
                </label>

                <button type="submit" disabled={status === 'loading'} className="btn-solid" style={{ width: '100%', marginTop: '5px', opacity: status === 'loading' ? 0.7 : 1 }}>
                  {status === 'loading' ? 'Отправка...' : 'Отправить заявку'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* ПРАВАЯ КОЛОНКА */}
        {data.image_url && (
          <div className="fade-in-4" style={{ flex: '1 1 300px', maxWidth: '350px', position: 'relative' }}>
             <div style={{ position: 'relative', width: '100%', borderRadius: '24px', overflow: 'hidden', background: 'rgba(30, 32, 38, 0.3)', lineHeight: 0 }}>
                <img src={data.image_url} alt="Партнерка" style={{ width: '100%', height: 'auto', display: 'block', maxHeight: '55vh', objectFit: 'contain' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle, transparent 65%, #0f1015 110%)', pointerEvents: 'none' }}></div>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, #0f1015 0%, transparent 10%, transparent 90%, #0f1015 100%)', pointerEvents: 'none' }}></div>
              </div>
          </div>
        )}

      </div>
    </div>
  );
}