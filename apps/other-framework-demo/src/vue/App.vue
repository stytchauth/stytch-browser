<script setup>
import { ref, computed } from 'vue';
import { createStytchClient, Products, StytchUI, defaultDarkTheme } from '@stytch/vanilla-js';

if (!window.customElements.get('stytch-ui')) {
  window.customElements.define('stytch-ui', StytchUI);
}

const isDarkMode = ref(false);
const presentation = computed(() => (isDarkMode.value ? { theme: defaultDarkTheme } : undefined));

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
</script>

<template>
  <stytch-ui
    .client="stytch"
    .config="config"
    :presentation="presentation"
    @stytch-event="handleStytchEvent"
    @stytch-error="handleStytchError"
  />

  <div class="control">
    <button @click="isDarkMode = !isDarkMode">Toggle {{ isDarkMode ? 'Light' : 'Dark' }} Mode</button>
  </div>
</template>
