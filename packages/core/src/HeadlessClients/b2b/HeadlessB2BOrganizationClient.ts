import { INetworkClient } from '../../NetworkClient';
import {
  B2BOrganizationsDeleteResponse,
  B2BOrganizationsGetBySlugOptions,
  B2BOrganizationsGetBySlugResponse,
  B2BOrganizationsGetConnectedAppOptions,
  B2BOrganizationsGetConnectedAppResponse,
  B2BOrganizationsGetConnectedAppsResponse,
  B2BOrganizationsMemberDeleteMFAPhoneNumberResponse,
  B2BOrganizationsMemberDeleteMFATOTPResponse,
  B2BOrganizationsMemberDeletePasswordResponse,
  B2BOrganizationsMemberGetConnectedAppsOptions,
  B2BOrganizationsMemberGetConnectedAppsResponse,
  B2BOrganizationsMemberRevokeConnectedAppOptions,
  B2BOrganizationsMemberRevokeConnectedAppResponse,
  B2BOrganizationsMembersCreateOptions,
  B2BOrganizationsMembersCreateResponse,
  B2BOrganizationsMembersDeleteResponse,
  B2BOrganizationsMembersReactivateResponse,
  B2BOrganizationsMembersSearchOptions,
  B2BOrganizationsMembersSearchResponse,
  B2BOrganizationsMemberStartEmailUpdateOptions,
  B2BOrganizationsMemberStartEmailUpdateResponse,
  B2BOrganizationsMembersUpdateOptions,
  B2BOrganizationsMembersUpdateResponse,
  B2BOrganizationsMemberUnlinkRetiredEmailOptions,
  B2BOrganizationsMemberUnlinkRetiredEmailResponse,
  B2BOrganizationsUpdateOptions,
  B2BOrganizationsUpdateResponse,
  IHeadlessB2BOrganizationClient,
  MemberResponseCommon,
  Organization,
  OrganizationInfo,
  ResponseCommon,
  StytchProjectConfigurationInput,
} from '../../public';
import { IB2BSubscriptionService } from '../../SubscriptionService';
import { validateInDev } from '../../utils/dev';

