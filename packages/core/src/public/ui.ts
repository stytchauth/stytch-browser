import { OTPsAuthenticateResponse, OTPsLoginOrCreateResponse } from './otps';
import { MagicLinksLoginOrCreateResponse } from './magicLinks';
import { CryptoWalletAuthenticateStartResponse, CryptoWalletAuthenticateResponse } from './cryptoWallets';
import {
  PasswordAuthenticateResponse,
  PasswordCreateResponse,
  PasswordResetByEmailResponse,
  PasswordResetByEmailStartResponse,
} from './passwords';
import {
  B2BMagicLinkLoginOrSignupResponse,
  B2BMagicLinksEmailDiscoverySendResponse,
  B2BMagicLinksDiscoveryAuthenticateResponse,
  SSOAuthenticateResponse,
  B2BDiscoveryOrganizationsCreateResponse,
  B2BDiscoveryIntermediateSessionsExchangeResponse,
  B2BPasswordResetByEmailStartResponse,
  B2BPasswordResetByEmailResponse,
  B2BPasswordResetBySessionResponse,
  B2BOAuthAuthenticateResponse,
  B2BOAuthDiscoveryAuthenticateResponse,
  B2BPasswordAuthenticateResponse,
  B2BMagicLinksAuthenticateResponse,
  B2BSMSSendResponse,
  B2BSMSAuthenticateResponse,
  B2BTOTPCreateResponse,
  B2BTOTPAuthenticateResponse,
  RecoveryCodeRecoverResponse,
  B2BPasswordDiscoveryResetByEmailResponse,
  B2BPasswordDiscoveryAuthenticateResponse,
  B2BPasswordDiscoveryResetByEmailStartResponse,
  B2BImpersonationAuthenticateResponse,
  B2BOTPsEmailAuthenticateResponse,
  B2BOTPsEmailLoginOrSignupResponse,
  B2BDiscoveryOTPEmailSendResponse,
  B2BDiscoveryOTPEmailAuthenticateResponse,
  B2BOrganizationsGetBySlugResponse,
  B2BSSODiscoverConnectionsResponse,
} from './b2b';
import { WebAuthnRegisterResponse, WebAuthnAuthenticateResponse } from './webauthn';
import { StytchSDKUIError } from './SDKErrors';
import { EnumOrStringLiteral } from '../utils/EnumOrStringLiteral';
import { StytchProjectConfigurationInput } from './typeConfig';

type DeepPartial<K> = {
  [attr in keyof K]?: K[attr] extends object ? DeepPartial<K[attr]> : K[attr];
};

/**
 * The authentication methods we support through our UI.
 * Currently we support `emailMagicLinks`, `oauth`, `otp`, `crypto` and `passwords`.
 */

export enum Products {
  emailMagicLinks = 'emailMagicLinks',
  oauth = 'oauth',
  otp = 'otp',
  crypto = 'crypto',
  passwords = 'passwords',
  passkeys = 'passkeys',
}

/**
 * The options for email magic links. This is used if you've enabled the `emailMagicLinks` product
 * in your configuration.
 */

export type EmailMagicLinksOptions = {
  loginRedirectURL?: string;
  loginExpirationMinutes?: number;
  signupRedirectURL?: string;
  signupExpirationMinutes?: number;
  loginTemplateId?: string;
  signupTemplateId?: string;
  createUserAsPending?: boolean;
  /**
   * @param domainHint - An optional hint indicating what domain the email will be sent from.
   * This field is only required if your project uses more than one custom domain to send emails.
   */
  domainHint?: string;
  locale?: string;
};

/**
 * The OAuth providers we support in our OAuth product.
 * Currently we support `Amazon`, `Apple`, `Bitbucket`, `Discord`, `Facebook`, `Figma`, `Google`, `GitLab`,
 * `LinkedIn`, `Microsoft`, `Salesforce`, `Slack`, `Snapchat`, `TikTok`, `Twitch`, `Twitter`, and `Yahoo`.
 */

