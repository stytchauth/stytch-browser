import { INetworkClient } from '@stytch/core';
import { ResponseCommon, SSOActiveConnection } from '@stytch/core/public';

// This can be incorporated into the core client once we decide to make it public

export interface B2BSSODiscoveryConnectionResponse extends ResponseCommon {
  connections: SSOActiveConnection[];
}

export const ssoDiscoveryConnection = async (networkClient: INetworkClient, emailAddress: string) =>
  await networkClient.fetchSDK<B2BSSODiscoveryConnectionResponse>({
    method: 'GET',
    url: `/b2b/sso/discovery/connections?email_address=${encodeURIComponent(emailAddress)}`,
  });
