import { BootstrapData, DFPProtectedAuthMode, INetworkClient, logger, RBACPolicyRaw, Vertical } from '@stytch/core';

import { B2BSubscriptionDataLayer, ConsumerSubscriptionDataLayer } from './SubscriptionService';

export interface IBootstrapData {
  getSync: () => BootstrapData;
  getAsync: () => Promise<BootstrapData>;
}

interface RawBootstrapData {
  request_id: string;
  project_name: string;
  status_code: number;
  disable_sdk_watermark: boolean;
  cname_domain: string | null;
  email_domains: string[];
  captcha_settings: BootstrapData['captchaSettings'];
  pkce_required_for_email_magic_links: boolean;
  pkce_required_for_password_resets: boolean;
  pkce_required_for_oauth: boolean;
  pkce_required_for_sso: boolean;
  slug_pattern: string | null;
  create_organization_enabled: boolean;
  password_config: { luds_complexity: number; luds_minimum_count: number } | null;
  dfp_protected_auth_enabled?: boolean;
  dfp_protected_auth_mode?: DFPProtectedAuthMode;
  rbac_policy?: RBACPolicyRaw;
  siwe_required_for_crypto_wallets: boolean;
  vertical: Vertical;
}

const BOOTSTRAP_CACHE_KEY = 'bootstrap';
const DEFAULT_BOOTSTRAP = (): BootstrapData => ({
  displayWatermark: false,
  projectName: null,
  cnameDomain: null,
  emailDomains: ['stytch.com'],
  captchaSettings: { enabled: false },
  pkceRequiredForEmailMagicLinks: false,
  pkceRequiredForPasswordResets: false,
  pkceRequiredForOAuth: false,
  pkceRequiredForSso: false,
  slugPattern: null,
  createOrganizationEnabled: false,
  passwordConfig: null,
  runDFPProtectedAuth: false,
  rbacPolicy: null,
  siweRequiredForCryptoWallets: false,
  vertical: null,
});

export class BootstrapDataManager implements IBootstrapData {
  private readonly _bootstrapDataPromise: Promise<BootstrapData>;

  constructor(
    private _publicToken: string,
    private _networkClient: INetworkClient,
    private _dataLayer: ConsumerSubscriptionDataLayer | B2BSubscriptionDataLayer,
  ) {
    // TODO: Push the async version of this into @stytch/core
    // for RN to use, have getSync throw a NotImplementedError
    // and inherit it to create a sync one here?
    this._bootstrapDataPromise = this._networkClient
      .fetchSDK<RawBootstrapData>({
        url: `/projects/bootstrap/${this._publicToken}`,
        method: 'GET',
      })
      .then(BootstrapDataManager.mapBootstrapData)
      .then((data) => {
        this._dataLayer.setItem(BOOTSTRAP_CACHE_KEY, JSON.stringify(data));
        return data;
      })
      .catch((error: unknown) => {
        logger.error(error);
        return DEFAULT_BOOTSTRAP();
      });
  }

  static mapBootstrapData(response: RawBootstrapData): BootstrapData {
    const passwordConfig =
      response.password_config !== null
        ? {
            ludsComplexity: response.password_config.luds_complexity,
            ludsMinimumCount: response.password_config.luds_minimum_count,
          }
        : null;

    return {
      projectName: response.project_name,
      displayWatermark: !response.disable_sdk_watermark,
      captchaSettings: response.captcha_settings,
      cnameDomain: response.cname_domain,
      emailDomains: response.email_domains,

      pkceRequiredForEmailMagicLinks: response.pkce_required_for_email_magic_links,
      pkceRequiredForPasswordResets: response.pkce_required_for_password_resets,
      pkceRequiredForOAuth: response.pkce_required_for_oauth,
      pkceRequiredForSso: response.pkce_required_for_sso,
      slugPattern: response.slug_pattern,
      createOrganizationEnabled: response.create_organization_enabled,
      passwordConfig,
      runDFPProtectedAuth: response.dfp_protected_auth_enabled ?? false,
      dfpProtectedAuthMode: response.dfp_protected_auth_mode,
      rbacPolicy: response.rbac_policy ?? null,
      siweRequiredForCryptoWallets: response.siwe_required_for_crypto_wallets,
      vertical: response.vertical,
    };
  }

  getSync(): BootstrapData {
    const cached = this._dataLayer.getItem(BOOTSTRAP_CACHE_KEY);
    if (cached === null) {
      return DEFAULT_BOOTSTRAP();
    }
    try {
      return JSON.parse(cached) as BootstrapData;
    } catch {
      return DEFAULT_BOOTSTRAP();
    }
  }

  getAsync(): Promise<BootstrapData> {
    return this._bootstrapDataPromise;
  }
}
