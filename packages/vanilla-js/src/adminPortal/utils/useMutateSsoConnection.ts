import {
  B2BSSOOIDCUpdateConnectionOptions,
  B2BSSOSAMLDeleteVerificationCertificateOptions,
  B2BSSOSAMLUpdateConnectionByURLOptions,
  B2BSSOSAMLUpdateConnectionOptions,
  B2BSSOUpdateExternalConnectionOptions,
  StytchProjectConfigurationInput,
} from '@stytch/core/public';
import { useCallback } from 'react';
import { useSWRConfig } from 'swr';
import { StytchB2BHeadlessClient } from '../../b2b/StytchB2BHeadlessClient';
import { ConnectionType } from './ConnectionType';
import { useMutateWithToast } from './useMutateWithToast';
import { useRevalidateConnectionList } from './useRevalidateConnectionList';
import { useStytchClient } from './useStytchClient';

const mutateSamlConnection =
  (client: StytchB2BHeadlessClient<StytchProjectConfigurationInput>) => (options: B2BSSOSAMLUpdateConnectionOptions) =>
    client.sso.saml.updateConnection(options);

const mutateOidcConnection =
  (client: StytchB2BHeadlessClient<StytchProjectConfigurationInput>) => (options: B2BSSOOIDCUpdateConnectionOptions) =>
    client.sso.oidc.updateConnection(options);

const mutateExternalConnection =
  (client: StytchB2BHeadlessClient<StytchProjectConfigurationInput>) => (options: B2BSSOOIDCUpdateConnectionOptions) =>
    client.sso.external.updateConnection(options);

const updateConnectionByURL =
  (client: StytchB2BHeadlessClient<StytchProjectConfigurationInput>) =>
  (options: B2BSSOSAMLUpdateConnectionByURLOptions) =>
    client.sso.saml.updateConnectionByURL(options);

const deleteConnection =
  (client: StytchB2BHeadlessClient<StytchProjectConfigurationInput>) =>
  ({ connection_id }: { connection_id: string }) =>
    client.sso.deleteConnection(connection_id);

const deleteVerificationCertificate =
  (client: StytchB2BHeadlessClient<StytchProjectConfigurationInput>) =>
  (options: B2BSSOSAMLDeleteVerificationCertificateOptions) =>
    client.sso.saml.deleteVerificationCertificate(options);

const useMutateFnSsoConnection = <TOptions extends { connection_id: string }, TResponse>(
  mutateFn: (
    client: StytchB2BHeadlessClient<StytchProjectConfigurationInput>,
  ) => (options: TOptions) => Promise<TResponse>,
) => {
  const { mutate: mutateSWR } = useSWRConfig();
  const client = useStytchClient();
  const revalidateConnectionList = useRevalidateConnectionList();

  return useMutateWithToast<TOptions>(
    useCallback(
      async (options) => {
        await mutateSWR(['sso.connection', options.connection_id], () => mutateFn(client)(options));

        return revalidateConnectionList();
      },
      [client, mutateFn, mutateSWR, revalidateConnectionList],
    ),
  );
};

export const useMutateSsoConnectionByUrl = () => {
  return useMutateFnSsoConnection(updateConnectionByURL);
};

export const useDeleteSsoConnection = () => {
  return useMutateFnSsoConnection(deleteConnection);
};

export const useDeleteSsoConnectionCert = () => {
  return useMutateFnSsoConnection(deleteVerificationCertificate);
};

export const useMutateSsoConnection = <TConnectionType extends ConnectionType>(connectionType: TConnectionType) => {
  return useMutateFnSsoConnection<
    TConnectionType extends 'saml'
      ? B2BSSOSAMLUpdateConnectionOptions
      : TConnectionType extends 'oidc'
        ? B2BSSOOIDCUpdateConnectionOptions
        : B2BSSOUpdateExternalConnectionOptions,
    unknown
  >(
    connectionType === 'saml'
      ? mutateSamlConnection
      : connectionType === 'oidc'
        ? mutateOidcConnection
        : mutateExternalConnection,
  );
};