export enum OAuthProviders {
  Google = 'google',
  Microsoft = 'microsoft',
  Apple = 'apple',
  Github = 'github',
  GitLab = 'gitlab',
  Facebook = 'facebook',
  Discord = 'discord',
  Salesforce = 'salesforce',
  Slack = 'slack',
  Amazon = 'amazon',
  Bitbucket = 'bitbucket',
  LinkedIn = 'linkedin',
  Coinbase = 'coinbase',
  Twitch = 'twitch',
  Twitter = 'twitter',
  TikTok = 'tiktok',
  Snapchat = 'snapchat',
  Figma = 'figma',
  Yahoo = 'yahoo',
}

/**
 * The Crypto Wallets we support in our crypto product.
 * Currently we support all ethereum and solana wallets.
 * We additionally detect and show popular wallets as distinct options.
 * The list of poular wallets include `Binance`, `Coinbase`, `Metamask`, `Phantom`, and `Vessel`
 */

export enum Wallets {
  Vessel = 'Vessel',
  Phantom = 'Phantom',
  Metamask = 'Metamask',
  Coinbase = 'Coinbase',
  Binance = 'Binance',
  GenericEthereumWallet = 'Other Ethereum Wallet',
  GenericSolanaWallet = 'Other Solana Wallet',
}

/**
 * Supported behaviors for positioning Google One Tap. The actual behavior
 * depends on browser support and Google's One Tap implementation.
 */

export enum OneTapPositions {
  /**
   * Display Google One Tap using a native browser prompt if available, or
   * embedded in the existing SDK login form otherwise.
   * @deprecated This option has been renamed to `floatingOrEmbedded`
   */
  embedded = 'embedded',
  /**
   * Display the One Tap prompt using a native browser prompt if available, or
   * in the top right corner otherwise. This is the default option.
   */
  floating = 'floating',
  /**
   * Display the One Tap prompt embedded in the existing SDK login form if a
   * native browser prompt is not available, or not at all otherwise. This
   * option is not recommended for new applications.
   */
  embeddedOnly = 'embeddedOnly',
  /**
   * Display the One Tap prompt using a native browser prompt if available, or
   * embedded in the existing SDK login form otherwise.
   */
  floatingOrEmbedded = 'floatingOrEmbedded',
  /**
   * Attempt to display the One Tap prompt embedded in the existing SDK login
   * form, even if a native browser prompt is supported. This option is not
   * recommended. It disables native browser FedCM support even where it is
   * available, and will stop being honored by Google in the future.
   */
  forceLegacyEmbedded = 'forceLegacyEmbedded',
}

export type ProviderOptions = {
  type: EnumOrStringLiteral<OAuthProviders>;
  one_tap?: boolean;
  position?: EnumOrStringLiteral<OneTapPositions>;
  /**
   * Whether to cancel the One Tap prompt when the user taps outside of it.
   * This is only applicable if one_tap is true.
   */
  cancel_on_tap_outside?: boolean;
  custom_scopes?: string[];
  provider_params?: Record<string, string>;
};

/**
 * An array of OAuth providers you wish to use. Each Provider is an object with a type key that
 * determines the type of provider. Each Provider accepts an optional custom_scopes array of
 * scopes that Stytch will request for your application in addition to the base set of scopes
 * required for login. The order of the providers in the array determines the order of the
 * rendered buttons.
 */
export type ProvidersOptions = ProviderOptions[];

/**
 * The options for oAuth. This is required if you've enabled the `oauth` product
 * in your configuration.
 */

export type OAuthOptions = {
  loginRedirectURL?: string;
  signupRedirectURL?: string;
  providers: ProvidersOptions;
};

/**
 * The methods array allows you to specify the authentication methods that you would like to expose
 * to your users. The order of the products that you include here will also be the order in which
 * they appear in the login form, with the first product specified appearing at the top of the login
 * form. We currently support passcodes on `email`, `sms` and `whatsapp`
 */

export enum OTPMethods {
  SMS = 'sms',
  WhatsApp = 'whatsapp',
  Email = 'email',
}

/**
 * The options for One Time Passcodes. This is required if you've enabled the `otp` product
 * in your configuration.
 */

export type OtpOptions = {
  methods: EnumOrStringLiteral<OTPMethods>[];
  expirationMinutes: number;
  loginTemplateId?: string;
  signupTemplateId?: string;
  locale?: string;
};

/**
 * The options for passwords. This is used if you've enabled the `passwords` product
 * in your configuration.
 */

