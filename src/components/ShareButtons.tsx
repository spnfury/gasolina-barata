'use client';

import React, { useEffect, useState } from 'react';

interface ShareButtonsProps {
    title: string;
}

export default function ShareButtons({ title }: ShareButtonsProps) {
    const [url, setUrl] = useState('');

    useEffect(() => {
        setUrl(window.location.href);
    }, []);

    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);

    const shareLinks = {
        whatsapp: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
        twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(url);
        alert('Enlace copiado al portapapeles');
    };

    if (!url) return null;

    return (
        <div className="share-buttons" style={{ display: 'flex', gap: '8px', marginTop: '24px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--rg-text-secondary)', marginRight: '8px' }}>Compartir:</span>
            
            <a href={shareLinks.whatsapp} target="_blank" rel="noopener noreferrer" style={btnStyle('#25D366')}>
                WhatsApp
            </a>
            <a href={shareLinks.twitter} target="_blank" rel="noopener noreferrer" style={btnStyle('#1DA1F2')}>
                X
            </a>
            <a href={shareLinks.facebook} target="_blank" rel="noopener noreferrer" style={btnStyle('#1877F2')}>
                Facebook
            </a>
            <button onClick={copyToClipboard} style={btnStyle('rgba(255,255,255,0.1)')}>
                📋 Copiar Link
            </button>
        </div>
    );
}

const btnStyle = (bg: string) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    background: bg,
    color: '#fff',
    textDecoration: 'none',
    borderRadius: '16px',
    fontSize: '0.85rem',
    fontWeight: 600,
    border: 'none',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
});
