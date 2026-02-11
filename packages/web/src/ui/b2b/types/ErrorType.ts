import { Values } from '../../../utils/types';

/* eslint-disable lingui/no-unlocalized-strings */

export const ErrorType = {
  Default: 'Default',
  EmailMagicLink: 'EmailMagicLink',
  Organization: 'Organization',
  CannotJoinOrgDueToAuthPolicy: 'CannotJoinOrgDueToAuthPolicy',
  AdBlockerDetected: 'AdBlockerDetected',
  OrganizationDiscoveryClaimedDomain: 'OrganizationDiscoveryClaimedDomain',
};
export type ErrorType = Values<typeof ErrorType>;
