export const TEST_API_URL = 'https://test.stytch.com';
export const LIVE_API_URL = 'https://api.stytch.com';
export const CLIENTSIDE_SERVICES_IFRAME_URL = 'https://js.stytch.com/clientside-services/index.html';

export const STYTCH_DFP_BACKEND_URL = `https://telemetry.stytch.com`;
export const STYTCH_DFP_CDN_URL = `https://elements.stytch.com`;

export const STYTCH_SESSION_COOKIE = 'stytch_session';
export const STYTCH_SESSION_JWT_COOKIE = 'stytch_session_jwt';
export const POWERED_BY_STYTCH_IMG_URL = 'https://public-assets.stytch.com/et_powered_by_stytch_logo.png';

export const GOOGLE_ONE_TAP_HOST = 'https://accounts.google.com/gsi';

export const GOOGLE_ONE_TAP_SCRIPT_URL = `${GOOGLE_ONE_TAP_HOST}/client`;

export const DEFAULT_SESSION_DURATION_MINUTES = 30;
export const DEFAULT_OTP_EXPIRATION_MINUTES = 5;

export const MULTIPLE_STYTCH_CLIENTS_DETECTED_WARNING =
  "It looks like you're creating multiple copies of the Stytch client." +
  ' This behavior is unsupported, and unintended side effects may occur. ' +
  "Make sure you are creating the Stytch client at the global level, and not inside a component's render function.";
