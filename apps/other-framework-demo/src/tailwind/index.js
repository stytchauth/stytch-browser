import { createStytchClient, Products, shadcnTheme, StytchUI } from '@stytch/vanilla-js';

window.customElements.define('stytch-ui', StytchUI);

// Create client and config
const stytch = createStytchClient(import.meta.env.REACT_APP_STYTCH_PUBLIC_TOKEN);
const config = {
  products: [Products.otp, Products.emailMagicLinks, Products.passkeys, Products.crypto, Products.oauth],
  otpOptions: {
    methods: ['sms', 'whatsapp'],
  },
  oauthOptions: {
    providers: [
      { type: 'google' },
      { type: 'apple' },
      { type: 'discord' },
      { type: 'facebook' },
      { type: 'github' },
      { type: 'gitlab' },
      { type: 'salesforce' },
      { type: 'slack' },
      { type: 'microsoft' },
      { type: 'amazon' },
      { type: 'bitbucket' },
      { type: 'linkedin' },
      { type: 'twitch' },
      { type: 'coinbase' },
      { type: 'twitter' },
      { type: 'figma' },
      { type: 'snapchat' },
      { type: 'tiktok' },
      { type: 'yahoo' },
    ],
    loginRedirectURL: `${window.location.origin}/?type=oauth`,
    signupRedirectURL: `${window.location.origin}/?type=oauth`,
  },
  emailMagicLinksOptions: {
    loginRedirectURL: `${window.location.origin}/?type=eml`,
    signupRedirectURL: `${window.location.origin}/?type=eml`,
  },
};

// Initial render
const stytchUi = document.getElementById('app');

stytchUi.render({
  client: stytch,
  config,
  presentation: {
    theme: shadcnTheme,
  },
});

// Toggles
document.getElementById('toggle-theme').addEventListener('click', () => {
  document.body.classList.toggle('dark');
});

let theme = undefined;
document.getElementById('themes').addEventListener('click', (evt) => {
  const newTheme = evt.target.dataset.theme;
  document.body.classList.toggle(theme);

  if (theme !== newTheme) {
    document.body.classList.toggle(newTheme);
    theme = newTheme;
  }
});
