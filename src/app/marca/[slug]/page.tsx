import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import locationsData from '@/data/locations.json';
import Navbar from '@/components/Navbar';
import Breadcrumbs from '@/components/Breadcrumbs';
import SmartDownloadButton from '@/components/SmartDownloadButton';

const SUPPORTED_BRANDS = [
    { slug: 'repsol', name: 'Repsol', aliases: ['REPSOL'] },
    { slug: 'cepsa', name: 'Cepsa', aliases: ['CEPSA', 'MOEVE'] },
    { slug: 'galp', name: 'Galp', aliases: ['GALP'] },
    { slug: 'bp', name: 'BP', aliases: ['BP'] },
    { slug: 'plenoil', name: 'Plenoil', aliases: ['PLENOIL', 'PLENERGY'] },
    { slug: 'ballenoil', name: 'Ballenoil', aliases: ['BALLENOIL'] },
    { slug: 'shell', name: 'Shell', aliases: ['SHELL'] },
    { slug: 'petroprix', name: 'Petroprix', aliases: ['PETROPRIX'] }
];

export async function generateMetadata(
    { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
    const { slug } = await params;
    const brand = SUPPORTED_BRANDS.find(b => b.slug === slug);
    if (!brand) return { title: 'No encontrado' };

    const title = `Gasolina barata en ${brand.name} hoy | Precios y gasolineras más económicas`;
    const description = `Descubre cuáles son las gasolineras ${brand.name} más baratas de España hoy. Compara precios del diésel y la gasolina 95 y ahorra en tu ruta preferida.`;

    return {
        title,
        description,
        alternates: { canonical: `https://gasolinabarata.org/marca/${slug}` },
        openGraph: {
            title,
            description,
            type: 'website',
            locale: 'es_ES',
            url: `https://gasolinabarata.org/marca/${slug}`,
            siteName: 'Gasolina Barata',
        },
    };
}

export async function generateStaticParams() {
    return SUPPORTED_BRANDS.map((b) => ({
        slug: b.slug,
    }));
}

export default async function BrandPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const brand = SUPPORTED_BRANDS.find(b => b.slug === slug);
    
    if (!brand) {
        notFound();
    }

    const data = locationsData as any;
    const brandStations: any[] = [];

    // Recolectar todas las estaciones de esta marca que están en los top5
    data.locations.forEach((prov: any) => {
        prov.localidades.forEach((loc: any) => {
            if (loc.top5) {
                loc.top5.forEach((st: any) => {
                    const rotulo = (st.rotulo || '').toUpperCase();
                    if (brand.aliases.some(alias => rotulo.includes(alias))) {
                        brandStations.push({
                            ...st,
                            localidad: loc.nombre,
                            provincia: prov.nombreProvincia,
                            provSlug: prov.provincia,
                            locSlug: loc.slug
                        });
                    }
                });
            }
        });
    });

    const dedupedMap = new Map();
    for (const st of brandStations) {
        const key = `${st.rotulo}-${st.localidad}`;
        if (!dedupedMap.has(key)) {
            dedupedMap.set(key, st);
        }
    }
    
    const uniqueStations = Array.from(dedupedMap.values());
    
    // Sort by precio95 ascending
    const topCheapest = [...uniqueStations]
        .filter(st => st.precio95 && st.precio95 > 0)
        .sort((a, b) => a.precio95 - b.precio95)
        .slice(0, 15);

    return (
        <div className="rg-landing">
            <Navbar />

            <header className="blog-hero" style={{ paddingBottom: '32px' }}>
                <div className="rg-container">
                    <Breadcrumbs items={[
                        { name: 'Inicio', url: 'https://gasolinabarata.org' },
                        { name: `Gasolineras ${brand.name}`, url: `https://gasolinabarata.org/marca/${slug}` }
                    ]} />
                    <h1>Gasolina barata en <span className="green">{brand.name}</span> hoy</h1>
                    <p className="blog-hero-sub">
                        Descubre cuáles son las estaciones de servicio <strong>{brand.name}</strong> más baratas de España. 
                        Ahorra al máximo en tu surtidor favorito sin dar rodeos.
                    </p>
                </div>
            </header>

            <main className="rg-container" style={{ paddingBottom: '80px', minHeight: '60vh' }}>
                
                <div style={{ marginBottom: '48px', textAlign: 'center' }}>
                    <div style={{ background: 'var(--rg-surface)', border: '1px solid var(--rg-border)', borderRadius: 'var(--rg-radius)', padding: '24px', display: 'inline-block' }}>
                        <h2 style={{ fontSize: '2.5rem', margin: '0 0 8px', color: 'var(--rg-primary)' }}>{uniqueStations.length}</h2>
                        <span style={{ color: 'var(--rg-text-secondary)' }}>Gasolineras {brand.name} low-cost y premium encontradas</span>
                    </div>
                </div>

                <h2>Las 15 gasolineras {brand.name} más económicas de España</h2>
                <p style={{ color: 'var(--rg-text-secondary)', marginBottom: '32px' }}>
                    Esta lista se actualiza a diario con los precios oficiales. Mostramos las opciones más bajas registradas hoy en toda la red de {brand.name}.
                </p>

                {topCheapest.length > 0 ? (
                    <div style={{ overflowX: 'auto', background: 'var(--rg-surface)', borderRadius: 'var(--rg-radius)', border: '1px solid var(--rg-border)', marginBottom: '48px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--rg-border)', color: 'var(--rg-text-secondary)', fontSize: '0.9rem', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                                    <th style={{ padding: '16px' }}>#</th>
                                    <th style={{ padding: '16px' }}>Gasolinera</th>
                                    <th style={{ padding: '16px' }}>Ubicación</th>
                                    <th style={{ padding: '16px' }}>Gasolina 95</th>
                                    <th style={{ padding: '16px' }}>Diésel</th>
                                    <th style={{ padding: '16px' }}>Comparar Localidad</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topCheapest.map((st, i) => (
                                    <tr key={i} style={{ borderBottom: i === topCheapest.length - 1 ? 'none' : '1px solid var(--rg-border)', transition: 'background 0.2s' }}>
                                        <td style={{ padding: '16px', fontWeight: 600, color: 'var(--rg-text-secondary)' }}>
                                            {i + 1}
                                        </td>
                                        <td style={{ padding: '16px', fontWeight: 700, color: 'var(--rg-text)' }}>
                                            {st.rotulo.replace('Nº', 'Nº ')}
                                        </td>
                                        <td style={{ padding: '16px', fontSize: '0.85rem' }}>
                                            <span style={{ display: 'block', fontWeight: 600, color: 'var(--rg-primary)' }}>{st.localidad} ({st.provincia})</span>
                                            <span style={{ color: 'var(--rg-text-secondary)' }}>{st.direccion}</span>
                                        </td>
                                        <td style={{ padding: '16px', fontWeight: 800, fontSize: '1.2rem', color: 'var(--rg-primary)' }}>
                                            {st.precio95 ? `${st.precio95}€` : '-'}
                                        </td>
                                        <td style={{ padding: '16px', fontWeight: 800, fontSize: '1.2rem' }}>
                                            {st.precioDiesel ? `${st.precioDiesel}€` : '-'}
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <Link 
                                                href={`/precio-gasolina/${st.provSlug}/${st.locSlug}`}
                                                className="rg-btn secondary"
                                                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                                            >
                                                Ver resto
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div style={{ padding: '40px', background: 'var(--rg-surface)', borderRadius: 'var(--rg-radius)', border: '1px solid var(--rg-border)', textAlign: 'center', marginBottom: '48px' }}>
                        <p style={{ color: 'var(--rg-text-secondary)' }}>No se encontraron gasolineras para esta marca hoy.</p>
                    </div>
                )}

                <div style={{ textAlign: 'center', background: 'var(--rg-bg-alt)', padding: '40px 20px', borderRadius: 'var(--rg-radius)', border: '1px solid var(--rg-border)' }}>
                    <h3 style={{ marginBottom: '16px' }}>¿Buscas un {brand.name} cerca de ti?</h3>
                    <p style={{ color: 'var(--rg-text-secondary)', marginBottom: '24px' }}>
                        Usa nuestra herramienta inteligente de geolocalización web o directamente nuestra aplicación iOS y Android para encontrar tu surtidor más cercano en ruta.
                    </p>
                    <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}>
                        <Link href="/cerca-de-mi" className="rg-btn secondary">
                            Activar "Cerca de mí" 📍
                        </Link>
                        <span style={{ color: 'var(--rg-text-secondary)' }}>o</span>
                        <SmartDownloadButton variant="primary" />
                    </div>
                </div>

            </main>

            <footer className="rg-footer">
                <div className="rg-footer-inner">
                    <div className="rg-footer-bottom">
                        <span>© {new Date().getFullYear()} Gasolina Barata — Directorio de Marcas</span>
                        <span>Precios orientativos extraídos del MITECO.</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
