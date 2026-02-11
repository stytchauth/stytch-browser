import React from 'react';

import styles from './Logo.module.css';

type LogoData = {
  url: string;
  alt: string;
};

const Logo = ({ orgLogo, appLogo }: { orgLogo?: LogoData; appLogo?: LogoData }) => {
  if (!orgLogo && !appLogo) return null;

  return (
    <div className={styles.container}>
      {orgLogo && <img className={styles.logo} src={orgLogo.url} alt={orgLogo.alt} />}
      {appLogo && <img className={styles.logo} src={appLogo.url} alt={appLogo.alt} />}
    </div>
  );
};

export default Logo;
