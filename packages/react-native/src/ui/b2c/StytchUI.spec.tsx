import React from 'react';
import { StytchClient } from '../../StytchClient';
import { render, screen } from '@testing-library/react-native';
import { StytchUI } from './StytchUI';
import { DEFAULT_UI_CONFIG, StytchUIConfig } from './config';
import { StytchUIInvalidConfiguration } from '../shared/Errors';
import { OTPMethods, RNUIProducts } from '@stytch/core/public';
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
const emlAndOTPConfig: StytchUIConfig = {
  ...DEFAULT_UI_CONFIG,
  productConfig: {
    products: [RNUIProducts.emailMagicLinks],
    emailMagicLinksOptions: {},
    oAuthOptions: {
      providers: [],
    },
    otpOptions: {
      methods: [OTPMethods.Email],
      expirationMinutes: 0,
    },
    sessionOptions: {
      sessionDurationMinutes: 0,
    },
    passwordOptions: {},
  },
};

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

describe('StytchUI', () => {
  beforeEach(() => {
    Linking.openURL = jest.fn(() => Promise.resolve());
  });
  it('Throws the correct error when EML and EOTP are both included', () => {
    expect(() => {
      const client = new StytchClient('');
      render(<StytchUI client={client} config={emlAndOTPConfig} />);
    }).toThrow(
      new StytchUIInvalidConfiguration(
        'You cannot have both Email Magic Links and Email OTP configured at the same time',
      ),
    );
  });
  it('renders the StytchUI component when given a valid configuration', () => {
    const client = new StytchClient('');
    render(<StytchUI client={client} config={DEFAULT_UI_CONFIG} />);
    expect(screen.getByTestId('StytchUI')).toBeTruthy();
  });
});
