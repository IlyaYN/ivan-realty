"use client";

import React, { useState } from 'react';
import Link from 'next/link';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* МОБИЛЬНЫЕ МЕНЮ (OVERLAY) */}
      <div className={`mobile-overlay ${isMobileMenuOpen ? 'open' : ''}`}>
        <Link href="/about" onClick={() => setIsMobileMenuOpen(false)}>О проекте</Link>
        <Link href="/services" onClick={() => setIsMobileMenuOpen(false)}>Услуги</Link>
        <Link href="/reviews" onClick={() => setIsMobileMenuOpen(false)}>Отзывы</Link>
        <Link href="/media" onClick={() => setIsMobileMenuOpen(false)}>Медиа</Link>
        <Link href="/contacts" onClick={() => setIsMobileMenuOpen(false)}>Контакты</Link>
        
        {/* ИСПРАВЛЕНО: Кнопка ведет на /contacts */}
        <Link href="/contacts" onClick={() => setIsMobileMenuOpen(false)} style={{textDecoration: 'none'}}>
          <button className="contact-btn-mobile">СВЯЗАТЬСЯ</button>
        </Link>
      </div>

      {/* ШАПКА */}
      <header className="top-bar">
        <Link href="/" className="logo-link" onClick={() => setIsMobileMenuOpen(false)}>
          <img src="/favicon.webp" alt="Логотип" className="logo-img" />
          <div className="logo-text">
            <div style={{ fontSize: '16px', fontWeight: '900', letterSpacing: '2px', color: '#fff' }}>НИЖНИК</div>
            <div style={{ fontSize: '16px', fontWeight: '900', letterSpacing: '2px', color: '#ea580c' }}>ИВАН</div>
          </div>
        </Link>
        
        <nav className="nav-links">
          <Link href="/about">О проекте</Link>
          <Link href="/services">Услуги</Link>
          <Link href="/reviews">Отзывы</Link>
          <Link href="/media">Медиа</Link>
          <Link href="/contacts">Контакты</Link>
        </nav>
        
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {/* ИСПРАВЛЕНО: Кнопка ведет на /contacts */}
          <Link href="/contacts" style={{textDecoration: 'none'}}>
            <button className="contact-btn">СВЯЗАТЬСЯ</button>
          </Link>
          
          <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? (
              <svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" strokeWidth="2" fill="none"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            ) : (
              <svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" strokeWidth="2" fill="none"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            )}
          </button>
        </div>
      </header>
    </>
  );
}