export type PasswordOptions = {
  loginRedirectURL?: string;
  loginExpirationMinutes?: number;
  resetPasswordRedirectURL?: string;
  resetPasswordExpirationMinutes?: number;
  resetPasswordTemplateId?: string;
  locale?: string;
};

/**
 * The options for Session Management. If you are using the UI components,
 * we also create a session for users when they log in.
 */

export type SessionOptions = {
  sessionDurationMinutes: number;
};

export type PasskeyOptions = {
  /**
   * Sets the domain option for both webauthn registration and authentication.
   * @default window.location.hostname
   */
  domain?: string;
};

export type StringsOptions = {
  /**
   * Specify custom strings to be used in the prebuilt UI. Consult the message
   * catalog (`messages/en.po` or `messages/b2b/en.po`) for the list of
   * available strings. Each value should be specified using ICU MessageFormat.
   *
   * Strings that are not defined will use the default English value as a
   * fallback.
   */
  strings?: Record<string, string>;
};

/**
 * The configuration object for the Stytch SDK's UI
 */
export type StytchLoginConfig = {
  /**
   * The products array allows you to specify the authentication methods that you would like to
   * expose to your users. The order of the products that you include here will also be the order
   * in which they appear in the login form,
   */
  products: EnumOrStringLiteral<Products>[];
  emailMagicLinksOptions?: EmailMagicLinksOptions;
  oauthOptions?: OAuthOptions;
  otpOptions?: OtpOptions;
  sessionOptions?: SessionOptions;
  passwordOptions?: PasswordOptions;
  passkeyOptions?: PasskeyOptions;

  /**
   * The `enableShadowDOM` configuration option allows developers to use the Stytch SDK in a shadow DOM. This defaults to `false`.
   */
  enableShadowDOM?: boolean;
};

/**
 * The style configuration allows you to customize the look of the SDK. You can specify some of
 * them or none at all.
 */
export type StyleConfig = DeepPartial<{
  /**
   * The configuration object for the Stytch UI container.
   */
  container: {
    /**
     * The background color of the SDK container.
     */
    backgroundColor: string;
    /**
     * The border color of the SDK container.
     */
    borderColor: string;
    /**
     * The border radius of the SDK container.
     */
    borderRadius: string;
    /**
     * The width of the SDK container.
     */
    width: string;
  };

  /**
   * The configuration object for colors used in the Stytch UI.
   */
  colors: {
    /**
     * Your primary brand color. This will be applied to most of the text in the SDK.
     */
    primary: string;
    /**
     * Your secondary brand color. This will be applied to text disclaimers and other visual elements.
     */
    secondary: string;
    /**
     * Your accent brand color. This will be applied to backgrounds of messages to draw user's attention.
     * This should have strong contrast with the primary text color for accessibility.
     */
    accent: string;
    /**
     * A success color to be used in visual elements.
     */
    success: string;
    /**
     * A warning color to be used in visual elements.
     */
    warning: string;
    /**
     * An error color to be used in visual elements.
     */
    error: string;
  };

  /**
   * The configuration object for buttons in the Stytch UI components.
   */
  buttons: {
    /**
     * The configuration object for primary buttons. These buttons are used in primary actions
     * including magic links, one-time passcodes and passwords products.
     */
    primary: {
      /**
       * The background color of the primary button.
       */
      backgroundColor: string;
      /**
       * The text color of the primary button.
       */
      textColor: string;
      /**
       * The border color of the primary button.
       */
      borderColor: string;
      /**
       * The border radius of the primary button.
       */
      borderRadius: string;
    };

    /**
     * The configuration object for secondary buttons.
     */
    secondary: {
      /**
       * The background color of the secondary button. These buttons are used in secondary actions
       * including but not limited OAuth and crypto wallets.
       */
      backgroundColor: string;
      /**
       * The text color of the secondary button.
       */
      textColor: string;
      /**
       * The border color of the secondary button.
       */
      borderColor: string;
      /**
       * The border radius of the secondary button.
       */
      borderRadius: string;
    };

    /**
     * The configuration object for disabled buttons.
     */
    disabled: {
      /**
       * The background color of the disabled button.
       */
      backgroundColor: string;
      /**
       * The text color of the disabled button.
       */
      textColor: string;
      /**
       * The border color of the disabled button.
       */
      borderColor: string;
      /**
       * The border radius of the disabled button.
       */
      borderRadius: string;
    };
  };

  /**
   * The configuration object for text inputs in the Stytch UI components.
   */
  inputs: {
    /**
     * The background color of the text inputs.
     */
    backgroundColor: string;
    /**
     * The text color of the text inputs.
     */
    textColor: string;
    /**
     * The color of the placeholder text in the text inputs.
     */
    placeholderColor: string;
    /**
     * The border color of the text inputs.
     */
    borderColor: string;
    /**
     * The border radius of the text inputs.
     */
    borderRadius: string;
  };

  /**
   * The font family that will apply to all text in the SDK.
   */
  fontFamily: string;

  /**
   * When this value is false, the title and description text will not show in the SDK.
   */
  hideHeaderText: boolean;

  /**
   * The configuration object for your custom logo.
   */
  logo: {
    /**
     * The URL of your custom logo.
     */
    logoImageUrl: string;
  };
}>;

