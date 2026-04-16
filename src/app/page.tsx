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

const getIcon = (name: string) => {
  const icons: any = {
    search: <circle cx="11" cy="11" r="8"></circle>,
    home: <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>,
    chart: <g><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></g>,
    shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>,
    file: <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>,
    message: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{icons[name] || icons.search}</svg>;
};

const getSafeLink = (link: string) => {
  if (!link) return '#';
  if (link.startsWith('/') || link.startsWith('#')) return link;
  if (link.startsWith('http://') || link.startsWith('https://')) return link;
  return `https://${link}`;
};

export default function Home() {
  const [config, setConfig] = useState<any>({});
  const [services, setServices] = useState<any[]>([]);
  const [socials, setSocials] = useState<any[]>([]);
  const [media, setMedia] = useState<any[]>([]);
  
  const [zoomedQr, setZoomedQr] = useState<string | null>(null);

  const placeholderImages: Record<string, string> = {
    vitrina: "https://r.unreal-code.ru/ivan_placeholder_vitrina.png",
    video: "https://r.unreal-code.ru/ivan_placeholder_video.png",
    news: "https://r.unreal-code.ru/ivan_placeholder_news.png"
  };

  useEffect(() => {
    async function loadAllData() {
      const configData = await fetchSheetData('config');
      if (configData) {
        const confObj: any = {};
        configData.forEach((item: any) => { confObj[item.key] = item.value; });
        setConfig(confObj);
      }
      const servicesData = await fetchSheetData('services');
      if (servicesData) setServices(servicesData);
      const socialsData = await fetchSheetData('socials');
      if (socialsData) setSocials(socialsData);
      const mediaData = await fetchSheetData('media');
      if (mediaData) setMedia(mediaData);
    }
    loadAllData();
    
    const handleGlobalWheel = (e: WheelEvent) => {
      const scrollContainer = (e.target as HTMLElement).closest('.scroll-row, .media-row');
      if (scrollContainer) {
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
          e.preventDefault();
          scrollContainer.scrollLeft += e.deltaY * 1.5;
        }
      }
    };
    document.addEventListener('wheel', handleGlobalWheel, { passive: false });
    return () => document.removeEventListener('wheel', handleGlobalWheel);
  }, []);

  return (
    <>
      <div className="ivan-container">
        <div className="ivan-glow-safe"></div>
        <img src="/ivan.webp" className="ivan-image" alt="Нижник Иван" />
        
        <div className="social-qr-container desktop-only fade-in-4">
          {socials.map((soc, i) => (
            <div key={i} className="qr-card">
              <span className="qr-title">{soc.name}</span>
              <div 
                className="qr-img-wrapper" 
                style={{ cursor: 'zoom-in' }}
                onClick={() => { if (soc.qr_img) setZoomedQr(soc.qr_img); }}
              >
                {soc.qr_img ? <img src={soc.qr_img} alt={soc.name} /> : <div style={{width: '100%', height: '100%', background: '#eee'}}></div>}
              </div>
              <a href={getSafeLink(soc.link)} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', width: '100%' }}>
                <button className="qr-btn" style={{ width: '100%' }}>{soc.btn_text || 'Перейти'}</button>
              </a>
            </div>
          ))}
        </div>
      </div>

      <div className="main-scroll">
        <div className="partner-box fade-in-4">
          <div className="partner-box-inner">
            <svg style={{ width: '26px', height: '26px', color: '#ea580c', flexShrink: 0 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ color: '#fff', fontSize: '15px', fontWeight: '700', lineHeight: '1.2', whiteSpace: 'nowrap' }}>{config.partner_title}</span>
              <span style={{ color: '#a1a1aa', fontSize: '14px', fontWeight: '500' }}>{config.partner_desc}</span>
            </div>
          </div>
          <Link href="/partnership" style={{ textDecoration: 'none' }}>
            <button className="btn-solid" style={{ width: '100%', padding: '10px', fontSize: '14px' }}>{config.partner_btn}</button>
          </Link>
        </div>

        <div className="text-block fade-in-1">
          <div className="expert-badge"><div className="expert-dot"></div>{config.hero_badge}</div>
          <h1 className="main-title">{config.hero_title}</h1>
          <p className="main-subtitle">{config.hero_subtitle}</p>
          <div className="btn-wrapper">
            <Link href="/services#buyer-search"><button className="btn-solid">Подобрать объект</button></Link>
            <Link href="/services#market-analytics"><button className="btn-hollow">Оценить квартиру</button></Link>
            <Link href="/partnership"><button className="btn-accent"><span style={{ marginRight: '6px' }}>🤝</span> Посоветовать и получить комиссию</button></Link>
          </div>
        </div>

        <div className="row-container fade-in-2">
          <h2 className="block-title">Направления работы</h2>
          <div className="scroll-row">
            {services.map((s, i) => (
              <Link key={i} href={`/services#${s.id}`} className="glass-card">
                <div className="card-head"><div className="svg-icon">{getIcon(s.icon_name)}</div><div className="card-h">{s.title}</div></div>
                <div className="card-p">{s.desc}</div>
              </Link>
            ))}
            <div style={{ flex: '0 0 45vw' }}></div>
          </div>
        </div>

        <div className="row-container fade-in-3" style={{ marginTop: '20px', marginBottom: '20px' }}>
          <h2 className="block-title">Медиа</h2>
          <div className="media-row">
            {media.map((m, i) => (
              <Link key={i} href={getSafeLink(m.link)} className="glass-card" style={{ textDecoration: 'none' }}>
                <div className="card-h">{m.title}</div>
                <div className="card-p" style={{ marginTop: '2px' }}>{m.desc}</div>
                <div className="widget-box" style={{ padding: 0, overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'rgba(234, 88, 12, 0.05)', aspectRatio: '21/9' }}>
                  <img 
                    src={m.image_url || placeholderImages[m.id] || "https://r.unreal-code.ru/ivan_placeholder_news.png"} 
                    alt={m.title} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="row-container mobile-only fade-in-4" style={{ marginTop: '20px', marginBottom: '20px' }}>
          <h2 className="block-title">Сообщества и Связь</h2>
          <div className="scroll-row">
            {socials.map((soc, i) => (
              <div key={i} className="glass-card" style={{ flex: '0 0 auto', width: '200px', alignItems: 'center', padding: '15px' }}>
                <div className="card-h" style={{ marginBottom: '10px', textAlign: 'center' }}>{soc.name}</div>
                <div 
                  className="widget-box" 
                  style={{ background: '#fff', padding: '5px', width: '100%', aspectRatio: '1/1', borderRadius: '8px', marginBottom: '10px', cursor: 'zoom-in' }}
                  onClick={() => { if (soc.qr_img) setZoomedQr(soc.qr_img); }}
                >
                  {soc.qr_img ? <img src={soc.qr_img} alt={soc.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <div style={{width: '100%', height: '100%', background: '#eee'}}></div>}
                </div>
                <a href={getSafeLink(soc.link)} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', width: '100%' }}>
                  <button className="btn-solid" style={{ width: '100%', padding: '8px', fontSize: '11px' }}>{soc.btn_text || 'Перейти'}</button>
                </a>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ИСПРАВЛЕННЫЙ КРЕСТИК: Теперь он жестко привязан к картинке внутри контента */}
      {zoomedQr && (
        <div className="qr-zoom-overlay" onClick={() => setZoomedQr(null)}>
          <div className="qr-zoom-content" onClick={(e) => e.stopPropagation()} style={{ position: 'relative' }}>
            <img src={zoomedQr} alt="Zoomed QR" />
            <button 
              onClick={() => setZoomedQr(null)}
              style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer', zIndex: 10001 }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}