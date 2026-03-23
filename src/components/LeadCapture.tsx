'use client';

import React, { useState } from 'react';

interface LeadCaptureProps {
    variant?: 'inline' | 'card';
    title?: string;
    subtitle?: string;
}

export default function LeadCapture({
    variant = 'card',
    title = '📬 Recibe el informe semanal de precios',
    subtitle = 'Te enviamos cada lunes un resumen con los precios de gasolina en tu zona y las gasolineras más baratas.',
}: LeadCaptureProps) {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !email.includes('@')) return;

        setStatus('loading');

        // For now, store locally. In production, connect to email service (Mailchimp, Brevo, etc.)
        try {
            // Store in localStorage as a simple MVP
            const existing = JSON.parse(localStorage.getItem('rg_leads') || '[]');
            existing.push({ email, date: new Date().toISOString() });
            localStorage.setItem('rg_leads', JSON.stringify(existing));

            setStatus('success');
            setEmail('');
        } catch {
            setStatus('error');
        }
    };

    if (status === 'success') {
        return (
            <div className={`lead-capture ${variant}`}>
                <div className="lead-capture-success">
                    <span className="lead-capture-check">✓</span>
                    <h3>¡Te has suscrito!</h3>
                    <p>Recibirás el informe semanal en tu bandeja de entrada.</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`lead-capture ${variant}`}>
            <div className="lead-capture-content">
                <h3 className="lead-capture-title">{title}</h3>
                <p className="lead-capture-subtitle">{subtitle}</p>
                <form className="lead-capture-form" onSubmit={handleSubmit}>
                    <input
                        type="email"
                        placeholder="tu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="lead-capture-input"
                        required
                        disabled={status === 'loading'}
                    />
                    <button
                        type="submit"
                        className="lead-capture-btn"
                        disabled={status === 'loading'}
                    >
                        {status === 'loading' ? '...' : 'Suscribirme gratis'}
                    </button>
                </form>
                <p className="lead-capture-privacy">
                    🔒 Sin spam. Solo precios. Puedes darte de baja en cualquier momento.
                </p>
            </div>
        </div>
    );
}
