import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
    title: 'Página no encontrada',
    robots: { index: false, follow: true },
};

export default function NotFound() {
    return (
        <div className="rg-landing">
            <Navbar />
            <section className="seo-section">
                <div
                    className="rg-container seo-content"
                    style={{ maxWidth: 720, textAlign: 'center', padding: '60px 20px' }}
                >
                    <h1 style={{ fontSize: '3rem', margin: '0 0 8px' }}>404</h1>
                    <h2 style={{ marginTop: 0 }}>No hemos encontrado esta página</h2>
                    <p style={{ color: 'var(--rg-text-secondary)', marginBottom: '32px' }}>
                        Puede que la localidad, gasolinera o página que buscas haya cambiado de dirección o
                        ya no exista. Prueba desde el inicio o consulta los precios por provincia.
                    </p>
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link href="/" className="rg-btn primary">
                            Ir al inicio
                        </Link>
                        <Link href="/cerca-de-mi" className="rg-btn secondary">
                            Gasolineras cerca de mí
                        </Link>
                        <Link href="/blog" className="rg-btn secondary">
                            Blog
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
