import React from 'react';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
    title: 'Política de Privacidad',
    description: 'Política de privacidad de gasolinabarata.org. Tratamiento de datos personales, derechos del usuario, base legal y datos del responsable.',
    alternates: { canonical: 'https://gasolinabarata.org/politica-privacidad' },
    robots: { index: true, follow: true },
};

const COMPANY = {
    name: '[TODO: Nombre o razón social]',
    nif: '[TODO: NIF/CIF]',
    address: '[TODO: Dirección fiscal completa]',
    email: 'thevega82@gmail.com',
};

export default function PoliticaPrivacidadPage() {
    return (
        <div className="rg-landing">
            <Navbar />
            <section className="seo-section">
                <div className="rg-container seo-content" style={{ maxWidth: 820 }}>
                    <h1>Política de Privacidad</h1>
                    <p><em>Última actualización: 28 de mayo de 2026</em></p>

                    <h2>1. Responsable del tratamiento</h2>
                    <ul>
                        <li><strong>Titular:</strong> {COMPANY.name}</li>
                        <li><strong>NIF/CIF:</strong> {COMPANY.nif}</li>
                        <li><strong>Domicilio:</strong> {COMPANY.address}</li>
                        <li><strong>Email de contacto:</strong> {COMPANY.email}</li>
                        <li><strong>Sitio web:</strong> https://gasolinabarata.org</li>
                    </ul>

                    <h2>2. Datos que recogemos</h2>
                    <p>En gasolinabarata.org tratamos los siguientes datos:</p>
                    <ul>
                        <li><strong>Datos de navegación</strong>: dirección IP, tipo de navegador, sistema operativo, páginas visitadas, tiempo de permanencia y referente. Recogidos vía Plausible Analytics (analítica sin cookies, sin identificación personal).</li>
                        <li><strong>Ubicación aproximada</strong>: solo si das consentimiento expreso al usar la funcionalidad &quot;Cerca de mí&quot;, mediante la API Geolocation del navegador. No se almacena en nuestros servidores.</li>
                        <li><strong>Datos publicitarios</strong>: si aceptas cookies publicitarias, Google AdSense puede recoger identificadores de dispositivo, cookies de personalización y datos de interacción con anuncios.</li>
                        <li><strong>Email</strong>: si te suscribes al boletín o usas el formulario de captura de leads (alta voluntaria).</li>
                    </ul>

                    <h2>3. Finalidad y base legal</h2>
                    <ul>
                        <li><strong>Prestación del servicio</strong> (interés legítimo / ejecución de contrato): mostrar precios de carburante y permitir búsquedas.</li>
                        <li><strong>Analítica agregada</strong> (interés legítimo): mejorar la experiencia. Plausible no usa cookies ni datos personales.</li>
                        <li><strong>Publicidad personalizada</strong> (consentimiento): solo si aceptas en el banner de cookies. Servida por Google AdSense.</li>
                        <li><strong>Comunicaciones comerciales</strong> (consentimiento): solo si te suscribes voluntariamente.</li>
                    </ul>

                    <h2>4. Plazo de conservación</h2>
                    <p>Conservamos tus datos el tiempo estrictamente necesario para la finalidad y, en su caso, durante los plazos legales aplicables. Los datos analíticos agregados se conservan hasta 36 meses. Los datos publicitarios se rigen por la política de Google.</p>

                    <h2>5. Destinatarios y encargados</h2>
                    <p>Tus datos pueden ser comunicados a:</p>
                    <ul>
                        <li><strong>Google Ireland Limited</strong> (AdSense, Funding Choices) — publicidad y CMP.</li>
                        <li><strong>Plausible Insights OÜ</strong> (Estonia, UE) — analítica web sin cookies.</li>
                        <li><strong>Resend, Inc.</strong> (EE. UU., adherido al EU-US DPF) — envío de emails transaccionales.</li>
                        <li><strong>Proveedores de hosting e infraestructura</strong> en la Unión Europea.</li>
                    </ul>
                    <p>No vendemos datos personales a terceros.</p>

                    <h2>6. Transferencias internacionales</h2>
                    <p>Algunos proveedores (Google, Resend) pueden tratar datos fuera del Espacio Económico Europeo, siempre amparados en mecanismos válidos: cláusulas contractuales tipo, EU-US Data Privacy Framework o decisiones de adecuación de la Comisión Europea.</p>

                    <h2>7. Derechos del usuario</h2>
                    <p>Puedes ejercer en cualquier momento tus derechos de:</p>
                    <ul>
                        <li>Acceso, rectificación, supresión, oposición, limitación y portabilidad.</li>
                        <li>Retirar el consentimiento prestado.</li>
                        <li>Presentar una reclamación ante la Agencia Española de Protección de Datos (<a href="https://www.aepd.es" rel="noopener nofollow">aepd.es</a>).</li>
                    </ul>
                    <p>Para ejercer estos derechos escribe a <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a> identificándote y describiendo tu solicitud.</p>

                    <h2>8. Medidas de seguridad</h2>
                    <p>Aplicamos medidas técnicas y organizativas razonables (HTTPS, control de accesos, copias de seguridad, principio de mínimo privilegio) para proteger tus datos contra acceso no autorizado, pérdida o destrucción.</p>

                    <h2>9. Datos de menores</h2>
                    <p>El sitio no está dirigido a menores de 14 años. No recogemos conscientemente datos de menores sin consentimiento parental.</p>

                    <h2>10. Cambios en esta política</h2>
                    <p>Podemos actualizar esta política. Publicaremos cualquier cambio en esta página indicando la fecha de última actualización.</p>

                    <p>Consulta también nuestra <a href="/politica-cookies">Política de Cookies</a> y nuestro <a href="/aviso-legal">Aviso Legal</a>.</p>
                </div>
            </section>
        </div>
    );
}
