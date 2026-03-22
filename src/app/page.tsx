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
            {/* JSON-LD WebSite + SearchAction */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'WebSite',
                        name: 'Gasolina Barata',
                        url: 'https://gasolinabarata.org',
                        description: 'Directorio completo con los precios de gasolina y diésel actualizados hoy en todas las provincias y localidades de España.',
                        potentialAction: {
                            '@type': 'SearchAction',
                            target: 'https://gasolinabarata.org/precio-gasolina/{search_term_string}',
                            'query-input': 'required name=search_term_string',
                        },
                    }),
                }}
            />
            <nav className="rg-navbar">
                <div className="rg-navbar-inner">
                    <Link href="/" className="rg-nav-logo">
                        ⛽ <span>Gasolina</span>Barata
                    </Link>
                    <div className="rg-nav-links">
                        <Link href="/">Inicio</Link>
                        <a href="#provincias">Provincias</a>
                        <a href="#noticias">Noticias</a>
                        <SmartDownloadButton variant="nav" className="rg-nav-cta" />
                    </div>
                </div>
            </nav>

            {/* SECCIÓN HERO */}
            <section className="blog-hero">
                <div className="rg-container">
                    <div className="rg-hero-badge">
                        <span className="dot" />
                        Precios actualizados a diario · Datos oficiales MITECO
                    </div>
                    <h1>
                        Encuentra la <span className="green">Gasolina más Barata</span> de España
                    </h1>
                    <p className="blog-hero-sub">
                        Compara precios de gasolina 95 y diésel en todas las provincias.
                        Descarga <strong>RadarGas</strong> para ver el mapa interactivo en tiempo real.
                    </p>
                    <div className="rg-hero-buttons" style={{ marginTop: '32px' }}>
                        <SmartDownloadButton variant="primary" label="🚀 Descargar RadarGas" />
                        <a href="#provincias" className="rg-btn secondary">
                            Ver por Provincias
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

            {/* DIRECTORIO DE PROVINCIAS */}
            <section id="provincias" style={{ padding: '80px 0', background: 'linear-gradient(180deg, var(--rg-bg-alt) 0%, var(--rg-bg) 100%)' }}>
                <div className="rg-container">
                    <div className="rg-section-title">
                        <h2>⛽ Consulta el precio por Provincia</h2>
                        <p>Selecciona tu provincia para ver las gasolineras más baratas cerca de ti.</p>
                    </div>
                    
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                        gap: '12px'
                    }}>
                        {provincias.map((prov: any) => (
                            <Link 
                                href={`/precio-gasolina/${prov.provincia}`} 
                                key={prov.provincia}
                                className="prov-card"
                            >
                                <span className="prov-card-name">Gasolina en {prov.nombreProvincia}</span>
                                <span className="prov-card-arrow">→</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* SEMÁNTICA SEO Y CONVERSIÓN */}
            <section className="seo-section">
                <div className="rg-container seo-content">
                    <h2>
                        ¿Por qué es importante comparar el precio de la gasolina hoy?
                    </h2>
                    <p>
                        En un escenario de fluctuación constante en el mercado energético, el precio del barril de Brent y los impuestos repercuten diariamente en el importe final del <strong>diésel y la gasolina 95 o 98</strong>. En Gasolina Barata hemos diseñado nuestra plataforma mediante algoritmos de inteligencia de datos extraídos al instante del MITECO, lo cual te permite identificar gasolineras low-cost cerca de ti para que puedas optimizar tu ruta diaria.
                    </p>
                    
                    <div className="seo-callout">
                        <h3>💰 Ahorro comprobado de hasta 250€ al año</h3>
                        <p>
                            Nuestros usuarios recurrentes aseguran ahorrar decenas de euros en cada periodo vacacional simplemente evitando las estaciones premium en autopistas y acercándose a cooperativas o polígonos utilizando nuestra aplicación en tiempo real.
                        </p>
                    </div>

                    <h2 style={{ marginTop: '48px' }}>
                        El ecosistema absoluto: RadarGas App
                    </h2>
                    <p>
                        Mientras que este portal web funciona de manera excepcional para revisar el precio por comunidad autónoma, el <strong>verdadero poder reside en la App Móvil RadarGas</strong>. Utiliza geolocalización avanzada en tiempo real, trazado de rutas GPS y favoritos para que el ahorro forme parte de tu conducción diaria de manera invisible.
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

