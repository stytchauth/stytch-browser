import {
  B2BDiscoveryIntermediateSessionsExchangeOptions,
  B2BDiscoveryIntermediateSessionsExchangeResponse,
  B2BDiscoveryOrganizationsCreateOptions,
  B2BDiscoveryOrganizationsCreateResponse,
  B2BDiscoveryOrganizationsResponse,
  IHeadlessB2BDiscoveryClient,
  StytchProjectConfigurationInput,
} from '../../public';
import { INetworkClient } from '../..';
import { validate } from '../../utils';
import { IB2BSubscriptionService } from '../..';

export class HeadlessB2BDiscoveryClient<TProjectConfiguration extends StytchProjectConfigurationInput>
  implements IHeadlessB2BDiscoveryClient<TProjectConfiguration>
{
  constructor(
    private _networkClient: INetworkClient,
    private _subscriptionService: IB2BSubscriptionService<TProjectConfiguration>,
  ) {}

  organizations = {
    list: async (): Promise<B2BDiscoveryOrganizationsResponse> => {
      return this._networkClient.fetchSDK<B2BDiscoveryOrganizationsResponse>({
        url: '/b2b/discovery/organizations',
        body: {
          intermediate_session_token: (await this._subscriptionService.getIntermediateSessionToken()) || undefined,
        },
        method: 'POST',
      });
    },
    create: this._subscriptionService.withUpdateSession(
      async (
        data: B2BDiscoveryOrganizationsCreateOptions,
      ): Promise<B2BDiscoveryOrganizationsCreateResponse<TProjectConfiguration>> => {
        validate('stytch.discovery.organizations.create')
          .isNumber('session_duration_minutes', data.session_duration_minutes)
          .isOptionalString('organization_name', data.organization_name)
          .isOptionalString('organization_slug', data.organization_slug)
          .isOptionalString('organization_logo_url', data.organization_logo_url)
          .isOptionalString('sso_jit_provisioning', data.sso_jit_provisioning)
          .isOptionalStringArray('email_allowed_domains', data.email_allowed_domains)
          .isOptionalString('email_invites', data.email_invites)
          .isOptionalString('auth_methods', data.auth_methods)
          .isOptionalStringArray('allowed_auth_methods', data.allowed_auth_methods)
          .isOptionalString('mfa_policy', data.mfa_policy);

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

  intermediateSessions = {
    exchange: this._subscriptionService.withUpdateSession(
      async (
        data: B2BDiscoveryIntermediateSessionsExchangeOptions,
      ): Promise<B2BDiscoveryIntermediateSessionsExchangeResponse<TProjectConfiguration>> => {
        validate('stytch.discovery.intermediateSessions.exchange')
          .isString('organization_id', data.organization_id)
          .isNumber('session_duration_minutes', data.session_duration_minutes)
          .isOptionalString('locale', data.locale);

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
