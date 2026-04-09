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
    return null;
  }
}

export default function ServicesPage() {
  const [config, setConfig] = useState<any>({});
  const [services, setServices] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', phone: '', comment: '', agreement: false });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  useEffect(() => {
    async function loadData() {
      const configData = await fetchSheetData('config');
      if (configData) {
        const confObj: any = {};
        configData.forEach((item: any) => { confObj[item.key] = item.value; });
        setConfig(confObj);
      }

      const data = await fetchSheetData('services');
      if (data) {
        setServices(data);
        setTimeout(() => {
          const hash = window.location.hash;
          if (hash) {
            const element = document.querySelector(hash);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }
        }, 100);
      }
    }
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.agreement) { alert('Нужно согласие на обработку данных'); return; }
    setStatus('loading');

    // Умная очистка спецсимволов для HTML
    const escapeHTML = (str: string) => str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const safeName = escapeHTML(formData.name);
    const safePhone = escapeHTML(formData.phone);
    const safeComment = formData.comment ? escapeHTML(formData.comment) : 'Нет комментариев';

    const message = `💼 <b>ЗАЯВКА НА УСЛУГУ</b>\n━━━━━━━━━━━━━━━━━━\n🏢 <b>Услуга:</b> ${selectedService}\n👤 <b>Клиент:</b> ${safeName}\n📞 <b>Телефон:</b> ${safePhone}\n💬 <b>Комментарий:</b> ${safeComment}\n━━━━━━━━━━━━━━━━━━\n<i>Свяжитесь с клиентом как можно скорее!</i>`;

    try {
      const res = await fetch('/api/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: message })
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || `HTTP Error ${res.status}`);
      }

      setStatus('success');
      setFormData({ name: '', phone: '', comment: '', agreement: false });
    } catch (e: any) {
      alert(`Ошибка отправки: ${e.message}\n(Проверьте терминал для деталей)`);
      setStatus('idle');
    }
  };

  return (
    <div className="main-scroll" style={{ paddingTop: '110px' }}>
      <div className="text-block fade-in-1" style={{ textAlign: 'center', margin: '0 auto 50px', maxWidth: '800px', padding: '0 15px' }}>
        <div className="expert-badge" style={{ marginBottom: '15px' }}><div className="expert-dot"></div>{config.services_badge || 'Направления'}</div>
        <h1 className="main-title" style={{ wordBreak: 'break-word', hyphens: 'auto' }}>{config.services_title || 'Услуги и сопровождение'}</h1>
        <p className="main-subtitle">{config.services_subtitle || 'Прозрачные условия и экспертный подход к каждой сделке.'}</p>
      </div>

      <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '30px', padding: '0 15px' }}>
        {services.map((s, i) => (
          <div key={i} id={s.id} className="fade-in-2" style={{ background: 'rgba(30, 32, 38, 0.65)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '30px', backdropFilter: 'blur(10px)', scrollMarginTop: '100px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#fff', marginBottom: '15px', textTransform: 'uppercase' }}>{s.title}</h2>
            <p style={{ fontSize: '15px', color: '#a1a1aa', lineHeight: '1.7', marginBottom: '30px' }}>{s.full_desc || s.desc}</p>
            
            <div className="btn-wrapper" style={{ marginBottom: 0 }}>
              <button onClick={() => setSelectedService(s.title)} className="btn-solid">Оставить заявку</button>
              <Link href="/contacts" style={{ textDecoration: 'none' }}>
                <button className="btn-hollow">Связаться напрямую</button>
              </Link>
            </div>

            {selectedService === s.title && status !== 'success' && (
              <div style={{ marginTop: '30px', padding: '20px', background: 'rgba(0,0,0,0.3)', borderRadius: '16px', border: '1px solid rgba(234, 88, 12, 0.3)' }}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
                    <input required placeholder="Ваше имя" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ flex: '1', minWidth: '200px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '12px', borderRadius: '8px', color: '#fff', outline: 'none' }} />
                    <input required placeholder="Ваш телефон" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} style={{ flex: '1', minWidth: '200px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '12px', borderRadius: '8px', color: '#fff', outline: 'none' }} />
                  </div>
                  
                  <textarea 
                    placeholder="Ваш комментарий или вопрос (необязательно)" 
                    value={formData.comment} 
                    onChange={e => setFormData({...formData, comment: e.target.value})} 
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '12px', borderRadius: '8px', color: '#fff', outline: 'none', minHeight: '80px', resize: 'vertical', fontSize: '14px', fontFamily: 'inherit' }} 
                  />
                  
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={formData.agreement} onChange={e => setFormData({...formData, agreement: e.target.checked})} style={{ marginTop: '2px', accentColor: '#ea580c' }} />
                    <span style={{ fontSize: '11px', color: '#71717a' }}>Согласен на <Link href="/privacy" style={{ color: '#ea580c', textDecoration: 'underline' }}>обработку персональных данных</Link></span>
                  </label>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '5px' }}>
                    <button type="submit" className="btn-solid" style={{ padding: '12px 30px', width: '100%' }}>{status === 'loading' ? 'Отправка...' : 'Отправить заявку'}</button>
                    <button type="button" onClick={() => setSelectedService(null)} style={{ background: 'none', border: 'none', color: '#a1a1aa', cursor: 'pointer', fontSize: '13px', padding: '10px' }}>Отмена</button>
                  </div>
                </form>
              </div>
            )}

            {selectedService === s.title && status === 'success' && (
              <div style={{ marginTop: '30px', color: '#22c55e', fontWeight: '700', textAlign: 'center' }}>
                ✓ Заявка отправлена! Иван свяжется с вами.
                <button onClick={() => {setStatus('idle'); setSelectedService(null)}} style={{ display: 'block', margin: '10px auto', background: 'none', border: 'none', color: '#ea580c', cursor: 'pointer' }}>Закрыть</button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <Link href="/"><button className="btn-hollow">← На главную</button></Link>
      </div>
    </div>
  );
}