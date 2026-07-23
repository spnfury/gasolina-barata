import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Breadcrumbs from '@/components/Breadcrumbs';
import locationsData from '@/data/locations.json';

const eur = (n: number) => (n > 0 ? n.toFixed(3).replace('.', ',') : '-');
const tc = (s: string) =>
    s.toLowerCase().replace(/(^|[\s(/-])([a-záéíóúñ])/g, (_, p, c) => p + c.toUpperCase());

function nationalToday() {
    const h = ((locationsData as any).historicoNacional || []) as any[];
    return h.length ? h[h.length - 1] : { precioGasolina95: 0, precioDiesel: 0 };
}

export const metadata: Metadata = {
    title: 'Precio de la gasolina hoy en España: 95 y diésel actualizado',
    description: `Precio medio de la gasolina 95 y el diésel hoy en España, actualizado con datos oficiales del MITECO. Consulta las provincias más baratas y caras para repostar.`,
    alternates: { canonical: 'https://gasolinabarata.org/precio-gasolina-hoy' },
    robots: { index: true, follow: true },
};

export default function PrecioHoyPage() {
    const data = locationsData as any;
    const nat = nationalToday();
    const provincias = [...data.locations]
        .filter((p: any) => p.precioMedioGasolina95 > 0)
        .sort((a: any, b: any) => a.precioMedioGasolina95 - b.precioMedioGasolina95);
    const baratas = provincias.slice(0, 5);
    const caras = provincias.slice(-5).reverse();

    return (
        <div className="rg-landing">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'Product',
                        name: 'Precio de la gasolina 95 hoy en España',
                        offers: {
                            '@type': 'AggregateOffer',
                            priceCurrency: 'EUR',
                            lowPrice: baratas[0]?.precioMedioGasolina95,
                            highPrice: caras[0]?.precioMedioGasolina95,
                            offerCount: provincias.length,
                        },
                    }),
                }}
            />
            <Navbar />
            <header className="blog-hero" style={{ paddingBottom: '32px' }}>
                <div className="rg-container">
                    <Breadcrumbs
                        items={[
                            { name: 'Inicio', url: 'https://gasolinabarata.org' },
                            { name: 'Precio gasolina hoy', url: 'https://gasolinabarata.org/precio-gasolina-hoy' },
                        ]}
                    />
                    <h1>Precio de la gasolina <span className="green">hoy</span> en España</h1>
                    <p className="blog-hero-sub">
                        Media nacional actualizada con datos oficiales del MITECO, el {new Date(nat.date || Date.parse(data.lastUpdated)).toLocaleDateString('es-ES')}.
                    </p>
                </div>
            </header>

            <main className="rg-container" style={{ paddingBottom: '80px', maxWidth: 900, margin: '0 auto' }}>
                <div style={{ display: 'grid', gap: 20, gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', marginBottom: 40 }}>
                    <Stat label="Gasolina 95 (media España)" value={`${eur(nat.precioGasolina95)}€/L`} big />
                    <Stat label="Diésel (media España)" value={`${eur(nat.precioDiesel)}€/L`} big />
                </div>

                <p style={{ color: 'var(--rg-text-secondary)', lineHeight: 1.7, marginBottom: 40 }}>
                    Hoy, la gasolina 95 tiene un precio medio de <strong>{eur(nat.precioGasolina95)}€/L</strong> y el
                    diésel de <strong>{eur(nat.precioDiesel)}€/L</strong> en España. El precio varía según la
                    provincia: repostar en la más barata frente a la más cara puede suponer más de{' '}
                    {baratas[0] && caras[0]
                        ? `${Math.round((caras[0].precioMedioGasolina95 - baratas[0].precioMedioGasolina95) * 100)} céntimos`
                        : 'varios céntimos'}{' '}
                    por litro. Consulta el detalle por provincia y localidad para encontrar la gasolinera más
                    económica cerca de ti.
                </p>

                <div style={{ display: 'grid', gap: 32, gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))' }}>
                    <RankCard title="Provincias más baratas hoy" rows={baratas} />
                    <RankCard title="Provincias más caras hoy" rows={caras} />
                </div>

                <h2 style={{ marginTop: 48 }}>Todas las provincias</h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 16 }}>
                    {provincias.map((p: any) => (
                        <Link key={p.provincia} href={`/precio-gasolina/${p.provincia}`} className="rg-btn secondary" style={{ padding: '8px 14px', fontSize: '.88rem' }}>
                            {tc(p.nombreProvincia)}: {eur(p.precioMedioGasolina95)}€
                        </Link>
                    ))}
                </div>
            </main>
        </div>
    );
}

function Stat({ label, value, big }: { label: string; value: string; big?: boolean }) {
    return (
        <div style={{ background: 'var(--rg-surface)', border: '1px solid var(--rg-border)', borderRadius: 'var(--rg-radius)', padding: '24px', textAlign: 'center' }}>
            <span style={{ display: 'block', color: 'var(--rg-text-secondary)', marginBottom: 8 }}>{label}</span>
            <span style={{ fontSize: big ? '2.2rem' : '1.5rem', fontWeight: 800, color: 'var(--rg-primary)' }}>{value}</span>
        </div>
    );
}

function RankCard({ title, rows }: { title: string; rows: any[] }) {
    return (
        <div style={{ background: 'var(--rg-surface)', border: '1px solid var(--rg-border)', borderRadius: 'var(--rg-radius)', padding: '20px 22px' }}>
            <h3 style={{ marginTop: 0 }}>{title}</h3>
            <ol style={{ margin: 0, paddingLeft: 18, color: 'var(--rg-text-secondary)', lineHeight: 2 }}>
                {rows.map((p: any) => (
                    <li key={p.provincia}>
                        <Link href={`/precio-gasolina/${p.provincia}`}>{tc(p.nombreProvincia)}</Link>: {eur(p.precioMedioGasolina95)}€/L
                    </li>
                ))}
            </ol>
        </div>
    );
}
