import { IB2BSubscriptionService, INetworkClient } from '../..';
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
import { StytchProjectConfigurationInput } from '../../public/typeConfig';
import { validateInDev } from '../../utils/dev';

export class HeadlessB2BSCIMClient<TProjectConfiguration extends StytchProjectConfigurationInput>
  implements IHeadlessB2BSCIMClient
{
  constructor(
    protected _networkClient: INetworkClient,
    protected _subscriptionService: IB2BSubscriptionService<TProjectConfiguration>,
  ) {}

  async createConnection(data: B2BSCIMCreateConnectionOptions): Promise<B2BSCIMCreateConnectionResponse> {
    validateInDev('stytch.scim.createConnection', data, {
      display_name: 'optionalString',
      identity_provider: 'optionalString',
    });

    return await this._networkClient.fetchSDK<B2BSCIMCreateConnectionResponse>({
      url: '/b2b/scim',
      method: 'POST',
      body: data,
    });
  }

  async updateConnection(data: B2BSCIMUpdateConnectionOptions): Promise<B2BSCIMUpdateConnectionResponse> {
    validateInDev('stytch.scim.updateConnection', data, {
      connection_id: 'string',
      display_name: 'optionalString',
      identity_provider: 'optionalString',
    });

    return await this._networkClient.fetchSDK<B2BSCIMUpdateConnectionResponse>({
      url: `/b2b/scim/${data.connection_id}`,
      method: 'PUT',
      body: data,
    });
  }

  async deleteConnection(connectionId: string): Promise<B2BSCIMDeleteConnectionResponse> {
    validateInDev(
      'stytch.scim.deleteConnection',
      { connection_id: connectionId },
      {
        connection_id: 'string',
      },
    );

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
    validateInDev('stytch.scim.getConnectionGroups', data, {
      limit: 'optionalNumber',
      cursor: 'optionalString',
    });

    return await this._networkClient.fetchSDK<B2BSCIMGetConnectionGroupsResponse>({
      url: '/b2b/scim/groups',
      method: 'POST',
      body: data,
    });
  }

  async rotateStart(connectionId: string): Promise<B2BSCIMRotateStartResponse> {
    validateInDev(
      'stytch.scim.rotateStart',
      { connectionId },
      {
        connectionId: 'string',
      },
    );
    return await this._networkClient.fetchSDK<B2BSCIMRotateStartResponse>({
      url: `/b2b/scim/rotate/start`,
      method: 'POST',
      body: { connection_id: connectionId },
    });
  }

  async rotateComplete(connectionId: string): Promise<B2BSCIMRotateCompleteResponse> {
    validateInDev(
      'stytch.scim.rotateComplete',
      { connectionId },
      {
        connectionId: 'string',
      },
    );

    return await this._networkClient.fetchSDK<B2BSCIMRotateCompleteResponse>({
      url: `/b2b/scim/rotate/complete`,
      method: 'POST',
      body: { connection_id: connectionId },
    });
  }

  async rotateCancel(connectionId: string): Promise<B2BSCIMRotateCancelResponse> {
    validateInDev(
      'stytch.scim.rotateCancel',
      { connectionId },
      {
        connectionId: 'string',
      },
    );

    return await this._networkClient.fetchSDK<B2BSCIMRotateCancelResponse>({
      url: `/b2b/scim/rotate/cancel`,
      method: 'POST',
      body: { connection_id: connectionId },
    });
  }
}
