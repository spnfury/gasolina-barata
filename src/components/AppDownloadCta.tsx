import React from 'react';
import styles from './Seo.module.css';
import SmartDownloadButton from './SmartDownloadButton';

interface AppDownloadCtaProps {
  locationName: string;
  placement: string;
}

export default function AppDownloadCta({ locationName, placement }: AppDownloadCtaProps) {
  return (
    <div className={styles.ctaContainer}>
      <h3 className={styles.ctaTitle}>💰 ¡Ahorra en cada depósito en {locationName}!</h3>
      <p className={styles.ctaSubtitle}>
        Descarga RadarGas ahora y descubre en tiempo real el mapa con las gasolineras más baratas cerca de ti. Cientos de conductores ya ahorran dinero cada mes.
      </p>
      <SmartDownloadButton variant="badge" placement={placement} style={{ fontSize: '1.1rem', padding: '16px 32px' }} />
    </div>
  );
}
