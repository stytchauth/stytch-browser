import { INetworkClient, IPKCEManager } from '@stytch/core';
import { ResponseCommon, StytchAPIError } from '@stytch/core/public';
import type { CredentialResponse } from 'google-one-tap';

import { GoogleOneTapClient } from '../../oneTap/GoogleOneTapClient';
import { loadGoogleOneTapClient } from '../../oneTap/OneTapProvider';

type B2BOneTapStartResponse = ResponseCommon & {
  google_client_id: string;
};

type B2BOneTapSubmitResponse = ResponseCommon & {
  redirect_url: string;
};

type OneTapNotLoadedReason =
  // These come from the API directly - err.error_type
  | 'oauth_config_not_found'
  | 'default_provider_not_allowed'
  // If we have an unhandled error :$
  | string;

type OneTapLoadResult =
  | { success: true; client: GoogleOneTapClient }
  | { success: false; reason: OneTapNotLoadedReason };

type DynamicConfig = Promise<{
  pkceRequiredForOAuth: boolean;
}>;

const DefaultDynamicConfig = Promise.resolve({
  pkceRequiredForOAuth: false,
});

/**
 * Handles loading One Tap config from Stytch API and initializing {@link GoogleOneTapClient}
 */
export class B2BOneTapProvider {
  private googleClientID?: string;
  constructor(
    private _networkClient: INetworkClient,
    private _pkceManager: IPKCEManager,
    private _config: DynamicConfig = DefaultDynamicConfig,
  ) {}

  private async fetchGoogleStart() {
    if (this.googleClientID) {
      return this.googleClientID;
    }
    const oneTapStartResp = await this._networkClient.fetchSDK<B2BOneTapStartResponse>({
      url: '/b2b/oauth/google/onetap/start',
      method: 'GET',
    });
    this.googleClientID = oneTapStartResp.google_client_id;
    return this.googleClientID;
  }

  private async submitGoogleOneTapTokenDiscovery({
    credential,
    discoveryRedirectUrl,
  }: {
    credential: string;
    discoveryRedirectUrl?: string;
  }) {
    let codeChallenge = undefined;
    const { pkceRequiredForOAuth } = await this._config;
    if (pkceRequiredForOAuth) {
      const keyPair = await this._pkceManager.startPKCETransaction();
      codeChallenge = keyPair.code_challenge;
    } else {
      this._pkceManager.clearPKPair();
    }
    return await this._networkClient.fetchSDK<B2BOneTapSubmitResponse>({
      url: '/b2b/oauth/google/onetap/discovery/submit',
      method: 'POST',
      body: {
        id_token: credential,
        discovery_redirect_url: discoveryRedirectUrl,
        pkce_code_challenge: codeChallenge,
      },
    });
  }

  private async submitGoogleOneTapToken({
    credential,
    organizationId,
    signupRedirectUrl,
    loginRedirectUrl,
  }: {
    credential: string;
    organizationId: string;
    signupRedirectUrl?: string;
    loginRedirectUrl?: string;
  }) {
    let codeChallenge = undefined;
    const { pkceRequiredForOAuth } = await this._config;
    if (pkceRequiredForOAuth) {
      const keyPair = await this._pkceManager.startPKCETransaction();
      codeChallenge = keyPair.code_challenge;
    } else {
      this._pkceManager.clearPKPair();
    }
    return await this._networkClient.fetchSDK<B2BOneTapSubmitResponse>({
      url: '/b2b/oauth/google/onetap/submit',
      method: 'POST',
      body: {
        id_token: credential,
        organization_id: organizationId,
        signup_redirect_url: signupRedirectUrl,
        login_redirect_url: loginRedirectUrl,
        pkce_code_challenge: codeChallenge,
      },
    });
  }

  async createOneTapClient(): Promise<OneTapLoadResult> {
    let googleClientId: string;
    try {
      googleClientId = await this.fetchGoogleStart();
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

  createOnDiscoverySuccessHandler =
    ({
      discoveryRedirectUrl,
      onSuccess,
      onError,
    }: {
      discoveryRedirectUrl?: string;
      onSuccess: (redirect_url: string) => void;
      onError?: (error: Error) => void;
    }) =>
    async (response: CredentialResponse) => {
      const { credential } = response;
      let submitPromise = this.submitGoogleOneTapTokenDiscovery({
        credential,
        discoveryRedirectUrl,
      }).then((result) => onSuccess(result.redirect_url));
      if (onError) {
        submitPromise = submitPromise.catch((error) => onError(error));
      }
      await submitPromise;
    };

  createOnSuccessHandler =
    ({
      organizationId,
      signupRedirectUrl,
      loginRedirectUrl,
      onSuccess,
      onError,
    }: {
      organizationId: string;
      signupRedirectUrl?: string;
      loginRedirectUrl?: string;
      onSuccess: (redirect_url: string) => void;
      onError?: (error: Error) => void;
    }) =>
    async (response: CredentialResponse) => {
      const { credential } = response;
      let submitPromise = this.submitGoogleOneTapToken({
        credential,
        organizationId,
        signupRedirectUrl,
        loginRedirectUrl,
      }).then((result) => onSuccess(result.redirect_url));
      if (onError) {
        submitPromise = submitPromise.catch((error) => onError(error));
      }
      await submitPromise;
    };

  redirectOnSuccess = (redirect_url: string) => {
    window.location.href = redirect_url;
  };
}
