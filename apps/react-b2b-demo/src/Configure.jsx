import React, { useState } from 'react';

import {
  configuration,
  getEnvConfigItem,
  getLocalStorageConfigItem,
  setConfigItem,
  setConfigItems,
} from './configuration';

const Item = ({ name, config }) => {
  const source = config.source === 'localStorage' ? 'local storage' : 'environment variable';

  return (
    <>
      <dt>{name}</dt>
      <dd>
        {config.value ? <code>{config.value}</code> : 'not set'} (from {source} <code>{config.key}</code>)
      </dd>
    </>
  );
};

const Input = ({ name, configKey, localConfig, setLocalConfig }) => {
  const handleChange = (event) => {
    const value = event.target.value;
    setLocalConfig((config) => ({ ...config, [configKey]: event.target.value }));
    setConfigItem(configKey, value);
  };

  return (
    <div>
      <label>
        {name}:{' '}
        <input
          type="text"
          value={localConfig[configKey] || ''}
          onChange={handleChange}
          style={{ width: 500 }}
          placeholder={getEnvConfigItem(configKey)}
        />
      </label>
    </div>
  );
};

const Configure = () => {
  const [localConfig, setLocalConfig] = useState({
    stytchPublicToken: getLocalStorageConfigItem('stytchPublicToken'),
    testAPIURL: getLocalStorageConfigItem('testAPIURL'),
    liveAPIURL: getLocalStorageConfigItem('liveAPIURL'),
    dfpBackendURL: getLocalStorageConfigItem('dfpBackendURL'),
    clientsideServicesIframeURL: getLocalStorageConfigItem('clientsideServicesIframeURL'),
  });

  const updateLocalConfig = (newConfig) => {
    setLocalConfig((config) => ({
      ...config,
      ...newConfig,
    }));
    setConfigItems(newConfig);
  };

  const getStytchDashboardUrl = () => {
    try {
      const liveUrlParsed = new URL(configuration.liveAPIURL.value);
      const prefix = 'api.';
      if (liveUrlParsed.host.startsWith(prefix)) {
        liveUrlParsed.host = liveUrlParsed.host.substring(prefix.length);
        return liveUrlParsed;
      }
    } catch {
      // Invalid URL, fallback to default
    }
    return new URL('https://stytch.com');
  };

  const stytchDashboardDomain = getStytchDashboardUrl().origin;

  return (
    <div style={{ margin: '24px 0' }}>
      <h2>Demo Configuration</h2>
      <h3>Current configuration</h3>
      <dl>
        <Item name="Public token" config={configuration.stytchPublicToken} />
        <Item name="Test API URL" config={configuration.testAPIURL} />
        <Item name="Live API URL" config={configuration.liveAPIURL} />
        <Item name="DFP backend URL" config={configuration.dfpBackendURL} />
        <Item name="Clientside services iframe URL" config={configuration.clientsideServicesIframeURL} />
      </dl>
      <h3>Project configuration</h3>
      <h4>
        <a href={`${stytchDashboardDomain}/dashboard/redirect-urls`}>Redirect URLs</a>
      </h4>
      <ul>
        <li>
          <code>{window.location.origin}</code>
        </li>
        <li>
          <code>{window.location.origin}/authenticate</code>
        </li>
        <li>
          <code>{window.location.origin}/passwords/reset</code>
        </li>
      </ul>
      <h4>
        <a href={`${stytchDashboardDomain}/dashboard/sdk-configuration`}>Frontend SDK Configuration</a>
      </h4>
      <dl>
        <dt>Domain</dt>
        <dd>
          <code>{window.location.origin}</code>
        </dd>
        <dt>Organization URL template</dt>
        <dd>
          <code>{`${window.location.origin}/org/{{slug}}`}</code>
        </dd>
      </dl>
      <h3>Override configuration</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          Update configuration in your browser&apos;s local storage and override environment variables set during build
          time. Changes are saved immediately, but only take effect after reloading the page.
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => {
              updateLocalConfig({
                testAPIURL: 'https://test.stytch.com',
                liveAPIURL: 'https://api.stytch.com',
                dfpBackendURL: 'https://telemetry.stytch.com',
                clientsideServicesIframeURL: 'https://js.stytch.com/clientside-services/index.html',
              });
            }}
          >
            Use prod
          </button>
          <button
            onClick={() => {
              updateLocalConfig({
                testAPIURL: 'https://test.staging.stytch.com',
                liveAPIURL: 'https://api.staging.stytch.com',
                dfpBackendURL: 'https://telemetry.staging.stytch.com',
                clientsideServicesIframeURL: 'https://js.staging.stytch.com/clientside-services/index.html',
              });
            }}
          >
            Use staging
          </button>
          <div>
            <form
              onSubmit={(e) => {
                e.preventDefault();

                const formData = new FormData(e.target);
                const remoteDevName = formData.get('remote-dev-name');
                if (remoteDevName) {
                  updateLocalConfig({
                    testAPIURL: `https://test.${remoteDevName}.dev.stytch.com`,
                    liveAPIURL: `https://api.${remoteDevName}.dev.stytch.com`,
                    dfpBackendURL: `https://telemetry.${remoteDevName}.dev.stytch.com`,
                  });
                }
              }}
            >
              <button>Use remote dev for:</button> <input type="text" name="remote-dev-name" placeholder="username" />
            </form>
          </div>
        </div>
        <div>
          <button
            onClick={() => {
              updateLocalConfig({
                stytchPublicToken: '',
                testAPIURL: '',
                liveAPIURL: '',
                dfpBackendURL: '',
                clientsideServicesIframeURL: '',
              });
            }}
          >
            Clear all (revert to environment variables)
          </button>
        </div>
        <div>
          <Input
            localConfig={localConfig}
            setLocalConfig={setLocalConfig}
            name="Public token"
            configKey="stytchPublicToken"
          />
          <Input localConfig={localConfig} setLocalConfig={setLocalConfig} name="Test API URL" configKey="testAPIURL" />
          <Input localConfig={localConfig} setLocalConfig={setLocalConfig} name="Live API URL" configKey="liveAPIURL" />
          <Input
            localConfig={localConfig}
            setLocalConfig={setLocalConfig}
            name="DFP backend URL"
            configKey="dfpBackendURL"
          />
          <Input
            localConfig={localConfig}
            setLocalConfig={setLocalConfig}
            name="Clientside services iframe URL"
            configKey="clientsideServicesIframeURL"
          />
        </div>
        <div>
          <button
            disabled={Object.entries(localConfig).every(([key, value]) => {
              return (
                (!value && configuration[key].source === 'env') ||
                (configuration[key].source === 'localStorage' && value === configuration[key].value)
              );
            })}
            onClick={() => window.location.reload()}
          >
            Reload and apply changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default Configure;
