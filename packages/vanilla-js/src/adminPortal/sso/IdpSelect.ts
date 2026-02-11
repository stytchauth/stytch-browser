import { OidcKnownIdp, SamlKnownIdp } from '../../utils/KnownIdp';
import { oidcIdpMap, samlIdpMap } from './IdpInfo';

const makeSamlOption = <T extends SamlKnownIdp>(idpName: T) => ({
  idp: samlIdpMap[idpName],
  idpName,
  type: 'saml' as const,
});

const makeOidcOption = <T extends OidcKnownIdp>(idpName: T) => ({
  idp: oidcIdpMap[idpName],
  idpName,
  type: 'oidc' as const,
});

export const idpOptions = {
  'saml:google-workspace': makeSamlOption('google-workspace'),
  'saml:okta': makeSamlOption('okta'),
  'oidc:okta': makeOidcOption('okta'),
  'saml:microsoft-entra': makeSamlOption('microsoft-entra'),
  'oidc:microsoft-entra': makeOidcOption('microsoft-entra'),
  'saml:generic': makeSamlOption('generic'),
  'oidc:generic': makeOidcOption('generic'),
} as const;

export type IdpSelectValue = keyof typeof idpOptions;

export const idpSelectItems = Object.entries(idpOptions).map(([idpKey, { idp }]) => ({
  label: idp.displayName,
  value: idpKey,
}));

export const samlIdpSelectItems = Object.values(idpOptions)
  .filter((item) => item.type === 'saml')
  .map((item) => ({ label: item.idp.displayName, value: item.idpName }));

export const oidcIdpSelectItems = Object.values(idpOptions)
  .filter((item) => item.type === 'oidc')
  .map((item) => ({ label: item.idp.displayName, value: item.idpName }));
