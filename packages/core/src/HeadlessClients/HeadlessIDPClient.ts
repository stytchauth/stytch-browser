import { INetworkClient } from '../NetworkClient';
import {
  IHeadlessIDPClient,
  OAuthAuthorizeStartOptions,
  OAuthAuthorizeStartResponse,
  OAuthAuthorizeSubmitOptions,
  OAuthAuthorizeSubmitResponse,
  OAuthLogoutStartOptions,
  OAuthLogoutStartResponse,
} from '../public/idp';

export class HeadlessIDPClient implements IHeadlessIDPClient {
  constructor(private _networkClient: INetworkClient) {}

  oauthAuthorizeStart = async (data: OAuthAuthorizeStartOptions): Promise<OAuthAuthorizeStartResponse> =>
    this._networkClient.fetchSDK<OAuthAuthorizeStartResponse>({
      url: '/idp/oauth/authorize/start',
      method: 'POST',
      body: data,
    });

  oauthAuthorizeSubmit = async (data: OAuthAuthorizeSubmitOptions): Promise<OAuthAuthorizeSubmitResponse> =>
    this._networkClient.fetchSDK<OAuthAuthorizeSubmitResponse>({
      url: '/idp/oauth/authorize/submit',
      method: 'POST',
      body: data,
    });

  oauthLogoutStart = async (data: OAuthLogoutStartOptions): Promise<OAuthLogoutStartResponse> =>
    this._networkClient.fetchSDK<OAuthLogoutStartResponse>({
      url: `/oauth/logout/start`,
      method: 'POST',
      body: data,
    });
}
