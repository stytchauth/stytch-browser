import {
  B2BSCIMCreateConnectionOptions,
  B2BSCIMCreateConnectionResponse,
  B2BSCIMDeleteConnectionResponse,
  B2BSCIMGetConnectionGroupsOptions,
  B2BSCIMGetConnectionGroupsResponse,
  B2BSCIMGetConnectionResponse,
  B2BSCIMRotateCancelResponse,
  B2BSCIMRotateCompleteResponse,
  B2BSCIMRotateStartResponse,
  B2BSCIMUpdateConnectionOptions,
  B2BSCIMUpdateConnectionResponse,
  IHeadlessB2BSCIMClient,
} from '../../public/b2b/scim';
import { IB2BSubscriptionService, INetworkClient } from '../..';
import { validate } from '../../utils';
import { StytchProjectConfigurationInput } from '../../public/typeConfig';

export class HeadlessB2BSCIMClient<TProjectConfiguration extends StytchProjectConfigurationInput>
  implements IHeadlessB2BSCIMClient
{
  constructor(
    protected _networkClient: INetworkClient,
    protected _subscriptionService: IB2BSubscriptionService<TProjectConfiguration>,
  ) {}

  async createConnection(data: B2BSCIMCreateConnectionOptions): Promise<B2BSCIMCreateConnectionResponse> {
    validate('stytch.scim.createConnection')
      .isOptionalString('display_name', data.display_name)
      .isOptionalString('identity_provider', data.identity_provider);

    return await this._networkClient.fetchSDK<B2BSCIMCreateConnectionResponse>({
      url: '/b2b/scim',
      method: 'POST',
      body: data,
    });
  }

  async updateConnection(data: B2BSCIMUpdateConnectionOptions): Promise<B2BSCIMUpdateConnectionResponse> {
    validate('stytch.scim.updateConnection')
      .isString('connection_id', data.connection_id)
      .isOptionalString('display_name', data.display_name)
      .isOptionalString('identity_provider', data.identity_provider);

    return await this._networkClient.fetchSDK<B2BSCIMUpdateConnectionResponse>({
      url: `/b2b/scim/${data.connection_id}`,
      method: 'PUT',
      body: data,
    });
  }

  async deleteConnection(connectionId: string): Promise<B2BSCIMDeleteConnectionResponse> {
    validate('stytch.scim.deleteConnection').isString('connection_id', connectionId);

    return await this._networkClient.fetchSDK<B2BSCIMDeleteConnectionResponse>({
      url: `/b2b/scim/${connectionId}`,
      method: 'DELETE',
    });
  }

  async getConnection(): Promise<B2BSCIMGetConnectionResponse> {
    return await this._networkClient.fetchSDK<B2BSCIMGetConnectionResponse>({
      url: '/b2b/scim',
      method: 'GET',
    });
  }

  async getConnectionGroups(data: B2BSCIMGetConnectionGroupsOptions): Promise<B2BSCIMGetConnectionGroupsResponse> {
    validate('stytch.scim.getConnectionGroups')
      .isOptionalNumber('limit', data.limit)
      .isOptionalString('cursor', data.cursor);

    return await this._networkClient.fetchSDK<B2BSCIMGetConnectionGroupsResponse>({
      url: '/b2b/scim/groups',
      method: 'POST',
      body: data,
    });
  }

  async rotateStart(connectionId: string): Promise<B2BSCIMRotateStartResponse> {
    validate('stytch.scim.rotateStart').isString('connectionId', connectionId);
    return await this._networkClient.fetchSDK<B2BSCIMRotateStartResponse>({
      url: `/b2b/scim/rotate/start`,
      method: 'POST',
      body: { connection_id: connectionId },
    });
  }

  async rotateComplete(connectionId: string): Promise<B2BSCIMRotateCompleteResponse> {
    validate('stytch.scim.rotateComplete').isString('connectionId', connectionId);

    return await this._networkClient.fetchSDK<B2BSCIMRotateCompleteResponse>({
      url: `/b2b/scim/rotate/complete`,
      method: 'POST',
      body: { connection_id: connectionId },
    });
  }

  async rotateCancel(connectionId: string): Promise<B2BSCIMRotateCancelResponse> {
    validate('stytch.scim.rotateCancel').isString('connectionId', connectionId);

    return await this._networkClient.fetchSDK<B2BSCIMRotateCancelResponse>({
      url: `/b2b/scim/rotate/cancel`,
      method: 'POST',
      body: { connection_id: connectionId },
    });
  }
}
