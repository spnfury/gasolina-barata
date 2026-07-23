import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Breadcrumbs from '@/components/Breadcrumbs';
import locationsData from '@/data/locations.json';

const eur = (n: number) => (n > 0 ? n.toFixed(3).replace('.', ',') : '-');
const tc = (s: string) =>
    s.toLowerCase().replace(/(^|[\s(/-])([a-záéíóúñ])/g, (_, p, c) => p + c.toUpperCase());
const is24h = (h?: string) => !!h && /24\s?h/i.test(h);

export const metadata: Metadata = {
    title: 'Gasolineras 24 horas abiertas hoy en España: las más baratas',
    description:
        'Encuentra gasolineras 24 horas abiertas hoy en España y reposta a cualquier hora. Listado de estaciones abiertas todo el día ordenadas por precio de la gasolina 95.',
    alternates: { canonical: 'https://gasolinabarata.org/gasolineras-24-horas' },
    robots: { index: true, follow: true },
};

export default function Gasolineras24hPage() {
    const data = locationsData as any;
    const stations: any[] = [];
    data.locations.forEach((prov: any) => {
        prov.localidades.forEach((loc: any) => {
            (loc.top5 || []).forEach((st: any) => {
                if (is24h(st.horario) && st.precio95 > 0) {
                    stations.push({ ...st, localidad: loc.nombre, provincia: prov.nombreProvincia, provSlug: prov.provincia, locSlug: loc.slug });
                }
            });
        });
    });
    stations.sort((a, b) => a.precio95 - b.precio95);
    const top = stations.slice(0, 40);

    return (
        <div className="rg-landing">
            <Navbar />
            <header className="blog-hero" style={{ paddingBottom: '32px' }}>
                <div className="rg-container">
                    <Breadcrumbs
                        items={[
                            { name: 'Inicio', url: 'https://gasolinabarata.org' },
                            { name: 'Gasolineras 24 horas', url: 'https://gasolinabarata.org/gasolineras-24-horas' },
                        ]}
                    />
                    <h1>Gasolineras <span className="green">24 horas</span> abiertas hoy</h1>
                    <p className="blog-hero-sub">
                        {stations.length.toLocaleString('es-ES')} estaciones abiertas todo el día en España, ordenadas
                        por precio de la gasolina 95. Reposta a cualquier hora sin pagar de más.
                    </p>
                </div>
            </header>

            <main className="rg-container" style={{ paddingBottom: '80px', maxWidth: 900, margin: '0 auto' }}>
                <p style={{ color: 'var(--rg-text-secondary)', lineHeight: 1.7, marginBottom: 32 }}>
                    Muchas gasolineras low cost y desatendidas abren 24 horas, lo que las hace ideales para viajes
                    nocturnos o rutas largas. Estas son las <strong>40 gasolineras 24 h más baratas</strong> de España
                    registradas hoy con datos oficiales del MITECO.
                </p>

                <div style={{ overflowX: 'auto', background: 'var(--rg-surface)', borderRadius: 'var(--rg-radius)', border: '1px solid var(--rg-border)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 560 }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--rg-border)', color: 'var(--rg-text-secondary)', fontSize: '.9rem' }}>
                                <th style={{ padding: 14 }}>#</th>
                                <th style={{ padding: 14 }}>Gasolinera</th>
                                <th style={{ padding: 14 }}>Ubicación</th>
                                <th style={{ padding: 14 }}>95</th>
                                <th style={{ padding: 14 }}>Diésel</th>
                            </tr>
                        </thead>
                        <tbody>
                            {top.map((st, i) => (
                                <tr key={i} style={{ borderBottom: i === top.length - 1 ? 'none' : '1px solid var(--rg-border)' }}>
                                    <td style={{ padding: 14, color: 'var(--rg-text-secondary)' }}>{i + 1}</td>
                                    <td style={{ padding: 14, fontWeight: 700 }}>{st.rotulo}</td>
                                    <td style={{ padding: 14, fontSize: '.85rem' }}>
                                        <Link href={`/precio-gasolina/${st.provSlug}/${st.locSlug}`}>
                                            {st.localidad} ({tc(st.provincia)})
                                        </Link>
                                    </td>
                                    <td style={{ padding: 14, fontWeight: 800, color: 'var(--rg-primary)' }}>{eur(st.precio95)}€</td>
                                    <td style={{ padding: 14, fontWeight: 800 }}>{st.precioDiesel > 0 ? `${eur(st.precioDiesel)}€` : '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <p style={{ color: 'var(--rg-text-secondary)', marginTop: 24 }}>
                    ¿Buscas la más cercana a ti ahora mismo? Usa{' '}
                    <Link href="/cerca-de-mi">gasolineras cerca de mí</Link> para localizarla en el mapa.
                </p>
            </main>
        </div>
    );
}
