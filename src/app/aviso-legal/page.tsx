import React from 'react';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
    title: 'Aviso Legal',
    description: 'Aviso legal de gasolinabarata.org: titularidad, condiciones de uso, propiedad intelectual, responsabilidad y legislación aplicable.',
    alternates: { canonical: 'https://gasolinabarata.org/aviso-legal' },
    robots: { index: true, follow: true },
};

const COMPANY = {
    name: '[TODO: Nombre o razón social]',
    nif: '[TODO: NIF/CIF]',
    address: '[TODO: Dirección fiscal completa]',
    email: 'thevega82@gmail.com',
    registry: '[TODO: Datos del Registro Mercantil si aplica]',
};

export default function AvisoLegalPage() {
    return (
        <div className="rg-landing">
            <Navbar />
            <section className="seo-section">
                <div className="rg-container seo-content" style={{ maxWidth: 820 }}>
                    <h1>Aviso Legal</h1>
                    <p><em>Última actualización: 28 de mayo de 2026</em></p>

                    <h2>1. Datos identificativos</h2>
                    <p>En cumplimiento de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE):</p>
                    <ul>
                        <li><strong>Titular:</strong> {COMPANY.name}</li>
                        <li><strong>NIF/CIF:</strong> {COMPANY.nif}</li>
                        <li><strong>Domicilio:</strong> {COMPANY.address}</li>
                        <li><strong>Contacto:</strong> <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a></li>
                        <li><strong>Registro:</strong> {COMPANY.registry}</li>
                    </ul>

                    <h2>2. Objeto</h2>
                    <p>Este sitio web ofrece información sobre precios de carburante en estaciones de servicio de España. Los datos provienen de la API oficial del Ministerio para la Transición Ecológica y el Reto Demográfico (MITECO) y se actualizan diariamente.</p>

                    <h2>3. Condiciones de uso</h2>
                    <p>El acceso al sitio es libre y gratuito. El usuario se compromete a hacer un uso adecuado de los contenidos y a no emplearlos para actividades ilícitas, perjudiciales para terceros o que infrinjan derechos de propiedad intelectual.</p>

                    <h2>4. Propiedad intelectual e industrial</h2>
                    <p>Los contenidos del sitio (textos, gráficos, código, diseño, logotipos) son propiedad del titular o de terceros que han autorizado su uso. Los datos de precios son de titularidad pública (MITECO) y se reutilizan conforme a las condiciones del propio organismo.</p>
                    <p>Queda prohibida su reproducción total o parcial sin autorización expresa, salvo cita con enlace a la fuente original.</p>

                    <h2>5. Exención de responsabilidad</h2>
                    <p>Los precios mostrados son <strong>orientativos</strong> y proceden de los datos declarados por las propias estaciones al MITECO. Pueden no estar actualizados al minuto. Recomendamos confirmar el precio en surtidor antes de repostar. El titular no se hace responsable de discrepancias entre el precio mostrado y el aplicado en la estación.</p>

                    <h2>6. Enlaces a terceros</h2>
                    <p>El sitio puede contener enlaces a páginas externas. El titular no se hace responsable del contenido ni de las políticas de privacidad de dichos sitios.</p>

                    <h2>7. Modificaciones</h2>
                    <p>El titular se reserva el derecho a modificar este aviso legal en cualquier momento. Los cambios serán efectivos desde su publicación.</p>

                    <h2>8. Legislación aplicable</h2>
                    <p>Las presentes condiciones se rigen por la legislación española. Para cualquier controversia se acuerda el sometimiento a los Juzgados y Tribunales del domicilio del titular, salvo cuando la normativa de consumo establezca otro fuero.</p>

                    <p>Consulta también nuestra <a href="/politica-privacidad">Política de Privacidad</a> y nuestra <a href="/politica-cookies">Política de Cookies</a>.</p>
                </div>
            </section>
        </div>
    );
}
