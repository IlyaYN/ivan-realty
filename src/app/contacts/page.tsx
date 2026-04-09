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

const getContactStyle = (type: string) => {
  switch (type.toLowerCase()) {
    case 'telegram': return { color: '#0088cc', icon: <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" /> };
    case 'whatsapp': return { color: '#25D366', icon: <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /> };
    case 'phone': return { color: '#ea580c', icon: <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /> };
    case 'email': return { color: '#a1a1aa', icon: <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6" /> };
    case 'address': return { color: '#f59e0b', icon: <g><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></g> };
    // ИСПРАВЛЕНА ИКОНКА ВК (теперь это залитый контур)
    case 'vk': return { color: '#0077FF', icon: <path fill="currentColor" stroke="none" d="M15.077 7.06c.045-.126.136-.452-.068-.61-.203-.135-.497-.113-.497-.113l-2.463.023s-.18.022-.293.135c-.113.113-.18.316-.18.316s-.384 1.015-.903 1.918c-1.106 1.918-1.558 2.03-1.74 1.918-.383-.226-.293-1.31-.293-1.986 0-.61-.09-1.038-.316-1.15-.158-.09-.34-.136-.677-.136-.52 0-.97.023-1.286.158-.226.113-.406.34-.294.36.136.024.452.09.61.34.202.293.18.947.18.947s.113 1.805-.293 2.03c-.27.158-.655-.18-1.467-1.58-.406-.677-.79-1.76-.79-1.76s-.068-.18-.18-.27c-.113-.09-.27-.113-.27-.113L2.09 7.15s-.248.023-.34.135c-.09.113-.022.34-.022.34s1.264 2.955 2.686 5.008c1.33 1.918 2.864 2.934 4.263 2.934 1.4 0 1.58-.316 1.58-.88v-1.67s.023-.384.18-.54c.136-.136.384-.09.835.34.52.496 1.06 1.353 1.49 1.69.316.248.654.18.654.18l2.256-.023s1.173-.09.632-.677c-.045-.045-.316-.677-1.625-1.896-1.376-1.264-1.196-1.06.452-3.273 1.015-1.353 1.444-2.188 1.31-2.526z"/> };
    default: return { color: '#fff', icon: <circle cx="12" cy="12" r="10" /> };
  }
};

export default function ContactsPage() {
  const [contacts, setContacts] = useState<any[]>([
    { type: 'phone', title: 'Личный телефон', value: '+7 (999) 000-00-00', link: 'tel:+79990000000' },
    { type: 'telegram', title: 'Telegram', value: 'Написать лично', link: 'https://t.me/' }
  ]);

  const [formData, setFormData] = useState({ name: '', phone: '', comment: '', agreement: false });
  const [formStatus, setFormStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  useEffect(() => {
    async function loadContacts() {
      const data = await fetchSheetData('contacts');
      if (data && data.length > 0) setContacts(data);
    }
    loadContacts();
  }, []);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.agreement) { alert('Нужно согласие на обработку данных'); return; }
    setFormStatus('loading');

    const escapeHTML = (str: string) => str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const safeName = escapeHTML(formData.name);
    const safePhone = escapeHTML(formData.phone);
    const safeComment = formData.comment ? escapeHTML(formData.comment) : 'Нет комментариев';

    const message = `📞 <b>ЗАЯВКА (КОНТАКТЫ)</b>\n━━━━━━━━━━━━━━━━━━\n👤 <b>Клиент:</b> ${safeName}\n📞 <b>Телефон:</b> ${safePhone}\n💬 <b>Комментарий:</b> ${safeComment}\n━━━━━━━━━━━━━━━━━━`;
    
    try {
      const res = await fetch('/api/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: message })
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || `HTTP Error ${res.status}`);

      setFormStatus('success');
      setFormData({ name: '', phone: '', comment: '', agreement: false });
    } catch (e: any) { 
      alert(`Ошибка отправки: ${e.message}`); 
      setFormStatus('idle'); 
    }
  };

  return (
    <div className="main-scroll" style={{ paddingTop: '120px', minHeight: '80vh', paddingBottom: '60px' }}>
      <div className="text-block fade-in-1" style={{ marginBottom: '40px', textAlign: 'center', margin: '0 auto', maxWidth: '600px', padding: '0 15px' }}>
        <h1 className="main-title" style={{ fontSize: 'clamp(2.5rem, 4vw, 3.5rem)' }}>Связь со мной</h1>
        <p className="main-subtitle" style={{ fontSize: '16px' }}>Выберите удобный способ связи или оставьте заявку ниже.</p>
      </div>

      <div className="fade-in-2" style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '500px', margin: '0 auto', width: '100%', padding: '0 15px' }}>
        {contacts.map((contact, i) => {
          const style = getContactStyle(contact.type);
          
          let safeLink = contact.link || '#';
          if (contact.type.toLowerCase() === 'email' && !safeLink.startsWith('mailto:')) safeLink = `mailto:${safeLink}`;
          if (contact.type.toLowerCase() === 'phone' && !safeLink.startsWith('tel:')) safeLink = `tel:${safeLink.replace(/[^0-9+]/g, '')}`;

          return (
            <a key={i} href={safeLink} target={contact.type !== 'phone' && contact.type !== 'email' ? '_blank' : '_self'} rel="noreferrer" className="glass-card" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '20px', width: '100%', padding: '20px', textDecoration: 'none' }}>
              {/* Цветовая база перенесена в parent div для правильной работы SVG */}
              <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: `${style.color}15`, color: style.color, display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}>
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{style.icon}</svg>
              </div>
              <div style={{ width: '100%' }}>
                <div style={{ fontSize: '12px', color: '#a1a1aa', fontWeight: '700', textTransform: 'uppercase' }}>{contact.title}</div>
                <div style={{ fontSize: '18px', fontWeight: '800', color: '#fff', userSelect: 'all', wordBreak: 'break-word' }}>{contact.value}</div>
              </div>
            </a>
          );
        })}
      </div>

      <div className="fade-in-3" style={{ maxWidth: '500px', margin: '40px auto 0', padding: '0 15px', width: '100%' }}>
        <div style={{ background: 'rgba(20, 22, 28, 0.85)', border: '1px solid rgba(234, 88, 12, 0.4)', boxShadow: '0 0 30px rgba(234, 88, 12, 0.15)', borderRadius: '24px', padding: '30px', backdropFilter: 'blur(15px)' }}>
          {formStatus === 'success' ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#22c55e', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px' }}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" width="30" height="30"><polyline points="20 6 9 17 4 12"></polyline></svg></div>
              <h3 style={{ fontSize: '22px', color: '#fff', marginBottom: '10px' }}>Заявка отправлена!</h3>
              <p style={{ color: '#a1a1aa', fontSize: '14px' }}>Свяжусь с вами в ближайшее время.</p>
              <button onClick={() => setFormStatus('idle')} className="btn-hollow" style={{ marginTop: '20px' }}>Отправить еще</button>
            </div>
          ) : (
            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: '20px', color: '#fff', marginBottom: '5px', textAlign: 'center' }}>Оставить сообщение</h3>
              
              <input required type="text" placeholder="Ваше имя" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', padding: '14px', borderRadius: '10px', color: '#fff', outline: 'none' }} />
              <input required type="tel" placeholder="+7 (999) 000-00-00" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', padding: '14px', borderRadius: '10px', color: '#fff', outline: 'none' }} />
              
              <textarea 
                placeholder="Ваш вопрос или комментарий" 
                value={formData.comment} 
                onChange={e => setFormData({...formData, comment: e.target.value})} 
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '12px', borderRadius: '8px', color: '#fff', outline: 'none', minHeight: '80px', resize: 'vertical', fontSize: '14px', fontFamily: 'inherit' }} 
              />

              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', marginTop: '5px' }}>
                <input type="checkbox" checked={formData.agreement} onChange={e => setFormData({...formData, agreement: e.target.checked})} style={{ marginTop: '3px', accentColor: '#ea580c' }} />
                <span style={{ fontSize: '12px', color: '#71717a', lineHeight: '1.4' }}>Согласен на <Link href="/privacy" style={{ color: '#ea580c', textDecoration: 'underline' }}>обработку данных</Link></span>
              </label>

              <button type="submit" disabled={formStatus === 'loading'} className="btn-solid" style={{ width: '100%', padding: '14px', fontSize: '15px', marginTop: '10px' }}>
                {formStatus === 'loading' ? 'Отправка...' : 'Отправить'}
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="fade-in-4" style={{ textAlign: 'center', marginTop: '40px' }}>
        <Link href="/"><button className="btn-hollow">← Вернуться на главную</button></Link>
      </div>
    </div>
  );
}