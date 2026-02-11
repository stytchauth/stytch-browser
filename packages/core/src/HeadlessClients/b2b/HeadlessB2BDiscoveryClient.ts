import { IB2BSubscriptionService, INetworkClient } from '../..';
import {
  B2BDiscoveryIntermediateSessionsExchangeOptions,
  B2BDiscoveryIntermediateSessionsExchangeResponse,
  B2BDiscoveryOrganizationsCreateOptions,
  B2BDiscoveryOrganizationsCreateResponse,
  B2BDiscoveryOrganizationsResponse,
  IHeadlessB2BDiscoveryClient,
  StytchProjectConfigurationInput,
} from '../../public';
import { validateInDev } from '../../utils/dev';

export class HeadlessB2BDiscoveryClient<TProjectConfiguration extends StytchProjectConfigurationInput>
  implements IHeadlessB2BDiscoveryClient<TProjectConfiguration>
{
  organizations: {
    list: () => Promise<B2BDiscoveryOrganizationsResponse>;
    create: (
      data: B2BDiscoveryOrganizationsCreateOptions,
    ) => Promise<B2BDiscoveryOrganizationsCreateResponse<TProjectConfiguration>>;
  };

  intermediateSessions: {
    exchange: (
      data: B2BDiscoveryIntermediateSessionsExchangeOptions,
    ) => Promise<B2BDiscoveryIntermediateSessionsExchangeResponse<TProjectConfiguration>>;
  };

  constructor(
    private _networkClient: INetworkClient,
    private _subscriptionService: IB2BSubscriptionService<TProjectConfiguration>,
  ) {
    this.organizations = {
      list: async () =>
        this._networkClient.fetchSDK<B2BDiscoveryOrganizationsResponse>({
          url: '/b2b/discovery/organizations',
          body: {
            intermediate_session_token: (await this._subscriptionService.getIntermediateSessionToken()) || undefined,
          },
          method: 'POST',
        }),
      create: this._subscriptionService.withUpdateSession(
        async (
          data: B2BDiscoveryOrganizationsCreateOptions,
        ): Promise<B2BDiscoveryOrganizationsCreateResponse<TProjectConfiguration>> => {
          validateInDev('stytch.discovery.organizations.create', data, {
            session_duration_minutes: 'number',
            organization_name: 'optionalString',
            organization_slug: 'optionalString',
            organization_logo_url: 'optionalString',
            sso_jit_provisioning: 'optionalString',
            email_allowed_domains: 'optionalStringArray',
            email_invites: 'optionalString',
            auth_methods: 'optionalString',
            allowed_auth_methods: 'optionalStringArray',
            mfa_policy: 'optionalString',
          });

          const requestBody = {
            ...data,
            intermediate_session_token: (await this._subscriptionService.getIntermediateSessionToken()) || undefined,
          };

          return this._networkClient.fetchSDK<B2BDiscoveryOrganizationsCreateResponse<TProjectConfiguration>>({
            url: '/b2b/discovery/organizations/create',
            body: requestBody,
            method: 'POST',
          });
        },
      ),
    };

    this.intermediateSessions = {
      exchange: this._subscriptionService.withUpdateSession(
        async (
          data: B2BDiscoveryIntermediateSessionsExchangeOptions,
        ): Promise<B2BDiscoveryIntermediateSessionsExchangeResponse<TProjectConfiguration>> => {
          validateInDev('stytch.discovery.intermediateSessions.exchange', data, {
            organization_id: 'string',
            session_duration_minutes: 'number',
            locale: 'optionalString',
          });

          const requestBody = {
            ...data,
            intermediate_session_token: this._subscriptionService.getIntermediateSessionToken() || undefined,
          };
          return this._networkClient.fetchSDK<B2BDiscoveryIntermediateSessionsExchangeResponse<TProjectConfiguration>>({
            url: '/b2b/discovery/intermediate_sessions/exchange',
            body: requestBody,
            method: 'POST',
          });
        },
      ),
    };
  }
}
