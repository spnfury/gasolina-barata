import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
    title: 'Contacto',
    description:
        'Contacta con gasolinabarata.org: sugerencias, correcciones de precios de gasolineras o consultas. Respondemos a todos los mensajes.',
    alternates: { canonical: 'https://gasolinabarata.org/contacto' },
    robots: { index: true, follow: true },
};

const EMAIL = 'thevega82@gmail.com';

export default function ContactoPage() {
    return (
        <div className="rg-landing">
            <Navbar />
            <section className="seo-section">
                <div className="rg-container seo-content" style={{ maxWidth: 820 }}>
                    <h1>Contacto</h1>
                    <p>
                        Gasolina Barata es un proyecto abierto a la comunidad de conductores. Si tienes
                        cualquier consulta, sugerencia de mejora o has detectado un precio incorrecto en
                        alguna estación, queremos saberlo.
                    </p>

                    <h2>Escríbenos</h2>
                    <p>
                        Correo electrónico:{' '}
                        <a href={`mailto:${EMAIL}`}>
                            <strong>{EMAIL}</strong>
                        </a>
                    </p>
                    <p>Solemos responder en un plazo de 24 a 48 horas laborables.</p>

                    <h2>¿Para qué puedes escribirnos?</h2>
                    <ul>
                        <li>Reportar un precio o una estación con datos que no cuadran.</li>
                        <li>Sugerir nuevas funciones o localidades.</li>
                        <li>Consultas sobre nuestra metodología o la fuente de datos.</li>
                        <li>Colaboraciones y propuestas comerciales.</li>
                    </ul>

                    <h2>Sobre los datos</h2>
                    <p>
                        Recuerda que los precios provienen de la fuente oficial (MITECO) y son orientativos.
                        Si un precio no coincide con el surtidor, suele deberse a la última declaración de la
                        propia estación. Puedes conocer más en{' '}
                        <Link href="/sobre-nosotros">quiénes somos</Link> y en el{' '}
                        <Link href="/aviso-legal">aviso legal</Link>.
                    </p>
                </div>
            </section>
        </div>
    );
}
