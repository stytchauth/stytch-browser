/* eslint-disable lingui/no-unlocalized-strings -- user-facing strings in this file can be overridden using different APIs */

import { RBACPolicyRaw } from '@stytch/core';
import { IDPConsentItem } from '@stytch/core/public';

const OPENID_CONSENT_ITEM: IDPConsentItem = {
  text: 'Verify your identity',
  details: ['View information stored within your account'],
};

// Full Access didn't really make the cut
// const FULL_ACCESS_CONSENT_ITEM: IDPConsentItem = {
//   text: 'Act on behalf of you',
//   details: [],
// };

const PROFILE_CONSENT_ITEM: IDPConsentItem = {
  text: 'View your personal profile information',
  details: [],
};

const OFFLINE_ACCESS_CONSENT_ITEM: IDPConsentItem = {
  text: "Maintain access to your data even when you're not actively using the app",
  details: [
    'Access your data even when you are offline.',
    'Synchronize data and process background tasks on your behalf.',
  ],
};

const OPENID_SCOPE = 'openid';
const PROFILE_SCOPE = 'profile';
const EMAIL_SCOPE = 'email';
const PHONE_SCOPE = 'phone';
const FULL_ACCESS_SCOPE = 'full_access';
const OFFLINE_ACCESS_SCOPE = 'offline_access';

const DEFAULT_SCOPES = new Set([
  OPENID_SCOPE,
  PROFILE_SCOPE,
  EMAIL_SCOPE,
  PHONE_SCOPE,
  FULL_ACCESS_SCOPE,
  OFFLINE_ACCESS_SCOPE,
]);

// Scope is an optional param in OAuth2.1
// When no scope is present, this is what we default to
const FALLBACK_SCOPES = [OPENID_SCOPE, EMAIL_SCOPE, PROFILE_SCOPE];

export const containsCustomScopes = (scope: string): boolean => {
  // set.difference is not in ES2015
  return scope.split(' ').some((sc) => !DEFAULT_SCOPES.has(sc));
};

export const createBuiltinScopeDescriptions = (scopes: string[]): IDPConsentItem[] => {
  const descriptions: IDPConsentItem[] = [];

  if (scopes.includes(OPENID_SCOPE)) {
    descriptions.push(OPENID_CONSENT_ITEM);
  }

  if (scopes.includes(EMAIL_SCOPE) || scopes.includes(PROFILE_SCOPE) || scopes.includes(PHONE_SCOPE)) {
    descriptions.push(
      createProfileScopeDescription({
        containsEmail: scopes.includes(EMAIL_SCOPE),
        containsPhoneNumber: scopes.includes(PHONE_SCOPE),
        containsProfile: scopes.includes(PROFILE_SCOPE),
      }),
    );
  }

  // if (scopes.has(FULL_ACCESS_SCOPE)) {
  //   descriptions.push();
  // }

  if (scopes.includes(OFFLINE_ACCESS_SCOPE)) {
    descriptions.push(OFFLINE_ACCESS_CONSENT_ITEM);
  }

  return descriptions;
};

const createProfileScopeDescription = ({
  containsProfile,
  containsEmail,
  containsPhoneNumber,
}: {
  containsProfile: boolean;
  containsEmail: boolean;
  containsPhoneNumber: boolean;
}): IDPConsentItem => {
  const details = [];
  if (containsProfile) {
    details.push('Your name, profile picture, and language preferences');
  }
  if (containsEmail) {
    details.push('Your email address');
  }
  if (containsPhoneNumber) {
    details.push('Your phone number');
  }

  return {
    text: PROFILE_CONSENT_ITEM.text,
    details: details,
  };
};

export const createCustomScopeDescriptions = (scopes: string[], rbacPolicy: RBACPolicyRaw | null): string[] => {
  if (!rbacPolicy) return [];

  const descriptions: string[] = [];

  for (const scope of scopes) {
    if (DEFAULT_SCOPES.has(scope)) continue;
    const found = rbacPolicy.scopes.find((policyScope) => policyScope.scope === scope);
    if (found && found.description) {
      descriptions.push(found.description);
    } else {
      descriptions.push(`Use the ${scope} scope`);
    }
  }

  return descriptions;
};

