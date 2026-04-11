'use client';

import React, { useEffect, useState } from 'react';

type Platform = 'ios' | 'android' | 'desktop';

const STORE_LINKS = {
  ios: 'https://apps.apple.com/us/app/radargas-gasolina-barata/id6760366244',
  android: 'https://play.google.com/store/apps/details?id=com.radargas.app',
};

/* Official badge URLs (Spanish locale) */
const BADGE_IOS =
  'https://tools.applemediaservices.com/api/badges/download-on-the-app-store/black/es-es?size=250x83';
const BADGE_ANDROID =
  'https://play.google.com/intl/es/badges/static/images/badges/es_badge_web_generic.png';

function detectPlatform(): Platform {
  if (typeof navigator === 'undefined') return 'desktop';
  const ua = navigator.userAgent || navigator.vendor || '';
  if (/iPad|iPhone|iPod/.test(ua)) return 'ios';
  if (/android/i.test(ua)) return 'android';
  return 'desktop';
}

interface SmartDownloadButtonProps {
  className?: string;
  style?: React.CSSProperties;
  /** 'primary' = main CTA btn, 'nav' = navbar link, 'badge' = store badges */
  variant?: 'primary' | 'nav' | 'badge';
  /** Custom label — overrides auto-generated text (only for nav/primary variants) */
  label?: string;
}

/* ─── Badge link (reusable) ─── */
function StoreBadge({ store }: { store: 'ios' | 'android' }) {
  const href = store === 'ios' ? STORE_LINKS.ios : STORE_LINKS.android;
  const src = store === 'ios' ? BADGE_IOS : BADGE_ANDROID;
  const alt =
    store === 'ios'
      ? 'Descargar en el App Store'
      : 'Disponible en Google Play';

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block' }}>
      <img
        src={src}
        alt={alt}
        style={{
          height: store === 'ios' ? '54px' : '78px',  /* Google badge has built-in padding so needs bigger size */
          marginTop: store === 'android' ? '-12px' : '0',
          objectFit: 'contain',
        }}
      />
    </a>
  );
}

function DownloadModal({ onClose }: { onClose: () => void }) {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 99999
    }} onClick={onClose}>
      <div style={{
        background: '#121822',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '16px',
        padding: '32px',
        maxWidth: '400px',
        width: '90%',
        textAlign: 'center',
        position: 'relative',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
      }} onClick={e => e.stopPropagation()}>
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            color: '#a0aec0',
            fontSize: '24px',
            cursor: 'pointer',
            lineHeight: 1,
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          aria-label="Cerrar"
        >
          &times;
        </button>
        <h3 style={{ color: 'white', margin: '0 0 12px 0', fontSize: '24px', fontWeight: 700 }}>Pásate a la App</h3>
        <p style={{ color: '#a0aec0', marginBottom: '24px', lineHeight: 1.5, fontSize: '15px' }}>
          Consigue alertas de precios, encuentra las gasolineras más baratas de tu zona al instante y ahorra dinero en cada repostaje. Totalmente gratis.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
          <StoreBadge store="ios" />
          <StoreBadge store="android" />
        </div>
      </div>
    </div>
  );
}

export default function SmartDownloadButton({
  className,
  style,
  variant = 'primary',
  label,
}: SmartDownloadButtonProps) {
  const [platform, setPlatform] = useState<Platform>('desktop');
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    setPlatform(detectPlatform());
  }, []);

  /* ── NAV variant: simple text link ── */
  if (variant === 'nav') {
    const text =
      label ||
      (platform === 'ios'
        ? 'Descargar en App Store'
        : platform === 'android'
          ? 'Descargar en Google Play'
          : 'Descargar RadarGas');

    if (platform === 'desktop') {
      return (
        <>
          <button 
            type="button"
            className={className} 
            style={{ 
               cursor: 'pointer', 
               background: 'var(--rg-primary, #00FF7F)', 
               color: '#000',
               border: 'none', 
               padding: '10px 20px', 
               font: 'inherit',
               fontWeight: 600,
               borderRadius: '8px',
               ...style 
            }} 
            onClick={() => setModalOpen(true)}
          >
            {text}
          </button>
          {modalOpen && <DownloadModal onClose={() => setModalOpen(false)} />}
        </>
      );
    }

    const href = platform === 'ios' ? STORE_LINKS.ios : STORE_LINKS.android;

    return (
      <a href={href} className={className} style={{...style, display: 'inline-block'}} target="_blank" rel="noopener noreferrer">
        {text}
      </a>
    );
  }

  /* ── BADGE variant: official store badges ── */
  if (variant === 'badge') {
    if (platform === 'ios') {
      return <StoreBadge store="ios" />;
    }
    if (platform === 'android') {
      return <StoreBadge store="android" />;
    }
    /* Desktop → both badges */
    return (
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', ...style }}>
        <StoreBadge store="ios" />
        <StoreBadge store="android" />
      </div>
    );
  }

  /* ── PRIMARY variant ── */
  if (platform === 'desktop') {
    /* Desktop with primary variant → also show both badges */
    return (
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', ...style }}>
        <StoreBadge store="ios" />
        <StoreBadge store="android" />
      </div>
    );
  }

  /* Mobile with primary → single badge */
  return platform === 'ios' ? <StoreBadge store="ios" /> : <StoreBadge store="android" />;
}
