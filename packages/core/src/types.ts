import { DFPProtectedAuthMode } from './DFPProtectedAuthProvider';
import {
  AuthFlowType,
  B2BEmailMagicLinksOptions,
  B2BEmailOTPOptions,
  B2BMFAProducts,
  B2BOAuthOptions,
  B2BPasswordOptions,
  B2BSMSOTPOptions,
  B2BSSOOptions,
  DirectLoginForSingleMembershipConfig,
  EmailMagicLinksOptions,
  OAuthOptions,
  OtpOptions,
  PasskeyOptions,
  PasswordOptions,
  SessionOptions,
  StytchClientOptions,
} from './public';
import { RBACPolicyRaw } from './rbac';
import { Vertical } from './Vertical';

export type BootstrapData = {
  projectName: string | null;
  displayWatermark: boolean;
  cnameDomain: string | null;
  emailDomains: string[];
  captchaSettings: { enabled: false } | { enabled: true; siteKey: string };
  pkceRequiredForEmailMagicLinks: boolean;
  pkceRequiredForPasswordResets: boolean;
  pkceRequiredForOAuth: boolean;
  pkceRequiredForSso: boolean;
  slugPattern: string | null;
  createOrganizationEnabled: boolean;
  passwordConfig: { ludsComplexity: number; ludsMinimumCount: number } | null;
  runDFPProtectedAuth: boolean;
  dfpProtectedAuthMode?: DFPProtectedAuthMode;
  rbacPolicy: RBACPolicyRaw | null;
  siweRequiredForCryptoWallets: boolean;
  vertical: Vertical | null;
};

export type EnvironmentOptions = {
  endpoints?: {
    liveAPIURL: string;
    testAPIURL: string;
    dfpBackendURL: string;
    clientsideServicesIframeURL: string;
  };
};

export type InternalStytchClientOptions = StytchClientOptions & EnvironmentOptions;

/**
 * Internal common config options, excluding platform specific configs like styling and the
 * products array on web. This is just internal to avoid this being exported out and getting
 * confused with the public StytchLoginConfig type
 */
export type CommonLoginConfig = {
  emailMagicLinksOptions?: EmailMagicLinksOptions;
  oauthOptions?: OAuthOptions;
  otpOptions?: OtpOptions;
  sessionOptions?: SessionOptions;
  passwordOptions?: PasswordOptions;
  passkeyOptions?: PasskeyOptions;

  /**
   * The `enableShadowDOM` configuration option allows developers to use the Stytch SDK in a shadow DOM.
   * @default false
   * @deprecated - Use enableShadowDOM in `presentation.options` instead
   */
  enableShadowDOM?: boolean;
};

/**
 * Internal common config options, excluding platform specific configs like styling and the
 * products array on web. This is just internal to avoid this being exported out and getting
 * confused with the public StytchB2BUIConfig type
 */
export type CommonB2BLoginConfig = {
  authFlowType: AuthFlowType;
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
  mfaProductOrder?: readonly B2BMFAProducts[];

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
  mfaProductInclude?: readonly B2BMFAProducts[];

  /**
   * The slug of the organization to use in the organization-specific auth flow.
   * If not specified, the organization will be inferred from the URL based on
   * the project's configured slug pattern.
   *
   * This has no effect outside of the organization-specific auth flow.
   */
  organizationSlug?: string | null;

  /**
   * The `enableShadowDOM` configuration option allows developers to use the Stytch SDK in a shadow DOM.
   * @default false
   * @deprecated - Use enableShadowDOM in `presentation.options` instead
   */
  enableShadowDOM?: boolean;
};

export type SessionUpdateOptions = {
  /**
   * If the authenticate method was called with session_duration_minutes, this property will
   * be set. This is mainly used for the keepSessionAlive option.
   */
  sessionDurationMinutes?: number;
};