export const fallbackConsentManifestGenerator = ({
  scopes,
  clientName,
  rbacPolicy,
}: {
  scopes: string[];
  clientName: string;
  rbacPolicy: RBACPolicyRaw | null;
}) => {
  return [
    {
      header: `${clientName} is requesting to:`,
      items: createBuiltinScopeDescriptions(scopes).concat(createCustomScopeDescriptions(scopes, rbacPolicy)),
    },
  ];
};

export type OAuthAuthorizeParams = {
  // Required.
  client_id: string;
  redirect_uri: string;
  // Required, but has default
  response_type: string;
  scopes: string[];
  // Optional.
  code_challenge?: string;
  state?: string;
  nonce?: string;
  prompt?: string;
  resources?: string[];
};

export type OAuthLogoutParams = {
  // Required.
  client_id: string;
  post_logout_redirect_uri: string;
  // Optional.
  id_token_hint?: string;
  state?: string;
};

export type IDPFlowParams =
  | { type: 'Authorize'; params: OAuthAuthorizeParams }
  | { type: 'Logout'; params: OAuthLogoutParams };

/**
 * Parse the OAuth Authorize params from the URL search parameters to pass in to subsequent OAuthAuthorize calls.
 *
 * @param params - The URL search parameters to parse.
 * @returns The parsed OAuth Authorize parameters.
 */
export const parseOAuthAuthorizeParams = (
  params: URLSearchParams,
): { error: string | null; result: OAuthAuthorizeParams } => {
  const authorizeParams: OAuthAuthorizeParams = {
    client_id: '',
    redirect_uri: '',
    // As of writing, ChatGPT isn't sending `response_type` when making calls to our
    // authorization endpoint, even though it's technically a required field in the spec.
    // We default it to 'code' here and server-side.
    // See: https://stytchio.slack.com/archives/C07U0MHAH7G/p1749075544763149.
    response_type: 'code',
    // Default to this initial set of scopes when the client does not provide this param
    scopes: [...FALLBACK_SCOPES],
  };

  const requiredFields = ['client_id', 'redirect_uri'] as const;
  for (const field of requiredFields) {
    const value = params.get(field);
    if (!value) {
      return {
        error: `Required parameter is missing: ${field}. Please reach out to the application developer.`,
        result: authorizeParams,
      };
    }
    authorizeParams[field] = value;
  }

  const optionalStringFields = ['response_type', 'scope', 'code_challenge', 'state', 'nonce', 'prompt'] as const;
  for (const field of optionalStringFields) {
    const value = params.get(field);
    if (value) {
      if (field === 'scope') {
        authorizeParams.scopes = value.split(' ').filter(Boolean);
      } else {
        authorizeParams[field] = value;
      }
    }
  }

  if (params.has('resource')) {
    authorizeParams.resources = params.getAll('resource');
  }

  return { error: null, result: authorizeParams };
};

export const parseOAuthLogoutParams = (
  params: URLSearchParams,
): { error: string | null; result: OAuthLogoutParams } => {
  const logoutParams: OAuthLogoutParams = {
    client_id: '',
    post_logout_redirect_uri: '',
  };

  const requiredFields = ['client_id', 'post_logout_redirect_uri'] as const;
  for (const field of requiredFields) {
    const value = params.get(field);
    if (!value) {
      return {
        error: `Required parameter is missing: ${field}. Please reach out to the application developer.`,
        result: logoutParams,
      };
    }
    logoutParams[field] = value;
  }

  logoutParams.id_token_hint = params.get('id_token_hint') || undefined;
  logoutParams.state = params.get('state') || undefined;

  return { error: null, result: logoutParams };
};

/**
 * Parse generic IDP parameters and determine if it is an Authorize or Logout request.
 */
export const parseIDPParams = (searchParams: string): { error: string | null; flow: IDPFlowParams } => {
  const params = new URLSearchParams(searchParams);

  // Check if `post_logout_redirect_uri` exists to determine if it's a Logout request.
  if (params.has('post_logout_redirect_uri')) {
    const logoutResult = parseOAuthLogoutParams(params);
    return { error: logoutResult.error, flow: { type: 'Logout', params: logoutResult.result } };
  }

  // Otherwise, assume it's an Authorize request.
  const authorizeResult = parseOAuthAuthorizeParams(params);
  return { error: authorizeResult.error, flow: { type: 'Authorize', params: authorizeResult.result! } };
};
