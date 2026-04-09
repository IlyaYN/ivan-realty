import './globals.css';
import type { Metadata } from 'next';
import Header from './components/Header';
import Footer from './components/Footer';

export const metadata: Metadata = {
  title: "НИЖНИК ИВАН - Недвижимость",
  description: "Профессиональный подход к сделкам.",
  icons: { icon: '/favicon.webp' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body style={{ backgroundColor: '#0f1015', color: '#fff', margin: 0, padding: 0, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        
        <img src="/city.jpg" className="app-bg" alt="" />
        <div className="app-overlay"></div>
        <Header />

        <main style={{ flex: 1, position: 'relative', zIndex: 10 }}>
          {children}
        </main>

        <Footer />

        <style dangerouslySetInnerHTML={{ __html: `
          * { box-sizing: border-box; margin: 0; padding: 0; font-family: system-ui, -apple-system, sans-serif; }
          html, body { overflow-x: hidden; width: 100%; }
          
          @media (min-width: 1025px) { .mobile-only { display: none !important; } }
          @media (max-width: 1024px) { .desktop-only { display: none !important; } }

          @keyframes pulse-gold { 0%, 100% { transform: scale(1); box-shadow: 0 0 10px #ea580c; } 50% { transform: scale(1.3); box-shadow: 0 0 20px #ea580c; } }
          @keyframes slideFadeUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
          
          .fade-in-1 { opacity: 0; animation: slideFadeUp 0.6s ease-out 0.1s forwards; }
          .fade-in-2 { opacity: 0; animation: slideFadeUp 0.6s ease-out 0.2s forwards; }
          .fade-in-3 { opacity: 0; animation: slideFadeUp 0.6s ease-out 0.3s forwards; }
          .fade-in-4 { opacity: 0; animation: slideFadeUp 0.6s ease-out 0.4s forwards; }

          .app-bg { position: fixed; inset: 0; z-index: -2; opacity: 0.35; object-fit: cover; width: 100vw; height: 100vh; pointer-events: none; }
          .app-overlay { position: fixed; inset: 0; z-index: -1; background: linear-gradient(180deg, rgba(15,16,21,0.5) 0%, rgba(15,16,21,0.95) 100%); pointer-events: none; }

          .top-bar { position: fixed; top: 0; left: 0; width: 100%; height: 70px; z-index: 100; display: flex; justify-content: space-between; align-items: center; padding: 0 5%; background: rgba(15,16,21,0.85); backdrop-filter: blur(10px); border-bottom: 1px solid rgba(255,255,255,0.05); }
          .logo-link { display: flex; align-items: center; gap: 10px; text-decoration: none; transition: 0.3s; }
          .logo-link:hover { transform: scale(1.05); }
          .logo-img { width: 34px; height: 34px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.15); }
          .nav-links { display: flex; gap: 30px; }
          .nav-links a { color: #a1a1aa; text-decoration: none; font-size: 13px; font-weight: 600; text-transform: uppercase; transition: 0.3s; }
          .nav-links a:hover { color: #fff; }
          .contact-btn { background: #fff; color: #000; padding: 8px 20px; border-radius: 50px; font-weight: 800; font-size: 11px; border: none; cursor: pointer; white-space: nowrap; transition: 0.3s; flex-shrink: 0; }
          .contact-btn:hover { background: #fff; transform: scale(1.05); box-shadow: 0 0 15px rgba(255, 255, 255, 0.5); }
          .mobile-menu-btn { display: none; background: none; border: none; color: #fff; cursor: pointer; padding: 5px; margin-left: 15px; z-index: 205; position: relative; }

          .mobile-overlay { position: fixed; inset: 0; background: rgba(15,16,21,0.98); z-index: 200; display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 40px; backdrop-filter: blur(20px); opacity: 0; pointer-events: none; transition: 0.3s ease; }
          .mobile-overlay.open { opacity: 1; pointer-events: all; }
          .mobile-overlay a { color: #fff; font-size: 24px; font-weight: 800; text-transform: uppercase; text-decoration: none; letter-spacing: 2px; }
          
          .contact-btn-mobile { background: #fff; color: #000; padding: 14px 40px; border-radius: 50px; font-weight: 800; font-size: 14px; border: none; cursor: pointer; transition: 0.3s; width: auto; min-width: 200px; margin-top: 10px; }
          .contact-btn-mobile:hover { transform: scale(1.05); box-shadow: 0 0 20px rgba(255,255,255,0.4); }

          .footer-line { padding: 20px 5%; border-top: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: center; align-items: center; gap: 20px; font-size: 12px; color: #666; width: 100%; text-align: center; margin-top: auto; flex-wrap: wrap; }
          .github-link { color: #666; text-decoration: none; transition: 0.3s; display: flex; align-items: center; gap: 6px; }
          .github-link:hover { color: #ea580c; }

          .main-scroll { position: relative; z-index: 10; padding: 100px 5% 40px 5%; width: 100%; max-width: 1600px; margin: 0 auto; display: flex; flex-direction: column; }
          
          .partner-box { position: fixed; top: 75px; right: 5%; width: auto; min-width: 400px; background: rgba(30, 32, 38, 0.85); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 15px 20px; z-index: 30; box-shadow: 0 15px 40px rgba(0,0,0,0.5); backdrop-filter: blur(15px); }
          .partner-box-inner { display: flex; gap: 15px; margin-bottom: 12px; align-items: center; }
          
          .text-block { padding-right: 5%; max-width: 800px; position: relative; z-index: 20; }
          .expert-badge { display: inline-flex; align-items: center; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); padding: 8px 18px; border-radius: 50px; font-size: 13px; font-weight: 700; color: #fff; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px; }
          .expert-dot { width: 8px; height: 8px; background: #ea580c; border-radius: 50%; margin-right: 12px; animation: pulse-gold 2s infinite; }
          .main-title { font-size: clamp(3rem, 5vw, 4.5rem); font-weight: 900; text-transform: uppercase; margin-bottom: 5px; line-height: 1; background: linear-gradient(180deg, #ffffff 0%, #bbbbbb 100%); -webkit-background-clip: text; color: transparent; filter: drop-shadow(0 0 25px rgba(234, 88, 12, 0.4)); letter-spacing: -1px; word-break: break-word; }
          .main-subtitle { font-size: 15px; color: #e4e4e7; margin-bottom: 18px; font-weight: 400; line-height: 1.6; max-width: 100%; text-shadow: 0 2px 5px rgba(0,0,0,0.8); }
          
          .btn-wrapper { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 30px; align-items: center; }
          .btn-solid { background: linear-gradient(90deg, #ea580c, #f97316); color: #fff; border: none; padding: 14px 28px; border-radius: 50px; font-weight: 700; font-size: 13px; cursor: pointer; box-shadow: 0 5px 20px rgba(234, 88, 12, 0.4); white-space: nowrap; transition: 0.2s; flex-shrink: 0; }
          .btn-solid:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(234, 88, 12, 0.6); }
          .btn-hollow { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.2); color: #fff; padding: 14px 28px; border-radius: 50px; font-weight: 700; font-size: 13px; cursor: pointer; white-space: nowrap; backdrop-filter: blur(10px); transition: 0.2s; flex-shrink: 0; }
          .btn-hollow:hover { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.4); }
          .btn-accent { background: rgba(234, 88, 12, 0.15); border: 1px solid rgba(234, 88, 12, 0.4); color: #f97316; padding: 14px 32px; border-radius: 50px; font-weight: 700; font-size: 13px; cursor: pointer; white-space: nowrap; transition: all 0.3s ease; box-shadow: 0 0 15px rgba(234, 88, 12, 0); flex-shrink: 0; }
          .btn-accent:hover { background: rgba(234, 88, 12, 0.25); transform: translateY(-2px); box-shadow: 0 8px 25px rgba(234, 88, 12, 0.3); }
          
          .block-title { font-size: 18px; font-weight: 800; margin: 0 0 10px 0; color: #fff; text-shadow: 0 2px 10px rgba(0,0,0,0.5); }
          
          .row-container { position: relative; width: 100%; z-index: 15; }
          .scroll-row { display: flex; overflow-x: auto; overflow-y: hidden; gap: 15px; padding-bottom: 15px; margin-bottom: 15px; width: 100%; cursor: grab; -webkit-overflow-scrolling: touch; }
          .scroll-row:active { cursor: grabbing; }
          .scroll-row::-webkit-scrollbar { height: 6px; }
          .scroll-row::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); border-radius: 10px; margin-right: 40vw; }
          .scroll-row::-webkit-scrollbar-thumb { background: rgba(234, 88, 12, 0.4); border-radius: 10px; }
          .scroll-row::-webkit-scrollbar-thumb:hover { background: rgba(234, 88, 12, 0.7); }

          .media-row { display: flex; gap: 15px; width: 100%; max-width: 900px; flex-wrap: wrap; margin-bottom: 20px; z-index: 15; position: relative; }
          
          .glass-card { flex: 0 0 auto; width: 260px; min-height: 110px; background: rgba(30, 32, 38, 0.65); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 15px; backdrop-filter: blur(10px); display: flex; flex-direction: column; transition: 0.3s; cursor: pointer; text-decoration: none; color: inherit; }
          .glass-card:hover { border-color: rgba(234, 88, 12, 0.4); transform: translateY(-3px); background: rgba(40, 42, 50, 0.9); }
          .card-head { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
          .svg-icon { width: 18px; height: 18px; color: #ea580c; flex-shrink: 0; }
          .card-h { font-size: 14px; font-weight: 700; color: #fff; }
          .card-p { font-size: 11px; color: #a1a1aa; line-height: 1.4; }
          .widget-box { flex: 1; min-height: 70px; margin-top: 8px; background: rgba(0,0,0,0.3); border: 1px dashed rgba(255,255,255,0.1); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #71717a; font-size: 11px; overflow: hidden; }

          .ivan-container { position: fixed; bottom: 0; right: 2%; height: 75vh; width: 45vw; max-width: 550px; z-index: 20; pointer-events: none; display: flex; justify-content: center; align-items: flex-end; }
          .ivan-glow-safe { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 120%; height: 120%; background: radial-gradient(circle, rgba(234,88,12,0.4) 0%, rgba(234,88,12,0.1) 40%, rgba(234,88,12,0) 70%); z-index: -1; filter: blur(30px); }
          .ivan-image { height: 100%; width: auto; object-fit: contain; object-position: bottom center; }

          /* ИСПРАВЛЕНО: Сдвинул чуть-чуть правее (с 19.5% на 20.5%) */
          .social-qr-container { position: absolute; bottom: 10%; left: 20.5%; transform: translateX(-50%); display: flex; flex-direction: row; gap: 10px; z-index: 35; pointer-events: auto; }
          .qr-card { width: 110px; background: rgba(20, 22, 28, 0.9); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 10px; display: flex; flex-direction: column; align-items: center; gap: 8px; backdrop-filter: blur(10px); transition: 0.3s; text-decoration: none; color: #fff; }
          .qr-card:hover { transform: translateY(-3px); border-color: #ea580c; box-shadow: 0 5px 15px rgba(234,88,12,0.2); }
          .qr-title { font-size: 10px; font-weight: 700; text-align: center; line-height: 1.1; }
          .qr-img-wrapper { width: 100%; aspect-ratio: 1/1; background: #fff; border-radius: 6px; padding: 4px; display: flex; justify-content: center; align-items: center; }
          .qr-img-wrapper img { width: 100%; height: 100%; object-fit: contain; }
          .qr-btn { background: rgba(255,255,255,0.1); border: none; color: #fff; padding: 6px; border-radius: 4px; font-size: 9px; font-weight: 700; width: 100%; cursor: pointer; transition: 0.3s; }
          .qr-card:hover .qr-btn { background: #ea580c; }

          /* АДАПТАЦИЯ ДЛЯ МОБИЛКИ */
          @media (max-width: 1024px) {
            .desktop-only { display: none !important; }
            .mobile-only { display: block !important; }

            .top-bar { padding: 0 15px; z-index: 210; }
            .logo-text div { font-size: 13px !important; }
            .mobile-menu-btn { display: flex; margin-left: 8px; }
            .nav-links { display: none; }
            .main-scroll { padding-top: 90px; }
            
            .main-title { font-size: 2.8rem; white-space: normal; word-break: break-word; line-height: 1; }
            
            .partner-box { position: relative; top: 0; right: 0; width: 100%; max-width: 100%; min-width: auto; margin-bottom: 25px; box-shadow: none; padding: 15px; }
            .partner-box-inner { gap: 12px; }
            .partner-box-inner > div > span:first-child { font-size: 13px !important; white-space: normal !important; line-height: 1.3 !important; }
            .partner-box-inner > div > span:last-child { font-size: 12px !important; }
            
            .btn-wrapper { flex-direction: column; align-items: stretch; width: 100%; }
            .btn-solid, .btn-hollow, .btn-accent { text-align: center; width: 100%; }
            
            .scroll-row::-webkit-scrollbar-track { margin-right: 5vw; }

            .media-row::-webkit-scrollbar-track { margin-right: 5vw; background: rgba(255,255,255,0.02); border-radius: 10px; }
            .media-row::-webkit-scrollbar-thumb { background: rgba(234, 88, 12, 0.4); border-radius: 10px; }

            .media-row { flex-wrap: nowrap; overflow-x: auto; overflow-y: hidden; padding-bottom: 15px; padding-right: 5vw; display: flex; width: 100%; gap: 15px; -webkit-overflow-scrolling: touch; cursor: grab; }
            .media-row:active { cursor: grabbing; }
            .media-row::-webkit-scrollbar { height: 6px; display: block; }
            
            .ivan-container { position: fixed; height: 50vh; width: 100vw; right: -10%; bottom: -5%; justify-content: flex-end; opacity: 0.15; z-index: 1; pointer-events: none; }
          }
        `}} />
      </body>
    </html>
  );
}