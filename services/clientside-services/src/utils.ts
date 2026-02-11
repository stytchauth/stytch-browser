import Cookies from 'js-cookie';

const STYTCH_CSRF_TOKEN_NAME = 'stytch_csrf_private_token';

const isTestPublicToken = (token: string): boolean => token.includes('public-token-test');

export const getStytchCsrfCookie = (): string => Cookies.get(STYTCH_CSRF_TOKEN_NAME) || '';

const getBaseURL = (publicToken: string): string => {
  if (isTestPublicToken(publicToken)) {
    return process.env.TEST_API_URL || '';
  }
  return process.env.LIVE_API_URL || '';
};

export const getOneTapAuthUrl = (publicToken: string, oauthCallbackID: string): string => {
  const baseURL = getBaseURL(publicToken);
  const authURL = new URL(`${baseURL}/v1/oauth/callback/${oauthCallbackID}`);
  return authURL.toString();
};

export const getOneTapStartUrl = (publicToken: string): string => {
  const baseURL = getBaseURL(publicToken);
  const oauthUrl = new URL(`${baseURL}/v1/public/oauth/google/onetap/start`);
  oauthUrl.searchParams.set('public_token', publicToken);
  return oauthUrl.toString();
};
