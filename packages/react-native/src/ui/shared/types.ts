import { StytchAPIError, StytchSDKError } from '@stytch/core/public';

export enum B2BErrorType {
  Default = 'Default',
  NoValidProducts = 'NoValidProducts',
  EmailMagicLink = 'EmailMagicLink',
  DiscoveryEmailMagicLink = 'DiscoveryEmailMagicLink',
  Organization = 'Organization',
  CannotJoinOrgDueToAuthPolicy = 'CannotJoinOrgDueToAuthPolicy',
  OrganizationDiscoveryClaimedDomain = 'OrganizationDiscoveryClaimedDomain',
}

export type ErrorResponse = {
  sdkError?: StytchSDKError;
  apiError?: StytchAPIError;
  internalError?: string | B2BErrorType | undefined;
};

export type PasswordResetType = 'none' | 'forgot' | 'breached' | 'dedupe';