export type IDPConsentItem =
  | string
  | {
      /**
       * A one liner description of access being requested
       * @example
       *  'View content and info about you'
       */
      text: string;
      /**
       * A detailed list of access being requested for a line item
       * Each item in the array will be displayed as a separate bullet point
       * @example
       *  [
       *   'View content you have added to the platform, including videos and comments',
       *   'View information shared on the platform, including your name, and email'
       * ]
       */
      details?: string[];
    };

export type IDPConsentSection = {
  /**
   * A top-level header for a section of the consent screen
   * @example
   *   '$Application is requesting to edit'
   */
  header: string;
  /**
   * A collection of {@link IDPConsentItem} rows to render with the supplied header
   */
  items: IDPConsentItem[];
};

/**
 * An IDP Consent Screen Manifest defines the text to be shown to the end user during
 * a consent flow. Manifests can be used to customize grouping of access controls.
 * For example, an application can choose to group access controls by action being performed,
 * by resource being accessed, or by something else entirely.
 * @example
 * // A simple list will be rendered as a list of bullet points
 * [
 *   { text: 'Content and info about you' },
 *   { text: 'Content and info about your workspace' },
 *   { text: 'Create and delete new items in your workspace' },
 * ]
 * @example
 * // Items can have nested details
 * [
 *   {
 *     text: 'Content and info about you'
 *     details: [
 *       'View content you have added to the platform, including videos and comments',
 *       'View information shared on the platform, including your name, and email'
 *     ]
 *   }
 * ]
 * @example
 * // Items can be grouped with headers
 *  [
 *    {
 *      header: '$Application is requesting to view:',
 *      items: [
 *        { text: 'Content and info about you' },
 *        { text: 'Content and info about your workspace' },
 *      ]
 *    },
 *    {
 *      header: '$Application is requesting to edit:',
 *      items: [
 *        { text: 'Your workspace items' }
 *      ]
 *    }
 *  ]
 */
export type IDPConsentScreenManifest = IDPConsentSection[] | IDPConsentItem[];

