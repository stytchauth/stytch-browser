import { StytchLoginConfig, StytchB2BUIConfig, RNUIProductConfig, TokenType, StytchSDKError } from './public';
import { BootstrapData } from './types';

export enum EmailSentType {
  LoginOrCreateEML = 'login_or_create_eml',
  LoginOrCreateOTP = 'login_or_create_otp',
  ResetPassword = 'reset_password',
}

export type AnalyticsEvent =
  | {
      name: 'sdk_instance_instantiated';
      details: {
        event_callback_registered: boolean;
        error_callback_registered: boolean;
        success_callback_registered: boolean;
      };
    }
  | {
      name: 'b2b_sdk_instance_instantiated';
      details: {
        event_callback_registered: boolean;
        error_callback_registered: boolean;
        success_callback_registered: boolean;
      };
    }
  | {
      name: 'render_login_screen';
      details: {
        options: StytchLoginConfig | RNUIProductConfig;
        bootstrap: BootstrapData;
      };
    }
  | {
      name: 'render_b2b_login_screen';
      details: {
        options: StytchB2BUIConfig;
        bootstrap: BootstrapData;
      };
    }
  | {
      name: 'render_idp_screen';
      details: {
        bootstrap: BootstrapData;
      };
    }
  | {
      name: 'render_b2b_idp_screen';
      details: {
        bootstrap: BootstrapData;
      };
    }
  | {
      name: 'email_sent';
      details: {
        email: string;
        type: EmailSentType;
      };
    }
  | {
      name: 'email_try_again_clicked';
      details: {
        email: string;
        type: EmailSentType;
      };
    }
  | {
      name: 'start_oauth_flow';
      details: {
        provider_type: string;
        custom_scopes?: string[];
        cname_domain: string | null;
        pkce: boolean;
        provider_params?: Record<string, string>;
      };
    }
  | {
      name: 'deeplink_handled_success';
      details: {
        token_type: TokenType;
      };
    }
  | {
      name: 'deeplink_handled_failure';
      details: {
        error: StytchSDKError | undefined;
      };
    }
  | {
      name: 'oauth_success';
      details: {
        provider_type: string;
      };
    }
  | {
      name: 'oauth_failure';
      details: {
        error: StytchSDKError | string | undefined;
      };
    }
  | {
      name: 'ui_authentication_success';
      details: {
        method: 'oauth' | 'otp' | 'magicLinks' | 'passwords';
      };
    }
  | {
      name: 'render_b2b_admin_portal_sso';
      details: Record<string, never>;
    }
  | {
      name: 'render_b2b_admin_portal_org_settings';
      details: Record<string, never>;
    }
  | {
      name: 'render_b2b_admin_portal_member_management';
      details: Record<string, never>;
    }
  | {
      name: 'render_b2b_admin_portal_scim';
      details: Record<string, never>;
    };
