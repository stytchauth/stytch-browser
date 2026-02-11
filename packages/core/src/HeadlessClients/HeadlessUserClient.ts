import { INetworkClient } from '../NetworkClient';
import {
  ConsumerState,
  IHeadlessUserClient,
  ResponseCommon,
  StytchProjectConfigurationInput,
  UnsubscribeFunction,
  UpdateResponse,
  User,
  UserGetConnectedAppsResponse,
  UserInfo,
  UserOnChangeCallback,
  UserUpdateOptions,
  UserUpdateResponse,
} from '../public';
import { IConsumerSubscriptionService } from '../SubscriptionService';
import { omitUser, removeResponseCommon, WithUser } from '../utils';
import { validateInDev } from '../utils/dev';

export class HeadlessUserClient<TProjectConfiguration extends StytchProjectConfigurationInput>
  implements IHeadlessUserClient
{
  constructor(
    private _networkClient: INetworkClient,
    private _subscriptionService: IConsumerSubscriptionService<TProjectConfiguration>,
  ) {}

  get = async (): Promise<User> => {
    const resp = await this._networkClient.fetchSDK<User & ResponseCommon>({
      url: '/users/me',
      method: 'GET',
    });
    const user = removeResponseCommon(resp);
    this._subscriptionService.updateUser(user);
    return user;
  };

  getSync = (): User | null => {
    return this._subscriptionService.getUser();
  };

  getInfo = (): UserInfo => ({
    user: this.getSync(),
    fromCache: this._subscriptionService.getFromCache(),
  });

  update = async (options: UserUpdateOptions) => {
    validateInDev('stytch.user.update', options, {
      untrusted_metadata: 'optionalObject',
    });
    const resp = await this._networkClient.fetchSDK<WithUser<UserUpdateResponse>>({
      url: '/users/me',
      body: options,
      method: 'PUT',
    });
    const user = removeResponseCommon(resp.__user);
    this._subscriptionService.updateUser(user);
    return omitUser(resp);
  };

  deleteEmail = async (emailId: string) => {
    const resp = await this._networkClient.fetchSDK<WithUser<UpdateResponse>>({
      url: `/users/emails/${emailId}`,
      method: 'DELETE',
    });
    const user = removeResponseCommon(resp.__user);
    this._subscriptionService.updateUser(user);
    return omitUser(resp);
  };

  deletePhoneNumber = async (phoneId: string) => {
    const resp = await this._networkClient.fetchSDK<WithUser<UpdateResponse>>({
      url: `/users/phone_numbers/${phoneId}`,
      method: 'DELETE',
    });
    const user = removeResponseCommon(resp.__user);
    this._subscriptionService.updateUser(user);
    return omitUser(resp);
  };

  deleteTOTP = async (totpId: string) => {
    const resp = await this._networkClient.fetchSDK<WithUser<UpdateResponse>>({
      url: `/users/totps/${totpId}`,
      method: 'DELETE',
    });
    const user = removeResponseCommon(resp.__user);
    this._subscriptionService.updateUser(user);
    return omitUser(resp);
  };

  deleteCryptoWallet = async (cryptoWalletId: string) => {
    const resp = await this._networkClient.fetchSDK<WithUser<UpdateResponse>>({
      url: `/users/crypto_wallets/${cryptoWalletId}`,
      method: 'DELETE',
    });
    const user = removeResponseCommon(resp.__user);
    this._subscriptionService.updateUser(user);
    return omitUser(resp);
  };

  deleteOAuthRegistration = async (oauthUserRegistrationId: string) => {
    const resp = await this._networkClient.fetchSDK<WithUser<UpdateResponse>>({
      url: `/users/oauth/${oauthUserRegistrationId}`,
      method: 'DELETE',
    });
    const user = removeResponseCommon(resp.__user);
    this._subscriptionService.updateUser(user);
    return omitUser(resp);
  };

  deleteWebauthnRegistration = async (webAuthnId: string) => {
    const resp = await this._networkClient.fetchSDK<WithUser<UpdateResponse>>({
      url: `/users/webauthn_registrations/${webAuthnId}`,
      method: 'DELETE',
    });
    const user = removeResponseCommon(resp.__user);
    this._subscriptionService.updateUser(user);
    return omitUser(resp);
  };

  deleteBiometricRegistration = async (biometricRegistrationId: string) => {
    const resp = await this._networkClient.fetchSDK<WithUser<UpdateResponse>>({
      url: `/users/biometric_registrations/${biometricRegistrationId}`,
      method: 'DELETE',
    });
    const user = removeResponseCommon(resp.__user);
    this._subscriptionService.updateUser(user);
    return omitUser(resp);
  };

  onChange = (callback: UserOnChangeCallback): UnsubscribeFunction => {
    let lastVal = this._subscriptionService.getUser();
    const listener = (state: ConsumerState | null) => {
      if (state?.user !== lastVal) {
        lastVal = state?.user ?? null;
        callback(lastVal);
      }
    };
    return this._subscriptionService.subscribeToState(listener);
  };

  getConnectedApps = async () => {
    return await this._networkClient.fetchSDK<UserGetConnectedAppsResponse>({
      url: '/users/connected_apps',
      method: 'GET',
    });
  };

  revokedConnectedApp = async (connectedAppId: string) => {
    return await this._networkClient.fetchSDK<ResponseCommon>({
      url: `/users/connected_apps/${connectedAppId}/revoke`,
      method: 'POST',
    });
  };
}