export enum StytchEventType {
  MagicLinkLoginOrCreateEvent = 'MAGIC_LINK_LOGIN_OR_CREATE',
  OTPsLoginOrCreateEvent = 'OTP_LOGIN_OR_CREATE',
  OTPsAuthenticate = 'OTP_AUTHENTICATE',
  CryptoWalletAuthenticateStart = 'CRYPTO_WALLET_AUTHENTICATE_START',
  CryptoWalletAuthenticate = 'CRYPTO_WALLET_AUTHENTICATE',
  PasswordCreate = 'PASSWORD_CREATE',
  PasswordAuthenticate = 'PASSWORD_AUTHENTICATE',
  PasswordResetByEmailStart = 'PASSWORD_RESET_BY_EMAIL_START',
  PasswordResetByEmail = 'PASSWORD_RESET_BY_EMAIL',
  PasskeyRegister = 'PASSKEY_REGISTER',
  PasskeyAuthenticate = 'PASSKEY_AUTHENTICATE',
  PasskeySkip = 'PASSKEY_SKIP',
  PasskeyDone = 'PASSKEY_DONE',
  /**
   * The authentication UI flow has completed successfully, including any steps
   * that take place after obtaining a valid session (such as saving recovery
   * codes).
   */
  AuthenticateFlowComplete = 'AUTHENTICATE_FLOW_COMPLETE',
  /**
   * An OAuth Authorization flow has been initiated by a Connected Application.
   * The end-user may be prompted for consent to continue depending on the application
   * that is requesting access.
   */
  OAuthAuthorizeFlowStart = 'OAUTH_AUTHORIZE_FLOW_START',
  /**
   * The end-user has completed the Authorization flow and is about to be redirected
   * back to the Connected Application
   */
  OAuthAuthorizeFlowComplete = 'OAUTH_AUTHORIZE_FLOW_COMPLETE',
  /**
   * The end-user has denied the Authorization flow and is about to be redirected
   * back to the Connected Application with an error message
   */
  OAuthAuthorizeFlowConsentDenied = 'OAUTH_AUTHORIZE_FLOW_CONSENT_DENIED',
  // More Events will go here ...
  // B2B Events
  B2BMagicLinkEmailLoginOrSignup = 'B2B_MAGIC_LINK_EMAIL_LOGIN_OR_SIGNUP',
  B2BMagicLinkAuthenticate = 'B2B_MAGIC_LINK_AUTHENTICATE',
  B2BMagicLinkEmailDiscoverySend = 'B2B_MAGIC_LINK_EMAIL_DISCOVERY_SEND',
  B2BMagicLinkDiscoveryAuthenticate = 'B2B_MAGIC_LINK_DISCOVERY_AUTHENTICATE',
  B2BSSOStart = 'B2B_SSO_START',
  B2BSSOAuthenticate = 'B2B_SSO_AUTHENTICATE',
  B2BSSODiscoverConnections = 'B2B_SSO_DISCOVER_CONNECTIONS',
  B2BOAuthAuthenticate = 'B2B_OAUTH_AUTHENTICATE',
  B2BOAuthDiscoveryAuthenticate = 'B2B_OAUTH_DISCOVERY_AUTHENTICATE',
  B2BDiscoveryOrganizationsCreate = 'B2B_DISCOVERY_ORGANIZATIONS_CREATE',
  B2BDiscoveryIntermediateSessionExchange = 'B2B_DISCOVERY_INTERMEDIATE_SESSION_EXCHANGE',
  B2BPasswordAuthenticate = 'B2B_PASSWORD_AUTHENTICATE',
  B2BPasswordDiscoveryAuthenticate = 'B2B_PASSWORD_DISCOVERY_AUTHENTICATE',
  B2BPasswordResetByEmailStart = 'B2B_PASSWORD_RESET_BY_EMAIL_START',
  B2BPasswordResetByEmail = 'B2B_PASSWORD_RESET_BY_EMAIL',
  B2BPasswordResetBySession = 'B2B_PASSWORD_RESET_BY_SESSION',
  B2BSMSOTPSend = 'B2B_SMS_OTP_SEND',
  B2BSMSOTPAuthenticate = 'B2B_SMS_OTP_AUTHENTICATE',
  B2BTOTPCreate = 'B2B_TOTP_CREATE',
  B2BTOTPAuthenticate = 'B2B_TOTP_AUTHENTICATE',
  B2BRecoveryCodesRecover = 'B2B_RECOVERY_CODES_RECOVER',
  B2BPasswordDiscoveryResetStart = 'B2B_PASSWORD_DISCOVERY_RESET_BY_EMAIL_START',
  B2BDiscoveryPasswordReset = 'B2B_PASSWORD_DISCOVERY_RESET_BY_EMAIL',
  B2BImpersonationAuthenticate = 'B2B_IMPERSONATION_AUTHENTICATE',
  B2BOTPsEmailAuthenticate = 'B2B_OTPS_EMAIL_AUTHENTICATE',
  B2BOTPsEmailDiscoveryAuthenticate = 'B2B_OTPS_EMAIL_DISCOVERY_AUTHENTICATE',
  B2BOTPsEmailDiscoverySend = 'B2B_OTPS_EMAIL_DISCOVERY_SEND',
  B2BOTPsEmailLoginOrSignup = 'B2B_OTPS_EMAIL_LOGIN_OR_SIGNUP',
  B2BOrganizationsGetBySlug = 'B2B_ORGANIZATIONS_GET_BY_SLUG',
}

