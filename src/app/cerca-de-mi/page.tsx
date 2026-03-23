import React from 'react';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import NearbyStationsClient from '@/components/NearbyStationsClient';

export const metadata: Metadata = {
    title: 'Gasolina barata cerca de mí hoy | Encuentra tu surtidor',
    description: 'Encuentra las gasolineras más baratas y cercanas a tu ubicación actual. Compara precios de Gasolina 95 y Diésel en tiempo real.',
    alternates: { canonical: 'https://gasolinabarata.org/cerca-de-mi' },
};

export default function CercaDeMiPage() {
    return (
        <div className="rg-landing">
            <Navbar />
            
            <header className="blog-hero" style={{ paddingBottom: '32px' }}>
                <div className="rg-container">
                    <h1>Gasolina barata <span className="green">cerca de mí</span></h1>
                    <p className="blog-hero-sub">
                        Encuentra las estaciones de servicio más económicas a tu alrededor. 
                        Ahorra al máximo en tu próximo repostaje sin desviarte de tu ruta.
                    </p>
                </div>
            </header>

            <main className="rg-container" style={{ paddingBottom: '80px', minHeight: '60vh' }}>
                <NearbyStationsClient />
            </main>

            <footer className="rg-footer" style={{ marginTop: 'auto' }}>
                <div className="rg-footer-inner">
                    <div className="rg-footer-bottom">
                        <span>© {new Date().getFullYear()} Gasolina Barata — Herramienta de Geolocalización</span>
                        <span>Precios orientativos extraídos del MITECO.</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
