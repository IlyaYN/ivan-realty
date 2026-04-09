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

export default function AboutPage() {
  const [aboutData, setAboutData] = useState<any>({
    badge_text: 'Обо мне',
    title: 'О ПРОЕКТЕ',
    subtitle: 'Загрузка...',
    text_1: '',
    text_2: '',
    image_url: '',
    btn_text: 'Связаться'
  });

  useEffect(() => {
    async function loadAboutData() {
      const data = await fetchSheetData('about');
      if (data) {
        const dataObj: any = {};
        data.forEach((item: any) => { dataObj[item.key] = item.value; });
        setAboutData(prev => ({ ...prev, ...dataObj }));
      }
    }
    loadAboutData();
  }, []);

  return (
    <div className="main-scroll" style={{ paddingTop: '110px', paddingBottom: '60px', minHeight: '80vh' }}>
      
      <div style={{ 
        maxWidth: '1300px', 
        margin: '0 auto', 
        width: '100%',
        display: 'flex',
        flexWrap: 'wrap', 
        gap: '50px',
        alignItems: 'center' 
      }}>
        
        {/* ЛЕВАЯ КОЛОНКА: Фотография, адаптирующаяся под пропорции оригинала */}
        <div className="fade-in-1" style={{ flex: '1 1 400px', position: 'relative' }}>
          <div style={{ 
            position: 'relative', 
            width: '100%', 
            borderRadius: '24px', 
            overflow: 'hidden',
            background: 'rgba(30, 32, 38, 0.3)', 
            lineHeight: 0 
          }}>
            {aboutData.image_url && (
              <img 
                src={aboutData.image_url} 
                alt="Фото о проекте" 
                style={{ 
                  width: '100%', 
                  height: 'auto', 
                  display: 'block',
                  maxHeight: '70vh', 
                  objectFit: 'contain' 
                }} 
              />
            )}
            
            {/* Динамические градиенты растворения краев */}
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle, transparent 40%, #0f1015 110%)', pointerEvents: 'none' }}></div>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, #0f1015 0%, transparent 10%, transparent 90%, #0f1015 100%)', pointerEvents: 'none' }}></div>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, #0f1015 0%, transparent 10%, transparent 90%, #0f1015 100%)', pointerEvents: 'none' }}></div>
          </div>
        </div>

        {/* ПРАВАЯ КОЛОНКА: Текст */}
        <div className="fade-in-2" style={{ flex: '1.2 1 500px' }}>
          <div className="expert-badge" style={{ marginBottom: '20px' }}>
            <div className="expert-dot"></div>{aboutData.badge_text}
          </div>
          
          <h1 className="main-title" style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', whiteSpace: 'normal', wordBreak: 'break-word', marginBottom: '15px' }}>
            {aboutData.title}
          </h1>
          
          <p className="main-subtitle" style={{ fontSize: '18px', color: '#c2410c', fontWeight: '700', marginBottom: '30px', opacity: 0.9 }}>
            {aboutData.subtitle}
          </p>

          <div style={{ 
            background: 'rgba(30, 32, 38, 0.65)', 
            border: '1px solid rgba(255,255,255,0.08)', 
            borderRadius: '16px', 
            padding: '30px', 
            backdropFilter: 'blur(10px)',
            fontSize: '15px',
            lineHeight: '1.8',
            color: '#e4e4e7',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            {aboutData.text_1 && <p>{aboutData.text_1}</p>}
            {aboutData.text_2 && <p>{aboutData.text_2}</p>}
          </div>

          <div className="btn-wrapper" style={{ marginTop: '40px' }}>
            <Link href="/contacts"><button className="btn-solid">{aboutData.btn_text}</button></Link>
            <Link href="/"><button className="btn-hollow">На главную</button></Link>
          </div>
        </div>

      </div>
    </div>
  );
}