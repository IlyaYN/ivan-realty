"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

// БЕРЕМ КЛЮЧИ ИЗ СЕЙФА
const SPREADSHEET_ID = process.env.NEXT_PUBLIC_SPREADSHEET_ID;
const VK_DOMAIN = process.env.NEXT_PUBLIC_VK_DOMAIN;

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

const fetchVK = async (method: string, params: Record<string, any>): Promise<any> => {
  const searchParams = new URLSearchParams({ method, ...params });
  try {
    // Теперь мы обращаемся не к ВК напрямую, а к нашему новому скрытому файлу
    const res = await fetch(`/api/vk?${searchParams.toString()}`);
    const data = await res.json();
    
    // Возвращаем ответ в виде Promise, как и ждет остальной код
    return new Promise((resolve) => resolve(data));
  } catch (error) {
    console.error("Ошибка загрузки ВК:", error);
    return null;
  }
};

export default function MediaPage() {
  const [config, setConfig] = useState<any>({});
  const [activeTab, setActiveTab] = useState<'wall' | 'market' | 'video'>('market');
  const [vkData, setVkData] = useState<{ wall: any[], market: any[], video: any[], albums: any[] }>({ wall: [], market: [], video: [], albums: [] });
  const [selectedAlbum, setSelectedAlbum] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [marketLoading, setMarketLoading] = useState(false);
  const [ownerId, setOwnerId] = useState<string | null>(null);

  const [expandedText, setExpandedText] = useState<Record<string, boolean>>({});
  const [formData, setFormData] = useState({ name: '', phone: '', comment: '', context: 'Общий вопрос из раздела Медиа', agreement: false });
  const [formStatus, setFormStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  
  // Состояния для попапов
  const [zoomedImg, setZoomedImg] = useState<string | null>(null);
  const [zoomedVideo, setZoomedVideo] = useState<string | null>(null); // Новое состояние для видеоплеера

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab === 'wall' || tab === 'market' || tab === 'video') setActiveTab(tab);
    }

    async function loadData() {
      try {
        const configData = await fetchSheetData('config');
        if (configData) {
          const confObj: any = {};
          configData.forEach((item: any) => { confObj[item.key] = item.value; });
          setConfig(confObj);
        }

        const resolveRes = await fetchVK('utils.resolveScreenName', { screen_name: VK_DOMAIN });
        if (!resolveRes?.response?.object_id) return setLoading(false);
        
        const id = `-${resolveRes.response.object_id}`;
        setOwnerId(id);

        const wallRes = await fetchVK('wall.get', { owner_id: id, count: 15, extended: 1 });
        await new Promise(r => setTimeout(r, 300));
        const marketRes = await fetchVK('market.get', { owner_id: id, count: 15, extended: 1 });
        await new Promise(r => setTimeout(r, 300));
        const videoRes = await fetchVK('video.get', { owner_id: id, count: 15, extended: 1 });
        const albumsRes = await fetchVK('market.getAlbums', { owner_id: id, count: 10 });

        setVkData({
          wall: wallRes?.response?.items || [],
          market: marketRes?.response?.items || [],
          video: videoRes?.response?.items || [],
          albums: albumsRes?.response?.items || []
        });
      } catch (e) {
        console.error("Ошибка ВК:", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const loadMarketAlbum = async (albumId: number | null) => {
    if (!ownerId) return;
    setSelectedAlbum(albumId);
    setMarketLoading(true);
    try {
      const params: any = { owner_id: ownerId, count: 20, extended: 1 };
      if (albumId) params.album_id = albumId;
      const marketRes = await fetchVK('market.get', params);
      setVkData(prev => ({ ...prev, market: marketRes?.response?.items || [] }));
    } catch (e) {} finally {
      setMarketLoading(false);
    }
  };

  const scrollToForm = (contextText: string) => {
    setFormData(prev => ({ ...prev, context: contextText }));
    const formElement = document.getElementById('media-contact-form');
    if (formElement) formElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const toggleText = (key: string) => {
    setExpandedText(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.agreement) { alert('Нужно согласие на обработку данных'); return; }
    setFormStatus('loading');

    const escapeHTML = (str: string) => str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const safeName = escapeHTML(formData.name);
    const safePhone = escapeHTML(formData.phone);
    const safeComment = formData.comment ? escapeHTML(formData.comment) : 'Нет комментариев';

    const message = `📱 <b>ЗАЯВКА (РАЗДЕЛ МЕДИА)</b>\n━━━━━━━━━━━━━━━━━━\n👤 <b>Клиент:</b> ${safeName}\n📞 <b>Телефон:</b> ${safePhone}\n📌 <b>Контекст:</b> ${formData.context}\n💬 <b>Комментарий:</b> ${safeComment}\n━━━━━━━━━━━━━━━━━━`;
    
    try {
      const res = await fetch('/api/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: message })
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || `HTTP Error ${res.status}`);

      setFormStatus('success');
      setFormData({ name: '', phone: '', comment: '', context: 'Общий вопрос из раздела Медиа', agreement: false });
    } catch (e: any) { 
      alert(`Ошибка отправки: ${e.message}`); 
      setFormStatus('idle'); 
    }
  };

  const formatDate = (unixTime: number) => new Date(unixTime * 1000).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
  
  const getSafeHighResPhoto = (post: any) => {
    try {
      let attachments = post.attachments || [];
      if (post.copy_history && post.copy_history.length > 0) {
        attachments = [...attachments, ...(post.copy_history[0].attachments || [])];
      }
      if (!attachments || attachments.length === 0) return null;
      
      const photoAtt = attachments.find((a: any) => a.type === 'photo');
      if (!photoAtt || !photoAtt.photo || !photoAtt.photo.sizes || photoAtt.photo.sizes.length === 0) return null;
      
      let bestUrl = photoAtt.photo.sizes[0].url;
      let maxWidth = 0;
      photoAtt.photo.sizes.forEach((s: any) => {
        if (s.width > maxWidth) { maxWidth = s.width; bestUrl = s.url; }
      });
      return bestUrl;
    } catch (e) {
      return null;
    }
  };

  const getMarketHighResPhoto = (item: any) => {
    try {
      if (item.photos && item.photos.length > 0 && item.photos[0].sizes) {
        let bestUrl = item.thumb_photo;
        let maxWidth = 0;
        item.photos[0].sizes.forEach((s: any) => {
          if (s.width > maxWidth) { maxWidth = s.width; bestUrl = s.url; }
        });
        return bestUrl;
      }
      return item.thumb_photo;
    } catch (e) {
      return item.thumb_photo;
    }
  };

  const getSafeText = (post: any) => {
    let text = post.text || "";
    if (post.copy_history && post.copy_history.length > 0 && post.copy_history[0].text) {
      text += (text ? "\n\n" : "") + post.copy_history[0].text;
    }
    return text;
  };

  const cardStyle = {
    background: 'rgba(30, 32, 38, 0.65)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '16px',
    padding: 0,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column' as const,
    width: '100%',
    backdropFilter: 'blur(10px)'
  };

  return (
    <div className="main-scroll" style={{ paddingTop: '110px', minHeight: '80vh', paddingBottom: '80px' }}>
      
      <div className="text-block fade-in-1" style={{ textAlign: 'center', margin: '0 auto 40px', maxWidth: '800px', padding: '0 15px' }}>
        <div className="expert-badge" style={{ marginBottom: '15px' }}><div className="expert-dot"></div>{config.media_badge || 'Проекты и Жизнь'}</div>
        <h1 className="main-title" style={{ fontSize: 'clamp(1.8rem, 5vw, 3rem)', wordBreak: 'break-word', hyphens: 'auto' }}>{config.media_title || 'Медиа и Объекты'}</h1>
        <p className="main-subtitle">{config.media_subtitle}</p>
      </div>

      <div className="fade-in-2" style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '40px', flexWrap: 'wrap', padding: '0 15px' }}>
        <button onClick={() => setActiveTab('market')} className={activeTab === 'market' ? 'btn-solid' : ''} style={activeTab !== 'market' ? { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#e4e4e7', padding: '12px 24px', borderRadius: '12px' } : { minWidth: '150px' }}>Витрина объектов</button>
        <button onClick={() => setActiveTab('video')} className={activeTab === 'video' ? 'btn-solid' : ''} style={activeTab !== 'video' ? { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#e4e4e7', padding: '12px 24px', borderRadius: '12px' } : { minWidth: '150px' }}>Видео и Клипы</button>
        <button onClick={() => setActiveTab('wall')} className={activeTab === 'wall' ? 'btn-solid' : ''} style={activeTab !== 'wall' ? { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#e4e4e7', padding: '12px 24px', borderRadius: '12px' } : { minWidth: '150px' }}>Новости</button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', color: '#ea580c', padding: '50px', fontSize: '18px', fontWeight: '700' }}>Загрузка данных из ВКонтакте...</div>
      ) : (
        <div className="fade-in-3" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          
          {/* ВКЛАДКА: ВИТРИНА (ТОВАРЫ) */}
          {activeTab === 'market' && (
            <>
              {vkData.albums.length > 0 && (
                <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '20px', marginBottom: '10px', scrollbarWidth: 'none' }}>
                  <button onClick={() => loadMarketAlbum(null)} style={{ padding: '8px 16px', borderRadius: '50px', background: selectedAlbum === null ? '#ea580c' : 'rgba(255,255,255,0.05)', color: '#fff', border: 'none', whiteSpace: 'nowrap', cursor: 'pointer', fontSize: '14px' }}>Все объекты</button>
                  {vkData.albums.map(alb => (
                    <button key={alb.id} onClick={() => loadMarketAlbum(alb.id)} style={{ padding: '8px 16px', borderRadius: '50px', background: selectedAlbum === alb.id ? '#ea580c' : 'rgba(255,255,255,0.05)', color: '#fff', border: 'none', whiteSpace: 'nowrap', cursor: 'pointer', fontSize: '14px' }}>{alb.title}</button>
                  ))}
                </div>
              )}
              
              {marketLoading ? <div style={{ color: '#a1a1aa', textAlign: 'center', padding: '40px' }}>Загрузка категории...</div> : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '20px' }}>
                  {vkData.market.length > 0 ? vkData.market.map((item, i) => {
                    const toggleKey = `market_${item.id}`;
                    const isExpanded = expandedText[toggleKey];
                    const highResPhotoUrl = getMarketHighResPhoto(item);
                    
                    return (
                      <div key={i} style={cardStyle}>
                        <div 
                          style={{ width: '100%', aspectRatio: '16/9', background: '#1e2026', position: 'relative', cursor: 'zoom-in' }}
                          onClick={() => setZoomedImg(highResPhotoUrl)}
                        >
                          <img src={item.thumb_photo} alt={item?.title || 'Объект'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <div style={{ position: 'absolute', bottom: '6px', right: '6px', background: '#ea580c', color: '#fff', padding: '4px 8px', borderRadius: '50px', fontSize: '12px', fontWeight: '800' }}>{item?.price?.text || ''}</div>
                        </div>
                        <div style={{ padding: '15px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                          <h3 style={{ fontSize: '15px', color: '#fff', fontWeight: '700', marginBottom: '8px', lineHeight: '1.3' }}>{item?.title || 'Без названия'}</h3>
                          
                          <p style={{ fontSize: '12px', color: '#a1a1aa', lineHeight: '1.5', display: isExpanded ? 'block' : '-webkit-box', WebkitLineClamp: isExpanded ? 'unset' : 3, WebkitBoxOrient: 'vertical', overflow: isExpanded ? 'visible' : 'hidden', marginBottom: '5px', whiteSpace: 'pre-wrap' }}>
                            {item?.description || ''}
                          </p>
                          
                          {item?.description && item.description.length > 80 && (
                            <button onClick={() => toggleText(toggleKey)} style={{ background: 'none', border: 'none', color: '#ea580c', fontSize: '11px', cursor: 'pointer', textAlign: 'left', padding: 0, marginBottom: '15px', fontWeight: '600' }}>
                              {isExpanded ? 'Свернуть описание ↑' : 'Читать полностью ↓'}
                            </button>
                          )}
                          
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: 'auto' }}>
                            <button onClick={() => scrollToForm(`Интересует объект: ${item?.title || ''}`)} className="btn-solid" style={{ width: '100%', padding: '8px', fontSize: '11px' }}>Узнать подробности</button>
                            <a href={`https://vk.com/market${item.owner_id}?w=product${item.owner_id}_${item.id}`} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                              <button className="btn-hollow" style={{ width: '100%', padding: '8px', fontSize: '11px', border: '1px solid rgba(255,255,255,0.2)' }}>Смотреть в сообществе ВК ↗</button>
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  }) : <div style={{ color: '#a1a1aa', textAlign: 'center', gridColumn: '1 / -1', padding: '40px' }}>В этой категории пока нет объектов.</div>}
                </div>
              )}
            </>
          )}

          {/* ВКЛАДКА: ВИДЕО И КЛИПЫ (ИСПРАВЛЕНИЕ: Открываем плеер ВНУТРИ сайта) */}
          {activeTab === 'video' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '20px' }}>
              {vkData.video.length > 0 ? vkData.video.map((vid, i) => {
                const coverUrl = vid.image && vid.image.length > 0 ? vid.image[vid.image.length - 1].url : '';
                const toggleKey = `video_${vid.id}`;
                const isExpanded = expandedText[toggleKey];
                return (
                  <div key={i} style={cardStyle}>
                    <div 
                      onClick={() => {
                        // Используем iframe-ссылку, которую отдает ВК, либо собираем её вручную
                        const playerUrl = vid.player || `https://vk.com/video_ext.php?oid=${vid.owner_id}&id=${vid.id}&hd=2`;
                        setZoomedVideo(playerUrl);
                      }}
                      style={{ width: '100%', aspectRatio: '16/9', background: '#1e2026', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer' }}
                    >
                      {coverUrl && <img src={coverUrl} alt={vid?.title || 'Видео'} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }} />}
                      <div style={{ position: 'absolute', width: '50px', height: '50px', background: '#ea580c', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', paddingLeft: '4px', boxShadow: '0 4px 15px rgba(0,0,0,0.5)' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                      </div>
                      {vid.duration > 0 && <div style={{ position: 'absolute', bottom: '6px', right: '6px', background: 'rgba(0,0,0,0.8)', color: '#fff', padding: '3px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: '600' }}>{Math.floor(vid.duration / 60)}:{(vid.duration % 60).toString().padStart(2, '0')}</div>}
                    </div>
                    <div style={{ padding: '15px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <h3 style={{ fontSize: '14px', color: '#fff', fontWeight: '700', lineHeight: '1.4', marginBottom: '8px' }}>{vid?.title || 'Без названия'}</h3>
                      
                      {vid?.description && (
                        <>
                          <p style={{ fontSize: '12px', color: '#a1a1aa', lineHeight: '1.5', display: isExpanded ? 'block' : '-webkit-box', WebkitLineClamp: isExpanded ? 'unset' : 2, WebkitBoxOrient: 'vertical', overflow: isExpanded ? 'visible' : 'hidden', marginBottom: '5px', whiteSpace: 'pre-wrap' }}>
                            {vid.description}
                          </p>
                          {vid.description.length > 60 && (
                            <button onClick={() => toggleText(toggleKey)} style={{ background: 'none', border: 'none', color: '#ea580c', fontSize: '11px', cursor: 'pointer', textAlign: 'left', padding: 0, marginBottom: '15px', fontWeight: '600' }}>
                              {isExpanded ? 'Свернуть ↑' : 'Читать полностью ↓'}
                            </button>
                          )}
                        </>
                      )}

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: 'auto' }}>
                        <button onClick={() => scrollToForm(`Консультация по видео: ${vid?.title || ''}`)} className="btn-solid" style={{ width: '100%', padding: '8px', fontSize: '11px' }}>Задать вопрос</button>
                        <a href={`https://vk.com/video${vid.owner_id}_${vid.id}`} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                          <button className="btn-hollow" style={{ width: '100%', padding: '8px', fontSize: '11px', border: '1px solid rgba(255,255,255,0.2)' }}>Смотреть в сообществе ВК ↗</button>
                        </a>
                      </div>
                    </div>
                  </div>
                )
              }) : <div style={{ color: '#a1a1aa', textAlign: 'center', gridColumn: '1 / -1' }}>Видео пока нет.</div>}
            </div>
          )}

          {/* ВКЛАДКА: НОВОСТИ */}
          {activeTab === 'wall' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '20px' }}>
              {vkData.wall.length > 0 ? vkData.wall.map((post, i) => {
                const photoUrl = getSafeHighResPhoto(post);
                const postText = getSafeText(post);
                const toggleKey = `wall_${post.id}`;
                const isExpanded = expandedText[toggleKey];
                
                if (!postText && !photoUrl) return null;

                return (
                  <div key={i} style={cardStyle}>
                    {photoUrl && (
                      <div 
                        style={{ width: '100%', height: '160px', background: '#1e2026', cursor: 'zoom-in' }}
                        onClick={() => setZoomedImg(photoUrl)}
                      >
                        <img src={photoUrl} alt="Пост ВК" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    )}
                    <div style={{ padding: '15px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <div style={{ fontSize: '11px', color: '#ea580c', fontWeight: '700', marginBottom: '8px' }}>
                        {post.date ? formatDate(post.date) : ''}
                      </div>
                      
                      {postText && (
                        <>
                          <p style={{ fontSize: '12px', color: '#e4e4e7', lineHeight: '1.6', flex: 1, display: isExpanded ? 'block' : '-webkit-box', WebkitLineClamp: isExpanded ? 'unset' : 4, WebkitBoxOrient: 'vertical', overflow: isExpanded ? 'visible' : 'hidden', marginBottom: '5px', whiteSpace: 'pre-wrap' }}>
                            {postText}
                          </p>
                          {postText.length > 100 && (
                            <button onClick={() => toggleText(toggleKey)} style={{ background: 'none', border: 'none', color: '#ea580c', fontSize: '11px', cursor: 'pointer', textAlign: 'left', padding: 0, marginBottom: '15px', fontWeight: '600' }}>
                              {isExpanded ? 'Свернуть текст ↑' : 'Читать полностью ↓'}
                            </button>
                          )}
                        </>
                      )}

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: 'auto' }}>
                        <button onClick={() => scrollToForm(`Консультация по новости от ${post.date ? formatDate(post.date) : 'ВК'}`)} className="btn-solid" style={{ width: '100%', padding: '8px', fontSize: '11px' }}>Задать вопрос</button>
                        <a href={`https://vk.com/wall${post.owner_id}_${post.id}`} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                          <button className="btn-hollow" style={{ width: '100%', padding: '8px', fontSize: '11px', border: '1px solid rgba(255,255,255,0.2)' }}>Читать в сообществе ВК ↗</button>
                        </a>
                      </div>
                    </div>
                  </div>
                )
              }) : <div style={{ color: '#a1a1aa', textAlign: 'center', gridColumn: '1 / -1' }}>На стене пока нет постов.</div>}
            </div>
          )}

        </div>
      )}

      {/* ГЛОБАЛЬНАЯ ФОРМА СВЯЗИ */}
      <div id="media-contact-form" className="fade-in-4" style={{ maxWidth: '600px', margin: '80px auto 0', padding: '35px', background: 'rgba(20, 22, 28, 0.85)', border: '1px solid rgba(234, 88, 12, 0.4)', boxShadow: '0 0 30px rgba(234, 88, 12, 0.15)', borderRadius: '24px', backdropFilter: 'blur(15px)' }}>
        {formStatus === 'success' ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#22c55e', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px' }}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" width="30" height="30"><polyline points="20 6 9 17 4 12"></polyline></svg></div>
            <h3 style={{ fontSize: '22px', color: '#fff', marginBottom: '10px' }}>Заявка отправлена!</h3>
            <p style={{ color: '#a1a1aa', fontSize: '14px' }}>Свяжусь с вами в ближайшее время.</p>
            <button onClick={() => setFormStatus('idle')} className="btn-hollow" style={{ marginTop: '20px' }}>Отправить еще</button>
          </div>
        ) : (
          <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '22px', color: '#fff', marginBottom: '5px', textAlign: 'center' }}>
              {config.form_title || 'Связаться со мной'}
            </h3>
            <p style={{ fontSize: '13px', color: '#a1a1aa', textAlign: 'center', marginBottom: '10px' }}>
              {config.form_subtitle || 'Заинтересовал объект или нужна консультация? Оставьте номер, и я перезвоню.'}
            </p>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
              <input required type="text" placeholder="Ваше имя" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ flex: '1 1 200px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', padding: '14px', borderRadius: '10px', color: '#fff', outline: 'none' }} />
              <input required type="tel" placeholder="+7 (999) 000-00-00" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} style={{ flex: '1 1 200px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', padding: '14px', borderRadius: '10px', color: '#fff', outline: 'none' }} />
            </div>

            <textarea 
              placeholder="Ваш комментарий или вопрос (необязательно)" 
              value={formData.comment} 
              onChange={e => setFormData({...formData, comment: e.target.value})} 
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '12px', borderRadius: '8px', color: '#fff', outline: 'none', minHeight: '80px', resize: 'vertical', fontSize: '14px', fontFamily: 'inherit' }} 
            />

            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', marginTop: '5px' }}>
              <input type="checkbox" checked={formData.agreement} onChange={e => setFormData({...formData, agreement: e.target.checked})} style={{ marginTop: '3px', accentColor: '#ea580c' }} />
              <span style={{ fontSize: '12px', color: '#71717a', lineHeight: '1.4' }}>Согласен на <Link href="/privacy" style={{ color: '#ea580c', textDecoration: 'underline' }}>обработку персональных данных</Link></span>
            </label>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
              <button type="submit" disabled={formStatus === 'loading'} className="btn-solid" style={{ width: '100%', padding: '14px', fontSize: '15px' }}>{formStatus === 'loading' ? 'Отправка...' : 'Отправить заявку'}</button>
              <Link href="/contacts" style={{ textDecoration: 'none' }}>
                <button type="button" className="btn-hollow" style={{ width: '100%', padding: '12px', fontSize: '14px', border: '1px solid rgba(255,255,255,0.15)' }}>Связаться напрямую (Контакты)</button>
              </Link>
            </div>
          </form>
        )}
      </div>

      {/* ПОПАП УВЕЛИЧЕННОЙ КАРТИНКИ */}
      {zoomedImg && (
        <div className="qr-zoom-overlay" onClick={() => setZoomedImg(null)}>
          <div className="img-zoom-content" onClick={(e) => e.stopPropagation()} style={{ position: 'relative' }}>
            <img src={zoomedImg} alt="Zoomed Image" />
            <button 
              onClick={() => setZoomedImg(null)}
              style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer', zIndex: 10001 }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
        </div>
      )}

      {/* ПОПАП ВИДЕОПЛЕЕРА ВК */}
      {zoomedVideo && (
        <div className="qr-zoom-overlay" onClick={() => setZoomedVideo(null)}>
          <div className="img-zoom-content" onClick={(e) => e.stopPropagation()} style={{ position: 'relative', width: '100%', maxWidth: '900px', aspectRatio: '16/9' }}>
            <iframe 
              src={zoomedVideo} 
              style={{ width: '100%', height: '100%', borderRadius: '16px', border: 'none', background: '#000' }} 
              allow="autoplay; encrypted-media; fullscreen; picture-in-picture" 
              allowFullScreen
            ></iframe>
            <button 
              onClick={() => setZoomedVideo(null)}
              style={{ position: 'absolute', top: '-45px', right: '0', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer', zIndex: 10001 }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
        </div>
      )}

    </div>
  );
}