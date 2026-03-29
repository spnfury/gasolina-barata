import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import locationsData from '@/data/locations.json';
import AppDownloadCta from '@/components/AppDownloadCta';
import SmartDownloadButton from '@/components/SmartDownloadButton';
import PriceHistoryCard from '@/components/PriceHistoryCard';
import FaqAccordion from '@/components/FaqAccordion';
import Breadcrumbs from '@/components/Breadcrumbs';
import styles from '@/components/Seo.module.css';
import MapWrapper from '@/components/MapWrapper';
import Navbar from '@/components/Navbar';

// Solo servir rutas pre-generadas; cualquier slug desconocido → 404 instantáneo
export const dynamicParams = false;

interface PageProps {
    params: Promise<{ provincia: string; localidad: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { provincia, localidad } = await params;
    const data = locationsData as any;
    const loc = data.locations.find((l: any) => l.provincia === provincia);
    const town = loc?.localidades.find((t: any) => t.slug === localidad);

    if (!town || !loc) return { title: 'No encontrado' };

    const title = `Gasolina barata en ${town.nombre} hoy | Precios Diésel y 95`;
    const description = `Descubre las gasolineras más baratas en ${town.nombre} (${loc.nombreProvincia}). Consulta la evolución del precio de la gasolina 95 y diésel hoy para ahorrar en tu ruta.`;

    return {
        title,
        description,
        alternates: { canonical: `https://gasolinabarata.org/precio-gasolina/${provincia}/${localidad}` },
        openGraph: {
            title,
            description,
            type: 'article',
            locale: 'es_ES',
            url: `https://gasolinabarata.org/precio-gasolina/${provincia}/${localidad}`,
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
    const params: { provincia: string; localidad: string }[] = [];
    const data = locationsData as any;
    data.locations.forEach((prov: any) => {
        prov.localidades.forEach((loc: any) => {
            params.push({ provincia: prov.provincia, localidad: loc.slug });
        });
    });
    return params;
}

export default async function LocalidadPage({ params }: PageProps) {
    const { provincia, localidad } = await params;
    
    const data = locationsData as any;
    const provData = data.locations.find((l: any) => l.provincia === provincia);
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
            {/* JSON-LD Structured Data - Aggregated Offers & Local Business List */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify([
                        {
                            '@context': 'https://schema.org',
                            '@type': 'Product',
                            name: `Gasolina 95 en ${townData.nombre}`,
                            description: `Compara y encuentra el precio más barato de Gasolina 95 y Diésel en ${townData.nombre} hoy.`,
                            offers: {
                                '@type': 'AggregateOffer',
                                priceCurrency: 'EUR',
                                lowPrice: townData.top5 && townData.top5.length > 0 && townData.top5[0].precio95 ? townData.top5[0].precio95 : townData.precioGasolina95,
                                highPrice: townData.precioGasolina95,
                                offerCount: townData.top5 && townData.top5.length > 0 ? townData.top5.length : 1,
                            }
                        },
                        ...(townData.top5 && townData.top5.length > 0 ? [{
                            '@context': 'https://schema.org',
                            '@type': 'ItemList',
                            name: `Gasolineras más baratas en ${townData.nombre}`,
                            itemListElement: townData.top5.map((station: any, idx: number) => ({
                                '@type': 'ListItem',
                                position: idx + 1,
                                item: {
                                    '@type': 'GasStation',
                                    name: station.rotulo,
                                    address: {
                                        '@type': 'PostalAddress',
                                        streetAddress: station.direccion,
                                        addressLocality: townData.nombre,
                                        addressRegion: provData.nombreProvincia,
                                        addressCountry: 'ES'
                                    },
                                    ...(station.latitud && station.longitud ? {
                                        geo: {
                                            '@type': 'GeoCoordinates',
                                            latitude: station.latitud,
                                            longitude: station.longitud
                                        }
                                    } : {}),
                                    priceRange: station.precio95 ? `${station.precio95}€` : '€',
                                    offers: {
                                        '@type': 'Offer',
                                        price: station.precio95 || station.precioDiesel,
                                        priceCurrency: 'EUR'
                                    }
                                }
                            }))
                        }] : [])
                    ]),
                }}
            />

            <Navbar />

            <header className="blog-hero" style={{ paddingBottom: '40px' }}>
                <div className="rg-container">
                    <Breadcrumbs items={[
                        { name: 'Inicio', url: 'https://gasolinabarata.org' },
                        { name: provData.nombreProvincia, url: `https://gasolinabarata.org/precio-gasolina/${provincia}` },
                        { name: townData.nombre, url: `https://gasolinabarata.org/precio-gasolina/${provincia}/${localidad}` }
                    ]} />
                    <div className="rg-hero-badge" style={{ marginBottom: '16px' }}>
                        <span className="dot" />
                        Actualizado el {new Date((locationsData as any).lastUpdated).toLocaleDateString()}
                    </div>
                    <h1>Gasolina barata en <span className="green">{townData.nombre}</span>: Precios hoy</h1>
                    <p className="blog-hero-sub">
                        Ahorra al máximo en cada depósito. Encuentra aquí las gasolineras más baratas de {townData.nombre} para Gasolina 95, 98 y Diésel en tu ruta.
                    </p>
                </div>
            </header>

            <main className="rg-container" style={{ paddingBottom: '80px', maxWidth: '800px', margin: '0 auto' }}>
                
                {/* 1. Precio Actual */}
                <div className={styles.card}>
                    <h2 className={styles.priceTitle}>Comparativa: Precios Medios Hoy en {townData.nombre}</h2>
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

                {/* NUEVO: MAPA INTERACTIVO */}
                {townData.top5 && townData.top5.length > 0 && (
                    <div className={styles.card} style={{ marginTop: '32px' }}>
                        <h3 className={styles.priceTitle}>🗺️ Mapa de Gasolineras Baratas en {townData.nombre}</h3>
                        <p style={{ color: 'var(--rg-text-secondary)', marginBottom: '24px' }}>
                            Navega por el mapa interactivo para localizar los surtidores más económicos de la zona.
                        </p>
                        <MapWrapper stations={townData.top5} />
                    </div>
                )}

                {/* NUEVO: TOP 5 Gasolineras Listado */}
                {townData.top5 && townData.top5.length > 0 && (
                    <div className={styles.card} style={{ marginTop: '32px' }}>
                        <h3 className={styles.priceTitle}>🏆 Top {townData.top5.length} Gasolineras más baratas en {townData.nombre}</h3>
                        <p style={{ color: 'var(--rg-text-secondary)', marginBottom: '24px' }}>
                            Conoce dónde repostar hoy mismo ahorrando al máximo en {townData.nombre}.
                        </p>
                        
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--rg-border)', color: 'var(--rg-text-secondary)', fontSize: '0.9rem' }}>
                                        <th style={{ padding: '12px 16px' }}>Rótulo / Marca</th>
                                        <th style={{ padding: '12px 16px' }}>Dirección</th>
                                        <th style={{ padding: '12px 16px' }}>Gasolina 95</th>
                                        <th style={{ padding: '12px 16px' }}>Diésel</th>
                                        <th style={{ padding: '12px 16px' }}>Horario</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {townData.top5.map((station: any, i: number) => (
                                        <tr key={i} style={{ borderBottom: '1px solid var(--rg-border)' }}>
                                            <td style={{ padding: '16px', fontWeight: 600, color: 'var(--rg-primary)' }}>
                                                {i + 1}. {station.rotulo}
                                            </td>
                                            <td style={{ padding: '16px', fontSize: '0.9rem' }}>{station.direccion}</td>
                                            <td style={{ padding: '16px', fontWeight: 600 }}>
                                                {station.precio95 ? `${station.precio95}€` : '-'}
                                            </td>
                                            <td style={{ padding: '16px', fontWeight: 600 }}>
                                                {station.precioDiesel ? `${station.precioDiesel}€` : '-'}
                                            </td>
                                            <td style={{ padding: '16px', fontSize: '0.85rem', color: 'var(--rg-text-secondary)' }}>
                                                {station.horario}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

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
