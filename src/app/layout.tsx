import type { Metadata } from 'next';
import './globals.css';

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
    ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="es">
            <head>
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body>{children}</body>
        </html>
    );
}
