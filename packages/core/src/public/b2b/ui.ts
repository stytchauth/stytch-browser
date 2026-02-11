import { EnumOrStringLiteral } from '../../utils';
import { SessionOptions } from '../ui';

/**
 * The authentication methods we support through our UI.
 * Currently we support `emailMagicLinks`, `emailOtp`, `sso`, `passwords`, and `oauth`.
 */

export enum B2BProducts {
  emailMagicLinks = 'emailMagicLinks',
  emailOtp = 'emailOtp',
  sso = 'sso',
  passwords = 'passwords',
  oauth = 'oauth',
}

export enum AuthFlowType {
  Discovery = 'Discovery',
  Organization = 'Organization',
  PasswordReset = 'PasswordReset',
}

export enum RedirectURLType {
  ResetPassword = 'reset_password',
}

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
  | EnumOrStringLiteral<B2BOAuthProviders>
  | {
      type: EnumOrStringLiteral<B2BOAuthProviders.Google>;
      one_tap: boolean;
      /**
       * Whether to cancel the One Tap prompt when the user taps outside of it.
       * This is only applicable if one_tap is true.
       */
      cancel_on_tap_outside?: boolean;
      customScopes?: string[];
      providerParams?: Record<string, string>;
    }
  | { type: EnumOrStringLiteral<B2BOAuthProviders>; customScopes?: string[]; providerParams?: Record<string, string> };

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

export type StytchB2BUIConfig = {
  /**
   * The products array allows you to specify the authentication methods that you would like to
   * expose to your users. The order of the products that you include here will also be the order
   * in which they appear in the login form,
   */
  products: EnumOrStringLiteral<B2BProducts>[];
  authFlowType: EnumOrStringLiteral<AuthFlowType>;
  sessionOptions: SessionOptions;
  emailMagicLinksOptions?: B2BEmailMagicLinksOptions;
  ssoOptions?: B2BSSOOptions;
  passwordOptions?: B2BPasswordOptions;
  oauthOptions?: B2BOAuthOptions;
  emailOtpOptions?: B2BEmailOTPOptions;
  smsOtpOptions?: B2BSMSOTPOptions;
  /**
   * An optional config that allows you to skip the discover flow and log a member
   * in directly only if they are a member of a single organization.
   */
  directLoginForSingleMembership?: DirectLoginForSingleMembershipConfig;
  /**
   * Whether or not an organization should be created directly when a user has
   * no memberships, invitations, or organizations they could join via JIT
   * provisioning. This has no effect if the ability to create organizations
   * from the frontend SDK is disabled in the Stytch dashboard. Defaults to
   * `false`.
   */
  directCreateOrganizationForNoMembership?: boolean;
  /**
   * Whether to prevent users who are not members of any organization from
   * creating a new organization during the discovery flow. This has no effect
   * if the ability to create organizations from the frontend SDK is disabled in
   * the Stytch dashboard. Defaults to `false`.
   */
  disableCreateOrganization?: boolean;

  /**
   * The order to present MFA products to a member when multiple choices are
   * available, such as during enrollment.
   */
  mfaProductOrder?: readonly EnumOrStringLiteral<B2BMFAProducts>[];

  /**
   * MFA products to include in the UI. If specified, the list of available
   * products will be limited to those included. Defaults to all available
   * products.
   *
   * Note that if an organization restricts the available MFA methods, the
   * organization's settings will take precedence. In addition, if a member is
   * enrolled in MFA compatible with their organization's policies, their
   * enrolled methods will always be made available.
   */
  mfaProductInclude?: readonly EnumOrStringLiteral<B2BMFAProducts>[];

  /**
   * The slug of the organization to use in the organization-specific auth flow.
   * If not specified, the organization will be inferred from the URL based on
   * the project's configured slug pattern.
   *
   * This has no effect outside of the organization-specific auth flow.
   */
  organizationSlug?: string | null;
};

export enum B2BMFAProducts {
  smsOtp = 'smsOtp',
  totp = 'totp',
}

/**
 * The OAuth providers we support in our B2B OAuth product.
 */

export enum B2BOAuthProviders {
  Google = 'google',
  Microsoft = 'microsoft',
  HubSpot = 'hubspot',
  Slack = 'slack',
  GitHub = 'github',
}
