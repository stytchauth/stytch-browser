import React from 'react';
import { StytchB2BClient } from '../../b2b/StytchB2BClient';
import { screen, render } from '@testing-library/react-native';
import { StytchB2BUI } from './StytchB2BUI';
import { DEFAULT_UI_CONFIG } from './config';
import { Platform } from '../../native-module/types';
import { Linking } from 'react-native';

jest.mock('react-native-url-polyfill/auto', () => {
  return {};
});
jest.mock('react-native-uuid', () => {
  return {
    v4: jest.fn(),
  };
});

jest.mock('../../native-module', function () {
  return {
    __esModule: true,
    default: class {
      DeviceInfo = {
        get: jest.fn().mockReturnValue({ platform: Platform.Android }),
      };
      Storage = {
        didMigrate: jest.fn().mockResolvedValue(true),
      };
      Misc = {
        configureDfp: jest.fn(),
      };
    },
  };
});

jest.mock('@stytch/react-native-inappbrowser-reborn', () => {
  return {};
});

jest.mock('react-native-country-codes-picker', () => {
  return {
    CountryPicker: jest.fn(),
  };
});

jest.mock('./hooks/useConsoleLogger', () => {
  return {
    useConsoleLogger: () => ({
      consoleLog: jest.fn(),
    }),
  };
});

describe('StytchB2BUI', () => {
  beforeEach(() => {
    Linking.addEventListener = jest.fn();
    Linking.removeAllListeners = jest.fn();
  });
  it('renders the StytchB2BUI component when given a valid configuration', () => {
    const client = new StytchB2BClient('');
    render(<StytchB2BUI client={client} config={DEFAULT_UI_CONFIG} />);
    expect(screen.getByTestId('StytchB2BUI')).toBeTruthy();
  });
});
