'use client';

import React, { useEffect, useState } from 'react';

type Platform = 'ios' | 'android' | 'desktop';

const STORE_LINKS = {
  ios: 'https://apps.apple.com/us/app/radargas-gasolina-barata/id6760366244',
  android: 'https://play.google.com/store/apps/details?id=com.radargas.app',
  fallback: 'https://app.radargas.com',
};

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
  /** Variant controls the look: 'primary' = main CTA btn, 'nav' = navbar link, 'badge' = store badges */
  variant?: 'primary' | 'nav' | 'badge';
  /** Custom label — overrides the auto-generated text */
  label?: string;
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

  // --- NAV variant: simple link ---
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

  // --- BADGE variant: on desktop show both store badges side-by-side ---
  if (variant === 'badge' || (variant === 'primary' && platform === 'desktop')) {
    if (platform === 'ios') {
      return (
        <a
          href={STORE_LINKS.ios}
          className={className || 'rg-btn primary'}
          style={style}
          target="_blank"
          rel="noopener noreferrer"
        >
          {label || ' Descargar en App Store'}
        </a>
      );
    }
    if (platform === 'android') {
      return (
        <a
          href={STORE_LINKS.android}
          className={className || 'rg-btn primary'}
          style={style}
          target="_blank"
          rel="noopener noreferrer"
        >
          {label || '🤖 Descargar en Google Play'}
        </a>
      );
    }

    // Desktop: show both buttons
    return (
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', ...style }}>
        <a
          href={STORE_LINKS.ios}
          className="rg-btn primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          target="_blank"
          rel="noopener noreferrer"
        >
           App Store
        </a>
        <a
          href={STORE_LINKS.android}
          className="rg-btn primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--rg-surface)', border: '1px solid var(--rg-primary)', color: 'var(--rg-primary)' }}
          target="_blank"
          rel="noopener noreferrer"
        >
          🤖 Google Play
        </a>
      </div>
    );
  }

  // --- PRIMARY variant on mobile ---
  const href =
    platform === 'ios' ? STORE_LINKS.ios : STORE_LINKS.android;
  const text =
    label ||
    (platform === 'ios'
      ? '🚀 Descargar en App Store'
      : '🚀 Descargar en Google Play');

  return (
    <a
      href={href}
      className={className || 'rg-btn primary'}
      style={style}
      target="_blank"
      rel="noopener noreferrer"
    >
      {text}
    </a>
  );
}
