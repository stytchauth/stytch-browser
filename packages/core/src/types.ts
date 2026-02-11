import { DFPProtectedAuthMode } from './DFPProtectedAuthProvider';
import { Vertical } from './Vertical';
import { StytchClientOptions } from './public';
import { RBACPolicyRaw } from './rbac';

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

export type SessionUpdateOptions = {
  /**
   * If the authenticate method was called with session_duration_minutes, this property will
   * be set. This is mainly used for the keepSessionAlive option.
   */
  sessionDurationMinutes?: number;
};
