export type StytchClientOptions = {
  /**
   * If true, the session will be automatically extended when the user has the
   * application open.
   */
  keepSessionAlive?: boolean;

  /**
   * The custom domain to use for Stytch API calls. Defaults to
   * `api.stytch.com`.
   */
  customBaseUrl?: string;

  /**
   * The custom domain to use for DFP Protected Auth. You must contact Stytch support to set up the domain
   * prior to using it in the SDK.
   */
  dfppaUrl?: string;

  iosDisableUrlCache?: boolean;
};
