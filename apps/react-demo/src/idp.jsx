import { IdentityProvider } from '@stytch/react';
import React, { useMemo, useState } from 'react';

import { getLocalStorageConfigItem, setConfigItem } from './configuration';
import { useB2CStrings } from './useStrings';

const CLIENT_ID_KEY = 'oauth:clientID';
const SCOPE_KEY = 'oauth:scope';
const PROJECT_DOMAIN_KEY = 'oauth:projectDomain';
const PKCE_KEY = 'oauth:pkce';
const TRUSTED_AUTH_TOKEN_KEY = 'b2cdemo::trustedAuthToken';
const TOKEN_PROFILE_ID_KEY = 'b2cdemo::tokenProfileID';

const useLocalStorageStringValue = (key) => {
  const [_value, _setValue] = useState(getLocalStorageConfigItem(key) || '');
  const setValue = (event) => {
    setConfigItem(key, event.target.value);
    _setValue(event.target.value);
  };
  return [_value, setValue];
};

const useLocalStorageCheckboxValue = (key) => {
  const [_value, _setValue] = useState(getLocalStorageConfigItem(key) === 'true');
  const setValue = (event) => {
    setConfigItem(key, event.target.checked);
    _setValue(event.target.checked);
  };
  return [_value, setValue];
};

const generateLinks = (projectDomain) => ({
  AS_METADATA: `${projectDomain}/.well-known/oauth-authorization-server`,
  OIDC_METADATA: `${projectDomain}/.well-known/openid-configuration`,
  JWKS_URI: `${projectDomain}/.well-known/jwks.json`,
  TOKEN_ENDPOINT: `${projectDomain}/v1/oauth2/token`,
  USERINFO_ENDPOINT: `${projectDomain}/v1/oauth2/userinfo`,
  REGISTER_ENDPOINT: `${projectDomain}/v1/oauth2/register`,
});

