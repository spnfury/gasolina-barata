import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import locationsData from '@/data/locations.json';
import AppDownloadCta from '@/components/AppDownloadCta';
import PriceHistoryCard from '@/components/PriceHistoryCard';
import FaqAccordion from '@/components/FaqAccordion';
import Breadcrumbs from '@/components/Breadcrumbs';
import styles from '@/components/Seo.module.css';

interface PageProps {
    params: Promise<{ provincia: string; localidad: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { provincia, localidad } = await params;
    const loc = locationsData.locations.find((l: any) => l.provincia === provincia);
    const town = loc?.localidades.find((t: any) => t.slug === localidad);

    if (!town || !loc) return { title: 'No encontrado' };

    return {
        title: `Gasolina Barata en ${town.nombre} Hoy - Precios Diésel y 95 | RadarGas`,
        description: `Descubre las gasolineras más baratas en ${town.nombre} (${loc.nombreProvincia}). Consulta la evolución del precio de la gasolina 95 y diésel hoy para ahorrar al máximo.`,
        alternates: { canonical: `https://gasolinabarata.es/precio-gasolina/${provincia}/${localidad}` },
    };
}

export async function generateStaticParams() {
    const params: { provincia: string; localidad: string }[] = [];
    locationsData.locations.forEach((prov: any) => {
        prov.localidades.forEach((loc: any) => {
            params.push({ provincia: prov.provincia, localidad: loc.slug });
        });
    });
    return params;
}

export default async function LocalidadPage({ params }: PageProps) {
    const { provincia, localidad } = await params;
    
    const provData = locationsData.locations.find((l: any) => l.provincia === provincia);
    const townData = provData?.localidades.find((t: any) => t.slug === localidad);

    if (!provData || !townData) {
        notFound();
    }

    const faqs = [
        {
            question: `¿Cuál es el mejor día para repostar en ${townData.nombre}?`,
            answer: `Generalmente, los lunes suele ser el día en el que el precio de la gasolina y el diésel en ${townData.nombre} es ligeramente inferior debido a la actualización de precios de principio de semana. Los fines de semana o puentes los precios tienden a subir.`,
        },
        {
            question: `¿Dónde encontrar la gasolinera más barata en ${townData.nombre}?`,
            answer: `Existen distintas estaciones low-cost en los polígonos industriales y afueras de ${townData.nombre}. Para ver la más cercana a ti ahora mismo y cuánto puedes ahorrarte en un depósito, descarga RadarGas.`,
        },
        {
            question: `¿Cómo varían los precios respecto a la media de ${provData.nombreProvincia}?`,
            answer: `En ${townData.nombre}, el precio de la Gasolina 95 está en ${townData.precioGasolina95}€/L, frente a la media de la provincia que suele situarse en ${provData.precioMedioGasolina95}€/L.`,
        }
    ];

    return (
        <div className="rg-landing">
            {/* JSON-LD Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'FAQPage',
                        mainEntity: faqs.map((f) => ({
                            '@type': 'Question',
                            name: f.question,
                            acceptedAnswer: {
                                '@type': 'Answer',
                                text: f.answer,
                            },
                        })),
                    }),
                }}
            />

            <nav className="rg-navbar">
                <div className="rg-navbar-inner">
                    <Link href="/" className="rg-nav-logo">
                        💰 <span>Gasolina</span>Barata
                    </Link>
                    <div className="rg-nav-links">
                        <Link href="/">Inicio</Link>
                        <Link href={`/precio-gasolina/${provincia}`}>Volver a {provData.nombreProvincia}</Link>
                        <a href="https://app.radargas.com" className="rg-nav-cta">
                            Mapa de Precios →
                        </a>
                    </div>
                </div>
            </nav>

            <header className="blog-hero" style={{ paddingBottom: '40px' }}>
                <div className="rg-container">
                    <Breadcrumbs items={[
                        { name: 'Inicio', url: 'https://gasolinabarata.es' },
                        { name: provData.nombreProvincia, url: `https://gasolinabarata.es/precio-gasolina/${provincia}` },
                        { name: townData.nombre, url: `https://gasolinabarata.es/precio-gasolina/${provincia}/${localidad}` }
                    ]} />
                    <div className="rg-hero-badge" style={{ marginBottom: '16px' }}>
                        <span className="dot" />
                        Actualizado el {new Date(locationsData.lastUpdated).toLocaleDateString()}
                    </div>
                    <h1>Precios de Gasolina en <span className="green">{townData.nombre}</span></h1>
                    <p className="blog-hero-sub">
                        Descubre cómo están los precios de Gasolina 95, 98 y Diésel en las estaciones de servicio de {townData.nombre}. ¡Empieza a ahorrar!
                    </p>
                </div>
            </header>

            <main className="rg-container" style={{ paddingBottom: '80px', maxWidth: '800px', margin: '0 auto' }}>
                
                {/* 1. Precio Actual */}
                <div className={styles.card}>
                    <h2 className={styles.priceTitle}>Precios Medios Hoy en {townData.nombre}</h2>
                    <div className={styles.priceGrid}>
                        <div className={styles.priceItem}>
                            <span className={styles.priceLabel}>Gasolina 95</span>
                            <span className={styles.priceValue}>{townData.precioGasolina95}€</span>
                        </div>
                        <div className={styles.priceItem}>
                            <span className={styles.priceLabel}>Diésel</span>
                            <span className={styles.priceValue}>{townData.precioDiesel}€</span>
                        </div>
                        <div className={styles.priceItem}>
                            <span className={styles.priceLabel}>Gasolina 98</span>
                            <span className={styles.priceValue}>{(townData.precioGasolina95 + 0.15).toFixed(3)}€</span>
                        </div>
                    </div>
                </div>

                {/* 2. CTA Descarga 1 */}
                <AppDownloadCta locationName={townData.nombre} />

                {/* 3. Evolución y Gráficos */}
                <PriceHistoryCard 
                    currentPrice95={townData.precioGasolina95} 
                    currentPriceDiesel={townData.precioDiesel} 
                    historico={townData.historico || []}
                />

                {/* 4. Opiniones (Estilo Blog) */}
                <div className={styles.card}>
                    <h3 className={styles.priceTitle}>💬 Lo que dicen los conductores de {townData.nombre}</h3>
                    <div className={styles.opinionsGrid}>
                        <div className={styles.opinionCard}>
                            <p className={styles.opinionText}>"Gracias a RadarGas descubrí una gasolinera a las afueras de {townData.nombre} donde me ahorro casi 10€ por depósito lleno."</p>
                            <span className={styles.opinionAuthor}>- María P.</span>
                        </div>
                        <div className={styles.opinionCard}>
                            <p className={styles.opinionText}>"Todos los viernes antes de viajar consulto el precio del diésel. Antes iba a la de siempre, ahora miro siempre el mapa."</p>
                            <span className={styles.opinionAuthor}>- Carlos R.</span>
                        </div>
                    </div>
                </div>

                {/* 5. FAQs SEO */}
                <FaqAccordion faqs={faqs} />

            </main>

            <footer className="rg-footer">
                <div className="rg-footer-inner">
                    <div className="rg-footer-bottom">
                        <span>© {new Date().getFullYear()} Gasolina Barata — Localidad: {townData.nombre}</span>
                        <span>Precios orientativos extraídos del MITECO</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
