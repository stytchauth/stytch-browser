import { INetworkClient } from '../../NetworkClient';
import {
  B2BMemberDeleteMFAPhoneNumberResponse,
  B2BMemberDeletePasswordResponse,
  B2BMemberGetConnectedAppsResponse,
  B2BMemberOnChangeCallback,
  B2BMemberRevokeConnectedAppOptions,
  B2BMemberRevokeConnectedAppResponse,
  B2BMemberStartEmailUpdateRequest,
  B2BMemberStartEmailUpdateResponse,
  B2BMemberUnlinkRetiredEmailRequest,
  B2BMemberUnlinkRetiredEmailResponse,
  B2BMemberUpdateOptions,
  B2BMemberUpdateResponse,
  IHeadlessB2BSelfClient,
  Member,
  MemberInfo,
  ResponseCommon,
  StytchProjectConfigurationInput,
} from '../../public';
import { IB2BSubscriptionService } from '../../SubscriptionService';
import { validateInDev } from '../../utils/dev';

export class HeadlessB2BSelfClient<TProjectConfiguration extends StytchProjectConfigurationInput>
  implements IHeadlessB2BSelfClient
{
  constructor(
    private _networkClient: INetworkClient,
    private _apiNetworkClient: INetworkClient,
    private _subscriptionService: IB2BSubscriptionService<TProjectConfiguration>,
  ) {}

  get = async (): Promise<Member | null> => {
    const resp = await this._networkClient.fetchSDK<{ member: Member } & ResponseCommon>({
      url: `/b2b/organizations/members/me`,
      method: 'GET',
    });
    this._subscriptionService.updateMember(resp.member);
    return resp.member;
  };

  getSync = (): Member | null => {
    return this._subscriptionService.getMember();
  };

  getInfo = (): MemberInfo => ({
    member: this.getSync(),
    fromCache: this._subscriptionService.getFromCache(),
  });

  onChange = (callback: B2BMemberOnChangeCallback) => {
    return this._subscriptionService.subscribeToState((state) => callback(state?.member ?? null));
  };

  update = async (data: B2BMemberUpdateOptions): Promise<B2BMemberUpdateResponse> => {
    validateInDev('stytch.self.update', data, {
      name: 'optionalString',
      untrusted_metadata: 'optionalObject',
      mfa_enrolled: 'optionalBoolean',
      mfa_phone_number: 'optionalString',
      default_mfa_method: 'optionalString',
    });

    const resp = await this._networkClient.fetchSDK<B2BMemberUpdateResponse>({
      url: '/b2b/organizations/members/update',
      body: data,
      method: 'PUT',
    });
    this._subscriptionService.updateMember(resp.member);
    return resp;
  };

  deleteMFAPhoneNumber = async (): Promise<B2BMemberDeleteMFAPhoneNumberResponse> => {
    const resp = await this._networkClient.fetchSDK<B2BMemberDeleteMFAPhoneNumberResponse>({
      url: '/b2b/organizations/members/deletePhoneNumber',
      method: 'DELETE',
    });
    this._subscriptionService.updateMember(resp.member);
    return resp;
  };

  deleteMFATOTP = async (): Promise<B2BMemberDeletePasswordResponse> => {
    const resp = await this._networkClient.fetchSDK<B2BMemberDeletePasswordResponse>({
      url: `/b2b/organizations/members/deleteTOTP`,
      method: 'DELETE',
    });
    this._subscriptionService.updateMember(resp.member);
    return resp;
  };

  deletePassword = async (passwordId: string): Promise<B2BMemberDeletePasswordResponse> => {
    const resp = await this._networkClient.fetchSDK<B2BMemberDeletePasswordResponse>({
      url: `/b2b/organizations/members/passwords/${passwordId}`,
      method: 'DELETE',
    });
    this._subscriptionService.updateMember(resp.member);
    return resp;
  };

  unlinkRetiredEmail = async (
    data: B2BMemberUnlinkRetiredEmailRequest,
  ): Promise<B2BMemberUnlinkRetiredEmailResponse> => {
    const resp = await this._apiNetworkClient.fetchSDK<B2BMemberUnlinkRetiredEmailResponse>({
      url: '/b2b/organizations/members/unlink_retired_email',
      method: 'POST',
      body: data,
    });
    this._subscriptionService.updateMember(resp.member);
    return resp;
  };

  startEmailUpdate = async (data: B2BMemberStartEmailUpdateRequest): Promise<B2BMemberStartEmailUpdateResponse> => {
    const resp = await this._apiNetworkClient.fetchSDK<B2BMemberStartEmailUpdateResponse>({
      url: '/b2b/organizations/members/start_email_update',
      method: 'POST',
      body: data,
    });
    this._subscriptionService.updateMember(resp.member);
    return resp;
  };

  getConnectedApps = async (): Promise<B2BMemberGetConnectedAppsResponse> => {
    return this._networkClient.fetchSDK<B2BMemberGetConnectedAppsResponse>({
      url: '/b2b/organizations/members/connected_apps',
      method: 'GET',
    });
  };

  revokeConnectedApp = async (
    data: B2BMemberRevokeConnectedAppOptions,
  ): Promise<B2BMemberRevokeConnectedAppResponse> => {
    return this._networkClient.fetchSDK<B2BMemberRevokeConnectedAppResponse>({
      url: `/b2b/organizations/members/connected_apps/${data.connected_app_id}/revoke`,
      method: 'POST',
    });
  };
}
