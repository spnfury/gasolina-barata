import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import locationsData from '@/data/locations.json';

export const metadata: Metadata = {
    title: 'Sobre nosotros',
    description:
        'Quiénes somos y cómo funciona gasolinabarata.org: metodología, fuente de datos oficial (MITECO) y compromiso de transparencia con precios de carburante en España.',
    alternates: { canonical: 'https://gasolinabarata.org/sobre-nosotros' },
    robots: { index: true, follow: true },
};

export default function SobreNosotrosPage() {
    const data = locationsData as any;
    const numProvincias = data.locations.length;
    const numLocalidades = data.locations.reduce(
        (acc: number, p: any) => acc + (p.localidades?.length || 0),
        0,
    );

    return (
        <div className="rg-landing">
            <Navbar />
            <section className="seo-section">
                <div className="rg-container seo-content" style={{ maxWidth: 820 }}>
                    <h1>Sobre nosotros</h1>
                    <p>
                        <strong>Gasolina Barata</strong> es un proyecto independiente que ayuda a los
                        conductores de España a encontrar el precio más bajo de la gasolina y el diésel
                        cerca de ellos. Cada día procesamos los precios de miles de estaciones de servicio
                        en {numProvincias} provincias y más de {numLocalidades.toLocaleString('es-ES')}{' '}
                        localidades para que ahorrar en cada repostaje sea sencillo y gratuito.
                    </p>

                    <h2>Nuestra misión</h2>
                    <p>
                        El precio del carburante puede variar más de 20 céntimos por litro entre dos
                        gasolineras de la misma ciudad. Eso son decenas de euros al mes para una familia.
                        Creemos que esa información debe ser pública, clara y accesible para todos, sin
                        registros ni letra pequeña.
                    </p>

                    <h2>De dónde salen los precios</h2>
                    <p>
                        Todos los precios proceden de la fuente oficial: la API de precios de carburantes
                        del{' '}
                        <a href="https://www.miteco.gob.es" rel="noopener nofollow" target="_blank">
                            Ministerio para la Transición Ecológica y el Reto Demográfico (MITECO)
                        </a>
                        , alimentada por las declaraciones obligatorias de las propias estaciones de
                        servicio. No inventamos ni estimamos precios: mostramos lo que cada estación
                        declara oficialmente.
                    </p>

                    <h2>Cómo trabajamos los datos</h2>
                    <ul>
                        <li>
                            <strong>Actualización diaria.</strong> Sincronizamos los precios oficiales cada
                            día y recalculamos las medias por localidad y provincia.
                        </li>
                        <li>
                            <strong>Ranking real.</strong> En cada localidad ordenamos las estaciones por
                            precio para mostrar de un vistazo cuál es la más barata hoy.
                        </li>
                        <li>
                            <strong>Histórico.</strong> Guardamos la evolución de precios para que puedas ver
                            la tendencia de las últimas semanas, no solo la foto de hoy.
                        </li>
                        <li>
                            <strong>Comparativas.</strong> Contrastamos el precio de cada municipio con la
                            media de su provincia y la media nacional para dar contexto.
                        </li>
                    </ul>

                    <h2>Transparencia y limitaciones</h2>
                    <p>
                        Los precios son <strong>orientativos</strong>. Reflejan la última declaración de cada
                        estación al MITECO y pueden no coincidir al minuto con el surtidor. Recomendamos
                        confirmar el precio en la estación antes de repostar. Puedes leer los detalles en
                        nuestro <Link href="/aviso-legal">aviso legal</Link>.
                    </p>

                    <h2>Cómo nos financiamos</h2>
                    <p>
                        El servicio es y seguirá siendo gratuito. Nos financiamos con publicidad y con
                        recomendaciones de productos relacionados con el automóvil (seguros, tarjetas de
                        combustible). Estas recomendaciones nunca alteran el ranking de precios, que se
                        basa únicamente en los datos oficiales.
                    </p>

                    <h2>Contacto</h2>
                    <p>
                        ¿Dudas, sugerencias o una estación con datos incorrectos? Escríbenos desde la{' '}
                        <Link href="/contacto">página de contacto</Link>. Leemos todos los mensajes.
                    </p>
                </div>
            </section>
        </div>
    );
}
