import { RequireAllOrNone } from 'type-fest';
import { OidcKnownIdp, SamlKnownIdp } from '../../utils/KnownIdp';
import { ConnectionType } from '../utils/ConnectionType';
import {
  ExternalTaggedConnection,
  OIDCTaggedConnection,
  SAMLTaggedConnection,
  TaggedConnection,
} from './TaggedConnection';

export type SamlSetupStep = 'createApplication' | 'copyToIdp' | 'copyFromIdp' | 'attributeMapping';

export type SamlIdpValue = 'ssoUrl' | 'entityId' | 'certificate';

export type OidcSetupStep = 'createApplication' | 'copyToIdp' | 'copyFromIdp';

export type SamlSupportedIdp = 'okta' | 'microsoft-entra' | 'google-workspace';
export type OidcSupportedIdp = 'okta' | 'microsoft-entra';
export type SamlSupportedManualConfigurationIdp = 'microsoft-entra' | 'google-workspace';
export type SamlSupportedAttributeMappingIdp = 'okta' | 'microsoft-entra' | 'google-workspace';

export type SamlIdpInfo = {
  displayName: string;
  copyToOrFromIdpDisplayName: string;
  setupOrder: SamlSetupStep[];
  idpValueOrder: SamlIdpValue[];
  acsUrlLabel: string;
  audienceUriLabel: string;
  idpSsoUrlLabel: string;
  idpEntityIdLabel: string;
  x509CertificateLabel: string;
  metadataUrlLabel: string | false;
  nameIdFormatLabel: string;
  nameIdFormatValue: string;
  attributeMappingLabel: string;
};

interface IssuerTransformer {
  issuerDerivedLabel: string;
  transformInputToIssuer?: (input: string) => string;
  extractIssuerFromInput?: (input: string) => string | undefined;
}

export type OidcIdpInfo = {
  displayName: string;
  copyToOrFromIdpDisplayName: string;
  setupOrder: OidcSetupStep[];
  redirectUrlLabel: string;
  clientIdLabel: string;
  clientSecretLabel: string;
  issuerLabel: string;
} & RequireAllOrNone<IssuerTransformer, keyof IssuerTransformer>;

export const samlIdpMap = {
  generic: {
    displayName: 'Custom SAML',
    copyToOrFromIdpDisplayName: 'your IdP',
    setupOrder: ['copyToIdp', 'attributeMapping', 'copyFromIdp'],
    idpValueOrder: ['ssoUrl', 'entityId', 'certificate'],
    acsUrlLabel: 'ACS URL (Reply URL)',
    audienceUriLabel: 'Audience URI (SP Entity ID)',
    idpSsoUrlLabel: 'IdP Sign-on URL',
    idpEntityIdLabel: 'IdP Entity ID',
    x509CertificateLabel: 'x509 Certificate (PEM Format)',
    metadataUrlLabel: 'Metadata URL',
    nameIdFormatLabel: 'Name ID Format',
    nameIdFormatValue: 'Primary Email Address',
    attributeMappingLabel: 'Attribute Mapping',
  },
  'microsoft-entra': {
    displayName: 'Entra SAML',
    copyToOrFromIdpDisplayName: 'Entra',
    setupOrder: ['createApplication', 'copyToIdp', 'attributeMapping', 'copyFromIdp'],
    idpValueOrder: ['ssoUrl', 'entityId', 'certificate'],
    acsUrlLabel: 'Reply URL (Assertion Consumer Service URL)',
    audienceUriLabel: 'Identifier (Entity ID)',
    idpSsoUrlLabel: 'Login Url',
    idpEntityIdLabel: 'Microsoft Entra Identifier',
    x509CertificateLabel: 'PEM Certificate',
    metadataUrlLabel: 'App Federation Metadata Url',
    nameIdFormatLabel: 'Unique User Identifier (Name ID) Format',
    nameIdFormatValue: 'user.primaryauthoritativeemail',
    attributeMappingLabel: 'Claim Names',
  },
  okta: {
    displayName: 'Okta SAML',
    copyToOrFromIdpDisplayName: 'Okta',
    setupOrder: ['createApplication', 'copyToIdp', 'attributeMapping', 'copyFromIdp'],
    idpValueOrder: ['ssoUrl', 'entityId', 'certificate'],
    acsUrlLabel: 'Single sign-on URL',
    audienceUriLabel: 'Audience URI (SP Entity ID)',
    idpSsoUrlLabel: 'Sign-on URL',
    idpEntityIdLabel: 'Issuer',
    x509CertificateLabel: 'Signing Certificate',
    metadataUrlLabel: 'Metadata URL',
    nameIdFormatLabel: 'Name ID Format',
    nameIdFormatValue: 'EmailAddress',
    attributeMappingLabel: 'Attribute Statements',
  },
  'google-workspace': {
    displayName: 'Google SAML',
    copyToOrFromIdpDisplayName: 'Google',
    setupOrder: ['createApplication', 'copyFromIdp', 'copyToIdp', 'attributeMapping'],
    idpValueOrder: ['entityId', 'ssoUrl', 'certificate'],
    acsUrlLabel: 'ACS URL',
    audienceUriLabel: 'Entity ID',
    idpSsoUrlLabel: 'SSO URL',
    idpEntityIdLabel: 'Entity ID',
    x509CertificateLabel: 'Certificate',
    metadataUrlLabel: false,
    nameIdFormatLabel: 'NameID Format',
    nameIdFormatValue: 'EMAIL; Basic Information > Primary email',
    attributeMappingLabel: 'Attribute Mapping',
  },
} as const satisfies Record<SamlKnownIdp, SamlIdpInfo>;

