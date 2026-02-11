import { StyleConfig, StytchB2BUIConfig, StytchLoginConfig } from '../src';
import { AdminPortalStyleConfig } from '../src/adminPortal';
import { AdminPortalMemberManagementUIConfig } from '../src/adminPortal/memberManagement/AdminPortalMemberManagement';
import { AdminPortalOrgUIConfig } from '../src/adminPortal/settings/AdminPortalOrgSettings';
import { DeepPartial } from '../src/testUtils';
import { AppState as B2BAppState } from '../src/ui/b2b/types/AppState';
import { AppState } from '../src/ui/b2c/GlobalContextProvider';

declare global {
  interface Window {
    __STORYBOOK_MOCK_LOCATION__?: {
      href: string;
    };
  }
}

declare module '@storybook/types' {
  interface StytchParameters {
    b2c: {
      config: StytchLoginConfig;
      initialState: AppState;
    };
    b2b: {
      config: StytchB2BUIConfig;
      initialState: B2BAppState;
    };
    theme?: DeepPartial<StyleConfig | AdminPortalStyleConfig>;
    disableSnackbar?: boolean;
    adminPortalConfig?: AdminPortalOrgUIConfig | AdminPortalMemberManagementUIConfig;
  }

  interface Parameters {
    stytch?: DeepPartial<StytchParameters>;
  }
}
