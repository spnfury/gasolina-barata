import React from 'react';

/**
 * Bloque de ofertas afiliadas (monetización principal — CPA conductores).
 *
 * URLs por env (NEXT_PUBLIC_AFF_*). Si una oferta no tiene URL configurada,
 * NO se renderiza → seguro desplegar sin IDs; se enciende al añadir la env.
 *
 * Configurar en /var/lib/jenkins/.gasolinabarata.env (build) y .env.local:
 *   NEXT_PUBLIC_AFF_SEGURO_URL=https://...        (comparador seguro coche)
 *   NEXT_PUBLIC_AFF_TARJETA_URL=https://...        (tarjeta descuento combustible)
 */

interface Offer {
    key: string;
    url?: string;
    icon: string;
    title: string;
    desc: string;
    cta: string;
}

interface AffiliateCtaProps {
    /** Nombre de localidad/provincia para contextualizar (sube CTR). */
    place?: string;
}

export default function AffiliateCta({ place }: AffiliateCtaProps) {
    const donde = place ? ` en ${place}` : '';

    const offers: Offer[] = [
        {
            key: 'seguro',
            url: process.env.NEXT_PUBLIC_AFF_SEGURO_URL,
            icon: '🚗',
            title: 'Compara tu seguro de coche',
            desc: `Ahorra hasta 300€/año. Comparativa gratis en 2 minutos.`,
            cta: 'Comparar gratis',
        },
        {
            key: 'tarjeta',
            url: process.env.NEXT_PUBLIC_AFF_TARJETA_URL,
            icon: '⛽',
            title: `Tarjeta de descuento en combustible`,
            desc: `Hasta 10 cént/L extra en cada repostaje${donde}. Alta gratuita.`,
            cta: 'Ver tarjetas',
        },
    ];

    const active = offers.filter((o) => o.url);
    if (active.length === 0) return null;

    return (
        <section
            aria-label="Ofertas para ahorrar más"
            style={{
                display: 'grid',
                gap: 16,
                gridTemplateColumns: `repeat(auto-fit, minmax(260px, 1fr))`,
                margin: '32px 0',
            }}
        >
            {active.map((o) => (
                <a
                    key={o.key}
                    href={o.url}
                    target="_blank"
                    rel="sponsored nofollow noopener"
                    className="aff-cta"
                    style={{
                        display: 'block',
                        padding: '20px 22px',
                        borderRadius: 14,
                        background: 'linear-gradient(135deg,#12303f 0%,#0f2533 100%)',
                        border: '1px solid #1c4a5e',
                        textDecoration: 'none',
                        color: '#eaf4f8',
                    }}
                >
                    <div style={{ fontSize: '1.6rem', marginBottom: 6 }}>{o.icon}</div>
                    <h3 style={{ margin: '0 0 6px', fontSize: '1.05rem', fontWeight: 700 }}>{o.title}</h3>
                    <p style={{ margin: '0 0 14px', fontSize: '.9rem', color: '#a9c7d4', lineHeight: 1.4 }}>
                        {o.desc}
                    </p>
                    <span
                        style={{
                            display: 'inline-block',
                            background: '#2ec26a',
                            color: '#05231a',
                            fontWeight: 700,
                            fontSize: '.9rem',
                            padding: '9px 18px',
                            borderRadius: 999,
                        }}
                    >
                        {o.cta} →
                    </span>
                </a>
            ))}
        </section>
    );
}
