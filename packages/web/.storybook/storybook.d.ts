import { StyleConfig } from '../src';
import { AdminPortalStyleConfig } from '../src/adminPortal/AdminPortalStyleConfig';
import { AdminPortalMemberManagementUIConfig } from '../src/adminPortal/memberManagement/AdminPortalMemberManagementContainer';
import { AdminPortalOrgUIConfig } from '../src/adminPortal/settings/AdminPortalOrgSettingsContainer';
import { DeepPartial } from '../src/testUtils';
import { StytchB2BExtendedLoginConfig, StytchLoginConfig } from '../src/types';
import { AppState as B2BAppState } from '../src/ui/b2b/types/AppState';
import { AppState } from '../src/ui/b2c/GlobalContextProvider';
import { adminThemes, themes } from './themeDecorator';

declare global {
  interface Window {
    __STORYBOOK_MOCK_LOCATION__?: {
      href: string;
    };
  }
}

declare module 'storybook/internal/types' {
  interface StytchParameters {
    b2c: {
      config: StytchLoginConfig;
      initialState: AppState;
    };
    b2b: {
      config: StytchB2BExtendedLoginConfig;
      initialState: B2BAppState;
    };
    theme?: DeepPartial<StyleConfig | AdminPortalStyleConfig>;
    disableSnackbar?: boolean;
    adminPortalConfig?: AdminPortalOrgUIConfig | AdminPortalMemberManagementUIConfig;
  }

  interface Parameters {
    stytch?: DeepPartial<StytchParameters>;
    adminPortal?: boolean;
  }
}

interface StorybookGlobal {
  theme: keyof typeof themes;
  adminTheme: keyof typeof adminThemes;
  watermark: 'No watermark' | 'Show watermark';
  locale: 'en' | 'pseudo' | 'id' | 'custom';
  logo: 'No customer logo' | 'Show customer logo';
  icons: 'White logo' | 'Black logo' | 'Color logo';
  direction: 'ltr' | 'rtl';
}
