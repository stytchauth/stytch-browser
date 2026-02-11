/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly STORYBOOK_PUBLIC_TEST_API_URL: string;
  readonly STORYBOOK_PUBLIC_LIVE_API_URL: string;
  readonly STORYBOOK_PUBLIC_DFP_BACKEND_URL: string;
  readonly STORYBOOK_PUBLIC_CLIENTSIDE_SERVICES_IFRAME_URL: string;
  readonly STORYBOOK_STYTCH_PUBLIC_TOKEN: string;
  readonly STORYBOOK_STYTCH_B2B_PUBLIC_TOKEN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