export const oidcIdpMap = {
  generic: {
    displayName: 'Custom OIDC',
    copyToOrFromIdpDisplayName: 'your IdP',
    setupOrder: ['copyToIdp', 'copyFromIdp'],
    redirectUrlLabel: 'Redirect URI',
    clientIdLabel: 'Client ID',
    clientSecretLabel: 'Client Secret',
    issuerLabel: 'Issuer',
  },
  'microsoft-entra': {
    displayName: 'Entra OIDC',
    copyToOrFromIdpDisplayName: 'Entra',
    setupOrder: ['createApplication', 'copyToIdp', 'copyFromIdp'],
    redirectUrlLabel: 'Redirect URI',
    clientIdLabel: 'Application (Client) ID',
    clientSecretLabel: 'Client Secret',
    issuerLabel: 'Issuer',
    issuerDerivedLabel: 'Directory (tenant) ID',
    extractIssuerFromInput: (input) => {
      const match = input.match(/^https:\/\/login\.microsoftonline\.com\/(.+)\/v2\.0$/);
      return match?.[1];
    },
    transformInputToIssuer: (id) => `https://login.microsoftonline.com/${id}/v2.0`,
  },
  okta: {
    displayName: 'Okta OIDC',
    copyToOrFromIdpDisplayName: 'Okta',
    setupOrder: ['createApplication', 'copyToIdp', 'copyFromIdp'],
    redirectUrlLabel: 'Sign-in Redirect URI',
    clientIdLabel: 'Client ID',
    clientSecretLabel: 'Client Secret',
    issuerLabel: 'Okta URL (Issuer)',
  },
} as const satisfies Record<OidcKnownIdp, OidcIdpInfo>;

type SamlTaggedIdpInfo = {
  idp: SamlIdpInfo;
  type: 'saml';
};

type OidcTaggedIdpInfo = {
  idp: OidcIdpInfo;
  type: 'oidc';
};

export type TaggedIdpInfo = SamlTaggedIdpInfo | OidcTaggedIdpInfo;

type IdpInfoReturnType<TConnectionType extends ConnectionType> = TaggedIdpInfo & {
  type: TConnectionType;
};

export const getIdpInfo = <TConnectionType extends ConnectionType>(
  idp: string,
  type: TConnectionType,
): IdpInfoReturnType<TConnectionType> => {
  if (type === 'saml') {
    const idpKey = idp in samlIdpMap ? (idp as SamlKnownIdp) : 'generic';
    return { idp: samlIdpMap[idpKey], type } as IdpInfoReturnType<TConnectionType>;
  } else {
    const idpKey = idp in oidcIdpMap ? (idp as OidcKnownIdp) : 'generic';
    return { idp: oidcIdpMap[idpKey], type } as IdpInfoReturnType<TConnectionType>;
  }
};

type IdpAndConnectionInfoReturnType<TConnectionType extends ConnectionType> = (
  | (SamlTaggedIdpInfo & { connection: SAMLTaggedConnection })
  | (OidcTaggedIdpInfo & { connection: OIDCTaggedConnection })
  | { idp: undefined; type: 'external'; connection: ExternalTaggedConnection }
) & { type: TConnectionType };

export const getIdpAndConnectionInfo = <TConnectionType extends ConnectionType>(
  connection: TaggedConnection & { connectionType: TConnectionType },
): IdpAndConnectionInfoReturnType<TConnectionType> => {
  if (connection.connectionType === 'external') {
    return {
      idp: undefined,
      type: 'external',
      connection: connection as ExternalTaggedConnection,
    } as IdpAndConnectionInfoReturnType<TConnectionType>;
  }

  return {
    ...getIdpInfo(
      (connection as SAMLTaggedConnection | OIDCTaggedConnection).identity_provider,
      connection.connectionType,
    ),
    connection,
  } as IdpAndConnectionInfoReturnType<TConnectionType>;
};

export const typeToUserFriendlyName = (type: ConnectionType): string => {
  if (type === 'saml') {
    return 'SAML';
  } else if (type === 'oidc') {
    return 'OIDC';
  } else {
    return 'External';
  }
};
