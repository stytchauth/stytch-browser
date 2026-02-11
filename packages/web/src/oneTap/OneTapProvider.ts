import { GOOGLE_ONE_TAP_SCRIPT_URL, loadESModule, OneTapStartResponse, RPCManifest } from '@stytch/core';
import { StytchAPIError } from '@stytch/core/public';
import type { CredentialResponse } from 'google-one-tap';

import { GoogleOneTapClient } from './GoogleOneTapClient';

export const loadGoogleOneTapClient = (): Promise<google.accounts['id']> =>
  loadESModule(GOOGLE_ONE_TAP_SCRIPT_URL, () => window.google.accounts.id);

type OneTapNotLoadedReason =
  // These come from the API directly - err.error_type
  | 'oauth_config_not_found'
  | 'no_login_redirect_urls_set'
  | 'no_signup_redirect_urls_set'
  // If we have an unhandled error :$
  | string;

type OneTapLoadResult =
  | { success: true; client: GoogleOneTapClient }
  | { success: false; reason: OneTapNotLoadedReason };

/**
 * Handles loading One Tap config from Stytch API and initializing {@link GoogleOneTapClient}
 */
export class OneTapProvider {
  private googleConfig?: Promise<OneTapStartResponse>;

  constructor(
    private _publicToken: string,
    private clientsideServices: RPCManifest,
  ) {}

  async createOneTapClient(): Promise<OneTapLoadResult> {
    let googleClientId: string;
    try {
      ({ googleClientId } = await this.fetchGoogleStart());
    } catch (e) {
      const err = StytchAPIError.from(e);
      return { success: false, reason: err.error_type };
    }

    if (googleClientId === '') {
      return { success: false, reason: 'oauth_config_not_found' };
    }
    const client = new GoogleOneTapClient(await loadGoogleOneTapClient(), googleClientId);
    return { success: true, client };
  }

  createOnSuccessHandler =
    ({
      loginRedirectUrl,
      signupRedirectUrl,
      onSuccess,
    }: {
      loginRedirectUrl?: string;
      signupRedirectUrl?: string;
      onSuccess: (redirect_url: string) => void;
    }) =>
    async (response: CredentialResponse) => {
      const { credential } = response;
      const { redirect_url } = await this.submitGoogleOneTapToken({
        credential,
        loginRedirectUrl,
        signupRedirectUrl,
      });
      onSuccess(redirect_url);
    };

  private fetchGoogleStart() {
    if (this.googleConfig) {
      return this.googleConfig;
    }
    this.googleConfig = this.clientsideServices.oneTapStart({
      publicToken: this._publicToken,
    });
    return this.googleConfig;
  }

  private async submitGoogleOneTapToken({
    credential,
    loginRedirectUrl,
    signupRedirectUrl,
  }: {
    credential: string;
    loginRedirectUrl?: string;
    signupRedirectUrl?: string;
  }) {
    const { oauthCallbackId } = await this.fetchGoogleStart();

    return this.clientsideServices.oneTapSubmit({
      publicToken: this._publicToken,
      idToken: credential,
      loginRedirectURL: loginRedirectUrl,
      oauthCallbackID: oauthCallbackId,
      signupRedirectURL: signupRedirectUrl,
    });
  }

  redirectOnSuccess = (redirect_url: string) => {
    window.location.href = redirect_url;
  };

  /**
   * Google One Tap will show a banner on the bottom of the screen on certain mobile devices
   * This logic is controlled via some sniffing of the useragent string on startup
   * These specific strings were extracted from the One Tap minified source code
   * See the linked PR for details and screenshots
   */
  static willGoogleOneTapShowEmbedded(ua = navigator.userAgent): boolean {
    const uaContains = (userAgent: string, searchString: string) => userAgent.indexOf(searchString) !== -1;

    const isTabletUA =
      uaContains(ua, 'iPad') || (uaContains(ua, 'Android') && !uaContains(ua, 'Mobile')) || uaContains(ua, 'Silk');

    const isMobileUA =
      uaContains(ua, 'iPod') || uaContains(ua, 'iPhone') || uaContains(ua, 'Android') || uaContains(ua, 'IEMobile');

    return !isTabletUA && isMobileUA;
  }
}
