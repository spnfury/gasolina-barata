import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';

const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

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
        icon: '/icon.png',
        apple: '/apple-touch-icon.png',
    },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="es" className={inter.className}>
            <head>
                {ADSENSE_CLIENT && (
                    <meta name="google-adsense-account" content={ADSENSE_CLIENT} />
                )}
                <Script
                    defer
                    data-domain="gasolinabarata.org"
                    src="https://clase-plausible.s0e6bf.easypanel.host/js/script.js"
                    strategy="beforeInteractive"
                />
            </head>
            <body style={{ margin: 0, padding: 0, background: '#0A0E14' }}>
                {children}
                <footer style={{
                    background: '#06090d',
                    color: '#9aa4b2',
                    padding: '24px 16px',
                    textAlign: 'center',
                    fontSize: '0.85rem',
                    borderTop: '1px solid rgba(255,255,255,0.05)',
                }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '16px', marginBottom: '10px' }}>
                        <a href="/aviso-legal" style={{ color: 'inherit' }}>Aviso legal</a>
                        <a href="/politica-privacidad" style={{ color: 'inherit' }}>Privacidad</a>
                        <a href="/politica-cookies" style={{ color: 'inherit' }}>Cookies</a>
                        <a href="https://www.miteco.gob.es" rel="noopener nofollow" style={{ color: 'inherit' }}>Fuente datos: MITECO</a>
                    </div>
                    <div>© {new Date().getFullYear()} gasolinabarata.org · Precios orientativos</div>
                </footer>
                {ADSENSE_CLIENT && (
                    <>
                        <Script
                            async
                            src={`https://fundingchoicesmessages.google.com/i/${ADSENSE_CLIENT}?ers=1`}
                            strategy="afterInteractive"
                        />
                        <Script id="fc-signal-present" strategy="afterInteractive">
                            {`(function(){function s(){[].forEach.call(document.querySelectorAll('.fc-rejected-message,.fc-button'),function(e){e.dispatchEvent(new Event('click'))})}window.googlefc=window.googlefc||{};window.googlefc.callbackQueue=window.googlefc.callbackQueue||[];window.googlefc.callbackQueue.push({CONSENT_DATA_READY:s});})();`}
                        </Script>
                        <Script
                            async
                            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
                            crossOrigin="anonymous"
                            strategy="afterInteractive"
                        />
                    </>
                )}
            </body>
        </html>
    );
}