type StytchEventMap<TProjectConfiguration extends StytchProjectConfigurationInput> = {
  [StytchEventType.MagicLinkLoginOrCreateEvent]: MagicLinksLoginOrCreateResponse & { email: string };
  [StytchEventType.OTPsLoginOrCreateEvent]: OTPsLoginOrCreateResponse;
  [StytchEventType.OTPsAuthenticate]: OTPsAuthenticateResponse<TProjectConfiguration>;
  [StytchEventType.CryptoWalletAuthenticateStart]: CryptoWalletAuthenticateStartResponse;
  [StytchEventType.CryptoWalletAuthenticate]: CryptoWalletAuthenticateResponse<TProjectConfiguration>;
  [StytchEventType.PasswordCreate]: PasswordCreateResponse<TProjectConfiguration>;
  [StytchEventType.PasswordAuthenticate]: PasswordAuthenticateResponse<TProjectConfiguration>;
  [StytchEventType.B2BPasswordDiscoveryAuthenticate]: B2BPasswordDiscoveryAuthenticateResponse<TProjectConfiguration>;
  [StytchEventType.PasswordResetByEmailStart]: PasswordResetByEmailStartResponse;
  [StytchEventType.PasswordResetByEmail]: PasswordResetByEmailResponse<TProjectConfiguration>;
  [StytchEventType.AuthenticateFlowComplete]: Record<string, never>;
  [StytchEventType.B2BMagicLinkEmailLoginOrSignup]: B2BMagicLinkLoginOrSignupResponse & { email: string };
  [StytchEventType.B2BMagicLinkAuthenticate]: B2BMagicLinksAuthenticateResponse<TProjectConfiguration>;
  [StytchEventType.B2BMagicLinkEmailDiscoverySend]: B2BMagicLinksEmailDiscoverySendResponse;
  [StytchEventType.B2BMagicLinkDiscoveryAuthenticate]: B2BMagicLinksDiscoveryAuthenticateResponse<TProjectConfiguration>;
  [StytchEventType.B2BSSOStart]: Record<string, never>;
  [StytchEventType.B2BSSOAuthenticate]: SSOAuthenticateResponse<TProjectConfiguration>;
  [StytchEventType.B2BSSODiscoverConnections]: B2BSSODiscoverConnectionsResponse;
  [StytchEventType.B2BDiscoveryOrganizationsCreate]: B2BDiscoveryOrganizationsCreateResponse<TProjectConfiguration>;
  [StytchEventType.B2BPasswordAuthenticate]: B2BPasswordAuthenticateResponse<TProjectConfiguration>;
  [StytchEventType.B2BPasswordResetByEmailStart]: B2BPasswordResetByEmailStartResponse;
  [StytchEventType.B2BPasswordResetByEmail]: B2BPasswordResetByEmailResponse<TProjectConfiguration>;
  [StytchEventType.B2BPasswordResetBySession]: B2BPasswordResetBySessionResponse<TProjectConfiguration>;
  [StytchEventType.B2BDiscoveryIntermediateSessionExchange]: B2BDiscoveryIntermediateSessionsExchangeResponse<TProjectConfiguration>;
  [StytchEventType.B2BOAuthAuthenticate]: B2BOAuthAuthenticateResponse<TProjectConfiguration>;
  [StytchEventType.B2BOAuthDiscoveryAuthenticate]: B2BOAuthDiscoveryAuthenticateResponse<TProjectConfiguration>;
  [StytchEventType.PasskeySkip]: Record<string, never>;
  [StytchEventType.PasskeyDone]: Record<string, never>;
  [StytchEventType.PasskeyRegister]: WebAuthnRegisterResponse<TProjectConfiguration>;
  [StytchEventType.PasskeyAuthenticate]: WebAuthnAuthenticateResponse<TProjectConfiguration>;
  [StytchEventType.B2BSMSOTPSend]: B2BSMSSendResponse;
  [StytchEventType.B2BSMSOTPAuthenticate]: B2BSMSAuthenticateResponse<TProjectConfiguration>;
  [StytchEventType.B2BTOTPCreate]: B2BTOTPCreateResponse;
  [StytchEventType.B2BTOTPAuthenticate]: B2BTOTPAuthenticateResponse<TProjectConfiguration>;
  [StytchEventType.B2BRecoveryCodesRecover]: RecoveryCodeRecoverResponse<TProjectConfiguration>;
  [StytchEventType.B2BDiscoveryPasswordReset]: B2BPasswordDiscoveryResetByEmailResponse<TProjectConfiguration>;
  [StytchEventType.B2BPasswordDiscoveryResetStart]: B2BPasswordDiscoveryResetByEmailStartResponse;
  [StytchEventType.B2BImpersonationAuthenticate]: B2BImpersonationAuthenticateResponse<TProjectConfiguration>;
  [StytchEventType.B2BOTPsEmailDiscoverySend]: B2BDiscoveryOTPEmailSendResponse;
  [StytchEventType.B2BOTPsEmailAuthenticate]: B2BOTPsEmailAuthenticateResponse<TProjectConfiguration>;
  [StytchEventType.B2BOTPsEmailDiscoveryAuthenticate]: B2BDiscoveryOTPEmailAuthenticateResponse<TProjectConfiguration>;
  [StytchEventType.B2BOTPsEmailLoginOrSignup]: B2BOTPsEmailLoginOrSignupResponse;
  [StytchEventType.B2BOrganizationsGetBySlug]: B2BOrganizationsGetBySlugResponse;
  [StytchEventType.OAuthAuthorizeFlowStart]: { client_id: string; redirect_uri: string; scope: string };
  [StytchEventType.OAuthAuthorizeFlowComplete]: Record<string, never>;
  [StytchEventType.OAuthAuthorizeFlowConsentDenied]: Record<string, never>;
  // More Events will go here ...
};

