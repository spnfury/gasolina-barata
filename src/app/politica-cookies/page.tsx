import React from 'react';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
    title: 'Política de Cookies',
    description: 'Información sobre las cookies que utiliza gasolinabarata.org: tipos, finalidades, terceros y cómo gestionarlas o desactivarlas.',
    alternates: { canonical: 'https://gasolinabarata.org/politica-cookies' },
    robots: { index: true, follow: true },
};

export default function PoliticaCookiesPage() {
    return (
        <div className="rg-landing">
            <Navbar />
            <section className="seo-section">
                <div className="rg-container seo-content" style={{ maxWidth: 820 }}>
                    <h1>Política de Cookies</h1>
                    <p><em>Última actualización: 28 de mayo de 2026</em></p>

                    <h2>1. ¿Qué son las cookies?</h2>
                    <p>Una cookie es un pequeño fichero de texto que un sitio web almacena en tu navegador para recordar información sobre tu visita. Se utilizan para hacer funcionar el sitio, recordar preferencias, medir audiencia o mostrar publicidad relevante.</p>

                    <h2>2. Cookies que utiliza este sitio</h2>

                    <h3>2.1 Cookies técnicas (exentas de consentimiento)</h3>
                    <p>Necesarias para el funcionamiento básico del sitio. No requieren consentimiento conforme al art. 22.2 LSSI.</p>

                    <h3>2.2 Cookies analíticas</h3>
                    <p>Utilizamos <strong>Plausible Analytics</strong>, una herramienta de analítica web sin cookies y sin recogida de datos personales. No requiere consentimiento al no usar cookies ni identificadores persistentes.</p>

                    <h3>2.3 Cookies publicitarias (requieren consentimiento)</h3>
                    <p>Si aceptas, <strong>Google AdSense</strong> instala cookies para:</p>
                    <ul>
                        <li>Medir frecuencia y rendimiento de los anuncios.</li>
                        <li>Personalizar los anuncios según tu actividad de navegación si has dado consentimiento.</li>
                        <li>Prevenir fraude publicitario.</li>
                    </ul>
                    <p>Lista detallada de cookies de Google y socios publicitarios: <a href="https://policies.google.com/technologies/cookies" rel="noopener nofollow">policies.google.com/technologies/cookies</a>.</p>

                    <h2>3. Gestión del consentimiento</h2>
                    <p>La primera vez que visitas el sitio mostramos un banner de consentimiento (CMP de Google Funding Choices, certificado IAB TCF v2.2). Desde él puedes:</p>
                    <ul>
                        <li><strong>Aceptar todas</strong> las cookies.</li>
                        <li><strong>Rechazar</strong> cookies no esenciales.</li>
                        <li><strong>Configurar</strong> tus preferencias por finalidad y por proveedor.</li>
                    </ul>
                    <p>Puedes revocar tu consentimiento en cualquier momento desde el enlace &quot;Configurar cookies&quot; del pie de página.</p>

                    <h2>4. Cómo desactivar cookies en tu navegador</h2>
                    <ul>
                        <li><a href="https://support.google.com/chrome/answer/95647" rel="noopener nofollow">Google Chrome</a></li>
                        <li><a href="https://support.mozilla.org/es/kb/proteccion-mejorada-contra-rastreo-firefox-escrit" rel="noopener nofollow">Mozilla Firefox</a></li>
                        <li><a href="https://support.apple.com/es-es/guide/safari/sfri11471/mac" rel="noopener nofollow">Safari</a></li>
                        <li><a href="https://support.microsoft.com/es-es/microsoft-edge" rel="noopener nofollow">Microsoft Edge</a></li>
                    </ul>
                    <p>Ten en cuenta que desactivar cookies puede afectar a la funcionalidad del sitio.</p>

                    <h2>5. Más información</h2>
                    <p>Para más detalles sobre el tratamiento de datos consulta nuestra <a href="/politica-privacidad">Política de Privacidad</a>.</p>
                </div>
            </section>
        </div>
    );
}
