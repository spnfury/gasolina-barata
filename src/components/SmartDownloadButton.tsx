'use client';

import React, { useEffect, useState } from 'react';

type Platform = 'ios' | 'android' | 'desktop';

const STORE_LINKS = {
  ios: 'https://apps.apple.com/us/app/radargas-gasolina-barata/id6760366244',
  android: 'https://play.google.com/store/apps/details?id=com.radargas.app',
  fallback: 'https://app.radargas.com',
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

export default function SmartDownloadButton({
  className,
  style,
  variant = 'primary',
  label,
}: SmartDownloadButtonProps) {
  const [platform, setPlatform] = useState<Platform>('desktop');

  useEffect(() => {
    setPlatform(detectPlatform());
  }, []);

  /* ── NAV variant: simple text link ── */
  if (variant === 'nav') {
    const href =
      platform === 'ios'
        ? STORE_LINKS.ios
        : platform === 'android'
          ? STORE_LINKS.android
          : STORE_LINKS.fallback;
    const text =
      label ||
      (platform === 'ios'
        ? 'Descargar en App Store'
        : platform === 'android'
          ? 'Descargar en Google Play'
          : 'Descargar RadarGas');

    return (
      <a href={href} className={className} style={style} target="_blank" rel="noopener noreferrer">
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