// We use OAuth/OIDC Debugger to start and complete PKCE-gated OIDC flows for Public clients
// Query param API is found at
// https://github.com/nbarbettini/oidc-debugger/blob/master/OidcDebugger/Pages/Index/index.js
// In the future, we should replace this with entirely our own logic so that we can test Access/Refresh
// token behavior for non-public clients as well
const OAuthDebuggerForm = () => {
  const [clientID, setClientID] = useLocalStorageStringValue(CLIENT_ID_KEY);
  const [scope, setScope] = useLocalStorageStringValue(SCOPE_KEY);
  const [projectDomain, setProjectDomain] = useLocalStorageStringValue(PROJECT_DOMAIN_KEY);
  const [pkce, setPKCE] = useLocalStorageCheckboxValue(PKCE_KEY);

  const links = generateLinks(projectDomain);

  // For some reason new URL.searchParams doesn't encode things properly, so build by hand...
  const startURL = encodeURI(
    `https://oidcdebugger.com/?` +
      `client_id_hint=${clientID}&` +
      `token_uri_hint=${links.TOKEN_ENDPOINT}&` +
      `authorize_uri_hint=${window.location.origin}${window.location.pathname}&` +
      `scope_hint=${scope}&` +
      `use_pkce=${pkce}`,
  );
  let disabledReason = null;
  if (!clientID) {
    disabledReason = 'Please configure a client to continue';
  } else if (pkce && !projectDomain) {
    disabledReason = 'PKCE requires the project ID to be set';
  }

  return (
    <div className="workbench">
      <div className="workbenchForm">
        <p>
          Use the{' '}
          <a href="https://oidcdebugger.com/" target="_blank" rel="noreferrer">
            OIDC Debugger
          </a>{' '}
          tool to start and complete a sample login transaction. Configure a Client ID and scopes below. The OIDC
          Debugger can be used to start flows for any client, but can only exchange tokens for public clients. Be sure
          to configure <code>https://oidcdebugger.com/debug</code> as a redirect URL.
        </p>

        {!disabledReason && (
          <a href={startURL}>
            <button>Start OIDC Flow with {clientID}</button>
          </a>
        )}
        {disabledReason && <button disabled>{disabledReason}</button>}

        <dl>
          <dt>Client ID</dt>
          <dt>
            <input
              style={{ width: '400px' }}
              value={clientID}
              placeholder="test-client-please-replace"
              onChange={setClientID}
            />
            <br />
            <small>
              The ID of the client that should be used to perform the OAuth flow. Take this from the Stytch dashboard.
            </small>
          </dt>
          <dt>Scope</dt>
          <dt>
            <input style={{ width: '400px' }} value={scope} placeholder="openid profile" onChange={setScope} />
            <br />
            <small>The set of scopes the client should request.</small>
          </dt>
          <label htmlFor="pkce">
            <dt>PKCE</dt>
            <dt>
              <input id="pkce" type="checkbox" checked={pkce} onChange={setPKCE} />
              <br />
              <small>
                True if PKCE should be used. If PKCE is used, the OIDC Debugger will attempt to perform the code
                exchange directly in the browser. Please set the Project Domain if this is true.{' '}
                <strong> Supports public clients only. </strong>
              </small>
            </dt>
          </label>
          <dt>Project Domain</dt>
          <dt>
            <input
              style={{ width: '400px' }}
              value={projectDomain}
              placeholder="https://{upn}.customers.stytch.dev"
              onChange={setProjectDomain}
            />
            <br />
            <small>
              The project Domain is used to determine where the OAuth Token endpoint is. Current auto-configured
              endpoints:
              {projectDomain && (
                <ul>
                  {Object.entries(links).map(([name, link]) => (
                    <li key={name}>
                      {name}&nbsp;
                      <a target="_blank" rel="noreferrer" href={link}>
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </small>
          </dt>
        </dl>
      </div>
    </div>
  );
};

const RadioSelect = ({
  options,
  name,
  onChange,
  selectedValue = '', // Default to no selection
}) => {
  const [value, setValue] = useState(selectedValue);

  const handleChange = (e) => {
    const selected = e.target.value;
    setValue(selected);
    onChange(selected);
  };

  return (
    <div>
      {options.map((option) => (
        <label key={option.value} style={{ display: 'block', margin: '5px 0' }}>
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={handleChange}
            style={{ marginRight: '5px' }}
          />
          {option.label}
        </label>
      ))}
    </div>
  );
};

const DEFAULT_SCOPES = new Set(['openid', 'profile', 'email', 'phone', 'offline_access']);

const ManifestOptions = [
  {
    label: 'Builtin Manifest Generator',
    value: 'builtin',
    func: undefined,
  },
  {
    label: 'Error Manifest Generator',
    value: 'error',
    func: () => {
      throw Error("I don't want to render");
    },
  },
  {
    label: 'Echo Scopes',
    value: 'simple',
    func: ({ scopes }) => {
      return scopes;
    },
  },
  {
    label: 'Groupings Without Details',
    value: 'groups',
    func: ({ scopes, clientName }) => {
      const openidScopes = scopes.filter((scope) => DEFAULT_SCOPES.has(scope));
      const customScopes = scopes.filter((scope) => !DEFAULT_SCOPES.has(scope));
      return [
        {
          header: `Allow ${clientName} to do an OpenID`,
          items: openidScopes.map((scope) => `With the ${scope} scope`),
        },
        {
          header: `Allow ${clientName} to do other things`,
          items: customScopes.map((scope) => `With the ${scope} scope`),
        },
      ];
    },
  },
  {
    label: 'Groupings with Details',
    value: 'groups-details',
    func: ({ scopes, clientName }) => {
      const openidScopes = scopes.filter((scope) => DEFAULT_SCOPES.has(scope));
      const customScopes = scopes.filter((scope) => !DEFAULT_SCOPES.has(scope));
      return [
        {
          header: `Allow ${clientName} to do an OpenID`,
          items: [
            {
              text: `We got so many scopes`,
              details: openidScopes,
            },
          ],
        },
        {
          header: `Allow ${clientName} to do other things`,
          items: customScopes.map((scope) => ({
            text: `With the ${scope} scope`,
            details: ['Very scary', 'Might not go well?'],
          })),
        },
      ];
    },
  },
];

const ManifestGeneratorChooser = ({ selectedGenerator, setSelectedGenerator }) => {
  return (
    <div className="workbench">
      <div className="workbenchForm">
        <p>Consent Screen Manifest:</p>
        <RadioSelect
          name="manifest-generator"
          options={ManifestOptions}
          selectedValue={selectedGenerator}
          onChange={setSelectedGenerator}
        />
      </div>
    </div>
  );
};

const IDP = () => {
  const [selectedGenerator, setSelectedGenerator] = useState('builtin');
  const manifestGenerator = ManifestOptions.find((option) => option.value === selectedGenerator)?.func;
  const strings = useB2CStrings();
  const [trustedAuthToken, setTrustedAuthToken] = useLocalStorageStringValue(TRUSTED_AUTH_TOKEN_KEY);
  const [tokenProfileID, setTokenProfileID] = useLocalStorageStringValue(TOKEN_PROFILE_ID_KEY);

  const authTokenParams = useMemo(() => {
    if (trustedAuthToken && tokenProfileID) {
      return { trustedAuthToken, tokenProfileID };
    }
    return undefined;
  }, [trustedAuthToken, tokenProfileID]);

  return (
    <div style={{ marginTop: '24px' }}>
      <h3>{'<IdentityProvider />'}</h3>
      <div style={{ display: 'flex', flexDirection: 'row', gap: '24px' }}>
        <IdentityProvider
          callbacks={{
            onError: (err) => {
              // eslint-disable-next-line no-console
              console.error('IDP Component errored', err);
            },
          }}
          getIDPConsentManifest={manifestGenerator}
          authTokenParams={authTokenParams}
          strings={strings}
        />
        <ManifestGeneratorChooser selectedGenerator={selectedGenerator} setSelectedGenerator={setSelectedGenerator} />
      </div>
      <div className="workbench">
        <div className="workbenchForm">
          <p>Trusted Auth (optional)</p>
          <dl>
            <dt>Trusted Auth Token</dt>
            <dt>
              <input
                style={{ width: '400px' }}
                value={trustedAuthToken}
                placeholder="trusted-auth-token"
                onChange={setTrustedAuthToken}
              />
            </dt>
            <dt>Profile ID</dt>
            <dt>
              <input
                style={{ width: '400px' }}
                value={tokenProfileID}
                placeholder="profile-id"
                onChange={setTokenProfileID}
              />
            </dt>
          </dl>
        </div>
      </div>
      <OAuthDebuggerForm />
    </div>
  );
};

export default IDP;
