import {
  defaultDarkTheme,
  defaultTheme,
  PresentationConfig,
  Products,
  StytchLogin,
  StytchLoginConfig,
} from '@stytch/nextjs';
import React from 'react';

import styles from './page.module.css';

const STYTCH_LOGO_IMG_URL = 'https://public-assets.stytch.com/stytch_logo_charcoal.png';

const StytchConfig: StytchLoginConfig = {
  products: [Products.otp],
  otpOptions: {
    methods: ['email'],
    expirationMinutes: 10,
  },
};

const presentationConfig: PresentationConfig = {
  theme: [defaultTheme, defaultDarkTheme],
  options: {
    logo: {
      alt: 'Stytch',
      url: STYTCH_LOGO_IMG_URL,
    },
  },
};

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <StytchLogin config={StytchConfig} presentation={presentationConfig} />
      </main>
    </div>
  );
}
