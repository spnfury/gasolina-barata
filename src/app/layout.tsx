import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';

const inter = Inter({
    subsets: ['latin'],
    display: 'swap',
    weight: ['400', '500', '600', '700', '800', '900'],
});

export const metadata: Metadata = {
    title: {
        template: '%s | Gasolina Barata España',
        default: 'Gasolina Barata — Precios de Combustible en España Hoy',
    },
    description:
        'Precios actualizados de gasolina y diésel en España. Análisis de tendencias, comparativas por comunidad y consejos para ahorrar en cada repostaje.',
    keywords: [
        'gasolina barata',
        'precio gasolina hoy',
        'precio diesel españa',
        'gasolina 95 precio',
        'combustible barato',
        'gasolineras baratas',
        'precio combustible españa',
        'ahorro gasolina',
    ],
    metadataBase: new URL('https://gasolinabarata.org'),
    openGraph: {
        type: 'website',
        locale: 'es_ES',
        siteName: 'Gasolina Barata',
    },
    twitter: {
        card: 'summary_large_image',
    },
    icons: {
        icon: '/favicon.svg',
        apple: '/apple-touch-icon.png',
    },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="es" className={inter.className}>
            <head>
                <meta name="google-adsense-account" content="ca-pub-XXXXXXXXXX" />
                <Script
                    defer
                    data-domain="gasolinabarata.org"
                    src="https://clase-plausible.s0e6bf.easypanel.host/js/script.js"
                    strategy="beforeInteractive"
                />
            </head>
            <body style={{ margin: 0, padding: 0, background: '#0A0E14' }}>
                {children}
                <Script
                    async
                    src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXX"
                    crossOrigin="anonymous"
                    strategy="afterInteractive"
                />
            </body>
        </html>
    );
}
