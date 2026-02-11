<script>
  import { createStytchClient, Products, StytchUI, defaultDarkTheme } from '@stytch/vanilla-js';

  if (!window.customElements.get('stytch-ui')) {
    window.customElements.define('stytch-ui', StytchUI);
  }

  let isDarkMode = false;
  $: presentation = isDarkMode ? { theme: defaultDarkTheme } : undefined;

  // Initialize Stytch client and config
  const stytch = createStytchClient(import.meta.env.REACT_APP_STYTCH_PUBLIC_TOKEN);
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

  const handleStytchEvent = (evt) => {
    console.log('Stytch event', evt.stytchEventType, evt.stytchEventData);
  };

  const handleStytchError = (evt) => {
    console.log('Stytch error', evt.error);
  };

  const toggleTheme = () => {
    isDarkMode = !isDarkMode;
  };
</script>

<stytch-ui client={stytch} {config} {presentation} onstytch-event={handleStytchEvent} onstytch-error={handleStytchError}
></stytch-ui>

<div class="control">
  <button onclick={toggleTheme}>
    Toggle {isDarkMode ? 'Light' : 'Dark'} Mode
  </button>
</div>
