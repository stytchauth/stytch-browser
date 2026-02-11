import { getOneTapAuthUrl, getOneTapStartUrl, getStytchCsrfCookie } from './utils';
import { RPCManifest } from './manifest';
import { StytchAPIError } from './errors';

export const parsedPhoneNumber: RPCManifest['parsedPhoneNumber'] = async ({ phoneNumber, regionCode }) => {
  const { getAsYouType, parsePhoneNumber } = await import('awesome-phonenumber');
  const parsedPhoneNumber = parsePhoneNumber(phoneNumber, regionCode);
  if (regionCode) {
    const ayt = getAsYouType(regionCode);
    ayt.addChar(phoneNumber);
    return {
      isValid: parsedPhoneNumber.isValid(),
      number: ayt.getPhoneNumber().toJSON().number.e164 ?? phoneNumber,
      national: ayt.getPhoneNumber().toJSON().number.national ?? phoneNumber,
    };
  }
  return {
    isValid: parsedPhoneNumber.isValid(),
    number: parsedPhoneNumber.getNumber() ?? phoneNumber,
    national: parsedPhoneNumber.getNumber('national') ?? phoneNumber,
  };
};

export const oneTapStart: RPCManifest['oneTapStart'] = async ({ publicToken }) => {
  const resp = await fetch(getOneTapStartUrl(publicToken), {
    method: 'GET',
    credentials: 'include',
  });
  const data = await resp.json();
  if (!resp.ok) {
    throw new StytchAPIError(data);
  }
  const { request_id, google_client_id, oauth_callback_id } = data;
  return {
    requestId: request_id,
    googleClientId: google_client_id,
    stytchCsrfToken: getStytchCsrfCookie(),
    oauthCallbackId: oauth_callback_id,
  };
};

export const oneTapSubmit: RPCManifest['oneTapSubmit'] = async ({
  publicToken,
  idToken,
  oauthCallbackID,
  loginRedirectURL,
  signupRedirectURL,
}) => {
  const headers = new Headers();
  headers.append('Content-Type', 'application/json');
  headers.append('x-stytch-oauth-type', 'google-one-tap');
  const resp = await fetch(getOneTapAuthUrl(publicToken, oauthCallbackID), {
    method: 'POST',
    credentials: 'include',
    headers: {
      'x-stytch-oauth-type': 'google-one-tap',
    },
    body: JSON.stringify({
      id_token: idToken,
      stytch_csrf_token: getStytchCsrfCookie(),
      login_redirect_url: loginRedirectURL,
      signup_redirect_url: signupRedirectURL,
    }),
  });
  const { redirect_url, status_code, request_id } = await resp.json();
  if (status_code !== 200) {
    throw Error(`Failed to authenticate Google One Tap token: ${status_code}:${request_id}`);
  }
  return { redirect_url };
};
