import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Breadcrumbs from '@/components/Breadcrumbs';
import locationsData from '@/data/locations.json';

const eur = (n: number) => (n > 0 ? n.toFixed(3).replace('.', ',') : '-');
const tc = (s: string) =>
    s.toLowerCase().replace(/(^|[\s(/-])([a-záéíóúñ])/g, (_, p, c) => p + c.toUpperCase());

export const metadata: Metadata = {
    title: 'Mapa de precios de la gasolina en España por provincia',
    description:
        'Mapa de precios de la gasolina 95 y el diésel en España por provincia. Compara de un vistazo dónde es más barato repostar hoy con datos oficiales del MITECO.',
    alternates: { canonical: 'https://gasolinabarata.org/mapa-precios-espana' },
    robots: { index: true, follow: true },
};

// Color por precio (verde barato → rojo caro) sobre el rango observado
function heat(price: number, min: number, max: number) {
    if (max <= min) return 'hsl(140 60% 22%)';
    const t = Math.min(1, Math.max(0, (price - min) / (max - min)));
    const hue = 140 - t * 140; // 140=verde, 0=rojo
    return `hsl(${hue} 55% 22%)`;
}

export default function MapaPreciosPage() {
    const data = locationsData as any;
    const provincias = [...data.locations]
        .filter((p: any) => p.precioMedioGasolina95 > 0)
        .sort((a: any, b: any) => a.precioMedioGasolina95 - b.precioMedioGasolina95);
    const min = provincias[0]?.precioMedioGasolina95 || 0;
    const max = provincias[provincias.length - 1]?.precioMedioGasolina95 || 0;

    const provinciasDiesel = [...data.locations]
        .filter((p: any) => p.precioMedioDiesel > 0)
        .sort((a: any, b: any) => a.precioMedioDiesel - b.precioMedioDiesel);
    const minD = provinciasDiesel[0]?.precioMedioDiesel || 0;
    const maxD = provinciasDiesel[provinciasDiesel.length - 1]?.precioMedioDiesel || 0;

    return (
        <div className="rg-landing">
            <Navbar />
            <header className="blog-hero" style={{ paddingBottom: '32px' }}>
                <div className="rg-container">
                    <Breadcrumbs
                        items={[
                            { name: 'Inicio', url: 'https://gasolinabarata.org' },
                            { name: 'Mapa de precios', url: 'https://gasolinabarata.org/mapa-precios-espana' },
                        ]}
                    />
                    <h1>Mapa de precios de la gasolina en <span className="green">España</span></h1>
                    <p className="blog-hero-sub">
                        Precio medio de la gasolina 95 por provincia, de la más barata (verde) a la más cara (rojo).
                        Datos oficiales del MITECO actualizados hoy.
                    </p>
                </div>
            </header>

            <main className="rg-container" style={{ paddingBottom: '80px', maxWidth: 1000, margin: '0 auto' }}>
                <p style={{ color: 'var(--rg-text-secondary)', lineHeight: 1.7, marginBottom: 24 }}>
                    El precio de la gasolina 95 va desde los <strong>{eur(min)}€/L</strong> de la provincia más
                    barata hasta los <strong>{eur(max)}€/L</strong> de la más cara: una diferencia de{' '}
                    <strong>{Math.round((max - min) * 100)} céntimos por litro</strong>. Pulsa una provincia para ver
                    sus localidades y gasolineras más baratas.
                </p>

                <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))' }}>
                    {provincias.map((p: any) => (
                        <Link
                            key={p.provincia}
                            href={`/precio-gasolina/${p.provincia}`}
                            style={{
                                background: heat(p.precioMedioGasolina95, min, max),
                                border: '1px solid var(--rg-border)',
                                borderRadius: 10,
                                padding: '14px 16px',
                                textDecoration: 'none',
                                color: '#eaf4f8',
                            }}
                        >
                            <span style={{ display: 'block', fontWeight: 700 }}>{tc(p.nombreProvincia)}</span>
                            <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>{eur(p.precioMedioGasolina95)}€</span>
                        </Link>
                    ))}
                </div>

                <h2 style={{ marginTop: 48 }}>Mapa de precios del diésel por provincia</h2>
                <p style={{ color: 'var(--rg-text-secondary)', lineHeight: 1.7, marginBottom: 24 }}>
                    El gasóleo A va desde los <strong>{eur(minD)}€/L</strong> de la provincia más barata hasta los{' '}
                    <strong>{eur(maxD)}€/L</strong> de la más cara: <strong>{Math.round((maxD - minD) * 100)} céntimos
                    por litro</strong> de diferencia. Pulsa una provincia para ver sus localidades.
                </p>

                <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))' }}>
                    {provinciasDiesel.map((p: any) => (
                        <Link
                            key={p.provincia}
                            href={`/precio-diesel/${p.provincia}`}
                            style={{
                                background: heat(p.precioMedioDiesel, minD, maxD),
                                border: '1px solid var(--rg-border)',
                                borderRadius: 10,
                                padding: '14px 16px',
                                textDecoration: 'none',
                                color: '#eaf4f8',
                            }}
                        >
                            <span style={{ display: 'block', fontWeight: 700 }}>{tc(p.nombreProvincia)}</span>
                            <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>{eur(p.precioMedioDiesel)}€</span>
                        </Link>
                    ))}
                </div>

                <p style={{ color: 'var(--rg-text-secondary)', marginTop: 32 }}>
                    ¿Quieres el mapa interactivo con las gasolineras cercanas? Entra en{' '}
                    <Link href="/cerca-de-mi">gasolineras cerca de mí</Link>.
                </p>
            </main>
        </div>
    );
}
