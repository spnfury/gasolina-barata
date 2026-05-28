import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import locationsData from '@/data/locations.json';
import SmartDownloadButton from '@/components/SmartDownloadButton';
import NewsSection from '@/components/NewsSection';
import NationalPriceChart from '@/components/NationalPriceChartLazy';
import Navbar from '@/components/Navbar';
import LeadCapture from '@/components/LeadCapture';
import { fetchNews } from '@/lib/news';

// ISR: regenerar como máximo 1 vez cada 24h → se sirve estática desde el CDN
export const revalidate = 86400;

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

const FAQS = [
    {
        question: '¿Cómo encuentro la gasolinera más barata cerca de mí hoy?',
        answer: 'Usa nuestro buscador por provincia o accede al apartado "Cerca de mí" para detectar tu ubicación y mostrar las estaciones con el precio de gasolina 95 y diésel más bajo a tu alrededor, actualizado a diario con datos del MITECO.',
    },
    {
        question: '¿Con qué frecuencia se actualizan los precios?',
        answer: 'Los precios se sincronizan cada día desde la API oficial del Ministerio para la Transición Ecológica (MITECO), que recoge la información declarada por más de 11.000 estaciones de servicio en España.',
    },
    {
        question: '¿Qué gasolineras son las más baratas en España?',
        answer: 'Las cadenas low-cost como Plenoil, Ballenoil, Petroprix y las cooperativas suelen ofrecer los precios más competitivos. Las estaciones de marcas tradicionales (Repsol, Cepsa, BP, Shell, Galp) suelen ser algo más caras pero ofrecen más servicios.',
    },
    {
        question: '¿Cuánto puedo ahorrar al año comparando precios?',
        answer: 'Un conductor medio que recorre 15.000 km al año puede ahorrar entre 150 y 300 € repostando siempre en las estaciones más baratas de su zona. Usa nuestra calculadora de ahorro para estimar tu caso.',
    },
    {
        question: '¿Por qué varían tanto los precios entre gasolineras?',
        answer: 'El precio final depende del coste del crudo Brent, los impuestos (IVA + Impuesto Especial sobre Hidrocarburos), los márgenes de la marca, la ubicación (autopista vs polígono) y el tipo de estación (low-cost vs servicio completo).',
    },
];

function formatLastUpdated(iso: string | undefined): string {
    if (!iso) return '';
    try {
        return new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
        return '';
    }
}

export default async function Home() {
    const provincias = (locationsData as any).locations;
    const news = await fetchNews(6);
    const historicoNacional = (locationsData as any).historicoNacional || [];
    const lastUpdated = formatLastUpdated((locationsData as any).lastUpdated);

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
            {/* JSON-LD FAQPage */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'FAQPage',
                        mainEntity: FAQS.map((f) => ({
                            '@type': 'Question',
                            name: f.question,
                            acceptedAnswer: { '@type': 'Answer', text: f.answer },
                        })),
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
                    {lastUpdated && (
                        <p style={{
                            textAlign: 'center',
                            color: 'var(--rg-text-secondary)',
                            fontSize: '0.9rem',
                            margin: '0 0 16px',
                        }}>
                            <strong>Última actualización:</strong> {lastUpdated} · Fuente oficial MITECO
                        </p>
                    )}
                    <NationalPriceChart historico={historicoNacional} />
                </div>
            </section>

            {/* HUBS INTERNOS — herramientas */}
            <section style={{ padding: '40px 0', background: 'var(--rg-bg-alt)' }}>
                <div className="rg-container">
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                        gap: '16px',
                    }}>
                        <Link href="/cerca-de-mi" className="rg-btn secondary" style={{ textAlign: 'center', padding: '20px' }}>
                            📍 Cerca de mí
                        </Link>
                        <Link href="/calculadora-ahorro" className="rg-btn secondary" style={{ textAlign: 'center', padding: '20px' }}>
                            🧮 Calculadora de ahorro
                        </Link>
                        <Link href="/blog" className="rg-btn secondary" style={{ textAlign: 'center', padding: '20px' }}>
                            📰 Blog y guías
                        </Link>
                    </div>
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

            {/* TOP MARCAS (SEO ENLAZADO INTERNO) */}
            <section style={{ padding: '80px 0 0', background: 'var(--rg-bg)' }}>
                <div className="rg-container">
                    <div className="rg-section-title" style={{ marginBottom: '24px' }}>
                        <h2>⛽ Busca por cadena de gasolineras</h2>
                        <p>Filtra fácilmente las estaciones de tu marca favorita (low-cost o tradicional).</p>
                    </div>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                        gap: '16px',
                        justifyContent: 'center',
                        textAlign: 'center'
                    }}>
                        {[
                            { name: 'Repsol', slug: 'repsol' },
                            { name: 'Cepsa', slug: 'cepsa' },
                            { name: 'Plenoil', slug: 'plenoil' },
                            { name: 'Ballenoil', slug: 'ballenoil' },
                            { name: 'Petroprix', slug: 'petroprix' },
                            { name: 'Galp', slug: 'galp' },
                            { name: 'BP', slug: 'bp' },
                            { name: 'Shell', slug: 'shell' }
                        ].map((brand) => (
                            <Link 
                                key={brand.slug}
                                href={`/marca/${brand.slug}`}
                                style={{
                                    background: 'var(--rg-surface)',
                                    border: `1px solid var(--rg-border)`,
                                    borderRadius: 'var(--rg-radius-sm)',
                                    padding: '20px 10px',
                                    color: 'var(--rg-text)',
                                    textDecoration: 'none',
                                    fontSize: '1.05rem',
                                    fontWeight: 700,
                                    transition: 'background 0.2s',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                                }}
                            >
                                {brand.name}
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

            {/* FAQ */}
            <section style={{ padding: '60px 0', background: 'var(--rg-bg-alt)' }}>
                <div className="rg-container" style={{ maxWidth: 820 }}>
                    <div className="rg-section-title" style={{ marginBottom: '24px' }}>
                        <h2>❓ Preguntas frecuentes</h2>
                    </div>
                    {FAQS.map((f, i) => (
                        <details key={i} style={{
                            background: 'var(--rg-surface)',
                            border: '1px solid var(--rg-border)',
                            borderRadius: 'var(--rg-radius-sm)',
                            padding: '16px 20px',
                            marginBottom: '12px',
                        }}>
                            <summary style={{ cursor: 'pointer', fontWeight: 600, fontSize: '1.05rem' }}>
                                {f.question}
                            </summary>
                            <p style={{ marginTop: '12px', color: 'var(--rg-text-secondary)', lineHeight: 1.6 }}>
                                {f.answer}
                            </p>
                        </details>
                    ))}
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

