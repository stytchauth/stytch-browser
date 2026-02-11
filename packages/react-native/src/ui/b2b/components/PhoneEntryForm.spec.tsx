import React from 'react';

import { useUpdateMemberPhoneNumber } from '../hooks/updateMemberPhoneNumber';
import { DEFAULT_RENDER_PROPS, fireEvent, ProviderProps, render, screen } from '../testUtils';
import { PhoneEntryForm } from './PhoneEntryForm';

jest.mock('../hooks/updateMemberPhoneNumber');
const useUpdateUserPhoneNumberMock = jest.mocked(useUpdateMemberPhoneNumber);

jest.mock('react-native-country-codes-picker', () => {
  return {
    CountryPicker: jest.fn(),
    CountryButton: jest.fn(),
    ListHeaderComponentProps: jest.fn(),
  };
});

describe('PhoneEntryForm', () => {
  beforeAll(() => {
    useUpdateUserPhoneNumberMock.mockReturnValue({
      setMemberPhoneNumber: jest.fn(),
    });
  });
  it('Renders as expected', () => {
    render(DEFAULT_RENDER_PROPS)(<PhoneEntryForm onValidPhoneNumberEntered={jest.fn()} />);
    expect(screen.getByTestId('CountryCodePicker')).toBeTruthy();
    expect(screen.getByTestId('StytchInput')).toBeTruthy();
  });

  // FIXME: This is seemingly untestable, as I can't get the countrycode picker to render in tests :(
  // eslint-disable-next-line jest/no-disabled-tests
  describe.skip('Changing the country code', () => {
    it('updates the phone number state', async () => {
      const mocked = jest.fn();
      useUpdateUserPhoneNumberMock.mockReturnValue({
        setMemberPhoneNumber: mocked,
      });
      render(DEFAULT_RENDER_PROPS)(<PhoneEntryForm onValidPhoneNumberEntered={jest.fn()} />);
      fireEvent.press(screen.getByTestId('CountryCodePicker'));
      expect(await screen.findByText('United Kindgom')).toBeTruthy();
      expect(mocked).toHaveBeenCalledWith('+44', undefined);
    });
  });

  describe('Changing the phonenumber', () => {
    it('updates the phone number state', () => {
      const mocked = jest.fn();
      useUpdateUserPhoneNumberMock.mockReturnValue({
        setMemberPhoneNumber: mocked,
      });
      render(DEFAULT_RENDER_PROPS)(<PhoneEntryForm onValidPhoneNumberEntered={jest.fn()} />);
      fireEvent.changeText(screen.getByTestId('StytchInput'), '5005550006');
      expect(mocked).toHaveBeenCalledWith('+1', '5005550006');
    });
  });
  describe('An invalid phone number', () => {
    it('disables the button', () => {
      const props: ProviderProps = {
        ...DEFAULT_RENDER_PROPS,
        state: [
          {
            ...DEFAULT_RENDER_PROPS.state[0],
            mfaState: {
              ...DEFAULT_RENDER_PROPS.state[0].mfaState,
              smsOtp: {
                isSending: true,
                sendError: undefined,
                codeExpiration: null,
                formattedDestination: null,
                enrolledNumber: {
                  phoneNumber: 'fake phone number',
                  countryCode: 'fake country code',
                },
              },
            },
          },
          DEFAULT_RENDER_PROPS.state[1],
        ],
      };
      const mocked = jest.fn();
      render(props)(<PhoneEntryForm onValidPhoneNumberEntered={mocked} />);
      fireEvent.press(screen.getByTestId('StytchButton'));
      expect(mocked).not.toHaveBeenCalled();
    });
  });

  describe('A valid phone number', () => {
    it('enables the button', () => {
      const props: ProviderProps = {
        ...DEFAULT_RENDER_PROPS,
        state: [
          {
            ...DEFAULT_RENDER_PROPS.state[0],
            mfaState: {
              ...DEFAULT_RENDER_PROPS.state[0].mfaState,
              smsOtp: {
                isSending: true,
                sendError: undefined,
                codeExpiration: null,
                formattedDestination: null,
                enrolledNumber: {
                  countryCode: '+1',
                  phoneNumber: '5005550006',
                },
              },
            },
          },
          DEFAULT_RENDER_PROPS.state[1],
        ],
      };
      const mocked = jest.fn();
      render(props)(<PhoneEntryForm onValidPhoneNumberEntered={mocked} />);
      fireEvent.press(screen.getByTestId('StytchButton'));
      expect(mocked).toHaveBeenCalled();
    });
  });
});
