import { Values } from '../../utils';

/**
 * The authentication methods we support through our UI.
 * Currently we support `emailMagicLinks`, `emailOtp`, `sso`, `passwords`, and `oauth`.
 */

export const AuthFlowType = {
  Discovery: 'Discovery',
  Organization: 'Organization',
  PasswordReset: 'PasswordReset',
} as const;

export type AuthFlowType = Values<typeof AuthFlowType>;

export const RedirectURLType = {
  ResetPassword: 'reset_password',
} as const;

export type RedirectURLType = Values<typeof RedirectURLType>;

/**
 * The OAuth providers we support in our B2B OAuth product.
 */
export const B2BOAuthProviders = {
  Google: 'google',
  Microsoft: 'microsoft',
  HubSpot: 'hubspot',
  Slack: 'slack',
  GitHub: 'github',
} as const;
export type B2BOAuthProviders = Values<typeof B2BOAuthProviders>;

/**
 * The options for email magic links. This is used if you've enabled the `emailMagicLinks` product
 * in your configuration.
 */

export type B2BEmailMagicLinksOptions = {
  loginRedirectURL?: string;
  signupRedirectURL?: string;
  discoveryRedirectURL?: string;
  loginTemplateId?: string;
  signupTemplateId?: string;
  /**
   * @param domainHint - An optional hint indicating what domain the email will be sent from.
   * This field is only required if your project uses more than one custom domain to send emails.
   */
  domainHint?: string;
  locale?: string;
};

/**
 * The options for SSO. This is used if you've enabled the `sso` product
 * in your configuration.
 */

export type B2BSSOOptions = {
  loginRedirectURL?: string;
  signupRedirectURL?: string;
};

/**
 * The options for OAuth. This is required if you've enabled the `oauth` product
 * in your configuration.
 */

export type B2BOAuthOptions = {
  loginRedirectURL?: string;
  signupRedirectURL?: string;
  discoveryRedirectURL?: string;
  /** @deprecated Use customScopes in B2BOAuthProviderConfig instead */
  customScopes?: string[];
  providers: B2BOAuthProviderConfig[];
  /** @deprecated Use providerParams in B2BOAuthProviderConfig instead */
  providerParams?: Record<string, string>;
  locale?: string;
};

/**
 * Details about the OAuth provider you wish to use. Each B2BOAuthProviderConfig object can be either a plain
 * B2BOAuthProviders string (e.g. 'google'), or  an object with a type key that determines the type of provider. For
 * Google OAuth, you can optionally specify the one_tap property to display Google One Tap.
 */
export type B2BOAuthProviderConfig =
  | B2BOAuthProviders
  | {
      type: typeof B2BOAuthProviders.Google;
      customScopes?: string[];
      providerParams?: Record<string, string>;

      one_tap?: boolean;
      /**
       * Whether to cancel the One Tap prompt when the user taps outside of it.
       * This is only applicable if one_tap is true.
       */
      cancel_on_tap_outside?: boolean;
    }
  | {
      type: Exclude<B2BOAuthProviders, typeof B2BOAuthProviders.Google>;
      customScopes?: string[];
      providerParams?: Record<string, string>;
    };

/**
 * The options for Passwords. This is used if you've enabled the `passwords` product
 * in your configuration.
 */

export type B2BPasswordOptions = {
  loginRedirectURL?: string;
  resetPasswordRedirectURL?: string;
  resetPasswordExpirationMinutes?: number;
  resetPasswordTemplateId?: string;
  discoveryRedirectURL?: string;
  verifyEmailTemplateId?: string;
  locale?: string;
};

export type B2BEmailOTPOptions = {
  loginTemplateId?: string;
  signupTemplateId?: string;
  locale?: string;
};

export type B2BSMSOTPOptions = {
  locale?: string;
};

export type DirectLoginForSingleMembershipConfig = {
  /**
   * Whether or not direct login for single membership is enabled.
   */
  status: boolean;
  /**
   * If enabled, logs user in directly even if they have pending invite to a different organization
   */
  ignoreInvites: boolean;
  /**
   * If enabled, logs user in directly even if they have organizations they could join via JIT provisioning
   */
  ignoreJitProvisioning: boolean;
};

export const B2BMFAProducts = {
  smsOtp: 'smsOtp',
  totp: 'totp',
} as const;
export type B2BMFAProducts = Values<typeof B2BMFAProducts>;
