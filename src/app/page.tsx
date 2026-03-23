import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import locationsData from '@/data/locations.json';
import SmartDownloadButton from '@/components/SmartDownloadButton';
import NewsSection from '@/components/NewsSection';
import NationalPriceChart from '@/components/NationalPriceChart';
import Navbar from '@/components/Navbar';
import LeadCapture from '@/components/LeadCapture';
import { fetchNews } from '@/lib/news';

export const metadata: Metadata = {
    title: 'Gasolina barata en España hoy | Encuentra tu gasolinera más económica',
    description:
        'Descubre dónde echar gasolina barata hoy. Directorio completo con los precios de gasolina 95 y diésel en todas las gasolineras de España para que ahorres en tu ruta.',
    alternates: { canonical: 'https://gasolinabarata.org' },
    openGraph: {
        title: 'Gasolina barata en España hoy | Encuentra la más cercana',
        description: 'Encuentra las gasolineras más baratas de España actualizadas hoy y ahorra en tu depósito.',
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
                        description: 'Descubre dónde echar gasolina barata hoy. Directorio completo con los precios de gasolina 95 y diésel en España.',
                        potentialAction: {
                            '@type': 'SearchAction',
                            target: 'https://gasolinabarata.org/precio-gasolina/{search_term_string}',
                            'query-input': 'required name=search_term_string',
                        },
                    }),
                }}
            />
            <Navbar />

            {/* SECCIÓN HERO */}
            <section className="blog-hero">
                <div className="rg-container">
                    <div className="rg-hero-badge">
                        <span className="dot" />
                        Precios actualizados a diario · Datos oficiales MITECO
                    </div>
                    <h1>
                        Encuentra la <span className="green">Gasolina más barata</span> cerca de ti hoy
                    </h1>
                    <p className="blog-hero-sub">
                        Descubre las gasolineras más económicas y compara precios de gasolina 95 y diésel en España.
                        Ahorra al máximo en tu ruta con nuestro directorio actualizado.
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
                        <h2>⛽ Encuentra gasolina barata por provincia</h2>
                        <p>Selecciona tu ruta o provincia para ver rápida y fácilmente las gasolineras más baratas hoy.</p>
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

            {/* CIUDADES PRINCIPALES (SEO ENLAZADO INTERNO) */}
            <section style={{ padding: '40px 0 80px', background: 'var(--rg-bg)' }}>
                <div className="rg-container">
                    <div className="rg-section-title" style={{ marginBottom: '24px' }}>
                        <h2>🏙️ Gasolina barata en las principales ciudades</h2>
                        <p>Accede directamente a los precios diarios de las localidades más buscadas.</p>
                    </div>
                    <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '12px',
                        justifyContent: 'center'
                    }}>
                        {[
                            { name: 'Madrid', prov: 'madrid', slug: 'madrid' },
                            { name: 'Barcelona', prov: 'barcelona', slug: 'barcelona' },
                            { name: 'Valencia', prov: 'valencia', slug: 'valencia' },
                            { name: 'Sevilla', prov: 'sevilla', slug: 'sevilla' },
                            { name: 'Zaragoza', prov: 'zaragoza', slug: 'zaragoza' },
                            { name: 'Málaga', prov: 'malaga', slug: 'malaga' },
                            { name: 'Murcia', prov: 'murcia', slug: 'murcia' },
                            { name: 'Palma', prov: 'illes-balears', slug: 'palma' },
                            { name: 'Bilbao', prov: 'bizkaia', slug: 'bilbao' },
                            { name: 'Alicante', prov: 'alicante', slug: 'alicantealacant' },
                            { name: 'Córdoba', prov: 'cordoba', slug: 'cordoba' },
                            { name: 'Valladolid', prov: 'valladolid', slug: 'valladolid' },
                            { name: 'Vigo', prov: 'pontevedra', slug: 'vigo' },
                            { name: 'L\'Hospitalet', prov: 'barcelona', slug: 'hospitalet-de-llobregat-l' }
                        ].map((city) => (
                            <Link 
                                key={city.slug}
                                href={`/precio-gasolina/${city.prov}/${city.slug}`}
                                style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid var(--rg-border)',
                                    borderRadius: '20px',
                                    padding: '10px 20px',
                                    color: 'var(--rg-text)',
                                    textDecoration: 'none',
                                    fontSize: '0.95rem',
                                    transition: 'all 0.2s',
                                    fontWeight: 500
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'var(--rg-primary)';
                                    e.currentTarget.style.color = 'var(--rg-bg)';
                                    e.currentTarget.style.borderColor = 'var(--rg-primary)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                                    e.currentTarget.style.color = 'var(--rg-text)';
                                    e.currentTarget.style.borderColor = 'var(--rg-border)';
                                }}
                            >
                                {city.name}
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

