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

export default function ReviewsPage() {
  const [config, setConfig] = useState<any>({});
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      // Подгружаем конфиг для шапки
      const configData = await fetchSheetData('config');
      if (configData) {
        const confObj: any = {};
        configData.forEach((item: any) => { confObj[item.key] = item.value; });
        setConfig(confObj);
      }

      // Подгружаем сами отзывы
      const data = await fetchSheetData('reviews');
      if (data && data.length > 0) setReviews(data);
    }
    loadData();
  }, []);

  return (
    <div className="main-scroll" style={{ paddingTop: '120px', minHeight: '80vh', paddingBottom: '60px' }}>
      
      <div className="text-block fade-in-1" style={{ marginBottom: '40px', textAlign: 'center', margin: '0 auto', maxWidth: '800px', padding: '0 15px' }}>
        <h1 className="main-title" style={{ fontSize: 'clamp(2.5rem, 4vw, 3.5rem)', wordBreak: 'break-word' }}>
          {config.reviews_title || 'Отзывы клиентов'}
        </h1>
        <p className="main-subtitle" style={{ fontSize: '16px' }}>
          {config.reviews_subtitle || 'Главный показатель качества моей работы — это рекомендации и слова благодарности от тех, с кем мы уже закрыли сделки.'}
        </p>
      </div>

      <div className="fade-in-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '0 15px' }}>
        {reviews.length > 0 ? reviews.map((review, i) => (
          <div key={i} className="glass-card" style={{ display: 'flex', flexDirection: 'column', padding: '25px', cursor: 'default' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(234, 88, 12, 0.1)', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px solid rgba(234, 88, 12, 0.3)', flexShrink: 0 }}>
                {review.photo_url ? (
                  <img src={review.photo_url} alt={review.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '24px', height: '24px' }}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                )}
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: '800', color: '#fff' }}>{review.name}</div>
                <div style={{ fontSize: '12px', color: '#a1a1aa', marginTop: '2px' }}>{review.date}</div>
              </div>
            </div>
            <div style={{ fontSize: '14px', lineHeight: '1.6', color: '#e4e4e7', flex: 1 }}>"{review.text}"</div>
            <div style={{ display: 'flex', gap: '4px', marginTop: '20px', color: '#ea580c' }}>
              {[1,2,3,4,5].map(star => <svg key={star} width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>)}
            </div>
          </div>
        )) : (
          <div style={{ color: '#a1a1aa', textAlign: 'center', width: '100%', padding: '40px' }}>Загрузка отзывов...</div>
        )}
      </div>

      <div className="fade-in-3" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '15px', marginTop: '50px', padding: '0 15px' }}>
        <Link href="/contacts" style={{ textDecoration: 'none' }}><button className="btn-solid" style={{ minWidth: '220px' }}>Оставить свой отзыв</button></Link>
        <Link href="/" style={{ textDecoration: 'none' }}><button className="btn-hollow" style={{ minWidth: '220px' }}>На главную</button></Link>
      </div>

    </div>
  );
}