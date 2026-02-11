import { createStytchClient, defaultDarkTheme, Products, StytchUI } from '@stytch/vanilla-js';

window.customElements.define('stytch-ui', StytchUI);

// Create client and config
const stytch = createStytchClient(process.env.REACT_APP_STYTCH_PUBLIC_TOKEN);
const config = {
  products: [Products.oauth, Products.emailMagicLinks],
  oauthOptions: {
    providers: [
      {
        type: 'google',
      },
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
});

// State
let isDarkMode = false;
const toggleButton = document.getElementById('toggle-theme');
toggleButton.addEventListener('click', () => {
  isDarkMode = !isDarkMode;
  toggleButton.textContent = `Toggle ${isDarkMode ? 'Light' : 'Dark'} Mode`;
  stytchUi.presentation = isDarkMode ? { theme: defaultDarkTheme } : undefined;
});
