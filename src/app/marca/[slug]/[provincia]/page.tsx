import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import locationsData from '@/data/locations.json';
import Navbar from '@/components/Navbar';
import Breadcrumbs from '@/components/Breadcrumbs';
import AffiliateCta from '@/components/AffiliateCta';
import SmartDownloadButton from '@/components/SmartDownloadButton';
import { getBrand, collectBrandStations, brandProvinces, SUPPORTED_BRANDS } from '@/lib/brands';

export const dynamicParams = false;

interface PageProps {
    params: Promise<{ slug: string; provincia: string }>;
}

const tc = (s: string) =>
    s.toLowerCase().replace(/(^|[\s(/-])([a-záéíóúñ])/g, (_, p, c) => p + c.toUpperCase());
const fmt = (n: number | null) => (n && n > 0 ? n.toFixed(3).replace('.', ',') : null);

function provinceName(provSlug: string): string | null {
    const prov = (locationsData as any).locations.find((p: any) => p.provincia === provSlug);
    return prov ? prov.nombreProvincia : null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug, provincia } = await params;
    const brand = getBrand(slug);
    const provNombre = provinceName(provincia);
    if (!brand || !provNombre) return { title: 'No encontrado' };

    const prov = tc(provNombre);
    const stations = collectBrandStations(locationsData as any, brand, provincia);
    const cheapest = stations
        .map((s) => s.precio95)
        .filter((p): p is number => p != null && p > 0)
        .sort((a, b) => a - b)[0];
    const cheapStr = fmt(cheapest ?? null);

    const title = cheapStr
        ? `Gasolineras ${brand.name} baratas en ${prov}: desde ${cheapStr}€/L`
        : `Gasolineras ${brand.name} baratas en ${prov} hoy`;
    const description = cheapStr
        ? `Las gasolineras ${brand.name} más baratas de ${prov}, desde ${cheapStr}€/L en gasolina 95. Precios oficiales actualizados hoy. Compara y ahorra.`
        : `Precios de las gasolineras ${brand.name} en ${prov}. Compara gasolina 95 y diésel hoy y encuentra la más barata cerca de ti.`;

    return {
        title,
        description,
        alternates: { canonical: `https://gasolinabarata.org/marca/${slug}/${provincia}` },
        openGraph: {
            title,
            description,
            type: 'website',
            locale: 'es_ES',
            url: `https://gasolinabarata.org/marca/${slug}/${provincia}`,
            siteName: 'Gasolina Barata',
        },
    };
}

export async function generateStaticParams() {
    const params: { slug: string; provincia: string }[] = [];
    SUPPORTED_BRANDS.forEach((brand) => {
        brandProvinces(locationsData as any, brand, 2).forEach((p) => {
            params.push({ slug: brand.slug, provincia: p.slug });
        });
    });
    return params;
}

export default async function BrandProvincePage({ params }: PageProps) {
    const { slug, provincia } = await params;
    const brand = getBrand(slug);
    const provNombre = provinceName(provincia);
    if (!brand || !provNombre) notFound();

    const prov = tc(provNombre);
    const stations = collectBrandStations(locationsData as any, brand, provincia)
        .filter((st) => st.precio95 && st.precio95 > 0)
        .sort((a, b) => (a.precio95 as number) - (b.precio95 as number));

    if (stations.length === 0) notFound();

    return (
        <div className="rg-landing">
            <Navbar />

            <header className="blog-hero" style={{ paddingBottom: '32px' }}>
                <div className="rg-container">
                    <Breadcrumbs
                        items={[
                            { name: 'Inicio', url: 'https://gasolinabarata.org' },
                            { name: `Gasolineras ${brand.name}`, url: `https://gasolinabarata.org/marca/${slug}` },
                            { name: prov, url: `https://gasolinabarata.org/marca/${slug}/${provincia}` },
                        ]}
                    />
                    <h1>
                        Gasolineras <span className="green">{brand.name}</span> baratas en {prov}
                    </h1>
                    <p className="blog-hero-sub">
                        Las estaciones <strong>{brand.name}</strong> más económicas de {prov}, con precios
                        oficiales actualizados hoy. Ahorra sin salirte de tu marca de confianza.
                    </p>
                </div>
            </header>

            <main className="rg-container" style={{ paddingBottom: '80px', minHeight: '60vh' }}>
                <h2>
                    {brand.name} más baratas de {prov} ({stations.length})
                </h2>
                <p style={{ color: 'var(--rg-text-secondary)', marginBottom: '32px' }}>
                    Ordenadas por precio de la gasolina 95. Datos oficiales del MITECO, actualizados a diario.
                </p>

                <div
                    style={{
                        overflowX: 'auto',
                        background: 'var(--rg-surface)',
                        borderRadius: 'var(--rg-radius)',
                        border: '1px solid var(--rg-border)',
                        marginBottom: '40px',
                    }}
                >
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                        <thead>
                            <tr
                                style={{
                                    borderBottom: '1px solid var(--rg-border)',
                                    color: 'var(--rg-text-secondary)',
                                    fontSize: '0.9rem',
                                    backgroundColor: 'rgba(255,255,255,0.02)',
                                }}
                            >
                                <th style={{ padding: '16px' }}>#</th>
                                <th style={{ padding: '16px' }}>Gasolinera</th>
                                <th style={{ padding: '16px' }}>Localidad</th>
                                <th style={{ padding: '16px' }}>Gasolina 95</th>
                                <th style={{ padding: '16px' }}>Diésel</th>
                                <th style={{ padding: '16px' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {stations.map((st, i) => (
                                <tr
                                    key={i}
                                    style={{ borderBottom: i === stations.length - 1 ? 'none' : '1px solid var(--rg-border)' }}
                                >
                                    <td style={{ padding: '16px', fontWeight: 600, color: 'var(--rg-text-secondary)' }}>{i + 1}</td>
                                    <td style={{ padding: '16px', fontWeight: 700, color: 'var(--rg-text)' }}>{st.rotulo}</td>
                                    <td style={{ padding: '16px', fontSize: '0.85rem' }}>
                                        <span style={{ display: 'block', fontWeight: 600, color: 'var(--rg-primary)' }}>{st.localidad}</span>
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
                                            Ver localidad
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <AffiliateCta place={prov} />

                <div
                    style={{
                        textAlign: 'center',
                        background: 'var(--rg-bg-alt)',
                        padding: '40px 20px',
                        borderRadius: 'var(--rg-radius)',
                        border: '1px solid var(--rg-border)',
                        marginTop: '40px',
                    }}
                >
                    <h3 style={{ marginBottom: '16px' }}>Encuentra tu {brand.name} más cercano</h3>
                    <p style={{ color: 'var(--rg-text-secondary)', marginBottom: '24px' }}>
                        Consulta todas las marcas de {prov} o localiza la estación más barata en ruta.
                    </p>
                    <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}>
                        <Link href={`/precio-gasolina/${provincia}`} className="rg-btn secondary">
                            Todas las gasolineras de {prov}
                        </Link>
                        <Link href={`/marca/${slug}`} className="rg-btn secondary">
                            {brand.name} en toda España
                        </Link>
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
