import { Member } from '@stytch/core/public';
import { AdminPortalConfigResponse } from './useAdminPortalConfig';
import { getFeatureState } from './getFeatureState';

describe('getFeatureState', () => {
  it('user is not in cache and awaiting cache refresh', () => {
    const self = null;
    const fromCache = true;
    const adminPortalConfigError = undefined;
    const isFeatureEnabled = undefined;
    const hasPermission = undefined;
    expect(
      getFeatureState({
        self,
        fromCache,
        adminPortalConfigError,
        isFeatureEnabled,
        hasPermission,
      }),
    ).toBe('loading');
  });

  it('user is not in cache and is not waiting for cache refresh', () => {
    const self = null;
    const fromCache = false;
    const adminPortalConfigError = undefined;
    const isFeatureEnabled = undefined;
    const hasPermission = undefined;
    expect(
      getFeatureState({
        self,
        fromCache,
        adminPortalConfigError,
        isFeatureEnabled,
        hasPermission,
      }),
    ).toBe('notLoggedIn');
  });

  it('user exists but admin portal config has an error', () => {
    const self = {} as Member;
    const fromCache = false;
    const adminPortalConfigError = true;
    const isFeatureEnabled = undefined;
    const hasPermission = undefined;
    expect(
      getFeatureState({
        self,
        fromCache,
        adminPortalConfigError,
        isFeatureEnabled,
        hasPermission,
      }),
    ).toBe('error');
  });

  it('user exists but admin portal config has not loaded', () => {
    const self = {} as Member;
    const fromCache = false;
    const adminPortalConfigError = undefined;
    const isFeatureEnabled = undefined;
    const hasPermission = undefined;
    expect(
      getFeatureState({
        self,
        fromCache,
        adminPortalConfigError,
        isFeatureEnabled,
        hasPermission,
      }),
    ).toBe('loading');
  });

  it('user exists, admin portal config has loaded, but rbac permission has not yet loaded', () => {
    const self = {} as Member;
    const fromCache = false;
    const adminPortalConfigError = undefined;
    const adminPortalConfig = {
      scim_config: {
        scim_enabled: true,
      },
    } as AdminPortalConfigResponse;
    const isFeatureEnabled = adminPortalConfig.scim_config.scim_enabled;
    const hasPermission = undefined;
    expect(
      getFeatureState({
        self,
        fromCache,
        adminPortalConfigError,
        isFeatureEnabled,
        hasPermission,
      }),
    ).toBe('loading');
  });

  it('user exists, admin portal config has loaded, permission has loaded, but feature is not enabled', () => {
    const self = {} as Member;
    const fromCache = false;
    const adminPortalConfigError = undefined;
    const adminPortalConfig = {
      scim_config: {
        scim_enabled: false,
      },
    } as AdminPortalConfigResponse;
    const isFeatureEnabled = adminPortalConfig.scim_config.scim_enabled;
    const hasPermission = true;
    expect(
      getFeatureState({
        self,
        fromCache,
        adminPortalConfigError,
        isFeatureEnabled,
        hasPermission,
      }),
    ).toBe('featureNotEnabled');
  });

  it('user exists, admin portal config has loaded, permission has loaded, feature is enabled, but has no rbac permission', () => {
    const self = {} as Member;
    const fromCache = false;
    const adminPortalConfigError = undefined;
    const adminPortalConfig = {
      scim_config: {
        scim_enabled: true,
      },
    } as AdminPortalConfigResponse;
    const isFeatureEnabled = adminPortalConfig.scim_config.scim_enabled;
    const hasPermission = false;
    expect(
      getFeatureState({
        self,
        fromCache,
        adminPortalConfigError,
        isFeatureEnabled,
        hasPermission,
      }),
    ).toBe('noPermission');
  });

  it('user exists, admin portal config has loaded, permission has loaded, feature is enabled, and has rbac permission', () => {
    const self = {} as Member;
    const fromCache = false;
    const adminPortalConfigError = undefined;
    const adminPortalConfig = {
      scim_config: {
        scim_enabled: true,
      },
    } as AdminPortalConfigResponse;
    const isFeatureEnabled = adminPortalConfig.scim_config.scim_enabled;
    const hasPermission = true;
    expect(
      getFeatureState({
        self,
        fromCache,
        adminPortalConfigError,
        isFeatureEnabled,
        hasPermission,
      }),
    ).toBe('success');
  });
});
