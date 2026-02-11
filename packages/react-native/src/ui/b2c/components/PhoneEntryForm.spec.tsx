import React from 'react';

import { useUpdateUserPhoneNumber } from '../hooks/updateUserPhoneNumber';
import { DEFAULT_RENDER_PROPS, fireEvent, ProviderProps, render, screen } from '../testUtils';
import { PhoneEntryForm } from './PhoneEntryForm';

jest.mock('../hooks/updateUserPhoneNumber');
const useUpdateUserPhoneNumberMock = jest.mocked(useUpdateUserPhoneNumber);

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
      setUserPhoneNumber: jest.fn(),
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
        setUserPhoneNumber: mocked,
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
        setUserPhoneNumber: mocked,
      });
      render(DEFAULT_RENDER_PROPS)(<PhoneEntryForm onValidPhoneNumberEntered={jest.fn()} />);
      fireEvent.changeText(screen.getByTestId('StytchInput'), '5005550006');
      expect(mocked).toHaveBeenCalledWith('+1', '5005550006', '(500) 555-0006');
    });
  });
  describe('An invalid phone number', () => {
    it('disables the button', () => {
      const props: ProviderProps = {
        ...DEFAULT_RENDER_PROPS,
        state: [
          {
            ...DEFAULT_RENDER_PROPS.state[0],
            userState: {
              ...DEFAULT_RENDER_PROPS.state[0].userState,
              phoneNumber: {
                ...DEFAULT_RENDER_PROPS.state[0].userState.phoneNumber,
                phoneNumber: 'invalid number',
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
            userState: {
              ...DEFAULT_RENDER_PROPS.state[0].userState,
              phoneNumber: {
                ...DEFAULT_RENDER_PROPS.state[0].userState.phoneNumber,
                countryCode: '+1',
                phoneNumber: '5005550006',
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
