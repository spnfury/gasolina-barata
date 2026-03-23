import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import SavingsCalculator from '@/components/SavingsCalculator';
import SmartDownloadButton from '@/components/SmartDownloadButton';
import LeadCapture from '@/components/LeadCapture';

export const metadata: Metadata = {
    title: 'Calculadora de Ahorro en Gasolina — ¿Cuánto puedes ahorrar? | Gasolina Barata',
    description:
        'Calcula cuánto dinero puedes ahorrar al año repostando en las gasolineras más baratas. Simulador interactivo con datos reales de MITECO.',
    alternates: { canonical: 'https://gasolinabarata.org/calculadora-ahorro' },
};

export default function CalculadoraPage() {
    return (
        <div className="rg-landing">
            <Navbar />

            <section className="blog-hero">
                <div className="rg-container">
                    <div className="rg-hero-badge">
                        <span className="dot" />
                        Simulador interactivo
                    </div>
                    <h1>
                        Calculadora de <span className="green">Ahorro en Gasolina</span>
                    </h1>
                    <p className="blog-hero-sub">
                        Ajusta los parámetros a tu conducción y descubre cuánto dinero podrías ahorrar 
                        al año eligiendo las gasolineras más baratas con RadarGas.
                    </p>
                </div>
            </section>

            <section style={{ padding: '0 0 64px' }}>
                <div className="rg-container">
                    <SavingsCalculator />
                </div>
            </section>

            <section style={{ padding: '0 0 64px' }}>
                <div className="rg-container">
                    <div style={{ textAlign: 'center' }}>
                        <SmartDownloadButton variant="primary" label="🚀 Descargar RadarGas Gratis" />
                    </div>
                </div>
            </section>

            <div className="rg-container">
                <LeadCapture
                    title="📬 Recibe consejos de ahorro semanales"
                    subtitle="Cada lunes te enviamos un resumen con las gasolineras más baratas de tu zona y trucos para gastar menos."
                />
            </div>

            <section className="seo-section" style={{ marginTop: '32px' }}>
                <div className="rg-container seo-content">
                    <h2>¿Cómo funciona la calculadora?</h2>
                    <p>
                        Nuestra calculadora de ahorro utiliza una fórmula muy sencilla: multiplicamos los litros que consumes al año
                        por la diferencia de precio entre la gasolinera más cara y la más barata de tu zona. Esta diferencia suele ser
                        de <strong>8 a 12 céntimos por litro</strong>, pero en algunas zonas puede llegar hasta 20 céntimos.
                    </p>
                    <div className="seo-callout">
                        <h3>💡 ¿Sabías que…?</h3>
                        <p>
                            Un conductor que recorre 15.000 km al año con un consumo de 7 L/100km y elige siempre la gasolinera 
                            más barata puede ahorrarse entre <strong>80€ y 210€ al año</strong>. Eso equivale a 2-4 depósitos llenos gratis.
                        </p>
                    </div>

                    <h2 style={{ marginTop: '48px' }}>Consejos para maximizar tu ahorro</h2>
                    <ul style={{ lineHeight: 2 }}>
                        <li>⛽ Evita repostar en autopistas y zonas turísticas (hasta +15 cént./L)</li>
                        <li>📊 Consulta los precios antes de salir con RadarGas</li>
                        <li>🕐 Reposta a primera hora de la mañana (el combustible es más denso)</li>
                        <li>🚗 Mantén la presión de neumáticos correcta (-3% consumo)</li>
                        <li>🗓️ Llena el tanque completo en días laborables, evita fines de semana</li>
                    </ul>

                    <div style={{ textAlign: 'center', marginTop: '40px' }}>
                        <SmartDownloadButton variant="badge" />
                    </div>
                </div>
            </section>

            <footer className="rg-footer">
                <div className="rg-footer-inner">
                    <div className="rg-footer-bottom">
                        <span>© {new Date().getFullYear()} Gasolina Barata (Marca RadarGas) — Datos MITECO</span>
                        <span>Precios orientativos.</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