export type StytchEvent<
  TProjectConfiguration extends StytchProjectConfigurationInput = Stytch.DefaultProjectConfiguration,
> = {
  [K in StytchEventType]: { type: K; data: StytchEventMap<TProjectConfiguration>[K] };
}[keyof StytchEventMap<TProjectConfiguration>];

/**
 * Optional callbacks that are triggered by various events in the SDK. See more details about the callbacks
 * {@link https://stytch.com/docs/sdks/javascript-sdk#resources_ui-callbacks here}.
 */
export type Callbacks<
  TProjectConfiguration extends StytchProjectConfigurationInput = Stytch.DefaultProjectConfiguration,
> = {
  /**
   * A callback function that responds to errors in the SDK. It is useful for debugging during development
   * and error handling in production.
   *
   * @param error - the error from the SDK with an additional error message
   */
  onError?(error: StytchSDKUIError): void;
  /**
   * A callback function that responds to events sent from the SDK. For the full list of events see the
   * {@link StytchEvent StytchEvent}
   *
   * @param event - the event fired by the SDK
   */
  onEvent?(event: StytchEvent<TProjectConfiguration>): void;
};

export type OneTapStyleConfig = {
  position?: EnumOrStringLiteral<OneTapPositions>;
};

export enum RNUIProducts {
  emailMagicLinks,
  oauth,
  otp,
  passwords,
}

export type RNUIEmailMagicLinksOptions = {
  loginExpirationMinutes?: number;
  signupExpirationMinutes?: number;
  loginTemplateId?: string;
  signupTemplateId?: string;
  locale?: string;
};

export type RNUIOAuthOptions = {
  providers: EnumOrStringLiteral<OAuthProviders>[] | ProvidersOptions;
  /** @deprecated Use custom_scopes in ProvidersOptions instead */
  customScopes?: string[];
  /** @deprecated Use provider_params in ProvidersOptions instead */
  providerParams?: Record<string, string>;
};

export type RNUIOTPOptions = {
  methods: EnumOrStringLiteral<OTPMethods>[];
  expirationMinutes: number;
  loginTemplateId?: string;
  signupTemplateId?: string;
  locale?: string;
};

export type RNUIPasswordOptions = {
  loginExpirationMinutes?: number;
  resetPasswordExpirationMinutes?: number;
  resetPasswordTemplateId?: string;
  locale?: string;
};

export type RNUIProductConfig = {
  products: RNUIProducts[];
  emailMagicLinksOptions: RNUIEmailMagicLinksOptions;
  oAuthOptions: RNUIOAuthOptions;
  otpOptions: RNUIOTPOptions;
  sessionOptions: SessionOptions;
  passwordOptions: RNUIPasswordOptions;
};
