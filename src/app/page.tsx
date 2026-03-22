import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import locationsData from '@/data/locations.json';
import SmartDownloadButton from '@/components/SmartDownloadButton';
import NewsSection from '@/components/NewsSection';
import NationalPriceChart from '@/components/NationalPriceChart';
import { fetchNews } from '@/lib/news';

export const metadata: Metadata = {
    title: 'Gasolina Barata — Directorio de Precios en España Hoy',
    description:
        'Directorio completo con los precios de gasolina y diésel actualizados hoy en todas las provincias y localidades de España. Usa RadarGas para ahorrar en cada depósito.',
    alternates: { canonical: 'https://gasolinabarata.org' },
    openGraph: {
        title: 'Gasolina Barata — Encuentra tu gasolinera más barata',
        description: 'Directorio completo de precios de surtidores de carburante en toda España.',
        type: 'website',
        locale: 'es_ES',
    },
};

export default async function Home() {
    const provincias = (locationsData as any).locations;
    const news = await fetchNews(6);
    const historicoNacional = (locationsData as any).historicoNacional || [];

    return (
        <div className="rg-landing">
            <nav className="rg-navbar">
                <div className="rg-navbar-inner">
                    <Link href="/" className="rg-nav-logo">
                        💰 <span>Gasolina</span>Barata
                    </Link>
                    <div className="rg-nav-links">
                        <Link href="/">Inicio</Link>
                        <a href="#noticias">Noticias</a>
                        <SmartDownloadButton variant="nav" className="rg-nav-cta" />
                    </div>
                </div>
            </nav>

            {/* SECCIÓN HERO - BUSCADOR / ACCIÓN PRINCIPAL */}
            <section className="blog-hero">
                <div className="rg-container">
                    <div className="rg-hero-badge">
                        <span className="dot" />
                        Millones de precios actualizados a diario
                    </div>
                    <h1>
                        El precio de la <span className="green">Gasolina en España</span>
                    </h1>
                    <p className="blog-hero-sub">
                        Selecciona tu provincia a continuación para descubrir las gasolineras más baratas de tu zona, o descarga nuestra App gratuita <strong>RadarGas</strong> para ver el mapa interactivo.
                    </p>
                    <div className="rg-hero-buttons" style={{ marginTop: '32px' }}>
                        <SmartDownloadButton variant="primary" label="🚀 Descargar RadarGas" />
                        <a href="#provincias" className="rg-btn secondary">
                            Ver Listado por Provincias
                        </a>
                    </div>
                </div>
            </section>

            {/* GRÁFICA NACIONAL DE EVOLUCIÓN DE PRECIOS */}
            <section style={{ padding: '60px 0', background: 'var(--rg-bg)' }}>
                <div className="rg-container">
                    <NationalPriceChart historico={historicoNacional} />
                </div>
            </section>

            {/* NOTICIAS SOBRE GASOLINA */}
            <NewsSection news={news} />

            {/* DIRECTORIO DE PROVINCIAS (INTERLINKING SILO) */}
            <section id="provincias" style={{ padding: '60px 0', background: 'var(--rg-bg-alt)' }}>
                <div className="rg-container">
                    <h2 style={{ fontSize: '2rem', fontWeight: 800, textAlign: 'center', marginBottom: '40px' }}>
                        ⛽ Consulta el precio por Provincia
                    </h2>
                    
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                        gap: '16px'
                    }}>
                        {provincias.map((prov: any) => (
                            <Link 
                                href={`/precio-gasolina/${prov.provincia}`} 
                                key={prov.provincia}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '16px 20px',
                                    background: 'var(--rg-surface)',
                                    border: '1px solid var(--rg-border)',
                                    borderRadius: '12px',
                                    textDecoration: 'none',
                                    color: 'var(--rg-text)',
                                    transition: 'all 0.2s',
                                    fontWeight: 600
                                }}
                            >
                                <span>{prov.nombreProvincia}</span>
                                <span style={{ color: 'var(--rg-primary)' }}>➔</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* SEMÁNTICA SEO Y CONVERSIÓN */}
            <section style={{ padding: '80px 0' }}>
                <div className="rg-container" style={{ maxWidth: '800px', margin: '0 auto', fontSize: '1.05rem', lineHeight: 1.8, color: 'var(--rg-text-secondary)' }}>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--rg-text)', marginBottom: '24px' }}>
                        ¿Por qué es importante comparar el precio de la gasolina hoy?
                    </h2>
                    <p style={{ marginBottom: '24px' }}>
                        En un escenario de fluctuación constante en el mercado energético, el precio del barril de Brent y los impuestos repercuten diariamente en el importe final del <strong>diésel y la gasolina 95 o 98</strong>. En Gasolina Barata hemos diseñado nuestra plataforma mediante algoritmos de inteligencia de datos extraídos al instante del MITECO, lo cual te permite identificar gasolineras low-cost cerca de ti para que puedas optimizar tu ruta diaria.
                    </p>
                    
                    <div style={{ background: 'linear-gradient(135deg, rgba(0, 230, 118, 0.1) 0%, rgba(0, 230, 118, 0.05) 100%)', borderLeft: '4px solid var(--rg-primary)', padding: '24px', borderRadius: '0 12px 12px 0', margin: '32px 0' }}>
                        <h3 style={{ fontSize: '1.3rem', color: 'var(--rg-primary)', margin: '0 0 12px' }}>Ahorro comprobado de hasta 250€ al año</h3>
                        <p style={{ margin: 0, color: 'var(--rg-text)' }}>
                            Nuestros usuarios recurrentes aseguran ahorrar decenas de euros en cada periodo vacacional simplemente evitando las estaciones premium en autopistas y acercándose a cooperativas o polígonos utilizando nuestra aplicación en tiempo real.
                        </p>
                    </div>

                    <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--rg-text)', marginBottom: '24px', marginTop: '48px' }}>
                        El ecosistema absoluto: RadarGas App
                    </h2>
                    <p style={{ marginBottom: '24px' }}>
                        Mientras que este portal web funciona de manera excepcional para revisar el precio por comunidad autónoma, el **verdadero poder reside en la App Móvil RadarGas**. Utiliza geolocalización avanzada en tiempo real, trazado de rutas GPS y favoritos para que el ahorro forme parte de tu conducción diaria de manera invisible.
                    </p>
                    <div style={{ textAlign: 'center', marginTop: '40px' }}>
                        <SmartDownloadButton variant="badge" />
                    </div>
                </div>
            </section>

            <footer className="rg-footer" style={{ marginTop: 'auto' }}>
                <div className="rg-footer-inner">
                    <div className="rg-footer-bottom">
                        <span>© {new Date().getFullYear()} Gasolina Barata (Marca RadarGas) — Datos MITECO</span>
                        <span>Precios orientativos.</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}

