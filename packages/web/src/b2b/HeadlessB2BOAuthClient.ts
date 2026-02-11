import {
  DisabledDFPProtectedAuthProvider,
  HeadlessB2BOAuthClient as BaseHeadlessB2BOAuthClient,
  IB2BSubscriptionService,
  IDFPProtectedAuthProvider,
  INetworkClient,
  IPKCEManager,
} from '@stytch/core';
import {
  IHeadlessB2BOAuthClient,
  OneTapPositions,
  StytchProjectConfigurationInput,
  StytchSDKUsageError,
} from '@stytch/core/public';

import { OneTapRenderResult } from '../oneTap/GoogleOneTapClient';
import { B2BOneTapProvider } from './oneTap/B2BOneTapProvider';

export type B2BGoogleOneTapDiscoveryOAuthOptions = {
  /**
   * The URL that Stytch redirects to after the Google One Tap discovery flow is completed.
   * This should be a URL that verifies the request by querying Stytch's /oauth/discovery/authenticate endpoint.
   * If this value is not passed, the default discovery redirect URL that you set in your Dashboard is used.
   * If you have not set a default discovery redirect URL, an error is returned.
   */
  discovery_redirect_url?: string;
  /**
   * Controls whether clicking outside the One Tap prompt dismisses the prompt.
   * Defaults to true.
   */
  cancel_on_tap_outside?: boolean;
};

export type B2BGoogleOneTapOAuthOptions = {
  /**
   * The ID of the organization that the end user is logging in to.
   */
  organization_id: string;

  /**
   * The URL that Stytch redirects to after the Google One Tap flow is completed for a member who already exists.
   * This should be a URL that verifies the request by querying Stytch's /oauth/authenticate endpoint.
   * If this value is not passed, the default login redirect URL that you set in your Dashboard is used.
   * If you have not set a default login redirect URL, an error is returned.
   */
  login_redirect_url?: string;

  /**
   * The URL that Stytch redirects to after the Google One Tap flow is completed for a member who does not yet exist.
   * This should be a URL that verifies the request by querying Stytch's /oauth/authenticate endpoint.
   * If this value is not passed, the default signup redirect URL that you set in your Dashboard is used.
   * If you have not set a default signup redirect URL, an error is returned.
   */
  signup_redirect_url?: string;
  /**
   * Controls whether clicking outside the One Tap prompt dismisses the prompt.
   * Defaults to true.
   */
  cancel_on_tap_outside?: boolean;
};

interface IB2BGoogleOneTapOAuthProvider {
  discovery: {
    /**
     * Start a discovery OAuth flow by showing the Google one tap prompt in the top right corner of the user's browser.
     * You can configure this to be started by a user action (i.e Button click) or on load/render.
     * @example
     * const showGoogleOneTap = useCallback(()=> {
     *   stytch.oauth.googleOneTap.discovery.start({
     *     discovery_redirect_url: 'https://example.com/oauth/callback',
     *   })
     * }, [stytch]);
     * return (
     *   <Button onClick={showGoogleOneTap}> Show Google one tap </Button>
     * );
     *
     * @param options - A {@link B2BGoogleOneTapDiscoveryOAuthOptions} object
     *
     * @returns A {@link OneTapRenderResult} object. The result object includes if the one-tap prompt
     * was rendered, and a reason if it couldn't be rendered.
     *
     * @throws An Error if the one tap client cannot be created.
     */
    start(options?: B2BGoogleOneTapDiscoveryOAuthOptions): Promise<OneTapRenderResult>;
  };
  /**
   * Start an OAuth flow by showing the Google one tap prompt in the top right corner of the user's browser.
   * You can configure this to be started by a user action (i.e Button click) or on load/render.
   * @example
   * const showGoogleOneTap = useCallback(()=> {
   *   stytch.oauth.googleOneTap.start({
   *     organization_id: 'organization-test-123',
   *   })
   * }, [stytch]);
   * return (
   *   <Button onClick={showGoogleOneTap}> Show Google one tap </Button>
   * );
   *
   * @param options - A {@link B2BGoogleOneTapOAuthOptions} object
   *
   * @returns A {@link OneTapRenderResult} object. The result object includes if the one-tap prompt
   * was rendered, and a reason if it couldn't be rendered.
   *
   * @throws An Error if the one tap client cannot be created.
   */
  start(options?: B2BGoogleOneTapOAuthOptions): Promise<OneTapRenderResult>;
}

type DynamicConfig = Promise<{
  cnameDomain: null | string;
  pkceRequiredForOAuth: boolean;
}>;
type Config = {
  publicToken: string;
  testAPIURL: string;
  liveAPIURL: string;
};

export interface IWebB2BOAuthClient<TProjectConfiguration extends StytchProjectConfigurationInput>
  extends IHeadlessB2BOAuthClient<TProjectConfiguration> {
  googleOneTap: IB2BGoogleOneTapOAuthProvider;
}

export class HeadlessB2BOAuthClient<TProjectConfiguration extends StytchProjectConfigurationInput>
  extends BaseHeadlessB2BOAuthClient<TProjectConfiguration>
  implements IWebB2BOAuthClient<TProjectConfiguration>
{
  constructor(
    _networkClient: INetworkClient,
    _subscriptionService: IB2BSubscriptionService<TProjectConfiguration>,
    _pkceManager: IPKCEManager,
    _dynamicConfig: DynamicConfig,
    _config: Config,
    _dfpProtectedAuth: IDFPProtectedAuthProvider = DisabledDFPProtectedAuthProvider(),
    private _oneTap: B2BOneTapProvider,
  ) {
    super(_networkClient, _subscriptionService, _pkceManager, _dynamicConfig, _config, _dfpProtectedAuth);
  }

  private startOneTapDiscovery = async (options: B2BGoogleOneTapDiscoveryOAuthOptions): Promise<OneTapRenderResult> => {
    const clientResult = await this._oneTap.createOneTapClient();
    if (!clientResult.success) {
      throw new Error(`One Tap could not load: ${clientResult.reason}`);
    }

    const { client } = clientResult;

    const onSuccessCallback = this._oneTap.createOnDiscoverySuccessHandler({
      discoveryRedirectUrl: options.discovery_redirect_url,
      onSuccess: this._oneTap.redirectOnSuccess,
    });

    return client.render({
      style: {
        position: OneTapPositions.floating,
      },
      callback: onSuccessCallback,
      cancelOnTapOutside: options.cancel_on_tap_outside,
    });
  };

  private startOneTap = async (options: B2BGoogleOneTapOAuthOptions): Promise<OneTapRenderResult> => {
    if (!options.organization_id) {
      throw new StytchSDKUsageError('stytch.oauth.googleOneTap.start', 'organization_id is a required argument');
    }
    const clientResult = await this._oneTap.createOneTapClient();
    if (!clientResult.success) {
      throw new Error(`One Tap could not load: ${clientResult.reason}`);
    }

    const { client } = clientResult;

    const onSuccessCallback = this._oneTap.createOnSuccessHandler({
      organizationId: options.organization_id,
      signupRedirectUrl: options.signup_redirect_url,
      loginRedirectUrl: options.login_redirect_url,
      onSuccess: this._oneTap.redirectOnSuccess,
    });

    return client.render({
      style: {
        position: OneTapPositions.floating,
      },
      callback: onSuccessCallback,
      cancelOnTapOutside: options.cancel_on_tap_outside,
    });
  };

  googleOneTap: IB2BGoogleOneTapOAuthProvider = {
    discovery: {
      start: this.startOneTapDiscovery,
    },
    start: this.startOneTap,
  };
}
