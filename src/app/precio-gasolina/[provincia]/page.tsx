import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import locationsData from '@/data/locations.json';
import AppDownloadCta from '@/components/AppDownloadCta';
import Breadcrumbs from '@/components/Breadcrumbs';
import SmartDownloadButton from '@/components/SmartDownloadButton';
import Navbar from '@/components/Navbar';

export async function generateMetadata(
    { params }: { params: Promise<{ provincia: string }> }
): Promise<Metadata> {
    const { provincia } = await params;
    const data = locationsData as any;
    const loc = data.locations.find((l: any) => l.provincia === provincia);
    if (!loc) return { title: 'No encontrado' };

    const title = `Gasolina barata en ${loc.nombreProvincia} hoy | Gasolineras más económicas`;
    const description = `Descubre dónde echar gasolina barata en la provincia de ${loc.nombreProvincia}. Compara precios de gasolina 95 y diésel hoy y ahorra en tu repostaje.`;

    return {
        title,
        description,
        alternates: { canonical: `https://gasolinabarata.org/precio-gasolina/${provincia}` },
        openGraph: {
            title,
            description,
            type: 'website',
            locale: 'es_ES',
            url: `https://gasolinabarata.org/precio-gasolina/${provincia}`,
            siteName: 'Gasolina Barata',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
        },
    };
}

export async function generateStaticParams() {
    const data = locationsData as any;
    return data.locations.map((loc: any) => ({
        provincia: loc.provincia,
    }));
}

export default async function ProvinciaPage({ params }: { params: Promise<{ provincia: string }> }) {
    const { provincia } = await params;
    const data = locationsData as any;
    const location = data.locations.find((l: any) => l.provincia === provincia);

    if (!location) {
        notFound();
    }

    return (
        <div className="rg-landing">
            <Navbar />

            <header className="blog-hero" style={{ paddingBottom: '32px' }}>
                <div className="rg-container">
                    <Breadcrumbs items={[
                        { name: 'Inicio', url: 'https://gasolinabarata.org' },
                        { name: `Gasolineras en ${location.nombreProvincia}`, url: `https://gasolinabarata.org/precio-gasolina/${provincia}` }
                    ]} />
                    <h1>Gasolina barata en <span className="green">{location.nombreProvincia}</span></h1>
                    <p className="blog-hero-sub">
                        Descubre las localidades y gasolineras más baratas para repostar hoy en {location.nombreProvincia}.
                        Ahorra al máximo en gasolina 95, 98 y Diésel en tu ruta.
                    </p>
                </div>
            </header>

            <main className="rg-container" style={{ paddingBottom: '80px' }}>
                <div style={{ display: 'grid', gap: '24px', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', marginBottom: '48px' }}>
                    <div style={{ background: 'var(--rg-surface)', border: '1px solid var(--rg-border)', borderRadius: 'var(--rg-radius)', padding: '24px', textAlign: 'center' }}>
                        <span style={{ display: 'block', color: 'var(--rg-text-secondary)', marginBottom: '8px' }}>Precio Medio Gasolina 95</span>
                        <span style={{ fontSize: '2rem', fontWeight: 800 }}>{location.precioMedioGasolina95}€/L</span>
                    </div>
                    <div style={{ background: 'var(--rg-surface)', border: '1px solid var(--rg-border)', borderRadius: 'var(--rg-radius)', padding: '24px', textAlign: 'center' }}>
                        <span style={{ display: 'block', color: 'var(--rg-text-secondary)', marginBottom: '8px' }}>Precio Medio Diésel</span>
                        <span style={{ fontSize: '2rem', fontWeight: 800 }}>{location.precioMedioDiesel}€/L</span>
                    </div>
                </div>

                <h2>Localidades en {location.nombreProvincia}</h2>
                <div className="blog-grid" style={{ marginTop: '24px' }}>
                    {location.localidades.map((loc: any) => (
                        <Link 
                            key={loc.slug} 
                            href={`/precio-gasolina/${provincia}/${loc.slug}`} 
                            style={{ 
                                background: 'rgba(255,255,255,0.03)', 
                                padding: '24px', 
                                border: '1px solid var(--rg-border)', 
                                borderRadius: 'var(--rg-radius-sm)',
                                textDecoration: 'none',
                                color: 'var(--rg-text)',
                                transition: 'all 0.2s',
                            }}
                        >
                            <h3 style={{ margin: '0 0 12px', fontSize: '1.2rem', color: 'var(--rg-primary)' }}>{loc.nombre}</h3>
                            <p style={{ margin: 0, color: 'var(--rg-text-secondary)', fontSize: '0.9rem' }}>Encontrar gasolina barata aquí →</p>
                        </Link>
                    ))}
                </div>

                <AppDownloadCta locationName={location.nombreProvincia} />
            </main>

            <footer className="rg-footer">
                <div className="rg-footer-inner">
                    <div className="rg-footer-bottom">
                        <span>© {new Date().getFullYear()} Gasolina Barata — Datos MITECO</span>
                        <span>Precios orientativos.</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