export class HeadlessB2BOrganizationClient<TProjectConfiguration extends StytchProjectConfigurationInput>
  implements IHeadlessB2BOrganizationClient
{
  constructor(
    private _networkClient: INetworkClient,
    private _apiNetworkClient: INetworkClient,
    private _subscriptionService: IB2BSubscriptionService<TProjectConfiguration>,
  ) {}

  get = async (): Promise<Organization | null> => {
    const resp = await this._networkClient.fetchSDK<{ organization: Organization } & ResponseCommon>({
      url: `/b2b/organizations/me`,
      method: 'GET',
    });
    this._subscriptionService.updateOrganization(resp.organization);
    return resp.organization;
  };

  getSync = (): Organization | null => {
    return this._subscriptionService.getOrganization();
  };

  getInfo = (): OrganizationInfo => ({
    organization: this.getSync(),
    fromCache: this._subscriptionService.getFromCache(),
  });

  onChange = (callback: (organization: Organization | null) => void) => {
    return this._subscriptionService.subscribeToState((state) => callback(state?.organization ?? null));
  };

  update = async (data: B2BOrganizationsUpdateOptions): Promise<B2BOrganizationsUpdateResponse> => {
    const resp = await this._networkClient.fetchSDK<B2BOrganizationsUpdateResponse>({
      url: `/b2b/organizations/me`,
      method: 'PUT',
      body: data,
    });

    this._subscriptionService.updateOrganization(resp.organization);
    return resp;
  };

  delete = async (): Promise<B2BOrganizationsDeleteResponse> => {
    const resp = await this._networkClient.fetchSDK<B2BOrganizationsDeleteResponse>({
      url: `/b2b/organizations/me`,
      method: 'DELETE',
    });

    this._subscriptionService.destroyState();

    return resp;
  };

  getBySlug = async (data: B2BOrganizationsGetBySlugOptions): Promise<B2BOrganizationsGetBySlugResponse> => {
    validateInDev('stytch.organization.getBySlug', data, {
      organization_slug: 'string',
    });

    return this._networkClient.fetchSDK<B2BOrganizationsGetBySlugResponse>({
      url: `/b2b/organizations/search`,
      method: 'POST',
      body: data,
    });
  };

  getConnectedApps = async (): Promise<B2BOrganizationsGetConnectedAppsResponse> => {
    return this._networkClient.fetchSDK<B2BOrganizationsGetConnectedAppsResponse>({
      url: '/b2b/organizations/connected_apps',
      method: 'GET',
    });
  };

  getConnectedApp = async (
    data: B2BOrganizationsGetConnectedAppOptions,
  ): Promise<B2BOrganizationsGetConnectedAppResponse> => {
    return this._networkClient.fetchSDK<B2BOrganizationsGetConnectedAppResponse>({
      url: `/b2b/organizations/connected_apps/${data.connected_app_id}`,
      method: 'GET',
    });
  };

  members = {
    create: async (data: B2BOrganizationsMembersCreateOptions): Promise<B2BOrganizationsMembersCreateResponse> => {
      return this._networkClient.fetchSDK<B2BOrganizationsMembersCreateResponse>({
        url: `/b2b/organizations/members`,
        method: 'POST',
        body: data,
      });
    },
    search: async (data: B2BOrganizationsMembersSearchOptions): Promise<B2BOrganizationsMembersSearchResponse> => {
      return this._networkClient.fetchSDK<B2BOrganizationsMembersSearchResponse>({
        url: `/b2b/organizations/me/members/search`,
        method: 'POST',
        body: data,
      });
    },
    update: async (data: B2BOrganizationsMembersUpdateOptions): Promise<B2BOrganizationsMembersUpdateResponse> => {
      const response = await this._networkClient.fetchSDK<B2BOrganizationsMembersUpdateResponse>({
        url: `/b2b/organizations/members/${data.member_id}`,
        method: 'PUT',
        body: data,
      });

      this.updateMemberIfSelf(response);
      return response;
    },
    deletePassword: async (passwordId: string): Promise<B2BOrganizationsMemberDeletePasswordResponse> => {
      const response = await this._networkClient.fetchSDK<B2BOrganizationsMemberDeletePasswordResponse>({
        url: `/b2b/organizations/members/passwords/${passwordId}`,
        method: 'DELETE',
      });

      this.updateMemberIfSelf(response);
      return response;
    },
    deleteMFAPhoneNumber: async (memberId: string): Promise<B2BOrganizationsMemberDeleteMFAPhoneNumberResponse> => {
      const response = await this._networkClient.fetchSDK<B2BOrganizationsMemberDeleteMFAPhoneNumberResponse>({
        url: `/b2b/organizations/members/mfa_phone_numbers/${memberId}`,
        method: 'DELETE',
      });

      this.updateMemberIfSelf(response);
      return response;
    },
    deleteMFATOTP: async (memberId: string): Promise<B2BOrganizationsMemberDeleteMFATOTPResponse> => {
      const response = await this._networkClient.fetchSDK<B2BOrganizationsMemberDeleteMFATOTPResponse>({
        url: `/b2b/organizations/members/totp/${memberId}`,
        method: 'DELETE',
      });

      this.updateMemberIfSelf(response);
      return response;
    },
    delete: async (memberId: string): Promise<B2BOrganizationsMembersDeleteResponse> => {
      const response = await this._networkClient.fetchSDK<B2BOrganizationsMembersDeleteResponse>({
        url: `/b2b/organizations/members/${memberId}`,
        method: 'DELETE',
      });

      if (memberId === this._subscriptionService.getMember()?.member_id) {
        this._subscriptionService.destroyState();
      }

      return response;
    },
    reactivate: async (memberId: string): Promise<B2BOrganizationsMembersReactivateResponse> => {
      return this._networkClient.fetchSDK<B2BOrganizationsMembersReactivateResponse>({
        url: `/b2b/organizations/members/${memberId}/reactivate`,
        method: 'PUT',
      });
    },
    unlinkRetiredEmail: async (
      data: B2BOrganizationsMemberUnlinkRetiredEmailOptions,
    ): Promise<B2BOrganizationsMemberUnlinkRetiredEmailResponse> => {
      const { member_id, ...body } = data;
      const response = await this._apiNetworkClient.fetchSDK<B2BOrganizationsMemberUnlinkRetiredEmailResponse>({
        url: `/b2b/organizations/members/${member_id}/unlink_retired_email`,
        method: 'POST',
        body,
      });

      this.updateMemberIfSelf(response);
      return response;
    },
    startEmailUpdate: async (
      data: B2BOrganizationsMemberStartEmailUpdateOptions,
    ): Promise<B2BOrganizationsMemberStartEmailUpdateResponse> => {
      const { member_id, ...body } = data;
      const response = await this._apiNetworkClient.fetchSDK<B2BOrganizationsMemberStartEmailUpdateResponse>({
        url: `/b2b/organizations/members/${member_id}/start_email_update`,
        method: 'POST',
        body,
      });

      this.updateMemberIfSelf(response);
      return response;
    },
    getConnectedApps: async (
      data: B2BOrganizationsMemberGetConnectedAppsOptions,
    ): Promise<B2BOrganizationsMemberGetConnectedAppsResponse> => {
      return this._networkClient.fetchSDK<B2BOrganizationsMemberGetConnectedAppsResponse>({
        url: `b2b/organizations/members/${data.member_id}/connected_apps`,
        method: 'GET',
      });
    },
    revokeConnectedApp: async (
      data: B2BOrganizationsMemberRevokeConnectedAppOptions,
    ): Promise<B2BOrganizationsMemberRevokeConnectedAppResponse> => {
      return this._networkClient.fetchSDK<B2BOrganizationsMemberRevokeConnectedAppResponse>({
        url: `/b2b/organizations/members/${data.member_id}/connected_apps/${data.connected_app_id}/revoke`,
        method: 'POST',
      });
    },
  };

  private updateMemberIfSelf = (response: MemberResponseCommon) => {
    if (response.member_id === this._subscriptionService.getMember()?.member_id) {
      this._subscriptionService.updateMember(response.member);
    }
  };
}
