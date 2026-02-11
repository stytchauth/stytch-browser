import { SCIMConnectionWithBearerToken, SCIMConnectionWithNextBearerToken } from '@stytch/core/public';

export type KnownSCIMIdp =
  | 'okta'
  | 'microsoft-entra'
  | 'cyberark'
  | 'jumpcloud'
  | 'onelogin'
  | 'pingfederate'
  | 'rippling'
  | 'generic';
export type ConnectionWithBearerTokenKey = keyof Pick<
  SCIMConnectionWithBearerToken,
  'bearer_token' | 'base_url' | 'display_name'
>;

export type ConnectionWithNextBearerTokenKey = keyof Pick<SCIMConnectionWithNextBearerToken, 'next_bearer_token'>;

export type Field<T> =
  | {
      label: string;
      value: string;
      isCopyable?: boolean;
    }
  | {
      label: string;
      scimConnectionKey: T;
      isCopyable?: boolean;
    };

export type SCIMIdpInfo = {
  displayName: string;
  copyToIdpLabel: string;
  copyToIdpFields: Field<ConnectionWithBearerTokenKey>[];
  confirmLabel?: string;
  confirmFields?: Field<never>[];
};

const DEFAULT_COPY_TO_IDP_LABEL = 'Copy the SCIM Connection Settings to your IdP.';
const DEFAULT_CONFIRM_LABEL = 'Confirm the SCIM username format matches in your IdP.';

export const DEFAULT_BASE_URL_LABEL = 'SCIM Base URL';
export const DEFAULT_HEADER_BEARER_TOKEN_LABEL = 'HTTP Header Bearer Token';

export const scimIdpMap = {
  okta: {
    displayName: 'Okta',
    copyToIdpLabel: DEFAULT_COPY_TO_IDP_LABEL,
    confirmLabel: DEFAULT_CONFIRM_LABEL,
    copyToIdpFields: [
      {
        label: 'Authentication Mode',
        value: 'HTTP Header',
      },
      {
        label: 'SCIM Connector base URL',
        scimConnectionKey: 'base_url',
        isCopyable: true,
      },
      {
        label: 'HTTP Header Authorization: Bearer',
        scimConnectionKey: 'bearer_token',
        isCopyable: true,
      },
    ],
    confirmFields: [
      {
        label: 'Application username format',
        value: 'Email',
      },
      {
        label: 'Unique Identifier field for users',
        value: 'userName',
      },
    ],
  },
  'microsoft-entra': {
    displayName: 'Entra',
    copyToIdpLabel: 'Copy the Admin Credentials to your IdP.',
    copyToIdpFields: [
      {
        label: 'Tenant URL',
        scimConnectionKey: 'base_url',
        isCopyable: true,
      },
      {
        label: 'Secret Token',
        scimConnectionKey: 'bearer_token',
        isCopyable: true,
      },
    ],
  },
  cyberark: {
    displayName: 'CyberArk',
    copyToIdpLabel: 'Copy the Provisioning Details to your IdP.',
    copyToIdpFields: [
      {
        label: 'SCIM Service URL',
        scimConnectionKey: 'base_url',
        isCopyable: true,
      },
      {
        label: 'Bearer Token',
        scimConnectionKey: 'bearer_token',
        isCopyable: true,
      },
    ],
  },
  jumpcloud: {
    displayName: 'JumpCloud',
    copyToIdpLabel: 'Copy the Configuration Settings to your IdP.',
    copyToIdpFields: [
      {
        label: 'Base URL',
        scimConnectionKey: 'base_url',
        isCopyable: true,
      },
      {
        label: 'Token Key',
        scimConnectionKey: 'bearer_token',
        isCopyable: true,
      },
    ],
  },
  onelogin: {
    displayName: 'OneLogin',
    copyToIdpLabel: 'Copy the configuration to your IdP.',
    copyToIdpFields: [
      {
        label: 'SCIM Username Format',
        value: 'Email',
      },
      {
        label: DEFAULT_BASE_URL_LABEL,
        scimConnectionKey: 'base_url',
        isCopyable: true,
      },
      {
        label: 'SCIM Bearer Token',
        scimConnectionKey: 'bearer_token',
        isCopyable: true,
      },
    ],
  },
  pingfederate: {
    displayName: 'Ping Federate',
    copyToIdpLabel: 'Copy the Provisioning Target Information to your IdP.',
    confirmLabel: DEFAULT_CONFIRM_LABEL,
    copyToIdpFields: [
      {
        label: 'SCIM Version',
        value: '2.0',
      },
      {
        label: 'Authentication Method',
        value: 'OAuth 2 Bearer Token',
      },
      {
        label: 'SCIM URL',
        scimConnectionKey: 'base_url',
        isCopyable: true,
      },
      {
        label: 'Access Token',
        scimConnectionKey: 'bearer_token',
        isCopyable: true,
      },
    ],
    confirmFields: [
      {
        label: 'SCIM userName',
        value: 'Email',
      },
    ],
  },
  rippling: {
    displayName: 'Rippling',
    copyToIdpLabel: 'Copy the configuration to your IdP.',
    copyToIdpFields: [
      {
        label: 'SCIM Version',
        value: '2.0',
      },
      {
        label: DEFAULT_BASE_URL_LABEL,
        scimConnectionKey: 'base_url',
        isCopyable: true,
      },
      {
        label: 'SCIM Authorization Method',
        value: 'Bearer Token',
      },
      {
        label: 'SCIM userName',
        value: 'Email address',
      },
      {
        label: 'Supported SCIM Attributes',
        value: 'externalId, emails.primary, name.givenName, name.familyName',
      },
      {
        label: 'Bearer Token',
        scimConnectionKey: 'bearer_token',
        isCopyable: true,
      },
    ],
  },
  generic: {
    displayName: 'Generic',
    copyToIdpLabel: DEFAULT_COPY_TO_IDP_LABEL,
    confirmLabel: DEFAULT_CONFIRM_LABEL,
    copyToIdpFields: [
      {
        label: DEFAULT_BASE_URL_LABEL,
        scimConnectionKey: 'base_url',
        isCopyable: true,
      },
      {
        label: DEFAULT_HEADER_BEARER_TOKEN_LABEL,
        scimConnectionKey: 'bearer_token',
        isCopyable: true,
      },
    ],
    confirmFields: [
      {
        label: 'SCIM userName Value',
        value: 'Primary email address',
      },
    ],
  },
} as const satisfies Record<KnownSCIMIdp, SCIMIdpInfo>;

export const getSCIMIdpInfo = (idp: string): SCIMIdpInfo => scimIdpMap[idp as KnownSCIMIdp] ?? scimIdpMap['generic'];

export const getFieldBy = <T extends ConnectionWithBearerTokenKey>({
  idp,
  key,
}: {
  idp: string;
  key: T;
}): Field<T> | undefined => {
  const { copyToIdpFields } = getSCIMIdpInfo(idp);
  return copyToIdpFields.find(
    (field): field is Field<T> => 'scimConnectionKey' in field && field.scimConnectionKey === key,
  );
};
