import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import locationsData from '@/data/locations.json';
import AppDownloadCta from '@/components/AppDownloadCta';
import Breadcrumbs from '@/components/Breadcrumbs';
import SmartDownloadButton from '@/components/SmartDownloadButton';

export async function generateMetadata(
    { params }: { params: Promise<{ provincia: string }> }
): Promise<Metadata> {
    const { provincia } = await params;
    const loc = locationsData.locations.find((l: any) => l.provincia === provincia);
    if (!loc) return { title: 'No encontrado' };

    return {
        title: `Precio de la Gasolina en ${loc.nombreProvincia} Hoy | Gasolina Barata`,
        description: `Descubre las gasolineras más baratas y la evolución del precio de la gasolina y diésel en la provincia de ${loc.nombreProvincia}. Ahorra en cada repostaje con RadarGas.`,
        alternates: { canonical: `https://gasolinabarata.org/precio-gasolina/${provincia}` },
    };
}

export async function generateStaticParams() {
    return locationsData.locations.map((loc: any) => ({
        provincia: loc.provincia,
    }));
}

export default async function ProvinciaPage({ params }: { params: Promise<{ provincia: string }> }) {
    const { provincia } = await params;
    const location = locationsData.locations.find((l: any) => l.provincia === provincia);

    if (!location) {
        notFound();
    }

    return (
        <div className="rg-landing">
            <nav className="rg-navbar">
                <div className="rg-navbar-inner">
                    <Link href="/" className="rg-nav-logo">
                        💰 <span>Gasolina</span>Barata
                    </Link>
                    <div className="rg-nav-links">
                        <Link href="/">Inicio</Link>
                        <SmartDownloadButton variant="nav" className="rg-nav-cta" label="Mapa de Precios →" />
                    </div>
                </div>
            </nav>

            <header className="blog-hero" style={{ paddingBottom: '32px' }}>
                <div className="rg-container">
                    <Breadcrumbs items={[
                        { name: 'Inicio', url: 'https://gasolinabarata.org' },
                        { name: `Gasolineras en ${location.nombreProvincia}`, url: `https://gasolinabarata.org/precio-gasolina/${provincia}` }
                    ]} />
                    <h1>Precio Gasolina en <span className="green">{location.nombreProvincia}</span></h1>
                    <p className="blog-hero-sub">
                        Encuentra las localidades más baratas para repostar en {location.nombreProvincia}.
                        Ahorra en gasolina 95, 98 y Diésel.
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
                            <p style={{ margin: 0, color: 'var(--rg-text-secondary)', fontSize: '0.9rem' }}>Ver precio actualizado y gasolineras baratas →</p>
                        </Link>
                    ))}
                </div>

                <AppDownloadCta locationName={location.nombreProvincia} />
            </main>

            <footer className="rg-footer">
                <div className="rg-footer-inner">
                    <div className="rg-footer-bottom">
                        <span>© {new Date().getFullYear()} Gasolina Barata — Datos MITECO</span>
                        <span>Precios orientativos</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
