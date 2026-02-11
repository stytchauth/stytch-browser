import { Products, StytchLogin } from '@stytch/react';
import React, { useState } from 'react';

import { useB2CStrings } from './useStrings';

const STYTCH_LOGO_IMG_URL = 'https://public-assets.stytch.com/stytch_logo_charcoal.png';

const emlRedirectURLs = {
  loginRedirectURL: `${window.location.origin}/?type=eml`,
  signupRedirectURL: `${window.location.origin}/?type=eml`,
};

const oauthRedirectURLs = {
  loginRedirectURL: `${window.location.origin}/?type=oauth`,
  signupRedirectURL: `${window.location.origin}/?type=oauth`,
};

const passwordOptions = {
  loginRedirectURL: `${window.location.origin}/reset`,
  resetPasswordRedirectURL: `${window.location.origin}/reset`,
  resetPasswordExpirationMinutes: 60,
};
const otpOptions = {
  methods: ['email', 'sms', 'whatsapp'],
  expirationMinutes: 10,
};
const allOauthProviders = [
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
];

const Options = [
  {
    name: 'Stytch- EML + OAuth - Embedded One Tap',
    config: {
      products: [Products.oauth, Products.emailMagicLinks],
      oauthOptions: {
        providers: [
          {
            type: 'google',
            one_tap: true,
            position: 'embedded',
          },
        ],
        ...oauthRedirectURLs,
      },
      emailMagicLinksOptions: emlRedirectURLs,
    },
  },
  {
    name: 'Passwords Only',
    config: {
      products: [Products.passwords],
      passwordOptions: passwordOptions,
    },
  },
  {
    name: 'EML + Passwords (Allowed)',
    config: {
      products: [Products.emailMagicLinks, Products.passwords],
      passwordOptions: passwordOptions,
      emailMagicLinksOptions: emlRedirectURLs,
    },
  },
  {
    name: 'OTP + Passwords (Allowed)',
    config: {
      products: [Products.otp, Products.passwords],
      passwordOptions: passwordOptions,
      otpOptions: otpOptions,
    },
  },
  {
    name: 'OTP + OAuth',
    config: {
      products: [Products.otp, Products.oauth],
      oauthOptions: {
        providers: [
          {
            type: 'google',
            custom_scopes: [
              'https://www.googleapis.com/auth/userinfo.profile',
              'https://www.googleapis.com/auth/drive.readonly',
            ],
            provider_params: { prompt: 'select_account' },
          },
          { type: 'microsoft' },
          { type: 'apple' },
          { type: 'facebook' },
        ],
        ...oauthRedirectURLs,
      },
      otpOptions: otpOptions,
    },
  },
  {
    name: 'OTP + EML (Error)',
    config: {
      products: [Products.otp, Products.emailMagicLinks],
      emailMagicLinksOptions: emlRedirectURLs,
      otpOptions: otpOptions,
    },
  },
  {
    name: 'OTP + EML (Allowed)',
    config: {
      products: [Products.otp, Products.emailMagicLinks],
      emailMagicLinksOptions: emlRedirectURLs,
      otpOptions: {
        methods: ['sms', 'whatsapp'],
        expirationMinutes: 10,
      },
    },
  },
  {
    name: 'EML + OAuth',
    config: {
      products: [Products.emailMagicLinks, Products.oauth],
      oauthOptions: {
        providers: [
          {
            type: 'google',
            custom_scopes: [
              'https://www.googleapis.com/auth/userinfo.profile',
              'https://www.googleapis.com/auth/drive.readonly',
            ],
          },
          { type: 'microsoft' },
          { type: 'apple' },
          { type: 'facebook' },
        ],
        ...oauthRedirectURLs,
      },
      emailMagicLinksOptions: emlRedirectURLs,
    },
  },
  {
    name: 'EML + OAuth - Embedded One Tap',
    config: {
      products: [Products.emailMagicLinks, Products.oauth],
      oauthOptions: {
        providers: [
          {
            type: 'google',
            one_tap: true,
            position: 'embedded',
          },
          { type: 'microsoft' },
          { type: 'apple' },
          { type: 'facebook' },
        ],
        ...oauthRedirectURLs,
      },
      emailMagicLinksOptions: emlRedirectURLs,
    },
  },
  {
    name: 'OAuth + Passwords',
    config: {
      products: [Products.oauth, Products.passwords],
      oauthOptions: {
        providers: [
          {
            type: 'google',
            custom_scopes: [
              'https://www.googleapis.com/auth/userinfo.profile',
              'https://www.googleapis.com/auth/drive.readonly',
            ],
          },
          { type: 'microsoft' },
          { type: 'apple' },
          { type: 'facebook' },
        ],
        ...oauthRedirectURLs,
      },
      passwordOptions: passwordOptions,
    },
  },
  {
    name: 'All OAuth - Plain',
    config: {
      products: [Products.oauth],
      oauthOptions: {
        providers: allOauthProviders,
        ...oauthRedirectURLs,
      },
    },
  },
  {
    name: 'All OAuth - Default One Tap',
    config: {
      products: [Products.oauth],
      oauthOptions: {
        providers: allOauthProviders.map((provider) =>
          provider.type === 'google' ? { ...provider, one_tap: true } : provider,
        ),
        ...oauthRedirectURLs,
      },
    },
  },
  {
    name: 'All OAuth - Embedded One Tap',
    config: {
      products: [Products.oauth],
      oauthOptions: {
        providers: allOauthProviders.map((provider) =>
          provider.type === 'google' ? { ...provider, one_tap: true, position: 'embedded' } : provider,
        ),
        ...oauthRedirectURLs,
      },
    },
  },
  {
    name: 'All OAuth - Floating One Tap',
    config: {
      products: [Products.oauth],
      oauthOptions: {
        providers: allOauthProviders.map((provider) =>
          provider.type === 'google' ? { ...provider, one_tap: true, position: 'floating' } : provider,
        ),
        ...oauthRedirectURLs,
      },
    },
  },
  {
    name: 'All OAuth - One Tap (embedded only)',
    config: {
      products: [Products.oauth],
      oauthOptions: {
        providers: allOauthProviders.map((provider) =>
          provider.type === 'google' ? { ...provider, one_tap: true, position: 'embeddedOnly' } : provider,
        ),
        ...oauthRedirectURLs,
      },
    },
  },
  {
    name: 'All OAuth - One Tap (floating or embedded)',
    config: {
      products: [Products.oauth],
      oauthOptions: {
        providers: allOauthProviders.map((provider) =>
          provider.type === 'google' ? { ...provider, one_tap: true, position: 'floatingOrEmbedded' } : provider,
        ),
        ...oauthRedirectURLs,
      },
    },
  },
  {
    name: 'All OAuth - One Tap (force legacy embedded)',
    config: {
      products: [Products.oauth],
      oauthOptions: {
        providers: allOauthProviders.map((provider) =>
          provider.type === 'google' ? { ...provider, one_tap: true, position: 'forceLegacyEmbedded' } : provider,
        ),
        ...oauthRedirectURLs,
      },
    },
  },
  {
    name: 'Floating Google One Tap Only',
    config: {
      products: [Products.oauth],
      oauthOptions: {
        providers: [{ type: 'google', position: 'floating', one_tap: true }],
        ...oauthRedirectURLs,
      },
    },
  },
  {
    name: 'OAuth + OTP',
    config: {
      products: [Products.oauth, Products.otp],
      oauthOptions: {
        providers: [{ type: 'google' }, { type: 'apple' }],
        ...oauthRedirectURLs,
      },
      otpOptions: otpOptions,
    },
  },
  {
    name: 'Crypto',
    config: {
      products: [Products.crypto],
    },
  },
  {
    name: 'EML + OAuth + Crypto',
    config: {
      products: [Products.oauth, Products.crypto, Products.emailMagicLinks],
      oauthOptions: {
        providers: [
          {
            type: 'google',
            custom_scopes: [
              'https://www.googleapis.com/auth/userinfo.profile',
              'https://www.googleapis.com/auth/drive.readonly',
            ],
          },
          { type: 'microsoft' },
          { type: 'apple' },
          { type: 'facebook' },
        ],
        ...oauthRedirectURLs,
      },
      emailMagicLinksOptions: emlRedirectURLs,
    },
  },
  {
    name: 'OAuth + Crypto',
    config: {
      products: [Products.oauth, Products.crypto],
      oauthOptions: {
        providers: [{ type: 'google' }, { type: 'apple' }, { type: 'facebook' }],
        ...oauthRedirectURLs,
      },
    },
  },
  {
    name: 'EML + Passkeys',
    config: {
      products: [Products.passkeys, Products.emailMagicLinks],
      emailMagicLinksOptions: emlRedirectURLs,
    },
  },
  {
    name: 'Crypto + Passkeys',
    config: {
      products: [Products.passkeys, Products.crypto],
    },
  },
  {
    name: 'Passwords + Passkeys',
    config: {
      products: [Products.passwords, Products.passkeys],
      passwordOptions: passwordOptions,
    },
  },
  {
    name: 'Passkeys Only (Error)',
    config: {
      products: [Products.passkeys],
    },
  },
  {
    name: 'OTP + Passkeys',
    config: {
      products: [Products.otp, Products.passkeys],
      otpOptions: {
        methods: ['sms', 'whatsapp', 'email'],
        expirationMinutes: 10,
      },
    },
  },
  {
    name: 'EML + OTP + Passkeys (Error)',
    config: {
      products: [Products.otp, Products.emailMagicLinks, Products.passkeys],
      emailMagicLinksOptions: emlRedirectURLs,
      otpOptions: {
        methods: ['sms', 'email'],
        expirationMinutes: 10,
      },
    },
  },
  {
    name: 'SMS Only',
    config: {
      products: [Products.otp],
      otpOptions: {
        methods: ['sms'],
      },
    },
  },
  {
    name: 'OneTap (Shadow DOM)',
    config: {
      products: [Products.oauth],
      oauthOptions: {
        providers: [{ type: 'google', one_tap: true, position: 'floating' }],
      },
      enableShadowDOM: true,
    },
  },
  {
    name: 'All products (Shadow DOM)',
    config: {
      products: [Products.otp, Products.emailMagicLinks, Products.passkeys, Products.crypto, Products.oauth],
      otpOptions: {
        methods: ['sms', 'whatsapp'],
      },
      oauthOptions: {
        providers: allOauthProviders.map((provider) =>
          provider.type === 'google' ? { ...provider, one_tap: true, position: 'floating' } : provider,
        ),
        ...oauthRedirectURLs,
      },
      emailMagicLinksOptions: emlRedirectURLs,
      enableShadowDOM: true,
    },
  },
];

const presentation = {
  options: {
    logo: {
      url: STYTCH_LOGO_IMG_URL,
      alt: 'Stytch',
    },
  },
};

const Playground = () => {
  const [currentOption, setCurrentOption] = useState(1);
  const resetOneTapCookie = () => {
    document.cookie = 'g_state="";expires=Thu, 01 Jan 1970 00:00:01 GMT';
  };

  const strings = useB2CStrings();

  return (
    <div>
      <div className="workbench">
        {Options.map((opt, i) => (
          <button key={opt.name} onClick={() => setCurrentOption(i)} style={{ width: '150px', margin: '12px' }}>
            {opt.name}
          </button>
        ))}
        <button onClick={resetOneTapCookie}>Reset One Tap</button>
      </div>

      <h1>Current Option: {Options[currentOption].name}</h1>

      <StytchLogin
        key={currentOption}
        config={Options[currentOption].config}
        presentation={presentation}
        strings={strings}
      />
    </div>
  );
};

export default Playground;
