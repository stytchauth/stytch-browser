import { Member } from '@stytch/core/public';

export type AdminPortalFeatureState =
  | 'success'
  | 'loading'
  | 'notLoggedIn'
  | 'error'
  | 'featureNotEnabled'
  | 'noPermission';

export const getFeatureState = ({
  self,
  fromCache,
  adminPortalConfigError,
  isFeatureEnabled,
  hasPermission,
}: {
  self: Member | null;
  fromCache: boolean;
  adminPortalConfigError: unknown;
  isFeatureEnabled: boolean | undefined;
  hasPermission: boolean | undefined;
}): AdminPortalFeatureState => {
  const hasSelf = !!self;

  const hasAdminPortalConfig = isFeatureEnabled !== undefined;

  if (!hasSelf) {
    return fromCache ? 'loading' : 'notLoggedIn';
  }
  if (adminPortalConfigError) {
    return 'error';
  }

  if (!hasAdminPortalConfig) {
    return 'loading';
  }
  if (hasPermission === undefined) {
    return 'loading';
  }

  if (!isFeatureEnabled) {
    return 'featureNotEnabled';
  }
  if (!hasPermission) {
    return 'noPermission';
  }

  return 'success';
};
